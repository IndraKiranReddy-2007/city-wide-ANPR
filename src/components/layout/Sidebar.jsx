import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Video, Map, AlertTriangle, ShieldAlert, 
  BarChart3, FileText, Cpu, Sliders, Activity, ScrollText, 
  Settings, ChevronLeft, ChevronRight, HardDrive
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, setActiveTab,
    alerts, incidents, cameras,
    storageStats
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;
  const activeIncidentsCount = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Cameras', icon: Video, badge: cameras.filter(c => c.status === 'online').length },
    { id: 'map', label: 'City Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount, badgeColor: 'bg-red-600 text-white' },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: activeIncidentsCount, badgeColor: 'bg-amber-600 text-white' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-models', label: 'AI Models', icon: Cpu },
    { id: 'camera-mgmt', label: 'Camera Management', icon: Sliders },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`bg-command-surface border-r border-command-border flex flex-col justify-between transition-all duration-200 z-30 shrink-0 hidden md:flex ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Top Nav Items */}
      <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-command-accent/15 text-command-cyan border border-command-accent/40 shadow-sm shadow-cyan-500/10'
                  : 'text-command-textDim hover:text-white hover:bg-command-card/80 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-command-cyan' : 'text-command-muted group-hover:text-white'
              }`} />

              {!isCollapsed && (
                <span className="truncate font-sans font-medium text-left flex-1">
                  {item.label}
                </span>
              )}

              {/* Badge count */}
              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  item.badgeColor || 'bg-command-card border border-command-border text-command-cyan'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed Tooltip Pill on Hover */}
              {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry & Collapse Toggle */}
      <div className="p-3 border-t border-command-border bg-command-card/40 space-y-3">
        {!isCollapsed && (
          <div className="p-2.5 rounded-lg bg-command-surface border border-command-border text-xs space-y-2">
            <div className="flex items-center justify-between text-command-muted font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-command-cyan" /> Video Storage
              </span>
              <span className="text-white">
                {storageStats?.storageTiers?.videoUsedGB || '142.4'} / 500 GB
              </span>
            </div>
            <div className="w-full h-1.5 bg-command-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-command-cyan to-blue-500 rounded-full" 
                style={{ width: `${((storageStats?.storageTiers?.videoUsedGB || 142.4) / 500) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-command-muted hover:text-white hover:bg-command-card transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
