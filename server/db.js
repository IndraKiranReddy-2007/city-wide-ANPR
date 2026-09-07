import 'dotenv/config';

// In-Memory & Persistent Storage Engine for City-Wide AI Surveillance

let cameras = [
  {
    id: 'CAM-001',
    name: 'Sitabuldi Main Junction - North Cam',
    location: 'Sitabuldi Main Junction',
    zone: 'Zone 1 - Central Business District',
    lat: 21.1458,
    lng: 79.0882,
    type: 'PTZ',
    streamType: process.env.REAL_CAMERA_STREAM_URL ? (process.env.REAL_CAMERA_STREAM_TYPE || 'HLS (.m3u8)') : 'No verified stream',
    streamUrl: process.env.REAL_CAMERA_STREAM_URL || '',
    status: process.env.REAL_CAMERA_STREAM_URL ? 'online' : 'offline', // 'online' | 'offline' | 'alert'
    aiEnabled: true,
    aiClasses: ['Person', 'Vehicle', 'Traffic', 'Intrusion'],
    confidenceThreshold: 75,
    alertSensitivity: 'High',
    fps: 30,
    resolution: '1920x1080',
    latency: 38,
    uptime: '99.8%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'High-definition PTZ camera monitoring main arterial traffic and pedestrian crosswalks.',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
    createdAt: '2026-01-15T08:00:00Z',
    // default speed limit (km/h) for this camera's monitored road
    speedLimit: 50,
  },
  {
    id: 'CAM-002',
    name: 'Nagpur Railway Station - Gate 4 Concourse',
    location: 'Nagpur Railway Station - Concourse Level',
    zone: 'Zone 2 - Transit Hubs',
    lat: 21.1510,
    lng: 79.0880,
    type: '360 Fisheye',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Person', 'Crowd', 'Abandoned Object', 'Intrusion'],
    confidenceThreshold: 80,
    alertSensitivity: 'High',
    fps: 25,
    resolution: '2560x1440',
    latency: 42,
    uptime: '99.4%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Wide-angle concourse surveillance covering turnstiles and ticket counters.',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&q=80',
    createdAt: '2026-01-20T09:30:00Z',
    speedLimit: 40,
  },
  {
    id: 'CAM-003',
    name: 'Central Market Square - South Plaza',
    location: 'Sadar Market Square - Lane 3',
    zone: 'Zone 3 - Commercial Markets',
    lat: 21.1539,
    lng: 79.0838,
    type: 'Fixed',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Person', 'Vehicle', 'Crowd', 'Abandoned Object'],
    confidenceThreshold: 70,
    alertSensitivity: 'Medium',
    fps: 30,
    resolution: '1920x1080',
    latency: 35,
    uptime: '99.9%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Fixed high-angle dome camera covering market walkways and commercial storefronts.',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&q=80',
    createdAt: '2026-02-01T10:15:00Z',
    speedLimit: 30,
  },
  {
    id: 'CAM-004',
    name: 'MIHAN Expressway - Lane 2',
    location: 'MIHAN Expressway - Outbound Lane 2',
    zone: 'Zone 4 - Highways & Tolls',
    lat: 21.0920,
    lng: 78.9980,
    type: 'ANPR',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Vehicle', 'Traffic', 'Wrong-way Movement'],
    confidenceThreshold: 85,
    alertSensitivity: 'High',
    fps: 60,
    resolution: '1920x1080',
    latency: 28,
    uptime: '99.95%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'High-speed automated number plate recognition (ANPR) camera for toll collection and traffic policing.',
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    createdAt: '2026-02-10T14:20:00Z',
    // highway / tollway camera — higher speed limit
    speedLimit: 80,
  },
  {
    id: 'CAM-005',
    name: 'Civil Lines Government Complex - East',
    location: 'Civil Lines Government Complex - Gate B',
    zone: 'Zone 5 - Restricted Security Zones',
    lat: 21.1515,
    lng: 79.0750,
    type: 'Thermal',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Person', 'Intrusion', 'Fire/Smoke'],
    confidenceThreshold: 80,
    alertSensitivity: 'High',
    fps: 25,
    resolution: '1280x720',
    latency: 45,
    uptime: '99.99%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Thermal dual-spectrum camera monitoring perimeter fence and restricted entry points.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    createdAt: '2026-02-14T06:00:00Z',
    speedLimit: 30,
  },
  {
    id: 'CAM-006',
    name: 'Industrial Port Warehouse 7',
    location: 'Butibori Industrial Area - Logistics Bay 12',
    zone: 'Zone 6 - Industrial & Logistics',
    lat: 20.9440,
    lng: 79.0010,
    type: 'Fixed',
    streamType: 'HTTP/HTTPS video',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Fire/Smoke', 'Person', 'Vehicle', 'Abandoned Object'],
    confidenceThreshold: 75,
    alertSensitivity: 'High',
    fps: 30,
    resolution: '1920x1080',
    latency: 50,
    uptime: '98.7%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Industrial safety camera equipped with thermal fire/smoke early warning models.',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
    createdAt: '2026-02-18T11:45:00Z',
    speedLimit: 40,
  },
  {
    id: 'CAM-007',
    name: 'Financial District Skybridge',
    location: 'Dharampeth Skybridge - Tower 4 to Tower 5',
    zone: 'Zone 1 - Central Business District',
    lat: 21.1360,
    lng: 79.0600,
    type: 'PTZ',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: true,
    aiClasses: ['Person', 'Crowd', 'Unusual Activity'],
    confidenceThreshold: 70,
    alertSensitivity: 'Medium',
    fps: 30,
    resolution: '1920x1080',
    latency: 32,
    uptime: '99.6%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Overhead PTZ camera with facial and crowd density tracking along commercial skybridge.',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    createdAt: '2026-02-22T16:00:00Z',
    speedLimit: 40,
  },
  {
    id: 'CAM-008',
    name: 'Futala Lake Promenade - West End',
    location: 'Futala Lake Promenade - West End',
    zone: 'Zone 7 - Public Parks & Recreation',
    lat: 21.1630,
    lng: 79.0440,
    type: 'Fixed',
    streamType: 'No verified stream',
    streamUrl: '',
    status: 'offline',
    aiEnabled: false,
    aiClasses: ['Person', 'Crowd', 'Unusual Activity'],
    confidenceThreshold: 70,
    alertSensitivity: 'Low',
    fps: 0,
    resolution: '1920x1080',
    latency: 0,
    uptime: '92.1%',
    lastDetection: 'Data unavailable',
    lastAlert: 'Data unavailable',
    description: 'Solar-powered park surveillance camera. Undergoing network switch maintenance.',
    thumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    createdAt: '2026-02-25T09:10:00Z',
    speedLimit: 25,
  }
];

