import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import camerasRouter from './routes/cameras.js';
import alertsRouter from './routes/alerts.js';
import incidentsRouter from './routes/incidents.js';
import analyticsRouter from './routes/analytics.js';
import systemRouter from './routes/system.js';
import eventsRouter from './routes/events.js';
import anprRouter from './routes/anpr.js';
import trafficRouter from './routes/traffic.js';
import vehiclesRouter from './routes/vehicles.js';
import trafficVideosRouter from './routes/trafficVideos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/events')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/cameras', camerasRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/system', systemRouter);
app.use('/api/events', eventsRouter);
app.use('/api/anpr', anprRouter);
app.use('/api/traffic', trafficRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/traffic-videos', trafficVideosRouter);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CITY-WIDE AI ENGINE FOR MULTI-CAMERA SURVEILLANCE',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve Static Assets in Production
const distPath = path.join(__dirname, '../dist');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(distPath));

// Fallback all other routes to React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Surveillance API Gateway</title></head>
          <body style="background:#070b14;color:#f1f5f9;font-family:sans-serif;padding:40px;text-align:center;">
            <h1 style="color:#06b6d4;">CITY-WIDE AI ENGINE FOR MULTI-CAMERA SURVEILLANCE</h1>
            <p>Backend API is active on port ${PORT}. Run <code>npm run build</code> to compile frontend dashboard.</p>
            <p><a href="/api/health" style="color:#10b981;">View API Health Status</a></p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SURVEILLANCE ENGINE BACKEND LIVE ON PORT ${PORT}`);
  console.log(`📡 SSE Stream: http://localhost:${PORT}/api/events`);
  console.log(`📹 Cameras API: http://localhost:${PORT}/api/cameras`);
  console.log(`=======================================================`);
});
