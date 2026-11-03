import React from 'react';
import {
  X,
  Bluetooth,
  Wifi,
  MapPin,
  Radio,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Share2
} from 'lucide-react';
import { RadioStatus } from '../core/githubOfflineBridge';

interface ConnectionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  radioStatus: RadioStatus;
  hotspotEnabled: boolean;
  onToggleRadio: (key: keyof RadioStatus) => void;
  onToggleHotspot: () => void;
  onEnableAllRadios: () => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const ConnectionAssistantModal: React.FC<ConnectionAssistantModalProps> = ({
  isOpen,
  onClose,
  radioStatus,
  hotspotEnabled,
  onToggleRadio,
  onToggleHotspot,
  onEnableAllRadios,
  onLogEvent
}) => {
  if (!isOpen) return null;

  const activeCount =
    (radioStatus.bluetoothEnabled ? 1 : 0) +
    (radioStatus.wifiMeshEnabled ? 1 : 0) +
    (radioStatus.locationServicesEnabled ? 1 : 0) +
    (hotspotEnabled ? 1 : 0);

  const isAllActive = activeCount === 4;

  const radioItems = [
    {
      id: 'bluetooth',
      name: 'Bluetooth Low Energy (BLE 5.0+)',
      icon: Bluetooth,
      isActive: radioStatus.bluetoothEnabled,
      onToggle: () => onToggleRadio('bluetoothEnabled'),
      purpose: 'Discovers neighborhood peer beacons and routes micro-packets with zero battery drain.'
    },
    {
      id: 'wifi',
      name: 'Wi-Fi Direct & Aware Mesh',
      icon: Wifi,
      isActive: radioStatus.wifiMeshEnabled,
      onToggle: () => onToggleRadio('wifiMeshEnabled'),
      purpose: 'Enables ultra-fast peer-to-peer swarming of large photos, videos, audio, and entire folders.'
    },
    {
      id: 'hotspot',
      name: 'Local Mesh Hotspot (Wi-Fi Tether)',
      icon: Radio,
      isActive: hotspotEnabled,
      onToggle: onToggleHotspot,
      purpose: 'Runs offline captive portal so nearby phones without the app can join and download the APK instantly.'
    },
    {
      id: 'location',
      name: 'Location Services (OS Permission)',
      icon: MapPin,
      isActive: radioStatus.locationServicesEnabled,
      onToggle: () => onToggleRadio('locationServicesEnabled'),
      purpose: 'Strict Android OS requirement: Bluetooth & Wi-Fi Direct hardware scanning is blocked by Android if Location is disabled.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="h-5 w-5" />
            <div>
              <h3 className="text-sm font-bold text-white">Connection Setup Assistant</h3>
              <p className="text-[10px] text-slate-400">Enable required hardware radios to form off-grid mesh</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Readiness Meter */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Mesh Readiness:</span>
            <span className={`font-bold ${isAllActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {activeCount} / 4 Radios Active ({Math.round((activeCount / 4) * 100)}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllActive ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${(activeCount / 4) * 100}%` }}
            />
          </div>

          <p className="text-[10.5px] text-slate-400 leading-snug">
            {isAllActive
              ? '✓ Full mesh capabilities active. Your phone can discover peers, relay packets, swarm media, and host hotspots.'
              : '⚠️ Some radios are turned off. Turn them on below so your phone can detect nearby peers and join the encrypted mesh.'}
          </p>
        </div>

        {/* 1-Tap Enable All Button */}
        {!isAllActive && (
          <button
            onClick={() => {
              onEnableAllRadios();
              onLogEvent('ConnectionAssistant', 'Activated all required radios: Bluetooth, Wi-Fi, Hotspot, and Location Services.', 'success');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse"
          >
            <Zap className="h-4 w-4" />
            <span>Turn On All 4 Needed Radios</span>
          </button>
        )}

        {/* Individual Radio Items */}
        <div className="space-y-2">
          {radioItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.isActive
                    ? 'bg-slate-950/80 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      item.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{item.name}</span>
                  </div>

                  <button
                    onClick={item.onToggle}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
                      item.isActive
                        ? 'bg-emerald-600 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.isActive ? 'ON' : 'TURN ON'}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-snug pl-8">
                  {item.purpose}
                </p>
              </div>
            );
          })}
        </div>

        {/* Close / Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
        >
          {isAllActive ? 'Close & Begin Scanning' : 'Dismiss for Now'}
        </button>
      </div>
    </div>
  );
};
