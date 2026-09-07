import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-command-cyan shrink-0" />;
        let border = 'border-command-cyan/30';
        let bg = 'bg-command-card/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-command-success shrink-0" />;
          border = 'border-command-success/40';
        } else if (toast.type === 'alert' || toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-command-warning shrink-0" />;
          border = 'border-command-warning/50';
        } else if (toast.type === 'critical' || toast.type === 'error') {
          icon = <AlertOctagon className="w-5 h-5 text-command-critical shrink-0 animate-pulse" />;
          border = 'border-command-critical/60';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border ${border} ${bg} backdrop-blur-md shadow-2xl transition-all transform translate-y-0 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium font-heading tracking-wide text-white">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-xs text-command-textDim mt-0.5 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-command-muted hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
