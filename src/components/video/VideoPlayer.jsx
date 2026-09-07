import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Maximize2, Minimize2, Camera, RefreshCw, AlertOctagon, 
  Eye, EyeOff, Radio, Play, Pause, Volume2, VolumeX, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VideoPlayer({
  camera,
  showOverlay = true,
  autoPlay = true,
  lazy = false,
  aspectRatio = 'aspect-video',
  className = '',
  onSnapshot
}) {
  const { addToast } = useApp();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const synthCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiOverlayActive, setAiOverlayActive] = useState(showOverlay);
  const [fps, setFps] = useState(camera?.fps || 30);
  const [retryCount, setRetryCount] = useState(0);

  const isOffline = camera?.status === 'offline';
  const isDemo = !camera?.streamUrl;
  const hasNoRealStream = !camera?.streamUrl;

  // Real-time canvas synthetic video generator for realistic CCTV feeds
  useEffect(() => {
    if (!isDemo || isOffline || !isPlaying) return;

    const canvas = synthCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Seeded objects for this camera
    const objects = [
      { id: 1, type: 'Car', x: 50, y: 180, speed: 2.2, color: '#3b82f6', width: 45, height: 25, label: 'DL-01-AX-9921', conf: 94 },
      { id: 2, type: 'Car', x: 220, y: 150, speed: 1.8, color: '#60a5fa', width: 40, height: 22, label: 'HR-26-BK-4412', conf: 91 },
      { id: 3, type: 'Person', x: 120, y: 80, speed: 0.8, color: '#06b6d4', width: 14, height: 28, label: 'P-104', conf: 88 },
      { id: 4, type: 'Person', x: 340, y: 110, speed: -0.6, color: '#06b6d4', width: 14, height: 28, label: 'P-105', conf: 85 },
      { id: 5, type: 'Truck', x: 400, y: 210, speed: -1.4, color: '#8b5cf6', width: 65, height: 32, label: 'COMMERCIAL', conf: 89 }
    ];

    let frameCount = 0;

    const renderSynthStream = () => {
      const width = canvas.width;
      const height = canvas.height;
      frameCount++;

      // Background Surveillance Scene
      ctx.fillStyle = '#0a1222';
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid / Roadway
      ctx.strokeStyle = 'rgba(30, 58, 102, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i * 1.4 - width * 0.2, height);
        ctx.stroke();
      }

      // Asphalt Road Surface
      ctx.fillStyle = '#0d182b';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width, height * 0.45);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Road Lane Markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.lineTo(width, height * 0.72);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sidewalk / Building outline
      ctx.fillStyle = '#08101d';
      ctx.fillRect(0, 0, width, height * 0.45);

      // Render & Animate Moving Entities
      objects.forEach(obj => {
        obj.x += obj.speed;
        if (obj.speed > 0 && obj.x > width + 50) obj.x = -60;
        if (obj.speed < 0 && obj.x < -60) obj.x = width + 50;

        // Vehicle / Person Body Sprite
        ctx.fillStyle = obj.color;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Headlights / Direction marker
        if (obj.type !== 'Person') {
          ctx.fillStyle = obj.speed > 0 ? '#fef08a' : '#ef4444';
          ctx.fillRect(obj.speed > 0 ? obj.x + obj.width - 3 : obj.x, obj.y + 4, 3, obj.height - 8);
        }

        // Draw AI Bounding Box & Label if enabled
        if (aiOverlayActive && camera?.aiEnabled) {
          const pad = 4;
          const bx = obj.x - pad;
          const by = obj.y - pad;
          const bw = obj.width + pad * 2;
          const bh = obj.height + pad * 2;

          // Corner Reticle style Bounding Box
          ctx.strokeStyle = obj.type === 'Person' ? '#06b6d4' : obj.type === 'Truck' ? '#a855f7' : '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // AI Label Tag
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillRect(bx, by - 14, ctx.measureText(`${obj.type} ${obj.conf}%`).width + 8, 14);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px "Share Tech Mono", monospace';
          ctx.fillText(`${obj.type} ${obj.conf}%`, bx + 3, by - 3);

          // Watermark tag
          ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.font = '8px "Share Tech Mono", monospace';
          ctx.fillText(`ID:${obj.id}`, bx, by + bh + 9);
        }
      });

      // Camera Watermark & HUD Info Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillText(`REC 🔴  [${camera?.id || 'CAM'}] ${camera?.name || 'FEED'}`, 12, 18);
      ctx.fillText(`${new Date().toISOString()}`, 12, 32);
      ctx.fillText(`FPS: ${fps} | LAT: ${camera?.latency || 32}ms | AI: YOLOv11`, width - 180, 18);

      // Scanline Effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }

      setIsLoading(false);
      animationId = requestAnimationFrame(renderSynthStream);
    };

    animationId = requestAnimationFrame(renderSynthStream);

    return () => cancelAnimationFrame(animationId);
  }, [isDemo, isOffline, isPlaying, aiOverlayActive, camera, fps]);

  // HLS.js or Direct HTML5 Stream Player
  useEffect(() => {
    if (isDemo) {
      setIsLoading(true);
      setHasError(false);
      return;
    }

    if (hasNoRealStream || isOffline) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(isOffline
        ? `Camera offline — no frames received from ${camera?.id || 'device'}.`
        : 'Data unavailable — this camera has no verified live stream URL.');
      return;
    }

    const video = videoRef.current;
    if (!video || !camera?.streamUrl) return;

    let hls = null;
    setIsLoading(true);
    setHasError(false);

    const streamUrl = camera.streamUrl;

    if (streamUrl.endsWith('.m3u8') || camera.streamType?.includes('HLS')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setHasError(true);
                setErrorMessage('Stream protocol error or network unreachable.');
                setIsLoading(false);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });
      }
    } else {
      // Standard MP4 / HTTP stream
      video.src = streamUrl;
      video.load();
      video.onloadeddata = () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      };
      video.onerror = () => {
        setHasError(true);
        setErrorMessage('Unable to load video resource from specified URL.');
        setIsLoading(false);
      };
    }

    return () => {
      if (hls) hls.destroy();
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [camera?.streamUrl, camera?.streamType, hasNoRealStream, isDemo, isOffline, autoPlay, retryCount]);

  // Capture Snapshot Handler
  const handleSnapshot = () => {
    let dataUrl = null;
    if (hasNoRealStream) {
      addToast('Snapshot unavailable', 'No verified live camera data is available.', 'error');
      return;
    } else if (videoRef.current) {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = videoRef.current.videoWidth || 1280;
      snapCanvas.height = videoRef.current.videoHeight || 720;
      const sCtx = snapCanvas.getContext('2d');
      sCtx.drawImage(videoRef.current, 0, 0, snapCanvas.width, snapCanvas.height);
      dataUrl = snapCanvas.toDataURL('image/jpeg');
    }

    if (dataUrl) {
      // Trigger download
      const link = document.createElement('a');
      link.download = `SNAPSHOT-${camera?.id || 'CAM'}-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      addToast('Snapshot Saved', `Exported live frame from ${camera?.name}`, 'success');
      if (onSnapshot) onSnapshot(dataUrl);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-black rounded-lg overflow-hidden border border-command-border/80 shadow-lg ${aspectRatio} ${className}`}
    >
      {/* 1. Offline State Banner */}
      {isOffline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-command-bg/95 p-6 text-center z-20">
          <AlertOctagon className="w-10 h-10 text-command-critical mb-3 animate-pulse" />
          <div className="text-sm font-semibold font-heading text-red-400 mb-1">
            🔴 CAMERA STREAM OFFLINE
          </div>
          <div className="text-xs text-command-muted max-w-xs mb-4">
            {camera?.description || `Unable to receive frames from ${camera?.id || 'CAM-004'}. Heartbeat signal lost.`}
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      ) : hasError ? (
        /* 2. Error State */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-command-bg/95 p-6 text-center z-20">
          <ShieldAlert className="w-10 h-10 text-command-warning mb-3" />
          <div className="text-sm font-semibold font-heading text-amber-400 mb-1">
            STREAM CONNECTION FAILED
          </div>
          <div className="text-xs text-command-muted max-w-xs mb-4">
            {errorMessage || "Preview unavailable — camera saved for later connection."}
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      ) : null}

      {/* 3. Loading State */}
      {isLoading && !isOffline && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-command-card/80 backdrop-blur-sm z-20">
          <RefreshCw className="w-8 h-8 text-command-cyan animate-spin mb-2" />
          <span className="text-xs font-mono text-command-cyan tracking-wider">
            CONNECTING TO STREAM...
          </span>
        </div>
      )}

      {/* Real HTML5 / HLS video only; demo and missing sources show the unavailable state above. */}
      {isDemo && !isOffline && (
        <canvas
          ref={synthCanvasRef}
          width="640"
          height="360"
          className="w-full h-full object-cover"
        />
      )}

      {!isDemo && !hasNoRealStream && !isOffline && (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay={autoPlay}
          loop
          className="w-full h-full object-cover"
        />
      )}

      {/* AI overlays are only available when a real video feed is connected. */}
      {!isDemo && !hasNoRealStream && !isOffline && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none ${aiOverlayActive ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* 7. Status HUD Badges (Top Left & Top Right) */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
          isOffline 
            ? 'bg-red-950/80 text-red-400 border border-red-800' 
            : camera?.status === 'alert'
            ? 'bg-amber-950/80 text-amber-400 border border-amber-800 animate-pulse'
            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isOffline ? 'bg-red-500' : camera?.status === 'alert' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          {isOffline ? 'OFFLINE' : camera?.status === 'alert' ? 'ALERT ACTIVE' : 'LIVE'}
        </span>

        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/90">
          {camera?.id || 'CAM-001'}
        </span>
      </div>

      {/* Top Right: AI Status / Demo Badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 pointer-events-none">
        {isDemo && (
          <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700 text-[9px] font-mono font-semibold">
            DEMO MODE
          </span>
        )}
        {camera?.aiEnabled && (
          <span className="px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 text-[9px] font-mono">
            AI ACTIVE
          </span>
        )}
      </div>

      {/* 8. Bottom Hover Controls Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* AI Overlay Toggle */}
          <button
            onClick={() => setAiOverlayActive(prev => !prev)}
            className={`p-1.5 rounded text-xs transition-colors ${
              aiOverlayActive ? 'text-command-cyan bg-command-card/80' : 'text-command-muted hover:text-white bg-black/50'
            }`}
            title={aiOverlayActive ? "Hide AI Bounding Boxes" : "Show AI Bounding Boxes"}
          >
            {aiOverlayActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleSnapshot}
            className="p-1.5 rounded bg-black/50 hover:bg-command-card text-command-muted hover:text-white transition-colors"
            title="Capture High-Res Frame Snapshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/80">
            {fps} FPS · {camera?.resolution || '1080p'}
          </span>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-black/50 hover:bg-command-card text-command-muted hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
