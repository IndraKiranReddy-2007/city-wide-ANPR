import express from 'express';

const router = express.Router();

const defaultBounds = '79.00,21.05,79.18,21.22';

const demoTrafficData = {
  flowSegmentData: [
    { id: 'nagpur-1', currentSpeed: 41, freeFlowSpeed: 54, currentTravelTime: 132, freeFlowTravelTime: 98, confidence: 0.93, coordinates: [[79.0722, 21.1458], [79.0955, 21.1567]] },
    { id: 'nagpur-2', currentSpeed: 33, freeFlowSpeed: 48, currentTravelTime: 164, freeFlowTravelTime: 109, confidence: 0.9, coordinates: [[79.0858, 21.1234], [79.1179, 21.1337]] },
    { id: 'nagpur-3', currentSpeed: 28, freeFlowSpeed: 42, currentTravelTime: 188, freeFlowTravelTime: 134, confidence: 0.88, coordinates: [[79.0587, 21.1617], [79.0912, 21.1731]] },
    { id: 'nagpur-4', currentSpeed: 46, freeFlowSpeed: 58, currentTravelTime: 121, freeFlowTravelTime: 92, confidence: 0.95, coordinates: [[79.1194, 21.1582], [79.1498, 21.1431]] }
  ]
};

router.get('/', async (req, res) => {
  const apiKey = process.env.TOMTOM_API_KEY;
  const bbox = req.query.bbox || defaultBounds;

  if (!apiKey) {
    return res.json({
      success: true,
      available: true,
      mode: 'demo',
      source: 'Demo Traffic Feed',
      fetchedAt: new Date().toISOString(),
      data: demoTrafficData,
      message: 'Live traffic API key is not configured, so a demo Nagpur feed is being used.'
    });
  }

  try {
    const url = new URL('https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('bbox', bbox);
    url.searchParams.set('unit', 'KMPH');

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        available: false,
        message: `Traffic provider returned HTTP ${response.status}.`
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      available: true,
      mode: 'live',
      source: 'TomTom Traffic Flow API',
      fetchedAt: new Date().toISOString(),
      data
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      available: false,
      message: `Traffic provider unavailable: ${error.message}`
    });
  }
});

export default router;
