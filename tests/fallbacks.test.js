import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';

import trafficRouter from '../server/routes/traffic.js';
import vehiclesRouter from '../server/routes/vehicles.js';
import trafficVideosRouter from '../server/routes/trafficVideos.js';

async function startServer(router, mountPath = '/api') {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}` };
}

test('traffic route falls back to demo data when no API key is configured', async () => {
  const { server, url } = await startServer(trafficRouter, '/api/traffic');
  try {
    const response = await fetch(`${url}/api/traffic`);
    const data = await response.json();
    assert.equal(response.status, 200, 'traffic route should return 200 in demo fallback mode');
    assert.equal(data.available, true, 'demo fallback should mark traffic as available');
    assert.equal(data.mode, 'demo', 'demo fallback should be identified as simulated data');
    assert.ok(Array.isArray(data.data?.flowSegmentData) || Array.isArray(data.data?.features), 'demo traffic payload should contain traffic data');
  } finally {
    server.close();
  }
});

test('vehicles route falls back to demo vehicle data when no source is configured', async () => {
  const { server, url } = await startServer(vehiclesRouter, '/api/vehicles');
  try {
    const response = await fetch(`${url}/api/vehicles`);
    const data = await response.json();
    assert.equal(response.status, 200, 'vehicles route should return 200 in demo fallback mode');
    assert.equal(data.available, true, 'demo fallback should mark vehicle feed as available');
    assert.equal(data.mode, 'demo', 'demo fallback should be identified as simulated data');
    assert.ok(Array.isArray(data.vehicles), 'demo vehicles payload should be an array');
    assert.ok(data.vehicles.length > 0, 'demo vehicles payload should include at least one vehicle');
  } finally {
    server.close();
  }
});

test('traffic video analysis falls back to demo detections when no provider is configured', async () => {
  const uploadDirectory = path.resolve('uploads/traffic');
  await fs.mkdir(uploadDirectory, { recursive: true });
  const fileName = 'demo-vehicle-sample.mp4';
  const filePath = path.join(uploadDirectory, fileName);
  const fileBuffer = Buffer.from('fake-video-stream');
  await fs.writeFile(filePath, fileBuffer);

  const { server, url } = await startServer(trafficVideosRouter, '/api/traffic-videos');
  try {
    const response = await fetch(`${url}/api/traffic-videos/${encodeURIComponent(fileName)}/analyze`, { method: 'POST' });
    const data = await response.json();
    assert.equal(response.status, 200, 'video analysis route should return 200 in demo fallback mode');
    assert.equal(data.available, true, 'demo fallback should mark analysis as available');
    assert.ok(data.result || data.analysis || data.detections, 'demo result should include detection payload');
  } finally {
    await fs.unlink(filePath).catch(() => {});
    server.close();
  }
});
