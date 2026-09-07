import express from 'express';

const router = express.Router();

const demoVehicles = [
  { id: 'veh-demo-1', plate: 'MH 12 AB 5431', class: 'Sedan', speed: 52, lat: 21.1458, lng: 79.0882, cameraId: 'CAM-001', direction: 'northbound' },
  { id: 'veh-demo-2', plate: 'MH 31 CD 2084', class: 'SUV', speed: 61, lat: 21.1613, lng: 79.1064, cameraId: 'CAM-003', direction: 'eastbound' },
  { id: 'veh-demo-3', plate: 'MH 47 EF 9910', class: 'Truck', speed: 39, lat: 21.1328, lng: 79.0725, cameraId: 'CAM-006', direction: 'southbound' }
];

router.get('/', async (req, res) => {
  const sourceUrl = process.env.VEHICLE_DATA_URL;

  if (!sourceUrl) {
    return res.json({
      success: true,
      available: true,
      mode: 'demo',
      source: 'Demo Vehicle Feed',
      fetchedAt: new Date().toISOString(),
      vehicles: demoVehicles,
      message: 'Vehicle data source is not configured, so demo vehicle markers are being used.'
    });
  }

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        available: false,
        vehicles: [],
        message: `Vehicle provider returned HTTP ${response.status}.`
      });
    }

    const payload = await response.json();
    const vehicles = Array.isArray(payload) ? payload : payload.vehicles;
    if (!Array.isArray(vehicles)) {
      return res.status(502).json({
        success: false,
        available: false,
        vehicles: [],
        message: 'Vehicle provider returned an unsupported response shape.'
      });
    }

    return res.json({
      success: true,
      available: true,
      mode: 'live',
      source: sourceUrl,
      fetchedAt: new Date().toISOString(),
      vehicles
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      available: false,
      vehicles: [],
      message: `Vehicle provider unavailable: ${error.message}`
    });
  }
});

export default router;
