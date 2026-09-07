import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Activity, RefreshCw, Zap, CheckCircle2, 
  Sliders, ShieldCheck, Layers, Eye
} from 'lucide-react';

export default function AIModelsPage() {
  const { addToast } = useApp();

  const [models, setModels] = useState([
    { id: 'MOD-01', name: 'YOLOv11x City Surveillance', type: 'Object & Vehicle Detection', version: 'v11.2.4', status: 'Active', latency: '16ms', fps: '62 FPS', accuracy: '96.8%', gpuUsage: '68%', classes: 24, targetDevices: 'NVIDIA TensorRT / WebGPU' },
    { id: 'MOD-02', name: 'DeepSORT Multi-Camera ReID', type: 'Cross-Camera Tracking', version: 'v3.1.0', status: 'Active', latency: '12ms', fps: '85 FPS', accuracy: '94.2%', gpuUsage: '42%', classes: 4, targetDevices: 'CUDA / CoreML' },
    { id: 'MOD-03', name: 'CrowdNet Density Estimator', type: 'Spatial Density & Heatmaps', version: 'v2.8.0', status: 'Active', latency: '22ms', fps: '45 FPS', accuracy: '92.5%', gpuUsage: '34%', classes: 1, targetDevices: 'TensorRT' },
    { id: 'MOD-04', name: 'PyroVision Smoke & Flame AI', type: 'Early Hazard Detection', version: 'v2.1.2', status: 'Active', latency: '14ms', fps: '70 FPS', accuracy: '98.1%', gpuUsage: '28%', classes: 2, targetDevices: 'CUDA' },
    { id: 'MOD-05', name: 'ANPR FastPlate OCR', type: 'License Plate Recognition', version: 'v4.0.1', status: 'Active', latency: '19ms', fps: '55 FPS', accuracy: '97.4%', gpuUsage: '38%', classes: 8, targetDevices: 'TensorRT' }
  ]);

  const [isReloading, setIsReloading] = useState(null);

  const handleReloadModel = (modId) => {
    setIsReloading(modId);
    setTimeout(() => {
      setIsReloading(null);
      addToast('Model Weights Reloaded', `Inference runtime warm for ${modId}`, 'success');
    }, 800);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              COMPUTER VISION AI MODELS & PIPELINES
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Real-time deep learning models deployed across edge and cloud TensorRT inference runtimes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
            5 / 5 INFERENCE ENGINES ACTIVE
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {models.map(mod => (
          <div key={mod.id} className="p-5 rounded-xl bg-command-surface border border-command-border shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-command-cyan uppercase px-2 py-0.5 rounded bg-command-card border border-command-border">
                    {mod.id} · {mod.version}
                  </span>
                  <h3 className="text-sm font-bold font-heading text-white mt-1.5">
                    {mod.name}
                  </h3>
                  <div className="text-xs text-command-textDim font-sans">
                    {mod.type}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {mod.status}
                </span>
              </div>

              {/* Hardware & Inference Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-command-card/50 border border-command-border/60 text-center font-mono text-xs">
                <div>
                  <div className="text-[10px] text-command-muted">Latency</div>
                  <div className="text-command-cyan font-bold mt-0.5">{mod.latency}</div>
                </div>
                <div>
                  <div className="text-[10px] text-command-muted">Throughput</div>
                  <div className="text-white font-bold mt-0.5">{mod.fps}</div>
                </div>
                <div>
                  <div className="text-[10px] text-command-muted">Precision</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{mod.accuracy}</div>
                </div>
              </div>

              {/* Target Devices & Classes */}
              <div className="space-y-1.5 text-xs font-mono text-command-textDim">
                <div className="flex justify-between">
                  <span className="text-command-muted">Compute Device:</span>
                  <span className="text-white">{mod.targetDevices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-command-muted">NPU / GPU Load:</span>
                  <span className="text-purple-300 font-bold">{mod.gpuUsage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-command-muted">Object Classes:</span>
                  <span className="text-white">{mod.classes} classes</span>
                </div>
              </div>
            </div>

            {/* Reload / Retune Model Button */}
            <div className="pt-2 border-t border-command-border/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-command-muted">Warm TensorRT Cache</span>
              <button
                onClick={() => handleReloadModel(mod.id)}
                disabled={isReloading === mod.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-mono text-command-cyan transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading === mod.id ? 'animate-spin' : ''}`} />
                <span>{isReloading === mod.id ? 'Reloading...' : 'Reload Model'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
