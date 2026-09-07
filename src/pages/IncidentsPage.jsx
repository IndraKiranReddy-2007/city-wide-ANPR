import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, Plus, Search, Filter, Clock, User, 
  MapPin, Video, CheckCircle2, MessageSquare, Send, X, ArrowRight, FileText
} from 'lucide-react';

export default function IncidentsPage() {
  const { 
    incidents, 
    createIncident, 
    updateIncident, 
    addIncidentNote, 
    cameras, 
    selectedIncident, 
    setSelectedIncident,
    isIncidentModalOpen, 
    setIsIncidentModalOpen,
    activeRole
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Incident Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Unauthorized Intrusion');
  const [severity, setSeverity] = useState('HIGH');
  const [selectedCamId, setSelectedCamId] = useState(cameras[0]?.id || 'CAM-001');
  const [assignedOperator, setAssignedOperator] = useState('Duty Responder Unit');
  const [description, setDescription] = useState('');

  const filteredIncidents = incidents.filter(i => {
    const matchesStatus = statusFilter === 'ALL' || i.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const cam = cameras.find(c => c.id === selectedCamId);
    await createIncident({
      title: title || 'Security Anomaly Event',
      type,
      severity,
      cameraId: selectedCamId,
      cameraName: cam?.name || 'Surveillance Node',
      location: cam?.location || 'Sector 4',
      assignedOperator,
      description: description || 'Manually dispatched security incident.',
      evidence: [
        { type: 'Snapshot', url: cam?.thumbnail || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80', caption: 'Incident location capture' }
      ]
    });
    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleAddTimelineNote = async () => {
    if (!selectedIncident || !newNote.trim()) return;
    await addIncidentNote(selectedIncident.id, newNote);
    setNewNote('');
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    await updateIncident(selectedIncident.id, { status: newStatus });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-command-critical" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              INCIDENT RESPONSE & CASE MANAGEMENT
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Full lifecycle case management: dispatch response teams, attach multi-camera evidence logs, and record investigative timelines.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Incident</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-command-card/40 p-3 rounded-xl border border-command-border">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-command-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incidents by case ID, title, or location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-accent"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'Open', 'Investigating', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                statusFilter === st 
                  ? 'bg-command-card text-command-cyan border border-command-cyan/30' 
                  : 'text-command-muted hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIncidents.map(inc => (
          <div
            key={inc.id}
            onClick={() => {
              setSelectedIncident(inc);
              setIsIncidentModalOpen(true);
            }}
            className="p-4 rounded-xl bg-command-surface border border-command-border hover:border-command-accent/50 cursor-pointer shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                  inc.severity === 'HIGH' ? 'bg-orange-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {inc.severity}
                </span>
                <span className="text-xs font-mono font-semibold text-command-cyan">{inc.id}</span>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${
                inc.status === 'Open' ? 'text-red-400 border-red-800 bg-red-950/40' :
                inc.status === 'Investigating' ? 'text-amber-400 border-amber-800 bg-amber-950/40' :
                'text-emerald-400 border-emerald-800 bg-emerald-950/40'
              }`}>
                {inc.status}
              </span>
            </div>

            <h3 className="text-sm font-bold font-heading text-white group-hover:text-command-cyan transition-colors line-clamp-1">
              {inc.title}
            </h3>

            <p className="text-xs text-command-textDim line-clamp-2 leading-relaxed">
              {inc.description}
            </p>

            <div className="pt-2 border-t border-command-border/40 space-y-1 text-[11px] font-mono text-command-muted">
              <div className="flex items-center gap-1 text-white truncate">
                <Video className="w-3 h-3 text-command-cyan" /> {inc.cameraName}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-command-muted" /> {inc.assignedOperator}
                </span>
                <span>{new Date(inc.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Detail Case Modal */}
      {isIncidentModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-3xl bg-command-surface border border-command-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-command-border bg-command-card/80">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                  selectedIncident.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                }`}>
                  {selectedIncident.severity}
                </span>
                <div>
                  <div className="text-sm font-bold font-heading text-white tracking-wide">
                    {selectedIncident.id}: {selectedIncident.title}
                  </div>
                  <div className="text-[11px] font-mono text-command-muted">
                    {selectedIncident.type} · {selectedIncident.location}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsIncidentModalOpen(false)} className="text-command-muted hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-command-card/60 border border-command-border">
                <span className="text-xs font-heading font-semibold text-command-textDim uppercase">
                  Investigation Status:
                </span>
                <div className="flex gap-1.5">
                  {['Open', 'Investigating', 'Resolved', 'Closed'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all ${
                        selectedIncident.status === st
                          ? 'bg-command-accent text-black font-bold shadow-sm'
                          : 'bg-command-surface text-command-muted hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Assigned Responder */}
              <div className="space-y-2">
                <div className="text-xs font-heading font-semibold uppercase text-command-textDim">Case Details</div>
                <p className="text-xs text-command-text leading-relaxed bg-command-card/30 p-3 rounded-lg border border-command-border">
                  {selectedIncident.description}
                </p>
                <div className="flex justify-between text-xs font-mono text-command-muted pt-1">
                  <span>Assigned: <strong className="text-white">{selectedIncident.assignedOperator}</strong></span>
                  <span>Logged: {new Date(selectedIncident.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Evidence Gallery */}
              {selectedIncident.evidence && selectedIncident.evidence.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-heading font-semibold uppercase text-command-textDim">Attached Evidence</div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedIncident.evidence.map((ev, idx) => (
                      <div key={idx} className="rounded-lg border border-command-border overflow-hidden bg-black">
                        {ev.url && (
                          <img src={ev.url} alt="Evidence Frame" className="w-full h-32 object-cover" />
                        )}
                        <div className="p-2 text-[10px] font-mono text-command-textDim bg-command-card">
                          {ev.caption || ev.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Notes */}
              <div className="space-y-2">
                <div className="text-xs font-heading font-semibold uppercase text-command-textDim">Investigation Log Timeline</div>
                <div className="space-y-2 bg-command-card/30 p-3 rounded-lg border border-command-border max-h-48 overflow-y-auto">
                  {selectedIncident.timeline?.map((entry, idx) => (
                    <div key={idx} className="text-xs font-mono border-l-2 border-command-cyan pl-3 py-1 space-y-0.5">
                      <div className="text-[10px] text-command-muted flex items-center justify-between">
                        <span>{entry.author}</span>
                        <span>{new Date(entry.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-white">{entry.note}</div>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add operational dispatch note or evidence reference..."
                    className="flex-1 px-3 py-2 rounded-lg bg-command-surface border border-command-border text-xs text-white focus:outline-none focus:border-command-accent"
                    onKeyDown={e => e.key === 'Enter' && handleAddTimelineNote()}
                  />
                  <button
                    onClick={handleAddTimelineNote}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black font-bold text-xs font-heading"
                  >
                    <Send className="w-3.5 h-3.5" /> Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form 
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-command-surface border border-command-border rounded-xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-command-border pb-3">
              <span className="text-sm font-bold font-heading text-white">Create Security Incident</span>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-command-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-heading text-command-textDim uppercase mb-1">Incident Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Unidentified individual entering restricted gate"
                required
                className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-heading text-command-textDim uppercase mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white"
                >
                  <option>CRITICAL</option>
                  <option>HIGH</option>
                  <option>MEDIUM</option>
                  <option>LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading text-command-textDim uppercase mb-1">Target Camera</label>
                <select
                  value={selectedCamId}
                  onChange={e => setSelectedCamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white"
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-command-textDim uppercase mb-1">Assigned Responder</label>
              <input
                type="text"
                value={assignedOperator}
                onChange={e => setAssignedOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-heading text-command-textDim uppercase mb-1">Description / Action Plan</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide event details, subject description, response team dispatch orders..."
                className="w-full px-3 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-command-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-command-card border border-command-border text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading"
              >
                Create Case
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
