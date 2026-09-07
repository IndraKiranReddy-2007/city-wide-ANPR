import express from 'express';
import { db } from '../db.js';

const router = express.Router();
const clients = new Set();

router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const client = { id: Date.now(), res };
  clients.add(client);

  res.write(`data: ${JSON.stringify({
    type: 'CONNECTED',
    timestamp: new Date().toISOString(),
    cameras: db.getCameras(),
    alerts: db.getAlerts(),
    incidents: db.getIncidents(),
    source: 'configured camera services'
  })}\n\n`);

  req.on('close', () => clients.delete(client));
});

// Keep connections alive without inventing detections, speeds, plates, or telemetry.
setInterval(() => {
  if (clients.size === 0) return;

  const message = `data: ${JSON.stringify({
    type: 'HEARTBEAT',
    timestamp: new Date().toISOString(),
    source: 'configured camera services'
  })}\n\n`;

  for (const client of clients) {
    try {
      client.res.write(message);
    } catch (error) {
      clients.delete(client);
    }
  }
}, 15000);

export default router;
