import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Video, Map, AlertTriangle, MoreHorizontal,
  ShieldAlert, BarChart3, FileText, Cpu, Sliders, Activity, ScrollText, Settings, X
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, alerts, incidents } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const moreItems = [
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-models', label: 'AI Models', icon: Cpu },
    { id: 'camera-mgmt', label: 'Camera Management', icon: Sliders },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* More Menu Drawer Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden flex flex-col justify-end">
          <div className="bg-command-surface border-t border-command-border rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-command-border mb-3">
              <span className="text-sm font-semibold font-heading text-white">More Modules</span>
              <button onClick={() => setIsMoreOpen(false)} className="text-command-muted p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border text-left ${
                      activeTab === item.id
                        ? 'bg-command-accent/20 border-command-accent text-command-cyan'
                        : 'bg-command-card border-command-border text-command-textDim hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-command-cyan shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-command-surface/95 backdrop-blur-md border-t border-command-border flex items-center justify-around px-2 z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-command-cyan' : 'text-command-muted hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'live' ? 'text-command-cyan' : 'text-command-muted hover:text-white'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>Cameras</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'map' ? 'text-command-cyan' : 'text-command-muted hover:text-white'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative ${
            activeTab === 'alerts' ? 'text-command-cyan' : 'text-command-muted hover:text-white'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isMoreOpen ? 'text-command-cyan' : 'text-command-muted hover:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
