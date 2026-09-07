import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Check, AlertCircle, ArrowRight, ArrowLeft, Video, 
  MapPin, Sliders, ShieldCheck, Activity, RefreshCw, Radio, Play, CheckCircle2, Lock
} from 'lucide-react';
import LocationPickerModal from '../map/LocationPickerModal';
import VideoPlayer from '../video/VideoPlayer';

export default function AddCameraModal({ isOpen, onClose }) {
  const { addCamera, cameras } = useApp();

  // Wizard Step: 1 to 5
  const [step, setStep] = useState(1);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cameraId, setCameraId] = useState(`CAM-${String(cameras.length + 1).padStart(3, '0')}`);
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('Zone 1 - Central Business District');
  const [lat, setLat] = useState(21.1458);
  const [lng, setLng] = useState(79.0882);
  const [type, setType] = useState('PTZ');
  const [description, setDescription] = useState('');

  // Stream Config State
  const [streamUrl, setStreamUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [streamType, setStreamType] = useState('No verified stream');

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { connected: true/false, latency, fps, resolution, message }

  // AI Configuration State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiClasses, setAiClasses] = useState(['Person', 'Vehicle', 'Traffic', 'Intrusion']);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [alertSensitivity, setAlertSensitivity] = useState('High');

  if (!isOpen) return null;

  const availableClasses = [
    'Person', 'Vehicle', 'Crowd', 'Intrusion', 
    'Abandoned Object', 'Traffic', 'Fire/Smoke', 'Unusual Activity'
  ];

  const streamTypeOptions = [
    'No verified stream',
    'HLS (.m3u8)',
    'WebRTC',
    'MJPEG',
    'HTTP/HTTPS video',
    'RTSP',
    'YouTube Live'
  ];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/cameras/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamUrl, streamType, username, password })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        connected: false,
        message: 'Connection failed: Backend tester unreachable or network timeout.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleClass = (cls) => {
    setAiClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleSaveCamera = async () => {
    const payload = {
      name: name || `Camera ${cameraId}`,
      id: cameraId,
      location: location || 'City Surveillance Grid',
      zone,
      lat: Number(lat),
      lng: Number(lng),
      type,
      description: description || 'New surveillance camera deployed.',
      streamUrl,
      streamType,
      aiEnabled,
      aiClasses,
      confidenceThreshold: Number(confidenceThreshold),
      alertSensitivity,
      fps: testResult?.fps || 30,
      resolution: testResult?.resolution || '1920x1080',
      status: testResult?.connected ? 'online' : 'offline',
    };

    await addCamera(payload);
    onClose();
    // Reset wizard
    setStep(1);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-command-surface border border-command-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-command-border bg-command-card/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center">
              <Video className="w-4 h-4 text-command-cyan" />
            </div>
            <div>
              <div className="text-sm font-bold font-heading text-white tracking-wide">
                ADD LIVE SURVEILLANCE CAMERA
              </div>
              <div className="text-[11px] font-mono text-command-muted">
                Step {step} of 5 — Multi-Stage Camera Setup Wizard
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-command-muted hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator (Requirement 2 / Step 5) */}
        <div className="px-6 py-3 border-b border-command-border bg-command-card/40 flex items-center justify-between text-xs font-mono">
          {[
            { num: 1, label: 'Information' },
            { num: 2, label: 'Stream' },
            { num: 3, label: 'Test' },
            { num: 4, label: 'AI Config' },
            { num: 5, label: 'Complete' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num 
                    ? 'bg-command-cyan text-black shadow-md shadow-cyan-500/20' 
                    : step > s.num 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-command-card border border-command-border text-command-muted'
                }`}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`hidden sm:inline ${step === s.num ? 'text-white font-medium' : 'text-command-muted'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-emerald-600' : 'bg-command-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Camera Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Camera Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. North Expressway Toll Cam 3"
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-sans focus:outline-none focus:border-command-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Camera Identifier (ID)
                  </label>
                  <input
                    type="text"
                    value={cameraId}
                    onChange={e => setCameraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-mono focus:outline-none focus:border-command-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Physical Location / Landmark *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Sitabuldi Main Junction"
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs focus:outline-none focus:border-command-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    City Zone
                  </label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs focus:outline-none focus:border-command-accent"
                  >
                    <option>Zone 1 - Central Business District</option>
                    <option>Zone 2 - Transit Hubs</option>
                    <option>Zone 3 - Commercial Markets</option>
                    <option>Zone 4 - Highways & Tolls</option>
                    <option>Zone 5 - Restricted Security Zones</option>
                    <option>Zone 6 - Industrial & Logistics</option>
                    <option>Zone 7 - Public Parks & Recreation</option>
                  </select>
                </div>
              </div>

              {/* Coordinates & Location Picker */}
              <div className="p-4 rounded-lg bg-command-card/50 border border-command-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-heading uppercase text-command-textDim flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-command-cyan" /> Geographic Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="px-3 py-1 rounded bg-command-accent/20 hover:bg-command-accent/30 text-command-cyan border border-command-accent/40 text-xs font-mono font-medium transition-colors"
                  >
                    [Pick Location on Map]
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-command-muted font-mono mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={e => setLat(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-command-surface border border-command-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-command-muted font-mono mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={e => setLng(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-command-surface border border-command-border text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Camera Hardware Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs focus:outline-none focus:border-command-accent"
                  >
                    <option>PTZ</option>
                    <option>Fixed</option>
                    <option>360 Fisheye</option>
                    <option>Thermal</option>
                    <option>ANPR</option>
                    <option>Drone Patrol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Description / Operational Role
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Overhead crowd safety and ANPR"
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs focus:outline-none focus:border-command-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Stream Configuration */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                  Stream Type
                </label>
                <select
                  value={streamType}
                  onChange={e => setStreamType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-mono focus:outline-none focus:border-command-accent"
                >
                  {streamTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                  Live Camera Stream URL *
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={e => setStreamUrl(e.target.value)}
                    placeholder="Enter a verified HLS, WebRTC, MJPEG, or RTSP gateway URL"
                  className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-mono focus:outline-none focus:border-command-accent"
                />
              </div>

              {/* Quick Presets for Demo / Testing */}
              <div className="p-3 rounded-lg bg-command-card/40 border border-command-border">
                <div className="text-xs font-mono text-command-muted mb-2">Quick Test Presets:</div>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStreamUrl(preset.url);
                        setStreamType(preset.type);
                      }}
                      className="px-2.5 py-1 rounded bg-command-surface hover:bg-command-card border border-command-border text-[11px] font-mono text-command-cyan transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* RTSP Credentials (Masked & Protected) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1">
                    Stream Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-command-muted" /> Stream Password (Masked)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {streamType === 'RTSP' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs leading-relaxed">
                  ℹ️ <strong>RTSP Handling Notice:</strong> Browsers cannot play RTSP directly. The backend media gateway will validate and transcode this stream before sending to the client player.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Test Connection (Honest reachability check) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-command-textDim font-heading uppercase">
                    Stream Validation & Diagnostics
                  </div>
                  <div className="text-[11px] text-command-muted font-mono">
                    Target: {streamUrl} ({streamType})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 stroke-[2.5]" />}
                  {isTesting ? 'Testing Link...' : 'Test Connection'}
                </button>
              </div>

              {/* Honest Test Results Card */}
              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.connected 
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' 
                    : 'bg-red-950/30 border-red-800/50 text-red-300'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {testResult.connected ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="font-heading font-bold text-sm tracking-wide text-emerald-400">
                            🟢 CAMERA STREAM CONNECTED
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                          <span className="font-heading font-bold text-sm tracking-wide text-red-400">
                            🔴 UNABLE TO CONNECT
                          </span>
                        </>
                      )}
                    </div>
                    {!testResult.connected && (
                      <button
                        onClick={handleTestConnection}
                        className="px-3 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white text-xs font-mono transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-command-textDim">
                    {testResult.message || (testResult.connected ? 'Stream validated successfully.' : 'Unable to receive packets from camera endpoint.')}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-command-border/40 text-[11px] font-mono">
                    <div>
                      <span className="text-command-muted block">Status:</span>
                      <span className="text-white font-bold">{testResult.connected ? 'ONLINE' : 'FAILED'}</span>
                    </div>
                    <div>
                      <span className="text-command-muted block">Latency:</span>
                      <span className="text-white font-bold">{testResult.latency ? `${testResult.latency} ms` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-command-muted block">FPS:</span>
                      <span className="text-white font-bold">{testResult.fps || 30} FPS</span>
                    </div>
                    <div>
                      <span className="text-command-muted block">Resolution:</span>
                      <span className="text-white font-bold">{testResult.resolution || '1080p'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Preview Box */}
              <div>
                <div className="text-xs font-semibold text-command-textDim font-heading uppercase mb-2">
                  Live Stream Preview Box
                </div>
                <div className="h-56 w-full rounded-lg overflow-hidden border border-command-border">
                  <VideoPlayer
                    camera={{
                      id: cameraId,
                      name: name || 'Test Feed',
                      streamUrl,
                      streamType,
                      status: testResult?.connected === false ? 'offline' : 'online',
                      aiEnabled: true,
                      fps: 30,
                      resolution: '1920x1080'
                    }}
                    autoPlay={true}
                    aspectRatio="h-full w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Configuration */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-command-card border border-command-border">
                <div>
                  <div className="text-sm font-semibold font-heading text-white">
                    Enable Real-Time AI Detection
                  </div>
                  <div className="text-xs text-command-muted">
                    Runs computer vision object classification and boundary detection
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={e => setAiEnabled(e.target.checked)}
                  className="w-5 h-5 accent-command-accent cursor-pointer"
                />
              </div>

              {/* Detection Classes Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-2">
                  Target AI Detection Classes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableClasses.map(cls => {
                    const isChecked = aiClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleToggleClass(cls)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          isChecked
                            ? 'bg-command-accent/20 border-command-accent text-command-cyan shadow-sm shadow-cyan-500/10'
                            : 'bg-command-card border-command-border text-command-muted hover:text-white'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-command-cyan border-command-cyan text-black' : 'border-command-border'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{cls}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confidence Threshold Slider (50% - 90%) */}
              <div className="p-4 rounded-lg bg-command-card/50 border border-command-border space-y-2">
                <div className="flex items-center justify-between text-xs font-heading">
                  <span className="text-command-textDim font-semibold uppercase">Confidence Threshold Slider</span>
                  <span className="text-command-cyan font-mono font-bold text-sm">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(e.target.value)}
                  className="w-full accent-command-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-command-muted">
                  <span>50% (High Recall)</span>
                  <span>70% (Balanced)</span>
                  <span>90% (High Precision)</span>
                </div>
              </div>

              {/* Alert Sensitivity */}
              <div>
                <label className="block text-xs font-semibold text-command-textDim font-heading uppercase mb-2">
                  Alert Trigger Sensitivity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Low', 'Medium', 'High'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAlertSensitivity(lvl)}
                      className={`py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                        alertSensitivity === lvl
                          ? 'bg-command-accent/20 border-command-accent text-command-cyan'
                          : 'bg-command-card border-command-border text-command-muted hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Complete & Summary */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold font-heading text-emerald-400">
                    CAMERA CONFIGURATION READY FOR DEPLOYMENT
                  </div>
                  <div className="text-xs text-emerald-300/80">
                    Node will be registered on the live city grid and stream channels activated.
                  </div>
                </div>
              </div>

              {/* Deployment Summary Table */}
              <div className="bg-command-card/60 rounded-lg border border-command-border p-4 divide-y divide-command-border/40 text-xs font-mono">
                <div className="flex justify-between py-2">
                  <span className="text-command-muted">Camera ID & Name:</span>
                  <span className="text-white font-bold">{cameraId} · {name || 'Surveillance Node'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-command-muted">Location / Zone:</span>
                  <span className="text-white">{location || 'City Grid'} ({zone})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-command-muted">Coordinates:</span>
                  <span className="text-command-cyan">{lat}, {lng}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-command-muted">Stream Protocol:</span>
                  <span className="text-white">{streamType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-command-muted">AI Detection:</span>
                  <span className="text-purple-300">
                    {aiEnabled ? `ON (${aiClasses.length} classes @ ${confidenceThreshold}%)` : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-command-border bg-command-card/80 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-medium text-command-textDim hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-medium text-command-textDim hover:text-white transition-colors"
            >
              Cancel
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && !testResult) {
                    handleTestConnection();
                  }
                  setStep(prev => prev + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveCamera}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black text-xs font-bold font-heading transition-all shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[2.5]" /> [Add Camera]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={Number(lat)}
        initialLng={Number(lng)}
        onConfirm={(pickedLat, pickedLng) => {
          setLat(pickedLat);
          setLng(pickedLng);
        }}
      />
    </div>
  );
}
