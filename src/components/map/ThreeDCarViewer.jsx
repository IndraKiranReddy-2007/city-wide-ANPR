import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, Stage, ContactShadows, useGLTF } from '@react-three/drei';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-white">{Math.round(progress)}%</Html>;
}

function Model({ url }) {
  // useGLTF from drei provides caching and handles typical glTF needs
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} dispose={null} />;
}

function SceneWrapper({ url }) {
  // Small performance tweak: use a fixed camera and stage to get realistic lighting
  return (
    <Stage adjustCamera preset="rembrandt" intensity={1} shadows={{ type: 'contact', opacity: 0.6 }}>
      <Model url={url} />
    </Stage>
  );
}

export default function ThreeDCarViewer() {
  const { is3DViewerOpen, setIs3DViewerOpen, active3DModelUrl } = useApp();
  const localModel = active3DModelUrl || '/models/car.glb';
  const [modelUrl, setModelUrl] = useState(localModel);
  const [modelAvailable, setModelAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkModel = async () => {
      try {
        const res = await fetch(localModel, { method: 'HEAD' });
        if (!mounted) return;
        if (res.ok) {
          setModelUrl(localModel);
          setModelAvailable(true);
          return;
        }
      } catch (e) {
        // ignore
      }
      if (mounted) {
        setModelAvailable(false);
      }
    };

    checkModel();
    return () => { mounted = false; };
  }, [localModel]);

  if (!is3DViewerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-6xl bg-command-surface border border-command-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-command-border bg-command-card/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-command-cyan shadow-[0_0_10px_#06b6d4]" />
              <h3 className="text-sm font-bold text-white tracking-wide">VEHICLE MODEL INSPECTION</h3>
            </div>
            <span className="text-[11px] text-command-textDim font-mono">Verified asset preview · interactive viewport</span>
          </div>
          <button onClick={() => setIs3DViewerOpen(false)} className="text-command-muted hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-[76vh] bg-[#05080f] relative">
          {!modelAvailable && (
            <div className="w-full h-full flex items-center justify-center text-white text-sm p-6">
              <div className="max-w-md text-center space-y-3 border border-command-border rounded-xl bg-command-card/70 p-6">
                <div className="font-bold">Model data unavailable</div>
                <div className="text-command-textDim">No verified 3D asset was found at <strong>{localModel}</strong>.</div>
                <div className="mt-2">
                  <button onClick={() => setIs3DViewerOpen(false)} className="px-3 py-1.5 rounded bg-command-accent text-black font-bold">Close viewer</button>
                </div>
              </div>
            </div>
          )}
          {modelAvailable && (
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.6, 3], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <Suspense fallback={<Loader />}>
              <SceneWrapper url={modelUrl} />
              <Environment preset="studio" background={false} />
            </Suspense>
            <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={5} blur={2} far={1} />
            <OrbitControls enablePan enableRotate enableZoom />
          </Canvas>
          )}
        </div>

        <div className="p-4 border-t border-command-border bg-command-card/50 flex items-center justify-between gap-4 text-xs">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-command-textDim">Asset source</div>
            <div className="text-command-cyan font-mono truncate">{modelUrl}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIs3DViewerOpen(false)} className="px-3 py-1.5 rounded bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-textDim hover:text-white transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload && useGLTF.preload('/models/car.glb');
