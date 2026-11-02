import React, { useState } from 'react';
import { Terminal, Trash2, Filter, Shield, Radio, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  module: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

interface LiveConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, onClear }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-rose-400 shrink-0" />;
      default:
        return <Info className="h-3 w-3 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono">
      {/* Console Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Logcat & Mesh Diagnostic Stream</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {logs.length} Events
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            {(['all', 'info', 'warn', 'error', 'success'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 text-[10px] rounded uppercase transition-colors ${
                  filterLevel === lvl ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear Logcat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-[11px] leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-8">No log events recorded yet.</div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-900/50 transition-colors border-b border-slate-900/40"
            >
              <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
              <div className="mt-0.5">{getLevelIcon(log.level)}</div>
              <span className="text-emerald-400 font-bold shrink-0">[{log.module}]</span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
