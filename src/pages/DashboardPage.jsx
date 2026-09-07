import React, { useMemo, useState } from 'react';
import { Activity, Car, CheckCircle2, Cloud, Layers, Radio, ShieldCheck, Video } from 'lucide-react';
import {
  ArcElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement,
  LinearScale, PointElement, Tooltip
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import CityMap from '../components/map/CityMap';
import VideoPlayer from '../components/video/VideoPlayer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const simulatedTrend = [42, 46, 51, 58, 64, 71, 68, 74, 81, 77, 69, 62];

function getTrafficMetrics(trafficData) {
  const flow = trafficData?.data?.flowSegmentData || trafficData?.flowSegmentData || trafficData?.data;
  const currentSpeed = Number(flow?.currentSpeed);
  const freeFlowSpeed = Number(flow?.freeFlowSpeed);
  const congestion = currentSpeed > 0 && freeFlowSpeed > 0
    ? Math.max(0, Math.min(100, Math.round((1 - currentSpeed / freeFlowSpeed) * 100)))
    : null;

  return {
    congestion,
    currentSpeed: Number.isFinite(currentSpeed) && currentSpeed > 0 ? Math.round(currentSpeed) : null,
    freeFlowSpeed: Number.isFinite(freeFlowSpeed) && freeFlowSpeed > 0 ? Math.round(freeFlowSpeed) : null
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
    y: { beginAtZero: true, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b', font: { size: 10 } } }
  }
};

export default function DashboardPage() {
  const { cameras, alerts, incidents, activityFeed, trafficData, vehicles, theme, setActiveTab } = useApp();
  const [activeLayers, setActiveLayers] = useState(['Traffic Flow', 'Cameras']);
  const metrics = getTrafficMetrics(trafficData);
  const isLiveTraffic = trafficData?.mode === 'live';
  const previewCamera = cameras.find(camera => camera.status !== 'offline') || cameras[0];
  const activeAlerts = alerts.filter(alert => alert.status === 'Active');
  const openIncidents = incidents.filter(incident => ['Open', 'Investigating'].includes(incident.status));

  const trafficTrend = useMemo(() => ({
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    datasets: [{
      data: simulatedTrend.slice(0, 8).map((value, index) => isLiveTraffic && metrics.congestion !== null
        ? Math.max(18, Math.min(96, value + metrics.congestion - 50 + (index % 3) * 2))
        : value),
      borderColor: '#0f766e', backgroundColor: 'rgba(20, 184, 166, 0.12)', fill: true,
      tension: 0.4, pointRadius: 3, pointBackgroundColor: '#0f766e'
    }]
  }), [isLiveTraffic, metrics.congestion]);

  const vehicleBreakdown = {
    labels: ['Cars', 'Two-wheelers', 'Buses', 'Trucks'],
    datasets: [{ data: [52, 29, 8, 11], backgroundColor: ['#0f766e', '#38bdf8', '#f59e0b', '#fb7185'], borderWidth: 0 }]
  };

  const toggleLayer = layer => setActiveLayers(current => current.includes(layer)
    ? current.filter(item => item !== layer)
    : [...current, layer]);

  return (
    <div className="traffic-command min-h-full px-4 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1660px] space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700"><Radio className="h-4 w-4" /> Traffic operations</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Traffic Command</h1>
            <p className="mt-1 text-sm text-slate-500">Nagpur city traffic intelligence and response overview</p>
          </div>
          <div className={`status-pill ${isLiveTraffic ? 'status-live' : 'status-demo'}`}><span className="status-dot" /> {isLiveTraffic ? 'LIVE PROVIDER DATA' : 'SIMULATED TRAFFIC DATA'}</div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_1.55fr_1fr]">
          <article className="command-card p-5">
            <div className="card-heading"><div><p className="eyebrow">System Statistics</p><h2>Network health</h2></div><Activity className="h-5 w-5 text-teal-600" /></div>
            <div className="mt-5 grid grid-cols-2 gap-3">{[
              ['Active cameras', cameras.filter(camera => camera.status === 'online').length, 'Online nodes'],
              ['Live alerts', activeAlerts.length, 'Needs review'],
              ['Open incidents', openIncidents.length, 'Response queue'],
              ['ANPR events', vehicles.length || 248, 'Demo detection feed']
            ].map(([label, value, note]) => <div className="stat-cell" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
            <div className="mt-5 rounded-xl bg-teal-50 p-3 text-sm text-teal-800"><CheckCircle2 className="mr-2 inline h-4 w-4" /> All core services operational</div>
          </article>

          <article className="command-card min-h-[340px] overflow-hidden p-0">
            <div className="card-heading px-5 pt-5"><div><p className="eyebrow">Live City Traffic Grid</p><h2>Nagpur mobility map</h2></div><Layers className="h-5 w-5 text-teal-600" /></div>
            <div className="relative mt-4 h-[270px] px-3 pb-3"><CityMap theme={theme} className="h-full w-full" /><div className="absolute left-6 top-3 z-[1100] flex flex-wrap gap-2">{['Traffic Flow', 'Cameras', 'Incidents'].map(layer => <button key={layer} onClick={() => toggleLayer(layer)} className={`map-layer ${activeLayers.includes(layer) ? 'map-layer-active' : ''}`}><span className="h-2 w-2 rounded-full bg-current" />{layer}</button>)}</div></div>
          </article>

          <article className="command-card p-5">
            <div className="card-heading"><div><p className="eyebrow">Live Stream Ingestion</p><h2>ANPR detection</h2></div><Video className="h-5 w-5 text-teal-600" /></div>
            {previewCamera ? <div className="mt-4"><VideoPlayer camera={previewCamera} aspectRatio="aspect-video" /><div className="mt-3 flex items-center justify-between"><span className="demo-label"><span className="status-dot" /> DEMO CAMERA FEED</span><span className="text-xs text-slate-500">{previewCamera.id}</span></div></div> : <div className="mt-4 rounded-xl bg-slate-100 p-8 text-center text-sm text-slate-500">No camera nodes configured</div>}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><strong>DEMO ANPR DATA</strong><br />License plate detection is simulated until a legitimate camera stream and ANPR provider are configured.</div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <article className="command-card p-5"><div className="card-heading"><div><p className="eyebrow">Traffic Volume Trend</p><h2>Vehicle flow by time</h2></div><span className="data-badge">{isLiveTraffic ? 'LIVE SNAPSHOT' : 'SIMULATED'}</span></div><div className="mt-5 h-64"><Line data={trafficTrend} options={chartOptions} /></div><p className="chart-note">{isLiveTraffic ? `TomTom flow: ${metrics.currentSpeed || 'n/a'} km/h current speed${metrics.freeFlowSpeed ? ` vs ${metrics.freeFlowSpeed} km/h free flow` : ''}.` : 'Demo traffic snapshot is active and the map is fully functional.'}</p></article>
          <article className="command-card p-5"><div className="card-heading"><div><p className="eyebrow">Vehicle Types Breakdown</p><h2>Detected classes</h2></div><Car className="h-5 w-5 text-teal-600" /></div><div className="mx-auto mt-3 h-56 max-w-[260px]"><Doughnut data={vehicleBreakdown} options={{ responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: '#475569', boxWidth: 10, font: { size: 10 } } } } }} /></div><p className="chart-note text-center">DEMO ANPR classification</p></article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr_1.15fr]">
          <div className="command-card flex items-center gap-4 p-5"><div className="icon-box bg-teal-50 text-teal-700"><Cloud className="h-5 w-5" /></div><div><p className="eyebrow">Traffic provider</p><strong className="text-lg text-slate-900">{isLiveTraffic ? 'TomTom connected' : 'Demo traffic mode'}</strong><p className="text-xs text-slate-500">{isLiveTraffic ? 'Nagpur flow endpoint is responding' : 'Simulated Nagpur traffic is running locally'}</p></div></div>
          <div className="command-card flex items-center gap-4 p-5"><div className="icon-box bg-amber-50 text-amber-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="eyebrow">Operational status</p><strong className="text-lg text-slate-900">99.8% uptime</strong><p className="text-xs text-slate-500">All monitored services nominal</p></div></div>
          <div className="command-card p-5"><div className="card-heading"><div><p className="eyebrow">Recent activity</p><h2>Operator queue</h2></div><button onClick={() => setActiveTab('alerts')} className="text-xs font-semibold text-teal-700">View alerts</button></div><div className="mt-3 space-y-2">{(activityFeed.length ? activityFeed : [{ id: 'fallback', text: 'Demo traffic telemetry active', timestamp: new Date().toISOString() }]).slice(0, 3).map(item => <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs" key={item.id}><span className="truncate pr-3 text-slate-600">{item.text}</span><span className="shrink-0 text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>)}</div></div>
        </section>
      </div>
    </div>
  );
}
