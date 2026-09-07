import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, TrendingUp, Users, Car, AlertTriangle, 
  Clock, Activity, Calendar, Filter, Download
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const { cameras } = useApp();
  const [timeRange, setTimeRange] = useState('24h'); // 'Today' | '24h' | '7d' | '30d' | 'Custom'

  // Hourly detection data
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  const detectionsTrendData = {
    labels: hours,
    datasets: [
      {
        label: 'People / Pedestrians',
        data: [120, 80, 110, 650, 2400, 3800, 4200, 3900, 4800, 5200, 3100, 1400],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Vehicles (ANPR)',
        data: [450, 210, 320, 1400, 3800, 4200, 3900, 3600, 4600, 5100, 3200, 1800],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const alertDistributionData = {
    labels: ['Critical Intrusion', 'Crowd Surge', 'Traffic Congestion', 'Hazard / Smoke', 'Unattended Object'],
    datasets: [
      {
        data: [12, 28, 45, 8, 14],
        backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#06b6d4'],
        borderWidth: 1,
        borderColor: '#0b1329',
      },
    ],
  };

  const cameraActivityData = {
    labels: ['CAM-001', 'CAM-002', 'CAM-003', 'CAM-004', 'CAM-005', 'CAM-006', 'CAM-007'],
    datasets: [
      {
        label: 'Detections (x100)',
        data: [42, 58, 36, 64, 22, 31, 48],
        backgroundColor: '#06b6d4',
        borderRadius: 6,
      },
      {
        label: 'Alerts Triggered',
        data: [4, 8, 2, 6, 9, 1, 3],
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Space Grotesk', size: 11 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 41, 59, 0.5)' },
        ticks: { color: '#64748b', font: { family: 'Share Tech Mono' } }
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.5)' },
        ticks: { color: '#64748b', font: { family: 'Share Tech Mono' } }
      }
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner & Filter Controls */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              SURVEILLANCE AI ANALYTICS & FLOW TRENDS
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Temporal patterns, entity density heatmaps, and detection classification breakdown across all cameras.
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 bg-command-card p-1 rounded-lg border border-command-border">
          {['Today', '24h', '7 days', '30 days', 'Custom'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                timeRange === r 
                  ? 'bg-command-accent text-black font-bold shadow-sm' 
                  : 'text-command-muted hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-xs font-mono text-command-muted uppercase">Total Vision Detections</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">148,920</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">▲ 8.4% from yesterday</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="text-xs font-mono text-command-muted uppercase">Avg Inference Latency</div>
          <div className="text-2xl font-bold font-mono text-command-cyan mt-1">18.4 ms</div>
          <div className="text-[11px] text-command-textDim font-mono mt-1">YOLOv11x on TensorRT</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="text-xs font-mono text-command-muted uppercase">Total Alerts Raised</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">107</div>
          <div className="text-[11px] text-command-textDim font-mono mt-1">94% response rate</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="text-xs font-mono text-command-muted uppercase">Fleet Health Score</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">99.4%</div>
          <div className="text-[11px] text-command-textDim font-mono mt-1">7 / 8 nodes operational</div>
        </div>
      </div>

      {/* Chart Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Detections Trend Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-command-border pb-3">
            <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-command-cyan" /> Detections By Hour (People vs Vehicles)
            </h2>
            <span className="text-[11px] font-mono text-command-muted">{timeRange} View</span>
          </div>

          <div className="h-72 w-full">
            <Line data={detectionsTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Alert Severity & Class Doughnut Chart */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-command-border pb-3">
            <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Alert Category Breakdown
            </h2>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <Doughnut 
              data={alertDistributionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Chart: Per Camera Activity Bar Chart */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-command-border pb-3">
          <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-command-cyan" /> Activity & Anomaly Frequency per Surveillance Node
          </h2>
        </div>

        <div className="h-64 w-full">
          <Bar data={cameraActivityData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
