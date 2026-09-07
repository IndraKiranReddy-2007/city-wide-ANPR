import React, { useEffect, useState } from 'react';
import { Film, Upload, Trash2, LoaderCircle, AlertCircle, ScanSearch } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getVehicleDetections(result) {
  const detections = result?.vehicles || result?.detections || result?.results;
  return Array.isArray(detections) ? detections : [];
}

export default function TrafficVideoUpload() {
  const [videos, setVideos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraId, setCameraId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/traffic-videos');
      const data = await response.json();
      setVideos(data.success ? data.videos : []);
      if (!data.success) setMessage(data.message || 'Video data unavailable.');
    } catch (error) {
      setMessage('Video service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Choose a traffic video first.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading video...');
    const formData = new FormData();
    formData.append('video', selectedFile);
    if (cameraId.trim()) formData.append('cameraId', cameraId.trim());

    try {
      const response = await fetch('/api/traffic-videos', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Upload failed.');
      setSelectedFile(null);
      event.target.reset();
      setMessage('Traffic video uploaded.');
      await loadVideos();
    } catch (error) {
      setMessage(error.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/traffic-videos/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete video.');
      setVideos(previous => previous.filter(video => video.id !== id));
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzingId(id);
    setAnalysis(previous => ({ ...previous, [id]: { available: false, message: 'Analyzing uploaded video...' } }));
    try {
      const response = await fetch(`/api/traffic-videos/${encodeURIComponent(id)}/analyze`, { method: 'POST' });
      const data = await response.json();
      setAnalysis(previous => ({ ...previous, [id]: data }));
    } catch (error) {
      setAnalysis(previous => ({ ...previous, [id]: { available: false, message: 'Analysis service unavailable.' } }));
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <section className="glass-panel rounded-xl p-4 lg:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-command-cyan" />
            <h2 className="text-sm font-bold font-heading text-white tracking-wide">TRAFFIC VIDEO EVIDENCE</h2>
          </div>
          <p className="text-xs text-command-textDim mt-1">Upload a traffic recording to detect vehicle number plates and vehicle colors.</p>
        </div>
        <span className="text-[10px] font-mono text-command-muted border border-command-border rounded px-2 py-1">MAX 500 MB · VIDEO ONLY</span>
      </div>

      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2">
        <input
          type="file"
          accept="video/*"
          onChange={event => setSelectedFile(event.target.files?.[0] || null)}
          className="w-full rounded-lg bg-command-surface border border-command-border px-3 py-2 text-xs text-command-textDim file:mr-3 file:border-0 file:bg-command-card file:px-2 file:py-1 file:text-xs file:text-command-cyan"
        />
        <input
          value={cameraId}
          onChange={event => setCameraId(event.target.value)}
          placeholder="Camera ID (optional)"
          className="rounded-lg bg-command-surface border border-command-border px-3 py-2 text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-accent"
        />
        <button disabled={isUploading} className="flex items-center justify-center gap-2 rounded-lg bg-command-accent px-4 py-2 text-xs font-bold text-black disabled:opacity-50">
          {isUploading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Uploading' : 'Upload video'}
        </button>
      </form>

      {message && (
        <div className="flex items-center gap-2 text-xs text-command-textDim">
          <AlertCircle className="w-3.5 h-3.5 text-command-warning" /> {message}
        </div>
      )}

      {isLoading ? (
        <div className="text-xs text-command-muted">Loading uploaded videos...</div>
      ) : videos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-command-border p-5 text-center text-xs text-command-muted">No traffic video uploaded.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {videos.map(video => (
            <article key={video.id} className="overflow-hidden rounded-lg border border-command-border bg-command-card/50">
              <video controls preload="metadata" src={video.url} className="aspect-video w-full bg-black" />
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white">{video.name}</div>
                  <div className="text-[10px] font-mono text-command-muted">{formatBytes(video.sizeBytes)} · {new Date(video.uploadedAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAnalyze(video.id)} disabled={analyzingId === video.id} className="flex items-center gap-1 rounded border border-command-cyan/40 px-2 py-1.5 text-[11px] text-command-cyan disabled:opacity-50" title="Read plates and detect vehicles with configured analysis provider">
                    {analyzingId === video.id ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <ScanSearch className="w-3.5 h-3.5" />}
                    Analyze
                  </button>
                  <button onClick={() => handleDelete(video.id)} title="Delete uploaded video" className="rounded p-2 text-command-muted hover:bg-red-950/50 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {analysis[video.id] && (
                <div className="border-t border-command-border px-3 py-2 text-[11px] font-mono">
                  {analysis[video.id].available ? (
                    <>
                      {getVehicleDetections(analysis[video.id].result).length > 0 ? (
                        <div className="mb-3 overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="text-command-muted">
                              <tr><th className="pb-1 pr-3">Vehicle</th><th className="pb-1 pr-3">Number plate</th><th className="pb-1 pr-3">Color</th><th className="pb-1 pr-3">State</th><th className="pb-1">Confidence</th></tr>
                            </thead>
                            <tbody>
                              {getVehicleDetections(analysis[video.id].result).map((vehicle, index) => (
                                <tr key={vehicle.id || index} className="border-t border-command-border">
                                  <td className="py-1.5 pr-3 text-white">{vehicle.type || vehicle.class || `Vehicle ${index + 1}`}</td>
                                  <td className="py-1.5 pr-3 text-emerald-300">{vehicle.plate || vehicle.licensePlate || vehicle.numberPlate || 'Not detected'}</td>
                                  <td className="py-1.5 pr-3 text-cyan-300">{vehicle.color || vehicle.vehicleColor || 'Not detected'}</td>
                                  <td className="py-1.5 pr-3 text-amber-300">{vehicle.state || vehicle.registrationState || vehicle.plateState || 'Not detected'}</td>
                                  <td className="py-1.5 text-command-muted">{vehicle.confidence ? `${Math.round(Number(vehicle.confidence) * (Number(vehicle.confidence) <= 1 ? 100 : 1))}%` : 'n/a'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-command-muted">No vehicles detected in this video.</div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-1 text-command-muted">
                      <div>{analysis[video.id].message || 'Analysis data unavailable.'}</div>
                      {analysis[video.id].message?.includes('VIDEO_ANALYSIS_API_URL') && (
                        <div className="text-command-warning">Enable LOCAL_VIDEO_ANALYZER=true with YOLO and EasyOCR installed, or configure a remote video-analysis provider.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
