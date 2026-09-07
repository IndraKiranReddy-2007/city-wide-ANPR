import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET system health status
router.get('/health', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    res.json({
      success: true,
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: [
        { name: 'Frontend Web Interface', status: 'Operational', latencyMs: 8, uptime: '100%' },
        { name: 'Backend API Gateway', status: 'Operational', latencyMs: 14, uptime: '99.98%' },
        { name: 'Surveillance DB & Cache', status: 'Operational', latencyMs: 4, uptime: '100%' },
        { name: 'AI Vision Inference Pipeline', status: 'Operational', latencyMs: 18, uptime: '99.92%' },
        { name: 'HLS/WebRTC Media Gateway', status: 'Operational', latencyMs: 24, uptime: '99.85%' },
        { name: 'Real-time Alert Dispatcher', status: 'Operational', latencyMs: 6, uptime: '100%' },
        { name: 'City Map Tile Server', status: 'Operational', latencyMs: 12, uptime: '100%' }
      ],
      metrics: {
        cpuUsagePct: Math.floor(Math.random() * 12) + 24,
        ramUsagePct: Math.floor(Math.random() * 8) + 46,
        heapUsedMB,
        apiLatencyMs: Math.floor(Math.random() * 6) + 12,
        activeConnections: Math.floor(Math.random() * 4) + 18,
        totalCameras: db.getCameras().length,
        onlineCameras: db.getCameras().filter(c => c.status === 'online').length,
        offlineCameras: db.getCameras().filter(c => c.status === 'offline').length,
        alertCameras: db.getCameras().filter(c => c.status === 'alert').length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET AI Models
router.get('/ai-models', (req, res) => {
  try {
    res.json({
      success: true,
      models: db.getAIModels()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Audit Logs
router.get('/audit-logs', (req, res) => {
  try {
    res.json({
      success: true,
      logs: db.getAuditLogs()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Storage Stats
router.get('/storage-stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.getStorageStats()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Run Storage Cleanup
router.post('/storage-cleanup', (req, res) => {
  try {
    const result = db.runStorageCleanup();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT Update Storage Settings
router.put('/storage-settings', (req, res) => {
  try {
    const updated = db.updateStorageSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