let alerts = [
  {
    id: 'ALT-8921',
    type: 'Intrusion / Restricted Zone',
    severity: 'CRITICAL',
    cameraId: 'CAM-005',
    cameraName: 'Civil Lines Government Complex - East',
    location: 'Civil Lines Government Complex - Gate B',
    timestamp: '2026-03-06T20:38:15Z',
    confidence: 93,
    status: 'Active', // 'Active' | 'Acknowledged' | 'Resolved'
    description: 'Human subject breached inner secondary fence line at unmonitored corner 3.',
    snapshot: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    acknowledgedBy: null,
    resolvedAt: null,
  },
  {
    id: 'ALT-8920',
    type: 'High Crowd Density Surge',
    severity: 'HIGH',
    cameraId: 'CAM-002',
    cameraName: 'Nagpur Railway Station - Gate 4 Concourse',
    location: 'Nagpur Railway Station - Concourse Level',
    timestamp: '2026-03-06T20:35:40Z',
    confidence: 88,
    status: 'Acknowledged',
    description: 'Crowd density exceeded safety threshold (4.8 persons/sq.meter) near ticket barriers.',
    snapshot: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&q=80',
    acknowledgedBy: 'Operator Rahul Sharma',
    resolvedAt: null,
  },
  {
    id: 'ALT-8919',
    type: 'Traffic Congestion Spike',
    severity: 'MEDIUM',
    cameraId: 'CAM-001',
    cameraName: 'Sitabuldi Main Junction - North Cam',
    location: 'Sitabuldi Main Junction',
    timestamp: '2026-03-06T20:20:10Z',
    confidence: 85,
    status: 'Active',
    description: 'Queue length exceeded 180 meters on the Sitabuldi approach lane.',
    snapshot: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
    acknowledgedBy: null,
    resolvedAt: null,
  },
  {
    id: 'ALT-8918',
    type: 'Camera Stream Offline',
    severity: 'HIGH',
    cameraId: 'CAM-008',
    cameraName: 'Futala Lake Promenade - West End',
    location: 'Memorial Park Riverside Walkway',
    timestamp: '2026-03-06T19:58:00Z',
    confidence: 99,
    status: 'Acknowledged',
    description: 'RTSP heartbeat timeout. Unable to receive video stream packets for > 120s.',
    snapshot: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    acknowledgedBy: 'Operator Priya Verma',
    resolvedAt: null,
  },
  {
    id: 'ALT-8915',
    type: 'Unattended Luggage / Bag',
    severity: 'LOW',
    cameraId: 'CAM-003',
    cameraName: 'Central Market Square - South Plaza',
    location: 'Old City Trade Market Lane 3',
    timestamp: '2026-03-06T18:14:22Z',
    confidence: 76,
    status: 'Resolved',
    description: 'Stationary object detected without owner within 2m radius for > 8 minutes. Claimed by shopkeeper.',
    snapshot: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&q=80',
    acknowledgedBy: 'Operator Rahul Sharma',
    resolvedAt: '2026-03-06T18:30:00Z',
  }
];

