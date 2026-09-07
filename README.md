# City-Wide AI Surveillance

This project is a demo City-Wide AI Engine for Multi-Camera Surveillance. It includes a React + Vite frontend and an Express backend that serves the production build and provides APIs.

## Run (development)

1. Install dependencies:

```powershell
npm install
```

2. Start frontend dev server (HMR):

```powershell
npm run dev
# open http://localhost:5173
```

3. Start backend server (API) in another terminal:

```powershell
npm start
# default serves on port 5000; to use a different port:
$env:PORT=3000; npm start
```

## Run (production preview)

Build the frontend and start the backend which serves `dist`:

```powershell
npm run build
npm start
# open http://localhost:3000 or http://localhost:5000 depending on $PORT
```

## New Features Added

- 3D Model Viewer: a modal that renders glTF models using `three`, `@react-three/fiber` and `@react-three/drei`.
  - Open from the map popup by clicking the `3D Model` button for a camera.
  - Uses a default local model at `/models/car.glb` if the camera doesn't provide a `modelUrl`.
  - For photoreal results, place an optimized `.glb` (draco-compressed recommended) at `public/models/car.glb`.
    Recommended tools: `Blender` (export glb), `gltfpack` (optimize), or use glTF/GLB assets from Poly/Sketchfab with appropriate licenses.

- Example model source: Khronos glTF sample models (public).

## Notes

- If you want Mapbox tiles instead of the default CARTO basemap, provide a Mapbox access token and update the `TileLayer` URL in `src/components/map/CityMap.jsx`.
- The 3D viewer depends on WebGL; ensure your browser supports it.

## Real online data configuration

The application does not generate fake video, vehicle detections, plates, or traffic conditions. Without a configured provider, the UI displays `Data unavailable`.

Copy `.env.example` to `.env` and configure the sources you actually operate:

```powershell
Copy-Item .env.example .env
```

- `REAL_CAMERA_STREAM_URL`: real HLS/WebRTC/MJPEG or gateway URL for `CAM-001`.
- `TOMTOM_API_KEY`: enables live traffic-flow data for the Nagpur map through `/api/traffic`.
- `VEHICLE_DATA_URL`: optional trusted vehicle/ANPR JSON endpoint. It must return `{ "vehicles": [] }`.
- `ANPR_API_URL`: optional external ANPR inference endpoint. Without it, `/api/anpr` reports unavailable instead of generating plates.
- `VIDEO_ANALYSIS_API_URL`: video-analysis endpoint. The Analyze button sends uploaded video bytes and displays returned plate, vehicle class, and color fields.
- `VIDEO_ANALYSIS_API_KEY`: optional bearer token sent to the configured video-analysis provider.
- `VITE_MAPBOX_TOKEN`: optional Mapbox tiles and geocoding token.

Restart the backend after changing `.env`. A live video URL must be browser-accessible or exposed through an HLS/WebRTC gateway; browsers cannot play RTSP directly.

## Upload traffic video

Open **Live Cameras** and use **Traffic Video Evidence** to upload a real traffic recording. Supported video MIME types are accepted up to 500 MB. Uploaded files are stored locally in `uploads/traffic` and can be played or deleted from the same panel. Press **Analyze** to send a video to `VIDEO_ANALYSIS_API_URL`; the provider must return a `vehicles`, `detections`, or `results` array with fields such as `plate`/`licensePlate` and `color`/`vehicleColor`. Without that provider, no fabricated detections are shown.

How to add a realistic car model

1. Obtain a glTF/GLB model (prefer `.glb`).
2. Optionally compress with DRACO or optimize with `gltfpack` for smaller downloads.
3. Place the file at `public/models/car.glb`.
4. Rebuild: `npm run build`.

I can help pick or optimize a model and wire it so each camera can reference its own model URL.

If you want, I can:
- wire a specific car glTF you provide into cameras,
- add dynamic loading on-demand to reduce bundle size,
- or integrate the 3D model as a map overlay that follows camera coordinates.
