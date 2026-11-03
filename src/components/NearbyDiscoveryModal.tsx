import React, { useState, useEffect } from 'react';
import {
  X,
  Radar,
  Radio,
  Wifi,
  Bluetooth,
  Signal,
  MessageSquare,
  Volume2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { PeerNodeSim } from '../data/simulatedMeshState';
import { RadioStatus } from '../core/githubOfflineBridge';
import { rssiToSignalPercentage, getSignalQuality } from '../core/securityAndLockdown';

interface NearbyDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerNodeSim[];
  currentHandle: string;
  onSelectPeer: (peer: PeerNodeSim) => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  radioStatus: RadioStatus;
  onOpenConnectionAssistant: () => void;
  onOpenQrModal?: () => void;
}

export const NearbyDiscoveryModal: React.FC<NearbyDiscoveryModalProps> = ({
  isOpen,
  onClose,
  peers,
  currentHandle,
  onSelectPeer,
  onLogEvent,
  radioStatus,
  onOpenConnectionAssistant,
  onOpenQrModal
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [radarAngle, setRadarAngle] = useState(0);
  const [pingedPeerId, setPingedPeerId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BLE' | 'WIFI'>('ALL');

  // Animated sweep rotation for radar
  useEffect(() => {
    if (!isOpen || !isScanning) return;
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, isScanning]);

  if (!isOpen) return null;

  const isAnyRadioOff = !radioStatus.bluetoothEnabled || !radioStatus.wifiMeshEnabled || !radioStatus.locationServicesEnabled;

  const filteredPeers = peers.filter(p => {
    if (selectedFilter === 'BLE') return p.transports.includes('BLE_MESH');
    if (selectedFilter === 'WIFI') return p.transports.includes('WIFI_DIRECT') || p.transports.includes('WIFI_AWARE');
    return true;
  });

  const handlePingPeer = (peer: PeerNodeSim) => {
    setPingedPeerId(peer.id);
    onLogEvent('NearbyRadar', `Sent acoustic & BLE discovery probe to ${peer.handle}. ACK received in 18ms.`, 'success');
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (_e) {}
    setTimeout(() => setPingedPeerId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="relative flex items-center justify-center">
              <Radar className="h-5 w-5 animate-pulse text-emerald-400" />
              <div className="absolute h-6 w-6 rounded-full border border-emerald-400/40 animate-ping" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Nearby User Discovery</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                  RADAR
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">BLE 5.0 & Wi-Fi Direct Peer Scanner</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Missing Radios Alert */}
        {isAnyRadioOff && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-[10px] text-amber-200">
                <span className="font-bold block">Radios Disabled</span>
                <span>Bluetooth or Location is OFF. Turn them on to discover nearby phones.</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenConnectionAssistant();
              }}
              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Visual 360-Degree Radar Scanner Screen */}
        <div className="relative w-full h-44 rounded-xl bg-[#01140e] border border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-inner">
          {/* Concentric Distance Rings */}
          <div className="absolute h-36 w-36 rounded-full border border-emerald-500/20" />
          <div className="absolute h-24 w-24 rounded-full border border-emerald-500/30" />
          <div className="absolute h-12 w-12 rounded-full border border-emerald-500/40" />
          {/* Axis Crosshairs */}
          <div className="absolute inset-0 m-auto h-full w-[1px] bg-emerald-500/20" />
          <div className="absolute inset-0 m-auto w-full h-[1px] bg-emerald-500/20" />

          {/* Rotating Radar Sweep Beam */}
          {isScanning && (
            <div
              className="absolute inset-0 pointer-events-none origin-center"
              style={{
                transform: `rotate(${radarAngle}deg)`,
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.4) 0deg, rgba(16, 185, 129, 0.0) 60deg, transparent 360deg)'
              }}
            />
          )}

          {/* Center Self Node */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-emerald-300 mt-0.5">YOU</span>
          </div>

          {/* Plotted Nearby Peer Nodes on Radar Screen */}
          {peers.map((peer, idx) => {
            const angleRad = (peer.angleDeg * Math.PI) / 180;
            const distRatio = Math.min(1, peer.distanceMeters / 45);
            const radiusPx = 18 + distRatio * 52;
            const x = Math.cos(angleRad) * radiusPx;
            const y = Math.sin(angleRad) * radiusPx;

            return (
              <button
                key={peer.id}
                onClick={() => {
                  onSelectPeer(peer);
                  onClose();
                  onLogEvent('NearbyRadar', `Connected directly to nearby peer ${peer.handle}`, 'success');
                }}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className="absolute z-20 group flex flex-col items-center -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                title={`${peer.handle} (${peer.distanceMeters}m away • ${peer.rssiDbm} dBm)`}
              >
                <div className="h-3 w-3 rounded-full bg-emerald-400 border border-slate-950 group-hover:scale-150 transition-transform shadow-md" />
                <span className="text-[8px] font-mono text-emerald-200 bg-black/80 px-1 rounded border border-emerald-800 scale-90 whitespace-nowrap mt-0.5">
                  {peer.handle.slice(0, 7)}
                </span>
              </button>
            );
          })}

          {/* Scanner Controls Floating Overlay */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-emerald-400/80 pointer-events-auto">
            <span>Range: 50m BLE/Wi-Fi</span>
            <button
              onClick={() => setIsScanning(!isScanning)}
              className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold hover:text-white"
            >
              {isScanning ? '● Sweep Active' : '○ Sweep Paused'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <div className="flex gap-1">
            {(['ALL', 'BLE', 'WIFI'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                  selectedFilter === flt
                    ? 'bg-emerald-600 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {flt === 'ALL' ? `All (${peers.length})` : flt === 'BLE' ? 'BLE Mesh' : 'Wi-Fi Direct'}
              </button>
            ))}
          </div>

          {onOpenQrModal && (
            <button
              onClick={() => {
                onClose();
                onOpenQrModal();
              }}
              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white font-bold"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Code</span>
            </button>
          )}
        </div>

        {/* Discovered Peers List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
          {filteredPeers.map(peer => {
            const sigPct = rssiToSignalPercentage(peer.rssiDbm);
            const sigQuality = getSignalQuality(peer.rssiDbm);
            const isPinged = pingedPeerId === peer.id;

            return (
              <div
                key={peer.id}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300 font-mono">
                    {peer.handle.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white font-mono">{peer.handle}</span>
                      <span className="text-[8px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {peer.activeTransport === 'BLE_MESH' ? 'BLE' : 'Wi-Fi'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9.5px] text-slate-400 font-mono">
                      <span>{peer.distanceMeters}m away</span>
                      <span>•</span>
                      <span className={sigPct > 60 ? 'text-emerald-400' : 'text-amber-400'}>
                        {peer.rssiDbm} dBm ({sigPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Ping Peer Button */}
                  <button
                    onClick={() => handlePingPeer(peer)}
                    title="Send Acoustic / Radio Ping Probe"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isPinged
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-700'
                    }`}
                  >
                    {isPinged ? <Check className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>

                  {/* Chat Directly Button */}
                  <button
                    onClick={() => {
                      onSelectPeer(peer);
                      onClose();
                      onLogEvent('NearbyRadar', `Opened direct chat with nearby peer ${peer.handle}`, 'success');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Active Nodes: {peers.length}</span>
          <button
            onClick={() => {
              onLogEvent('NearbyRadar', 'Dispatched fresh beacon probe over BLE & Wi-Fi Aware.', 'info');
            }}
            className="text-emerald-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Rescan Radios
          </button>
        </div>
      </div>
    </div>
  );
};
