import express from 'express';

const router = express.Router();

// Demo ANPR endpoint — accepts image uploads or cameraId and returns simulated plate detection.
router.post('/', async (req, res) => {
  const sourceUrl = process.env.ANPR_API_URL;
  if (!sourceUrl) {
    return res.json({
      success: true,
      available: true,
      source: 'Demo ANPR Feed',
      detection: {
        plate: 'MH 12 AB 5431',
        state: 'MH',
        color: 'White',
        vehicleClass: 'Sedan',
        confidence: 0.96
      },
      message: 'ANPR API is not configured, so demo recognition data is being used.'
    });
  }

  try {
    const response = await fetch(sourceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        available: false,
        message: `ANPR provider returned HTTP ${response.status}.`
      });
    }

    return res.json({ success: true, available: true, source: sourceUrl, detection: payload.detection || payload });
  } catch (err) {
    return res.status(502).json({ success: false, available: false, message: `ANPR provider unavailable: ${err.message}` });
  }
});

export default router;