let incidents = [
  {
    id: 'INC-2026-042',
    title: 'Perimeter Breach Attempt at Civil Lines Government Complex',
    type: 'Restricted Zone Intrusion',
    severity: 'CRITICAL',
    cameraId: 'CAM-005',
    cameraName: 'Civil Lines Government Complex - East',
    location: 'Civil Lines Government Complex - Gate B',
    timestamp: '2026-03-06T20:39:00Z',
    status: 'Investigating', // 'Open' | 'Investigating' | 'Resolved' | 'Closed'
    assignedOperator: 'Inspector V. Malhotra (QRT Alpha)',
    description: 'Thermal camera AI flagged motion in restricted buffer zone. Quick Reaction Team dispatched.',
    evidence: [
      { type: 'Snapshot', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80', caption: 'Thermal detection frame 042-A' },
      { type: 'Log', text: 'AI Confidence: 93% · Latency: 45ms · Zone ID: SEC-B-RED' }
    ],
    timeline: [
      { time: '2026-03-06T20:38:15Z', author: 'AI Engine', note: 'Automated Alert ALT-8921 generated' },
      { time: '2026-03-06T20:39:00Z', author: 'Op. Rahul Sharma', note: 'Incident created and escalated to QRT Alpha' },
      { time: '2026-03-06T20:41:20Z', author: 'QRT Dispatch', note: 'Ground patrol arrived on site for verification' }
    ]
  },
  {
    id: 'INC-2026-041',
    title: 'Evening Concourse Overcrowding',
    type: 'Crowd Safety & Flow',
    severity: 'HIGH',
    cameraId: 'CAM-002',
    cameraName: 'Nagpur Railway Station - Gate 4 Concourse',
    location: 'Nagpur Railway Station - Concourse Level',
    timestamp: '2026-03-06T20:36:00Z',
    status: 'Open',
    assignedOperator: 'Station Controller Desk',
    description: 'Surge in passenger arrival rate causing choke point at escalator landings. Additional turnstiles requested.',
    evidence: [
      { type: 'Snapshot', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&q=80', caption: 'Concourse density heatmap' }
    ],
    timeline: [
      { time: '2026-03-06T20:35:40Z', author: 'AI Engine', note: 'CrowdNet density trigger: 88%' },
      { time: '2026-03-06T20:36:00Z', author: 'Op. Priya Verma', note: 'Incident logged. Station marshall notified.' }
    ]
  },
  {
    id: 'INC-2026-039',
    title: 'Wrong-way Vehicle on Toll Ramp',
    type: 'Traffic Violation / Hazard',
    severity: 'HIGH',
    cameraId: 'CAM-004',
    cameraName: 'MIHAN Expressway - Lane 2',
    location: 'Expressway km 14.2 Outbound',
    timestamp: '2026-03-06T16:20:00Z',
    status: 'Resolved',
    assignedOperator: 'Traffic Police Patrol 12',
    description: 'Motorcycle entered reverse exit slipway. Intercepted by highway marshals within 4 minutes.',
    evidence: [
      { type: 'Snapshot', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80', caption: 'ANPR capture DL-01-AX-9921' }
    ],
    timeline: [
      { time: '2026-03-06T16:20:00Z', author: 'AI Engine', note: 'Vector direction anomaly detected' },
      { time: '2026-03-06T16:22:00Z', author: 'Highway Control', note: 'Emergency sign flashed WRONG WAY VEHICLE' },
      { time: '2026-03-06T16:26:00Z', author: 'Patrol 12', note: 'Vehicle safely turned around. Incident resolved.' }
    ]
  }
];

let auditLogs = [
  { id: 'LOG-1092', timestamp: '2026-03-06T20:41:00Z', user: 'admin@surveillance.city.gov', role: 'Admin', action: 'System Telemetry Poll', details: 'All 8 camera telemetry endpoints verified healthy.' },
  { id: 'LOG-1091', timestamp: '2026-03-06T20:39:00Z', user: 'rahul.s@surveillance.city.gov', role: 'Operator', action: 'Create Incident INC-2026-042', details: 'Created critical security incident for CAM-005 perimeter alert.' },
  { id: 'LOG-1090', timestamp: '2026-03-06T20:36:10Z', user: 'priya.v@surveillance.city.gov', role: 'Operator', action: 'Acknowledge Alert ALT-8920', details: 'Acknowledged high crowd density alert at Metro Hub.' },
  { id: 'LOG-1089', timestamp: '2026-03-06T19:40:00Z', user: 'admin@surveillance.city.gov', role: 'Admin', action: 'AI Threshold Update', details: 'Adjusted YOLOv11 confidence slider on CAM-001 from 70% to 75%.' },
  { id: 'LOG-1088', timestamp: '2026-03-06T18:15:00Z', user: 'analyst.k@surveillance.city.gov', role: 'Analyst', action: 'Export Daily Report', details: 'Generated PDF surveillance summary for Zone 1-3.' }
];

let aiModels = [
  { id: 'MOD-01', name: 'YOLOv11x City Surveillance', type: 'Object & Vehicle Detection', version: 'v11.2.4', status: 'Active', latency: '16ms', fps: '62 FPS', accuracy: '96.8%', gpuUsage: '68%', classes: 24, targetDevices: 'NVIDIA TensorRT / WebGPU' },
  { id: 'MOD-02', name: 'DeepSORT Multi-Camera ReID', type: 'Cross-Camera Tracking', version: 'v3.1.0', status: 'Active', latency: '12ms', fps: '85 FPS', accuracy: '94.2%', gpuUsage: '42%', classes: 4, targetDevices: 'CUDA / CoreML' },
  { id: 'MOD-03', name: 'CrowdNet Density Estimator', type: 'Spatial Density & Heatmaps', version: 'v2.8.0', status: 'Active', latency: '22ms', fps: '45 FPS', accuracy: '92.5%', gpuUsage: '34%', classes: 1, targetDevices: 'TensorRT' },
  { id: 'MOD-04', name: 'PyroVision Smoke & Flame AI', type: 'Early Hazard Detection', version: 'v2.1.2', status: 'Active', latency: '14ms', fps: '70 FPS', accuracy: '98.1%', gpuUsage: '28%', classes: 2, targetDevices: 'CUDA' },
  { id: 'MOD-05', name: 'ANPR FastPlate OCR', type: 'License Plate Recognition', version: 'v4.0.1', status: 'Active', latency: '19ms', fps: '55 FPS', accuracy: '97.4%', gpuUsage: '38%', classes: 8, targetDevices: 'TensorRT' }
];

let storageSettings = {
  autoOptimization: true,
  tempFileRetentionHours: 24,
  snapshotRetentionDays: 60,
  eventMetadataRetentionDays: 90,
  incidentEvidenceRetentionDays: 365,
  storageTiers: {
    videoUsedGB: 142.4,
    videoTotalGB: 500.0,
    snapshotsUsedGB: 18.2,
    snapshotsTotalGB: 100.0,
    dbUsedGB: 2.4,
    dbTotalGB: 20.0,
    cacheUsedGB: 1.1,
    cacheTotalGB: 10.0,
    tempUsedMB: 420.0,
    tempTotalMB: 5000.0
  }
};

export const db = {
  // Cameras
  getCameras: () => cameras,
  getCameraById: (id) => cameras.find(c => c.id === id),
  addCamera: (data) => {
    const newId = `CAM-${String(cameras.length + 1).padStart(3, '0')}`;
    const newCam = {
      id: newId,
      name: data.name || `Camera ${newId}`,
      location: data.location || 'City Surveillance Grid',
      zone: data.zone || 'Zone 1 - Central Business District',
      lat: Number(data.lat) || 21.1458,
      lng: Number(data.lng) || 79.0882,
      type: data.type || 'Fixed',
      streamType: data.streamType || 'No verified stream',
      streamUrl: data.streamUrl || '',
      status: data.status || 'offline',
      aiEnabled: data.aiEnabled !== undefined ? data.aiEnabled : true,
      aiClasses: data.aiClasses || ['Person', 'Vehicle'],
      confidenceThreshold: Number(data.confidenceThreshold) || 75,
      alertSensitivity: data.alertSensitivity || 'Medium',
      fps: data.fps || 30,
      resolution: data.resolution || '1920x1080',
      latency: Math.floor(Math.random() * 25) + 25,
      uptime: '100%',
      lastDetection: 'Stream Connected · Just now',
      lastAlert: 'None',
      description: data.description || 'Newly deployed surveillance node.',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
      createdAt: new Date().toISOString()
      ,
      // sensible default speed limit for newly added cameras
      speedLimit: Number(data.speedLimit) || 50
    };
    cameras.unshift(newCam);
    db.logAuditEvent('Camera Added', 'Operator', `Added camera ${newCam.id} (${newCam.name})`);
    return newCam;
  },
  updateCamera: (id, data) => {
    const index = cameras.findIndex(c => c.id === id);
    if (index === -1) return null;
    cameras[index] = { ...cameras[index], ...data };
    db.logAuditEvent('Camera Updated', 'Operator', `Updated configuration for ${id}`);
    return cameras[index];
  },
  deleteCamera: (id) => {
    const index = cameras.findIndex(c => c.id === id);
    if (index === -1) return false;
    const removed = cameras.splice(index, 1);
    db.logAuditEvent('Camera Deleted', 'Admin', `Deleted camera ${id} (${removed[0]?.name})`);
    return true;
  },

  // Alerts
  getAlerts: () => alerts,
  acknowledgeAlert: (id, operator = 'Operator') => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'Acknowledged';
      alert.acknowledgedBy = operator;
      db.logAuditEvent('Alert Acknowledged', operator, `Acknowledged alert ${id}`);
      return alert;
    }
    return null;
  },
  resolveAlert: (id, operator = 'Operator') => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'Resolved';
      alert.resolvedAt = new Date().toISOString();
      db.logAuditEvent('Alert Resolved', operator, `Resolved alert ${id}`);
      return alert;
    }
    return null;
  },
  createAlert: (data) => {
    const newId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert = {
      id: newId,
      type: data.type || 'Anomaly Detected',
      severity: data.severity || 'HIGH',
      cameraId: data.cameraId || 'CAM-001',
      cameraName: data.cameraName || 'Surveillance Node',
      location: data.location || 'City Sector',
      timestamp: new Date().toISOString(),
      confidence: data.confidence || 88,
      status: 'Active',
      description: data.description || 'AI vision model flagged target anomaly.',
      snapshot: data.snapshot || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
      acknowledgedBy: null,
      resolvedAt: null
    };
    alerts.unshift(newAlert);
    return newAlert;
  },

  // Incidents
  getIncidents: () => incidents,
  createIncident: (data) => {
    const newId = `INC-2026-${String(incidents.length + 43).padStart(3, '0')}`;
    const newIncident = {
      id: newId,
      title: data.title || 'Security Anomaly Event',
      type: data.type || 'Surveillance Alert',
      severity: data.severity || 'HIGH',
      cameraId: data.cameraId || 'CAM-001',
      cameraName: data.cameraName || 'Sitabuldi Main Junction',
      location: data.location || 'Sector 4',
      timestamp: new Date().toISOString(),
      status: 'Open',
      assignedOperator: data.assignedOperator || 'Duty Commander',
      description: data.description || 'Incident raised from AI surveillance alert.',
      evidence: data.evidence || [
        { type: 'Snapshot', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80', caption: 'Initial detection frame' }
      ],
      timeline: [
        { time: new Date().toISOString(), author: 'Operator', note: 'Incident created from Alert Center' }
      ]
    };
    incidents.unshift(newIncident);
    db.logAuditEvent('Incident Created', 'Operator', `Created incident ${newId}: ${newIncident.title}`);
    return newIncident;
  },
  updateIncident: (id, data) => {
    const inc = incidents.find(i => i.id === id);
    if (!inc) return null;
    if (data.status) inc.status = data.status;
    if (data.assignedOperator) inc.assignedOperator = data.assignedOperator;
    if (data.description) inc.description = data.description;
    if (data.title) inc.title = data.title;
    if (data.severity) inc.severity = data.severity;
    db.logAuditEvent('Incident Updated', 'Operator', `Updated status of ${id} to ${inc.status}`);
    return inc;
  },
  addIncidentNote: (id, note, author = 'Operator') => {
    const inc = incidents.find(i => i.id === id);
    if (!inc) return null;
    inc.timeline.push({
      time: new Date().toISOString(),
      author,
      note
    });
    return inc;
  },

  // AI Models
  getAIModels: () => aiModels,

  // Audit Logs
  getAuditLogs: () => auditLogs,
  logAuditEvent: (action, user = 'System', details = '') => {
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: user.includes('@') ? user : `${user.toLowerCase()}@surveillance.city.gov`,
      role: user.includes('Admin') ? 'Admin' : 'Operator',
      action,
      details
    };
    auditLogs.unshift(newLog);
    if (auditLogs.length > 200) auditLogs.pop();
    return newLog;
  },

  // Storage & Cleanup
  getStorageStats: () => storageSettings,
  updateStorageSettings: (settings) => {
    storageSettings = { ...storageSettings, ...settings };
    db.logAuditEvent('Storage Policy Update', 'Admin', 'Updated retention policy configuration.');
    return storageSettings;
  },
  runStorageCleanup: () => {
    const cleanedMB = Math.floor(Math.random() * 150) + 220;
    storageSettings.storageTiers.tempUsedMB = Math.max(50, storageSettings.storageTiers.tempUsedMB - cleanedMB);
    storageSettings.storageTiers.cacheUsedGB = (Math.max(0.4, storageSettings.storageTiers.cacheUsedGB - 0.3)).toFixed(1);
    db.logAuditEvent('Storage Cleanup Executed', 'System', `Cleaned ${cleanedMB}MB temporary video chunks and cached thumbnails.`);
    return { success: true, freedMB: cleanedMB, current: storageSettings };
  },

  // Analytics Aggregation
  getAnalytics: (timeframe = '24h') => {
    const totalDetections = 148920;
    const totalPeople = 84200;
    const totalVehicles = 52300;
    const totalAlerts = 248;

    return {
      timeframe,
      kpis: {
        totalDetections,
        totalPeople,
        totalVehicles,
        totalAlerts,
        activeCameras: cameras.filter(c => c.status === 'online').length,
        alertCameras: cameras.filter(c => c.status === 'alert').length,
        offlineCameras: cameras.filter(c => c.status === 'offline').length,
        avgInferenceLatencyMs: 18.4,
        cameraUptimeAvg: '99.4%',
        systemHealthPct: 99.2
      },
      hourlyDetections: [
        { hour: '00:00', people: 120, vehicles: 450, alerts: 2 },
        { hour: '02:00', people: 80, vehicles: 210, alerts: 1 },
        { hour: '04:00', people: 110, vehicles: 320, alerts: 3 },
        { hour: '06:00', people: 650, vehicles: 1400, alerts: 8 },
        { hour: '08:00', people: 2400, vehicles: 3800, alerts: 18 },
        { hour: '10:00', people: 3800, vehicles: 4200, alerts: 24 },
        { hour: '12:00', people: 4200, vehicles: 3900, alerts: 19 },
        { hour: '14:00', people: 3900, vehicles: 3600, alerts: 15 },
        { hour: '16:00', people: 4800, vehicles: 4600, alerts: 28 },
        { hour: '18:00', people: 5200, vehicles: 5100, alerts: 32 },
        { hour: '20:00', people: 3100, vehicles: 3200, alerts: 14 },
        { hour: '22:00', people: 1400, vehicles: 1800, alerts: 7 },
      ],
      detectionsByClass: [
        { name: 'Person / Pedestrian', count: 84200, percentage: 56.5, color: '#06b6d4' },
        { name: 'Automobile (Car/SUV)', count: 36400, percentage: 24.4, color: '#3b82f6' },
        { name: 'Commercial (Bus/Truck)', count: 11200, percentage: 7.5, color: '#8b5cf6' },
        { name: 'Two-Wheeler (Motorcycle/Bike)', count: 8700, percentage: 5.8, color: '#10b981' },
        { name: 'Crowd Gathering', count: 4800, percentage: 3.2, color: '#f59e0b' },
        { name: 'Zone Intrusion / Breach', count: 1820, percentage: 1.2, color: '#ef4444' },
        { name: 'Hazard (Smoke / Object)', count: 1800, percentage: 1.2, color: '#ec4899' },
      ],
      alertsBySeverity: [
        { severity: 'CRITICAL', count: 12, color: '#ef4444' },
        { severity: 'HIGH', count: 48, color: '#f97316' },
        { severity: 'MEDIUM', count: 96, color: '#f59e0b' },
        { severity: 'LOW', count: 92, color: '#06b6d4' },
      ],
      cameraActivityTop: cameras.map(cam => ({
        id: cam.id,
        name: cam.name,
        zone: cam.zone,
        status: cam.status,
        detectionsToday: Math.floor(Math.random() * 4000) + 1200,
        alertsToday: Math.floor(Math.random() * 8) + 1,
        uptime: cam.uptime
      }))
    };
  }
};
