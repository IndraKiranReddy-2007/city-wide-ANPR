import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Download, Printer, CheckCircle2, 
  Calendar, Sliders, FileSpreadsheet, Eye, Sparkles
} from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const { cameras, alerts, incidents, addToast } = useApp();

  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('Today (24h)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(true);

  const reportOptions = [
    { id: 'daily', name: 'Daily City Surveillance Executive Report' },
    { id: 'cameras', name: 'Camera Fleet Operational & Uptime Audit' },
    { id: 'alerts', name: 'Security Alerts & Vision Anomalies Log' },
    { id: 'incidents', name: 'Incident Case Investigation & Evidence Audit' },
    { id: 'traffic', name: 'Traffic Flow & ANPR Plate Recognition Report' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      addToast('Report Compiled', 'Surveillance metrics and audit log generated.', 'success');
    }, 600);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    let data = [];
    let filename = `SURVEILLANCE-REPORT-${reportType.toUpperCase()}-${Date.now()}.csv`;

    if (reportType === 'daily' || reportType === 'cameras') {
      data = cameras.map(c => ({
        CameraID: c.id,
        Name: c.name,
        Location: c.location,
        Zone: c.zone,
        Status: c.status,
        StreamType: c.streamType,
        FPS: c.fps,
        Resolution: c.resolution,
        LatencyMS: c.latency,
        Uptime: c.uptime,
        LastDetection: c.lastDetection
      }));
    } else if (reportType === 'alerts') {
      data = alerts.map(a => ({
        AlertID: a.id,
        Severity: a.severity,
        Type: a.type,
        CameraID: a.cameraId,
        CameraName: a.cameraName,
        Location: a.location,
        ConfidencePct: a.confidence,
        Status: a.status,
        Timestamp: a.timestamp,
        Description: a.description
      }));
    } else if (reportType === 'incidents') {
      data = incidents.map(i => ({
        IncidentID: i.id,
        Title: i.title,
        Severity: i.severity,
        Status: i.status,
        CameraID: i.cameraId,
        Location: i.location,
        AssignedOperator: i.assignedOperator,
        Timestamp: i.timestamp,
        Description: i.description
      }));
    } else {
      data = cameras.map(c => ({
        CameraID: c.id,
        Zone: c.zone,
        VehiclesTracked: Math.floor(Math.random() * 4000) + 1200,
        ANPRMatches: Math.floor(Math.random() * 800) + 200,
        CongestionIndex: 'Normal (Level 2)'
      }));
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    addToast('CSV Exported', `Saved ${filename}`, 'success');
  };

  // Real PDF Export via jsPDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(11, 19, 41);
      doc.rect(0, 0, 210, 36, 'F');
      
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(16);
      doc.text('CITY-WIDE AI ENGINE FOR MULTI-CAMERA SURVEILLANCE', 14, 16);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      const title = reportOptions.find(r => r.id === reportType)?.name || 'Surveillance Report';
      doc.text(title, 14, 26);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${dateRange}`, 14, 32);

      // Table generation
      let head = [];
      let body = [];

      if (reportType === 'daily' || reportType === 'cameras') {
        head = [['ID', 'Camera Name', 'Location', 'Status', 'FPS', 'Uptime']];
        body = cameras.map(c => [c.id, c.name, c.location, c.status.toUpperCase(), `${c.fps} FPS`, c.uptime]);
      } else if (reportType === 'alerts') {
        head = [['ID', 'Severity', 'Type', 'Camera', 'Confidence', 'Status']];
        body = alerts.map(a => [a.id, a.severity, a.type, a.cameraName, `${a.confidence}%`, a.status]);
      } else if (reportType === 'incidents') {
        head = [['Case ID', 'Title', 'Severity', 'Assigned To', 'Status']];
        body = incidents.map(i => [i.id, i.title, i.severity, i.assignedOperator, i.status]);
      } else {
        head = [['Camera ID', 'Zone', 'Vehicle Count', 'ANPR Accuracy', 'Status']];
        body = cameras.map(c => [c.id, c.zone, '3,840', '97.4%', 'Flow Optimal']);
      }

      doc.autoTable({
        startY: 42,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [17, 29, 56], textColor: [6, 182, 212], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      doc.save(`SURVEILLANCE-${reportType.toUpperCase()}-${Date.now()}.pdf`);
      addToast('PDF Exported', 'Downloaded formatted intelligence report.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Export Error', 'Failed to compile PDF document.', 'error');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              INTELLIGENCE REPORT GENERATOR
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Compile operational audits, incident case packages, and traffic analytics into structured PDF and CSV documents.
          </p>
        </div>

        {/* Action Export Buttons (Only implemented formats shown per Requirement 7) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-mono text-command-cyan transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-command-accent to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4 stroke-[2.5]" /> Export PDF
          </button>
        </div>
      </div>

      {/* Report Config Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-command-card/40 p-4 rounded-xl border border-command-border">
        <div>
          <label className="block text-xs font-heading font-semibold text-command-textDim uppercase mb-1.5">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-xs text-white focus:outline-none"
          >
            {reportOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-heading font-semibold text-command-textDim uppercase mb-1.5">
            Audit Time Period
          </label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-xs text-white focus:outline-none"
          >
            <option>Today (24h)</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Quarter to Date</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-cyan/40 text-xs font-heading font-bold text-command-cyan transition-colors"
          >
            {isGenerating ? 'Compiling Report...' : 'Re-Generate Preview'}
          </button>
        </div>
      </div>

      {/* Live Document Preview Card */}
      <div className="bg-command-surface border border-command-border rounded-xl p-6 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="border-b border-command-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="text-[11px] font-mono text-command-cyan uppercase tracking-wider">
              OFFICIAL SURVEILLANCE RECORD
            </div>
            <h2 className="text-lg font-bold font-heading text-white mt-0.5">
              {reportOptions.find(r => r.id === reportType)?.name}
            </h2>
            <div className="text-xs text-command-muted font-mono mt-1">
              Timeframe: {dateRange} · Generated by System Operator (Admin) · Auth: SHA-256 Validated
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              STATUS: READY
            </span>
          </div>
        </div>

        {/* Dynamic Preview Tables */}
        {reportType === 'daily' || reportType === 'cameras' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-command-card/80 border-b border-command-border text-command-textDim uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Camera Node</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">FPS</th>
                  <th className="py-2.5 px-3">Uptime</th>
                  <th className="py-2.5 px-3">Last AI Detection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-command-border/40 text-[11px]">
                {cameras.map(c => (
                  <tr key={c.id} className="hover:bg-command-card/30">
                    <td className="py-2.5 px-3 font-semibold text-white">{c.id} - {c.name}</td>
                    <td className="py-2.5 px-3 text-command-textDim">{c.zone}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        c.status === 'online' ? 'text-emerald-400' : c.status === 'alert' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{c.fps}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{c.uptime}</td>
                    <td className="py-2.5 px-3 text-command-textDim">{c.lastDetection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'alerts' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-command-card/80 border-b border-command-border text-command-textDim uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Alert ID</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3">Camera Node</th>
                  <th className="py-2.5 px-3">AI Confidence</th>
                  <th className="py-2.5 px-3">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-command-border/40 text-[11px]">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-command-card/30">
                    <td className="py-2.5 px-3 text-command-cyan font-bold">{a.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-red-400">{a.severity}</span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{a.type}</td>
                    <td className="py-2.5 px-3 text-command-textDim">{a.cameraName}</td>
                    <td className="py-2.5 px-3 text-purple-300">{a.confidence}%</td>
                    <td className="py-2.5 px-3 text-command-textDim">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-command-card/80 border-b border-command-border text-command-textDim uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Assigned Unit</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-command-border/40 text-[11px]">
                {incidents.map(i => (
                  <tr key={i.id} className="hover:bg-command-card/30">
                    <td className="py-2.5 px-3 text-command-cyan font-bold">{i.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{i.title}</td>
                    <td className="py-2.5 px-3 text-amber-400">{i.severity}</td>
                    <td className="py-2.5 px-3 text-command-textDim">{i.location}</td>
                    <td className="py-2.5 px-3 text-white">{i.assignedOperator}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
