import React from 'react';
import {
  Lock,
  Wifi,
  WifiOff,
  Bluetooth,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  X,
  RefreshCw,
  Database,
  Radio,
  EyeOff
} from 'lucide-react';
import { PrivatePacketRecord, RadioStatus } from '../core/githubOfflineBridge';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  radioStatus: RadioStatus;
  onToggleRadio: (radio: keyof RadioStatus) => void;
  bufferedPackets: PrivatePacketRecord[];
  onTriggerSync: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  radioStatus,
  onToggleRadio,
  bufferedPackets,
  onTriggerSync
}) => {
  if (!isOpen) return null;

  const locallyStoredCount = bufferedPackets.filter(p => p.status === 'STORED_LOCALLY_ROOM_DB').length;
  const syncedStealthCount = bufferedPackets.filter(p => p.status === 'SYNCED_TO_GITHUB_PRIVATE').length;
  const deliveredCount = bufferedPackets.filter(p => p.status === 'DELIVERED_TO_RECIPIENT').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-xl bg-[#031d16] border border-emerald-800/50 p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto text-emerald-100">
        {/* Header - Zero government recognizable logos */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
              <EyeOff className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Stealth Dark Rendezvous Relay</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  DPI Jam-Proof
                </span>
              </h3>
              <p className="text-[10px] text-emerald-400/80">Anonymous Onion DTN Relay</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-400/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* End-to-End Cryptographic Privacy Explanation */}
        <div className="p-2.5 rounded-lg bg-[#021812] border border-emerald-900/60 text-[11px] text-emerald-200/90 leading-relaxed">
          <span className="font-bold text-emerald-300 block mb-0.5">🛡️ End-to-End Cryptographic Privacy:</span>
          When radios are off, encrypted chats buffer in local hardware storage. When online, packets disperse through decentralized peer-to-peer endpoints as high-entropy AES-256 ciphertext. Untrusted intermediate relays see zero plaintext or private metadata.
        </div>

        {/* Hardware Radios State Switcher */}
        <div>
          <span className="text-[11px] font-bold text-emerald-300 block mb-1.5">
            Hardware Radio Shields & Interfaces:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleRadio('bluetoothEnabled')}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                radioStatus.bluetoothEnabled
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                  : 'bg-[#021812] border-emerald-950 text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Bluetooth className="h-3.5 w-3.5" />
                <span>Bluetooth</span>
              </div>
              <span className="text-[10px] font-mono">{radioStatus.bluetoothEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={() => onToggleRadio('locationServicesEnabled')}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                radioStatus.locationServicesEnabled
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                  : 'bg-[#021812] border-emerald-950 text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Location</span>
              </div>
              <span className="text-[10px] font-mono">{radioStatus.locationServicesEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={() => onToggleRadio('wifiMeshEnabled')}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                radioStatus.wifiMeshEnabled
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                  : 'bg-[#021812] border-emerald-950 text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5" />
                <span>Wi-Fi Mesh</span>
              </div>
              <span className="text-[10px] font-mono">{radioStatus.wifiMeshEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={() => onToggleRadio('wifiInternetActive')}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                radioStatus.wifiInternetActive
                  ? 'bg-teal-900/40 border-teal-500 text-teal-200'
                  : 'bg-[#021812] border-emerald-950 text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" />
                <span>Stealth Relay</span>
              </div>
              <span className="text-[10px] font-mono">{radioStatus.wifiInternetActive ? 'ONLINE' : 'DARK'}</span>
            </button>
          </div>
        </div>

        {/* Sync Pipeline Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[#021812] border border-emerald-900/60">
            <span className="text-[10px] text-emerald-400 block mb-0.5">Isolated Room DB</span>
            <span className="text-sm font-bold font-mono text-amber-400">{locallyStoredCount}</span>
          </div>
          <div className="p-2 rounded-lg bg-[#021812] border border-emerald-900/60">
            <span className="text-[10px] text-emerald-400 block mb-0.5">Stealth Dispatched</span>
            <span className="text-sm font-bold font-mono text-teal-400">{syncedStealthCount}</span>
          </div>
          <div className="p-2 rounded-lg bg-[#021812] border border-emerald-900/60">
            <span className="text-[10px] text-emerald-400 block mb-0.5">Receipt Confirmed</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{deliveredCount}</span>
          </div>
        </div>

        {/* Queued Packets List */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-300">Buffered Onion Packets:</span>
            <button
              onClick={onTriggerSync}
              disabled={!radioStatus.wifiInternetActive}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Dispatch Now</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {bufferedPackets.length === 0 ? (
              <div className="p-3 text-center text-[10px] text-emerald-600">
                No offline packets currently queued.
              </div>
            ) : (
              bufferedPackets.map((pkt) => (
                <div
                  key={pkt.packetId}
                  className="p-2 rounded-lg bg-[#021812] border border-emerald-900/60 text-[10px] flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-emerald-200 block">{pkt.recipientHandle}</span>
                    <span className="text-emerald-500 font-mono text-[9px]">{pkt.packetId}</span>
                  </div>
                  <div>
                    {pkt.status === 'STORED_LOCALLY_ROOM_DB' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        Hardware DB
                      </span>
                    )}
                    {pkt.status === 'SYNCED_TO_GITHUB_PRIVATE' && (
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                        Stealth Relay
                      </span>
                    )}
                    {pkt.status === 'DELIVERED_TO_RECIPIENT' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
