import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrollText, Search, Filter, ShieldCheck, Clock, User, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function AuditLogsPage() {
  const { auditLogs, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = roleFilter === 'ALL' || log.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.user.toLowerCase().includes(search.toLowerCase()) ||
                          log.details.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleExportLogs = () => {
    const csv = Papa.unparse(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUDIT-LOGS-${Date.now()}.csv`;
    link.click();
    addToast('Audit Logs Exported', 'Downloaded cryptographic audit trail.', 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              IMMUTABLE OPERATIONAL AUDIT LOGS
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Tamper-evident access log capturing camera modifications, alert dispatches, incident creation, and operator logins.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs font-mono text-command-cyan transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV Audit Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-command-card/40 p-3 rounded-xl border border-command-border">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-command-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, or details..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'Admin', 'Operator', 'Analyst'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                roleFilter === r ? 'bg-command-card text-command-cyan border border-command-cyan/40' : 'text-command-muted hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-card/80 border-b border-command-border text-command-textDim uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Log ID & Timestamp</th>
                <th className="py-3 px-4">Operator / Principal</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/40 text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-command-card/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-command-cyan font-bold">{log.id}</div>
                    <div className="text-[10px] text-command-muted">{new Date(log.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {log.user}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      log.role === 'Admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      log.role === 'Operator' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white font-heading">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-command-textDim font-sans max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
