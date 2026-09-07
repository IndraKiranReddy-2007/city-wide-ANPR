import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const router = express.Router();
const execFileAsync = promisify(execFile);
const uploadDirectory = path.resolve('uploads/traffic');

await fs.mkdir(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.mp4';
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('video/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Only video files are allowed.'));
  }
});

router.get('/', async (_req, res) => {
  try {
    const entries = await fs.readdir(uploadDirectory, { withFileTypes: true });
    const videos = await Promise.all(entries.filter(entry => (
      entry.isFile() && /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(entry.name)
    )).map(async entry => {
      const filePath = path.join(uploadDirectory, entry.name);
      const stats = await fs.stat(filePath);
      return {
        id: entry.name,
        name: entry.name,
        url: `/uploads/traffic/${encodeURIComponent(entry.name)}`,
        sizeBytes: stats.size,
        uploadedAt: stats.birthtime.toISOString()
      };
    }));

    videos.sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt));
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Choose a video file to upload.' });
  }

  return res.status(201).json({
    success: true,
    video: {
      id: req.file.filename,
      name: req.file.originalname,
      url: `/uploads/traffic/${encodeURIComponent(req.file.filename)}`,
      sizeBytes: req.file.size,
      uploadedAt: new Date().toISOString(),
      cameraId: req.body.cameraId || null
    }
  });
});

router.delete('/:id', async (req, res) => {
  const safeName = path.basename(req.params.id);
  if (safeName !== req.params.id) {
    return res.status(400).json({ success: false, message: 'Invalid video id.' });
  }

  try {
    await fs.unlink(path.join(uploadDirectory, safeName));
    return res.json({ success: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/analyze', async (req, res) => {
  const sourceUrl = process.env.VIDEO_ANALYSIS_API_URL;
  const providerKey = process.env.VIDEO_ANALYSIS_API_KEY;
  const safeName = path.basename(req.params.id);

  if (safeName !== req.params.id) {
    return res.status(400).json({ success: false, available: false, message: 'Invalid video id.' });
  }

  if (process.env.LOCAL_VIDEO_ANALYZER === 'true') {
    try {
      const videoPath = path.join(uploadDirectory, safeName);
      const python = process.env.PYTHON_PATH || 'python';
      const { stdout } = await execFileAsync(
        python,
        [path.resolve('server/analyze_video.py'), videoPath],
        { maxBuffer: 10 * 1024 * 1024, timeout: 15 * 60 * 1000 }
      );
      const payload = JSON.parse(stdout);
      if (payload.error) throw new Error(payload.error);
      return res.json({
        success: true,
        available: true,
        mode: 'local',
        source: 'YOLO + EasyOCR',
        analyzedAt: new Date().toISOString(),
        result: payload
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(503).json({
          success: false,
          available: false,
          mode: 'local',
          message: 'Local analyzer is enabled but Python or its dependencies are unavailable.'
        });
      }
      return res.status(502).json({
        success: false,
        available: false,
        mode: 'local',
        message: `Local video analysis failed: ${error.message}`
      });
    }
  }

  if (!sourceUrl) {
    const demoResult = {
      vehicles: [
        { type: 'Car', plate: 'MH 12 AB 5431', color: 'White', confidence: 0.97 },
        { type: 'SUV', plate: 'MH 31 CD 2084', color: 'Black', confidence: 0.95 },
        { type: 'Motorcycle', plate: 'MH 47 EF 9910', color: 'Red', confidence: 0.9 }
      ],
      summary: 'Demo analysis completed using embedded sample traffic detections.'
    };

    return res.json({
      success: true,
      available: true,
      source: 'Demo Video Analysis',
      analyzedAt: new Date().toISOString(),
      result: demoResult,
      message: 'Video analysis API is not configured, so demo detections are being used.'
    });
  }

  try {
    const videoPath = path.join(uploadDirectory, safeName);
    const videoBuffer = await fs.readFile(videoPath);
    const headers = {
      'Content-Type': 'video/*',
      'X-Video-Filename': safeName
    };
    if (providerKey) headers.Authorization = `Bearer ${providerKey}`;

    const response = await fetch(sourceUrl, {
      method: 'POST',
      headers,
      body: videoBuffer
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { rawResponse: responseText.slice(0, 2000) };
    }
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        available: false,
        message: `Video analysis provider returned HTTP ${response.status}.`,
        result
      });
    }

    return res.json({
      success: true,
      available: true,
      source: sourceUrl,
      analyzedAt: new Date().toISOString(),
      result
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, available: false, message: 'Video not found.' });
    }
    return res.status(502).json({
      success: false,
      available: false,
      message: `Video analysis provider unavailable: ${error.message}`
    });
  }
});

export default router;
