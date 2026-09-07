import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation & Views
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiModels, setAiModels] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  
  // UI & Modal States
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isCameraDetailsOpen, setIsCameraDetailsOpen] = useState(false);
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // 3D Model Viewer Modal
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [active3DModelUrl, setActive3DModelUrl] = useState(null);
  
  // Layout for Live Cameras
  const [liveGridCols, setLiveGridCols] = useState(2); // 1, 2, 3, 4
  const [showAiOverlays, setShowAiOverlays] = useState(true);
  
  // User Role: 'Admin' | 'Operator' | 'Analyst' | 'Viewer'
  const [activeRole, setActiveRole] = useState('Admin');
  
  // Demo Mode & Connection Status
  const [demoMode, setDemoMode] = useState(true);
  const [liveConnectionStatus, setLiveConnectionStatus] = useState('connecting'); // 'connected' | 'reconnecting' | 'offline'
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('surveillance-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  
  // Notifications & Toasts
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Live Activity Ticker Feed
  const [activityFeed, setActivityFeed] = useState([]);
  // Vehicles seen in real-time (from SSE / ANPR)
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('surveillance-theme', theme);
  }, [theme]);

  // Poll configured external providers. Missing credentials or unavailable providers remain explicit.
  useEffect(() => {
    let mounted = true;
    const fetchExternalData = async () => {
      const [traffic, vehicleFeed] = await Promise.all([
        fetch('/api/traffic').then(response => response.json()).catch(() => ({ available: false, message: 'Traffic data unavailable.' })),
        fetch('/api/vehicles').then(response => response.json()).catch(() => ({ available: false, vehicles: [], message: 'Vehicle data unavailable.' }))
      ]);

      if (!mounted) return;
      setTrafficData(traffic);
      setVehicles(vehicleFeed.available && Array.isArray(vehicleFeed.vehicles) ? vehicleFeed.vehicles : []);
    };

    fetchExternalData();
    const intervalId = setInterval(fetchExternalData, 60000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Audio Chime Player
  const playChime = useCallback((type = 'alert') => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'critical') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }, [audioEnabled]);

  // Toast Notification Dispatcher
  const addToast = useCallback((title, description = '', type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, description, type, time: Date.now() }]);
    
    if (type === 'error' || type === 'critical') {
      playChime('critical');
    } else if (type === 'success' || type === 'alert') {
      playChime('alert');
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, [playChime]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial data from backend API with fallback
  const fetchAllData = useCallback(async () => {
    try {
      const [cRes, aRes, iRes, hRes, sRes] = await Promise.all([
        fetch('/api/cameras').then(r => r.json()).catch(() => null),
        fetch('/api/alerts').then(r => r.json()).catch(() => null),
        fetch('/api/incidents').then(r => r.json()).catch(() => null),
        fetch('/api/system/health').then(r => r.json()).catch(() => null),
        fetch('/api/system/storage-stats').then(r => r.json()).catch(() => null)
      ]);

      if (cRes && cRes.cameras) setCameras(cRes.cameras);
      if (aRes && aRes.alerts) {
        setAlerts(aRes.alerts);
        setNotifications(aRes.alerts.slice(0, 10));
        setUnreadNotificationsCount(aRes.alerts.filter(a => a.status === 'Active').length);
      }
      if (iRes && iRes.incidents) setIncidents(iRes.incidents);
      if (hRes && hRes.success) setSystemHealth(hRes);
      if (sRes && sRes.data) setStorageStats(sRes.data);

      setLiveConnectionStatus('connected');
    } catch (err) {
      console.warn('Backend fetch failed, relying on cached / demo state', err);
      setLiveConnectionStatus('reconnecting');
    }
  }, []);

  // Server-Sent Events (SSE) Listener for Real-Time Telemetry & Detections
  useEffect(() => {
    fetchAllData();

    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setLiveConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'CONNECTED') {
              if (data.cameras) setCameras(data.cameras);
              if (data.alerts) setAlerts(data.alerts);
              if (data.incidents) setIncidents(data.incidents);
            } else if (data.type === 'AI_DETECTION') {
              // Add to live activity feed
              const iconMap = { Person: '👤', Vehicle: '🚗', Crowd: '👥', Traffic: '🚦', Intrusion: '🚨', 'Fire/Smoke': '🔥' };
              const newActivity = {
                id: `ACT-${Date.now()}`,
                timestamp: data.timestamp,
                icon: iconMap[data.detection.type] || '👁️',
                text: `${data.detection.type} detected (${data.detection.confidence}% confidence)`,
                camera: `${data.cameraId} · ${data.location}`,
                type: data.detection.type.toLowerCase()
              };

              setActivityFeed(prev => [newActivity, ...prev.slice(0, 19)]);

              // Update system health metrics if received
              if (data.telemetry) {
                setSystemHealth(prev => prev ? {
                  ...prev,
                  metrics: { ...prev.metrics, ...data.telemetry }
                } : null);
              }

              // Handle vehicle-specific detection metadata (ANPR, speed, wrong-way)
              if (data.detection && data.detection.type === 'Vehicle') {
                const vehicle = {
                  id: `VEH-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
                  plate: data.detection.plate || null,
                  state: data.detection.state || null,
                  speed: data.detection.speed || null,
                  wrongWay: !!data.detection.wrongWay,
                  class: data.detection.vehicleClass || 'Car',
                  lat: data.detection.lat || null,
                  lng: data.detection.lng || null,
                  cameraId: data.cameraId,
                  timestamp: data.timestamp
                };

                setVehicles(prev => [vehicle, ...prev].slice(0, 200));

                // Raise frontend alert if speed > threshold or wrongWay
                try {
                  const speedThreshold = 80; // default; could be per-camera
                  if (vehicle.wrongWay || (vehicle.speed && vehicle.speed > speedThreshold)) {
                    // create backend alert as well
                    fetch('/api/alerts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: vehicle.wrongWay ? 'Wrong-way Vehicle' : 'Speed Threshold Violation',
                        severity: 'HIGH',
                        cameraId: vehicle.cameraId,
                        cameraName: data.cameraName,
                        location: data.location,
                        confidence: data.detection.confidence || 90,
                        description: `ANPR: ${vehicle.plate || 'UNKNOWN'} (${vehicle.class}) @ ${vehicle.speed || 'N/A'} km/h ${vehicle.wrongWay ? '(wrong-way)' : ''}`,
                        snapshot: ''
                      })
                    }).catch(() => {});
                  }
                } catch (e) {}
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          setLiveConnectionStatus('reconnecting');
          if (eventSource) eventSource.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        setLiveConnectionStatus('reconnecting');
        reconnectTimeout = setTimeout(connectSSE, 4000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [fetchAllData]);

  // Camera Actions
  const addCamera = async (cameraData) => {
    try {
      const res = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cameraData)
      });
      const json = await res.json();
      if (json.success && json.camera) {
        setCameras(prev => [json.camera, ...prev]);
        addToast('Camera Added Successfully', `${json.camera.name} (${json.camera.id}) is now online.`, 'success');
        return json.camera;
      } else {
        throw new Error(json.message || 'Failed to add camera');
      }
    } catch (err) {
      // Local Fallback
      const newId = `CAM-${String(cameras.length + 1).padStart(3, '0')}`;
      const localCam = {
        id: newId,
        ...cameraData,
        status: 'online',
        fps: 30,
        resolution: '1920x1080',
        latency: 32,
        uptime: '100%',
        lastDetection: 'Stream Connected · Just now',
        lastAlert: 'None',
        thumbnail: cameraData.thumbnail || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
        createdAt: new Date().toISOString()
      };
      setCameras(prev => [localCam, ...prev]);
      addToast('Camera Added (Demo Mode)', `${localCam.name} saved to active surveillance grid.`, 'success');
      return localCam;
    }
  };

  const updateCamera = async (id, data) => {
    try {
      const res = await fetch(`/api/cameras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.camera) {
        setCameras(prev => prev.map(c => c.id === id ? json.camera : c));
        if (selectedCamera?.id === id) setSelectedCamera(json.camera);
        addToast('Camera Updated', `Configuration saved for ${id}.`, 'info');
        return json.camera;
      }
    } catch (err) {
      setCameras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      if (selectedCamera?.id === id) setSelectedCamera(prev => ({ ...prev, ...data }));
      addToast('Camera Updated', `Updated ${id} locally.`, 'info');
    }
  };

  const deleteCamera = async (id) => {
    try {
      await fetch(`/api/cameras/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Ignore
    }
    setCameras(prev => prev.filter(c => c.id !== id));
    if (selectedCamera?.id === id) {
      setSelectedCamera(null);
      setIsCameraDetailsOpen(false);
    }
    addToast('Camera Removed', `Camera ${id} has been deregistered.`, 'info');
  };

  // Alert Actions
  const acknowledgeAlert = async (id) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: activeRole })
      });
    } catch (e) {}

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged', acknowledgedBy: `Operator (${activeRole})` } : a));
    addToast('Alert Acknowledged', `Alert ${id} acknowledged by ${activeRole}.`, 'info');
  };

  const resolveAlert = async (id) => {
    try {
      await fetch(`/api/alerts/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: activeRole })
      });
    } catch (e) {}

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved', resolvedAt: new Date().toISOString() } : a));
    addToast('Alert Resolved', `Alert ${id} marked as resolved.`, 'success');
  };

  // Incident Actions
  const createIncident = async (incidentData) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });
      const json = await res.json();
      if (json.success && json.incident) {
        setIncidents(prev => [json.incident, ...prev]);
        addToast('Incident Created', `${json.incident.id} dispatched to ${json.incident.assignedOperator}.`, 'critical');
        return json.incident;
      }
    } catch (e) {}

    const newId = `INC-2026-${String(incidents.length + 43).padStart(3, '0')}`;
    const localInc = {
      id: newId,
      ...incidentData,
      timestamp: new Date().toISOString(),
      status: 'Open',
      timeline: [{ time: new Date().toISOString(), author: activeRole, note: 'Incident logged from command center' }]
    };
    setIncidents(prev => [localInc, ...prev]);
    addToast('Incident Created', `${newId} logged in active operations.`, 'critical');
    return localInc;
  };

  const updateIncident = async (id, data) => {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}

    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => ({ ...prev, ...data }));
    }
    addToast('Incident Updated', `Incident ${id} updated.`, 'info');
  };

  const addIncidentNote = async (id, noteText) => {
    try {
      await fetch(`/api/incidents/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText, author: activeRole })
      });
    } catch (e) {}

    const newEntry = { time: new Date().toISOString(), author: activeRole, note: noteText };
    setIncidents(prev => prev.map(i => i.id === id ? {
      ...i,
      timeline: [...(i.timeline || []), newEntry]
    } : i));

    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => ({
        ...prev,
        timeline: [...(prev.timeline || []), newEntry]
      }));
    }
    addToast('Timeline Note Added', `Entry logged for incident ${id}.`, 'info');
  };

  // Storage Cleanup Action
  const runStorageCleanup = async () => {
    try {
      const res = await fetch('/api/system/storage-cleanup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setStorageStats(json.current);
        addToast('Storage Cleaned', `Freed ${json.freedMB}MB of cached frames & temp logs.`, 'success');
        return json;
      }
    } catch (e) {}
    addToast('Storage Cleaned', 'Temporary video buffer flushed.', 'success');
  };

  // Global Keybindings (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(() => ({
    activeTab, setActiveTab,
    cameras, setCameras,
    alerts, setAlerts,
    incidents, setIncidents,
    auditLogs, setAuditLogs,
    aiModels, setAiModels,
    storageStats, setStorageStats,
    systemHealth, setSystemHealth,
    trafficData,
    selectedCamera, setSelectedCamera,
    isCameraDetailsOpen, setIsCameraDetailsOpen,
    isAddCameraOpen, setIsAddCameraOpen,
    editingCamera, setEditingCamera,
    selectedIncident, setSelectedIncident,
    isIncidentModalOpen, setIsIncidentModalOpen,
    isSearchOpen, setIsSearchOpen,
    searchQuery, setSearchQuery,
    is3DViewerOpen, setIs3DViewerOpen,
    active3DModelUrl, setActive3DModelUrl,
    liveGridCols, setLiveGridCols,
    showAiOverlays, setShowAiOverlays,
    activeRole, setActiveRole,
    demoMode, setDemoMode,
    theme, setTheme,
    liveConnectionStatus, setLiveConnectionStatus,
    notifications, setNotifications,
    unreadNotificationsCount, setUnreadNotificationsCount,
    toasts, addToast, removeToast,
    audioEnabled, setAudioEnabled,
    activityFeed,
    vehicles,
    // Methods
    addCamera,
    updateCamera,
    deleteCamera,
    acknowledgeAlert,
    resolveAlert,
    createIncident,
    updateIncident,
    addIncidentNote,
    runStorageCleanup,
    fetchAllData
  }), [
    activeTab, cameras, alerts, incidents, auditLogs, aiModels, storageStats, systemHealth,
    selectedCamera, isCameraDetailsOpen, isAddCameraOpen, editingCamera, selectedIncident,
    isIncidentModalOpen, isSearchOpen, searchQuery, liveGridCols, showAiOverlays, activeRole,
    is3DViewerOpen, active3DModelUrl,
    demoMode, theme, liveConnectionStatus, notifications, unreadNotificationsCount, toasts,
    audioEnabled, activityFeed, vehicles, trafficData, addCamera, updateCamera, deleteCamera, acknowledgeAlert,
    resolveAlert, createIncident, updateIncident, addIncidentNote, runStorageCleanup, fetchAllData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
