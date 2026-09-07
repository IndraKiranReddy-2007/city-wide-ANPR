import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { MapPin, Layers, LocateFixed, Activity, AlertTriangle, CarFront, Camera, Gauge } from 'lucide-react';
import MapSearchBar from './MapSearchBar';

// Marker Icon Factory for Leaflet
const createMarkerIcon = (status, isSelected) => {
  let color = '#10b981'; // online
  let pulseClass = 'camera-pulse-online';
  
  if (isSelected) {
    color = '#3b82f6';
    pulseClass = '';
  } else if (status === 'offline') {
    color = '#ef4444';
    pulseClass = '';
  } else if (status === 'alert') {
    color = '#f59e0b';
    pulseClass = 'camera-pulse-alert';
  }

  return L.divIcon({
    className: 'custom-camera-marker',
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        <div class="${pulseClass}" style="position:absolute;width:100%;height:100%;border-radius:50%;background-color:${color};opacity:0.2;"></div>
        <div style="width:20px;height:20px;border-radius:50%;background-color:#0b1329;border:2.5px solid ${color};box-shadow:0 0 10px ${color};display:flex;align-items:center;justify-content:center;">
          <div style="width:6px;height:6px;border-radius:50%;background-color:${color};"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function CityMap({ className = 'h-[600px] w-full', theme = 'dark' }) {
  const { 
    cameras,
    selectedCamera,
    setSelectedCamera,
    setIsCameraDetailsOpen,
    setActiveTab,
    setIs3DViewerOpen,
    setActive3DModelUrl,
    vehicles,
    trafficData,
    incidents
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCoverageRings, setShowCoverageRings] = useState(true);
  const [locationStatus, setLocationStatus] = useState('Configured camera locations');
  const [tileFallback, setTileFallback] = useState(false);
  const mapRef = useRef(null);
  const isLiveTraffic = trafficData?.mode === 'live';
  const flowSegments = trafficData?.data?.flowSegmentData || trafficData?.flowSegmentData || [];
  const averageSpeed = flowSegments.length
    ? Math.round(flowSegments.reduce((total, segment) => total + Number(segment.currentSpeed || 0), 0) / flowSegments.length)
    : null;
  const averageFreeFlow = flowSegments.length
    ? Math.round(flowSegments.reduce((total, segment) => total + Number(segment.freeFlowSpeed || 0), 0) / flowSegments.length)
    : null;
  const congestion = averageSpeed && averageFreeFlow
    ? Math.max(0, Math.min(100, Math.round((1 - averageSpeed / averageFreeFlow) * 100)))
    : null;
  const activeIncidents = incidents.filter(incident => ['Open', 'Investigating'].includes(incident.status));
  const onlineCameras = cameras.filter(camera => camera.status === 'online').length;

  const routeCorridors = [
    [[21.1458, 79.0882], [21.1702, 79.1034], [21.1882, 79.1185]],
    [[21.1104, 79.0728], [21.1348, 79.0891], [21.1605, 79.1018]],
    [[21.1553, 79.0556], [21.1466, 79.0826], [21.1298, 79.1178]],
    [[21.1847, 79.0947], [21.1689, 79.0999], [21.1441, 79.1122]]
  ];

  useEffect(() => {
    if (!mapRef.current) return;
    const refreshMap = () => mapRef.current?.invalidateSize();
    const frame = requestAnimationFrame(refreshMap);
    const timeout = setTimeout(refreshMap, 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [className, theme, filterStatus, tileFallback]);

  // Center map around Nagpur city center.
  const centerLat = 21.1458;
  const centerLng = 79.0882;

  const filteredCameras = filterStatus === 'ALL' 
    ? cameras 
    : cameras.filter(c => c.status.toLowerCase() === filterStatus.toLowerCase());
  const incidentMarkers = activeIncidents.map(incident => ({
    ...incident,
    camera: cameras.find(camera => camera.id === incident.cameraId)
  })).filter(incident => incident.camera?.lat && incident.camera?.lng);

  const handleOpenLive = (cam) => {
    setSelectedCamera(cam);
    setActiveTab('live');
  };

  const handleOpenDetails = (cam) => {
    setSelectedCamera(cam);
    setIsCameraDetailsOpen(true);
  };

  const handleOpen3D = (cam) => {
    const modelUrl = cam.modelUrl || '/models/car.glb';
    setActive3DModelUrl(modelUrl);
    setIs3DViewerOpen(true);
  };

  const centerOnCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location unavailable in this browser');
      return;
    }

    setLocationStatus('Requesting current location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.setView([coords.latitude, coords.longitude], 15);
        setLocationStatus(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
      },
      () => setLocationStatus('Location permission denied or unavailable'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-command-border shadow-2xl ${theme === 'light' ? 'bg-slate-100' : 'bg-command-bg'} ${className}`}>
      {/* Map Control Overlay Toolbar */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-command-surface/90 backdrop-blur-md p-2 rounded-xl border border-command-border shadow-xl">
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-heading font-semibold text-white">
          <MapPin className="w-4 h-4 text-command-cyan" />
          <span>NAGPUR, MAHARASHTRA · TACTICAL MAP</span>
        </div>

        <div className="h-4 w-px bg-command-border" />

        {/* Filter by status */}
        <div className="flex items-center gap-1">
          {['ALL', 'ONLINE', 'ALERT', 'OFFLINE'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                filterStatus === st 
                  ? 'bg-command-accent text-black font-bold shadow-sm shadow-cyan-500/20' 
                  : 'bg-command-card text-command-muted hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-command-border" />

        {/* Coverage Rings Toggle */}
        <button
          onClick={() => setShowCoverageRings(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
            showCoverageRings ? 'bg-command-card text-command-cyan border border-command-cyan/30' : 'bg-command-card text-command-muted'
          }`}
          title="Toggle camera surveillance coverage radius"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Coverage</span>
        </button>

        <button
          onClick={centerOnCurrentLocation}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-command-card text-command-muted hover:text-white border border-command-border"
          title="Center map on your current location"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>My location</span>
        </button>
      </div>

      {/* Map location and node count */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-command-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-command-border text-[11px] font-mono text-command-textDim flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-command-cyan animate-pulse" />
        <span>{locationStatus} · {filteredCameras.length} NODES VISIBLE</span>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] bg-command-surface/90 backdrop-blur-md px-3 py-2 rounded-lg border border-command-border text-[11px] font-mono shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${trafficData?.available ? 'text-emerald-400' : 'text-command-muted'}`} />
          <span className={trafficData?.available ? 'text-emerald-400' : 'text-command-muted'}>
            {isLiveTraffic ? 'LIVE TRAFFIC FLOW' : trafficData?.available ? 'SIMULATED TRAFFIC FLOW' : 'TRAFFIC DATA UNAVAILABLE'}
          </span>
        </div>
        <div className="text-[10px] text-command-textDim mt-1">
          {trafficData?.available ? trafficData.source : 'Traffic feed unavailable'}
        </div>
        <div className="text-[10px] text-command-textDim mt-1">
          {vehicles?.length ? `${vehicles.length} verified vehicles` : 'Vehicle data unavailable'}
        </div>
      </div>

      <div className="absolute top-20 right-4 z-[1000] w-56 rounded-xl border border-command-border bg-command-surface/90 p-3 text-command-textDim shadow-xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between border-b border-command-border pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-command-cyan">Operations detail</span>
          <span className={`h-2 w-2 rounded-full ${trafficData?.available ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="rounded-lg bg-command-card/80 p-2"><Camera className="mb-1 h-3.5 w-3.5 text-cyan-300" /><strong className="block text-sm text-white">{onlineCameras}/{cameras.length}</strong> cameras online</div>
          <div className="rounded-lg bg-command-card/80 p-2"><AlertTriangle className="mb-1 h-3.5 w-3.5 text-amber-300" /><strong className="block text-sm text-white">{activeIncidents.length}</strong> active incidents</div>
          <div className="rounded-lg bg-command-card/80 p-2"><CarFront className="mb-1 h-3.5 w-3.5 text-emerald-300" /><strong className="block text-sm text-white">{vehicles.length}</strong> tracked vehicles</div>
          <div className="rounded-lg bg-command-card/80 p-2"><Gauge className="mb-1 h-3.5 w-3.5 text-violet-300" /><strong className="block text-sm text-white">{averageSpeed || '--'} <span className="text-[9px]">km/h</span></strong> average speed</div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span>Congestion index</span><strong className={congestion > 55 ? 'text-amber-300' : 'text-emerald-300'}>{congestion === null ? '--' : `${congestion}%`}</strong>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-command-card"><div className={`h-full ${congestion > 55 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${congestion || 0}%` }} /></div>
        <div className="mt-2 text-[9px] text-command-textDim">{isLiveTraffic ? 'Provider telemetry' : 'Local simulation telemetry'} · {averageFreeFlow || '--'} km/h free flow</div>
      </div>

      {/* Interactive Leaflet Map */}
      {!tileFallback && (
        <MapContainer
          whenCreated={map => { mapRef.current = map; requestAnimationFrame(() => map.invalidateSize()); }}
          center={[centerLat, centerLng]}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            eventHandlers={{ tileerror: () => setTileFallback(true) }}
          />

        {routeCorridors.map((corridor, index) => (
          <Polyline
            key={`corridor-${index}`}
            positions={corridor}
            pathOptions={{
              color: index % 2 === 0 ? '#22d3ee' : '#8b5cf6',
              weight: 2.2,
              opacity: 0.45,
              dashArray: '10 12'
            }}
          />
        ))}

        {/* Camera Markers & Visual Radius Rings */}
        {filteredCameras.map(cam => {
          const isSelected = selectedCamera?.id === cam.id;
          const icon = createMarkerIcon(cam.status, isSelected);

          return (
            <React.Fragment key={cam.id}>
              {showCoverageRings && cam.status !== 'offline' && (
                <Circle
                  center={[cam.lat, cam.lng]}
                  radius={cam.type === 'PTZ' ? 600 : cam.type === '360 Fisheye' ? 450 : 350}
                  pathOptions={{
                    color: cam.status === 'alert' ? '#f59e0b' : '#06b6d4',
                    fillColor: cam.status === 'alert' ? '#f59e0b' : '#06b6d4',
                    fillOpacity: 0.08,
                    weight: 1,
                    dashArray: '4, 4'
                  }}
                />
              )}

              <Marker position={[cam.lat, cam.lng]} icon={icon}>
                <Popup className="custom-dark-popup" maxWidth={320}>
                  <div className="space-y-3 p-1 font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-command-border/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          cam.status === 'online' ? 'bg-emerald-400' : cam.status === 'alert' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <span className="font-heading font-bold text-xs text-white">
                          {cam.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-command-cyan px-1.5 py-0.5 rounded bg-command-card border border-command-border">
                        {cam.id}
                      </span>
                    </div>

                    <div className="text-xs text-command-textDim space-y-1 font-mono">
                      <div>📍 {cam.location}</div>
                      <div>📡 {cam.streamType} · {cam.fps} FPS</div>
                      <div className="text-purple-300">
                        🤖 AI: {cam.aiEnabled ? 'ACTIVE (YOLOv11)' : 'DISABLED'}
                      </div>
                      {cam.status === 'alert' && (
                        <div className="text-amber-400 font-bold bg-amber-950/40 p-1.5 rounded border border-amber-800/50 text-[11px]">
                          🚨 Active Alert: {cam.lastAlert}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-command-border/60">
                      <button
                        onClick={() => handleOpenLive(cam)}
                        className="flex-1 py-1.5 rounded bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-colors"
                      >
                        View Live Feed
                      </button>
                      <button
                        onClick={() => handleOpen3D(cam)}
                        className="px-3 py-1.5 rounded bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-textDim hover:text-white transition-colors"
                      >
                        3D Model
                      </button>
                      <button
                        onClick={() => handleOpenDetails(cam)}
                        className="px-3 py-1.5 rounded bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-textDim hover:text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Vehicle markers */}
        {vehicles && vehicles.map(v => {
          if (!v.lat || !v.lng) return null;
          const vehicleIcon = L.divIcon({
            className: 'vehicle-marker',
            html: `<div style="background:rgba(255,255,255,0.9);padding:4px 6px;border-radius:6px;border:1px solid #0b1329;font-size:11px;font-weight:700;color:#0b1329;">${v.plate || 'VEH'}</div>`,
            iconSize: [80, 28],
            iconAnchor: [40, 14]
          });

          return (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={vehicleIcon}>
              <Popup className="custom-dark-popup" maxWidth={260}>
                <div className="text-xs">
                  <div className="font-bold text-white">{v.plate || 'Unknown'}</div>
                  <div className="text-command-textDim">{v.class} · {v.speed ? `${v.speed} km/h` : 'N/A'}</div>
                  <div className="text-command-textDim">Detected by: {v.cameraId}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {incidentMarkers.map(incident => {
          const incidentIcon = L.divIcon({
            className: 'incident-marker',
            html: '<div style="width:22px;height:22px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 12px #f59e0b;display:flex;align-items:center;justify-content:center;color:#111;font-size:12px;font-weight:900;">!</div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          return (
            <Marker key={`incident-${incident.id}`} position={[incident.camera.lat, incident.camera.lng]} icon={incidentIcon}>
              <Popup className="custom-dark-popup" maxWidth={280}>
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-amber-300">{incident.title}</div>
                  <div className="text-command-textDim">{incident.type} · {incident.severity}</div>
                  <div className="text-command-textDim">{incident.camera.name}</div>
                  <div className="text-command-textDim">Status: {incident.status}</div>
                  <button onClick={() => { setSelectedCamera(incident.camera); setIsCameraDetailsOpen(true); }} className="w-full rounded bg-command-accent px-2 py-1.5 text-xs font-bold text-black">Inspect camera</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      )}

      {tileFallback && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-slate-950/85 text-center text-slate-200">
          <div className="rounded-xl border border-command-border bg-slate-900/80 px-6 py-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm font-bold tracking-[0.18em] text-cyan-300">OFFLINE MAP MODE</div>
            <div className="mt-2 text-xs text-slate-300">Basemap tiles are unavailable; surveillance markers remain active and the map is still usable.</div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[850] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.2)_55%,rgba(2,6,23,0.55)_100%)]" />

      {/* Render MapSearchBar positioned over the map using absolute positioning so it has access to mapRef */}
      <div className="absolute top-6 left-6 z-[1100]">
        <MapSearchBar map={mapRef.current} />
      </div>
    </div>
  );
}
