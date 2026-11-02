import React, { useState, useEffect } from 'react';
import {
  Share2,
  Users,
  User,
  Radio,
  Wifi,
  Zap,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  MapPin,
  Download,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  QrCode,
  Scan,
  Camera,
  Copy,
  Sliders,
  Send
} from 'lucide-react';
import { PeerNodeSim, MeshGroupSim } from '../data/simulatedMeshState';

export interface NearbyShareItem {
  id: string;
  title: string;
  category: 'PHOTO' | 'VIDEO' | 'MAP_SECTOR' | 'NOTE' | 'APK_INSTALLER';
  sizeBytes: number;
  description: string;
}

const DEFAULT_SHARE_ITEMS: NearbyShareItem[] = [
  {
    id: 'item-apk',
    title: 'Qaidi Share Lite v2.4 Release APK (2.1 MB)',
    category: 'APK_INSTALLER',
    sizeBytes: 2.1 * 1024 * 1024,
    description: 'Autonomous lightweight mesh installer with ProGuard/R8 bytecode optimization.'
  },
  {
    id: 'item-map',
    title: 'Offline Sector Map: Sector G & Quad (34.2 MB)',
    category: 'MAP_SECTOR',
    sizeBytes: 34.2 * 1024 * 1024,
    description: 'High-res offline vector and satellite tiles with cached aid points.'
  },
  {
    id: 'item-video',
    title: 'DIY Cantenna Antenna Assembly Guide (5.2 MB)',
    category: 'VIDEO',
    sizeBytes: 5.2 * 1024 * 1024,
    description: 'Merkle chunked tactical video for building range boosters.'
  },
  {
    id: 'item-note',
    title: 'Emergency Decontamination & Saline Protocol (12 KB)',
    category: 'NOTE',
    sizeBytes: 12 * 1024,
    description: 'E2EE encrypted field instructions for smoke and dust emergency relief.'
  }
];

// Discovered device models for Quick Share aesthetics
const PEER_DEVICE_MODELS: Record<string, { model: string; os: string }> = {
  '@bob_mesh': { model: 'Samsung Galaxy S23', os: 'Android 14' },
  '@charlie_rescue': { model: 'Google Pixel 8 Pro', os: 'Android 15' },
  'qaidi7711': { model: 'Xiaomi 13 Ultra', os: 'Android 13' },
  'qaidi3390': { model: 'OnePlus 11', os: 'Android 14' },
  '@relay_ridge_04': { model: 'ESP32 Solar LoRa Relay', os: 'FreeRTOS v10' }
};

interface NearbyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerNodeSim[];
  groups: MeshGroupSim[];
  senderHandle: string;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const NearbyShareModal: React.FC<NearbyShareModalProps> = ({
  isOpen,
  onClose,
  peers,
  groups,
  senderHandle,
  onLogEvent
}) => {
  // Navigation Mode: 'QUICK_PEOPLE' | 'QR_CODE' | 'QR_SCANNER'
  const [activeShareTab, setActiveShareTab] = useState<'QUICK_PEOPLE' | 'QR_CODE' | 'QR_SCANNER'>('QUICK_PEOPLE');

  // Selected content to share
  const [selectedItem, setSelectedItem] = useState<NearbyShareItem>(DEFAULT_SHARE_ITEMS[0]);
  
  // Visibility setting like Quick Share
  const [visibility, setVisibility] = useState<'EVERYONE' | 'CONTACTS' | 'HIDDEN'>('EVERYONE');

  // Transfer State
  const [transferState, setTransferState] = useState<'IDLE' | 'DISCOVERING' | 'TRANSFERRING' | 'COMPLETED'>('IDLE');
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeedMbps, setTransferSpeedMbps] = useState(24.5);
  const [selectedTargetPeer, setSelectedTargetPeer] = useState<string | null>(null);
  const [nodesReceived, setNodesReceived] = useState<string[]>([]);

  // QR Scanning Simulation state
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Tap Quick Beam to a selected peer in network
  const handleQuickBeamToPeer = (peerHandle: string) => {
    setSelectedTargetPeer(peerHandle);
    setTransferState('DISCOVERING');
    setTransferProgress(10);
    onLogEvent('QuickShare', `Connecting to ${peerHandle} via Wi-Fi Direct Channel 6...`, 'info');

    setTimeout(() => {
      setTransferState('TRANSFERRING');
      setTransferProgress(45);
      onLogEvent('QuickShare', `Beaming "${selectedItem.title}" to ${peerHandle} at ${transferSpeedMbps} MB/s...`, 'info');
    }, 400);

    setTimeout(() => {
      setTransferProgress(85);
    }, 700);

    setTimeout(() => {
      setTransferProgress(100);
      setTransferState('COMPLETED');
      setNodesReceived([peerHandle]);
      onLogEvent('QuickShare', `Delivered "${selectedItem.title}" to ${peerHandle} in 0.9s without cellular data!`, 'success');
    }, 1000);
  };

  // Broadcast to all nearby nodes
  const handleBeamToAllNearby = () => {
    setTransferState('DISCOVERING');
    setTransferProgress(15);
    onLogEvent('QuickShare', `Broadcasting "${selectedItem.title}" to all nearby mesh peers...`, 'info');

    setTimeout(() => {
      setTransferState('TRANSFERRING');
      setTransferProgress(60);
    }, 500);

    setTimeout(() => {
      setTransferProgress(100);
      setTransferState('COMPLETED');
      const allHandles = peers.map(p => p.handle);
      setNodesReceived(allHandles);
      onLogEvent('QuickShare', `Successfully beamed to ${allHandles.length} nearby nodes.`, 'success');
    }, 1100);
  };

  // Simulate QR Code Camera Scanner
  const handleSimulateScanPeerQR = () => {
    setIsScanningActive(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanningActive(false);
      setScanResult('Paired with @charlie_rescue (Google Pixel 8 Pro)! Direct Wi-Fi P2P link established.');
      onLogEvent('QuickShare', 'Scanned QR Code: Instant pairing with @charlie_rescue completed.', 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Header - Quick Share Style */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Quick Share & Nearby
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Zero Data
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Fast Wi-Fi Direct, QR code & mesh proximity sharing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visibility Pill Bar */}
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium">Device Visibility:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setVisibility('EVERYONE')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                visibility === 'EVERYONE'
                  ? 'bg-emerald-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Everyone
            </button>
            <button
              onClick={() => setVisibility('CONTACTS')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                visibility === 'CONTACTS'
                  ? 'bg-emerald-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Known Nodes
            </button>
          </div>
        </div>

        {/* Selected Item Preview */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
            Item Selected to Share:
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                {selectedItem.category === 'APK_INSTALLER' && <Smartphone className="h-4 w-4" />}
                {selectedItem.category === 'MAP_SECTOR' && <MapPin className="h-4 w-4" />}
                {selectedItem.category === 'VIDEO' && <Film className="h-4 w-4" />}
                {selectedItem.category === 'NOTE' && <FileText className="h-4 w-4" />}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">
                  {selectedItem.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(selectedItem.sizeBytes / (1024 * 1024)).toFixed(1)} MB • Offline Ready
                </span>
              </div>
            </div>

            <select
              value={selectedItem.id}
              onChange={(e) => {
                const found = DEFAULT_SHARE_ITEMS.find(i => i.id === e.target.value);
                if (found) setSelectedItem(found);
              }}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 font-bold focus:outline-none shrink-0"
            >
              {DEFAULT_SHARE_ITEMS.map(i => (
                <option key={i.id} value={i.id}>
                  {i.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Share Mode Tabs: People in Network | QR Code | Scan QR */}
        <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveShareTab('QUICK_PEOPLE')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeShareTab === 'QUICK_PEOPLE'
                ? 'bg-emerald-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>People in Network</span>
          </button>

          <button
            onClick={() => setActiveShareTab('QR_CODE')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeShareTab === 'QR_CODE'
                ? 'bg-emerald-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Show QR Code</span>
          </button>

          <button
            onClick={() => setActiveShareTab('QR_SCANNER')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeShareTab === 'QR_SCANNER'
                ? 'bg-emerald-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* TAB 1: PEOPLE IN NETWORK (QUICK SHARE UI) */}
        {activeShareTab === 'QUICK_PEOPLE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>DEVICES FOUND NEARBY ({peers.length})</span>
              <button
                onClick={handleBeamToAllNearby}
                className="text-emerald-400 hover:underline font-bold"
              >
                Beam to All Nearby
              </button>
            </div>

            {/* Quick Share Device Cards Grid */}
            <div className="space-y-2">
              {peers.map((peer) => {
                const deviceInfo = PEER_DEVICE_MODELS[peer.handle] || {
                  model: 'Android Smartphone',
                  os: 'Android 14'
                };
                const isSelected = selectedTargetPeer === peer.handle;

                return (
                  <div
                    key={peer.handle}
                    onClick={() => handleQuickBeamToPeer(peer.handle)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs group-hover:scale-105 transition-transform">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                            {deviceInfo.model}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {peer.handle} • {peer.distanceMeters}m away • {peer.rssiDbm} dBm
                        </p>
                      </div>
                    </div>

                    <button
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Beam</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE SHARING */}
        {activeShareTab === 'QR_CODE' && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Scan with Another Phone to Receive
            </span>

            {/* Generated SVG QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <svg
                viewBox="0 0 160 160"
                className="w-40 h-40"
                shapeRendering="crispEdges"
              >
                {/* Simulated authentic high-density QR matrix for P2P connection */}
                <rect width="160" height="160" fill="white" />
                {/* Corner Finder 1 */}
                <rect x="10" y="10" width="40" height="40" fill="black" />
                <rect x="16" y="16" width="28" height="28" fill="white" />
                <rect x="22" y="22" width="16" height="16" fill="black" />

                {/* Corner Finder 2 */}
                <rect x="110" y="10" width="40" height="40" fill="black" />
                <rect x="116" y="16" width="28" height="28" fill="white" />
                <rect x="122" y="22" width="16" height="16" fill="black" />

                {/* Corner Finder 3 */}
                <rect x="10" y="110" width="40" height="40" fill="black" />
                <rect x="16" y="116" width="28" height="28" fill="white" />
                <rect x="22" y="122" width="16" height="16" fill="black" />

                {/* Data modules */}
                <rect x="60" y="15" width="8" height="8" fill="black" />
                <rect x="75" y="15" width="8" height="8" fill="black" />
                <rect x="90" y="25" width="8" height="8" fill="black" />
                <rect x="60" y="35" width="8" height="8" fill="black" />
                <rect x="80" y="45" width="8" height="8" fill="black" />
                <rect x="20" y="65" width="8" height="8" fill="black" />
                <rect x="35" y="75" width="8" height="8" fill="black" />
                <rect x="50" y="65" width="8" height="8" fill="black" />
                <rect x="70" y="65" width="20" height="20" fill="black" />
                <rect x="100" y="65" width="8" height="8" fill="black" />
                <rect x="120" y="75" width="8" height="8" fill="black" />
                <rect x="135" y="65" width="8" height="8" fill="black" />
                <rect x="60" y="95" width="8" height="8" fill="black" />
                <rect x="75" y="105" width="8" height="8" fill="black" />
                <rect x="90" y="95" width="8" height="8" fill="black" />
                <rect x="110" y="100" width="12" height="12" fill="black" />
                <rect x="130" y="115" width="12" height="12" fill="black" />
                <rect x="115" y="130" width="8" height="8" fill="black" />
                <rect x="65" y="125" width="14" height="14" fill="black" />
                <rect x="85" y="135" width="10" height="10" fill="black" />
              </svg>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">
                Wi-Fi Direct P2P Hotspot
              </span>
              <p className="text-[10px] text-emerald-400 font-mono">
                SSID: DIRECT-Qaidi-Share-4829 • Pass: wpa2-offgrid-88
              </p>
              <p className="text-[9px] text-slate-400">
                Peer points their camera to immediately initiate autonomous download.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: SCAN QR CODE VIEW */}
        {activeShareTab === 'QR_SCANNER' && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Camera Viewfinder (Optical P2P Pairing)
            </span>

            {/* Simulated Camera Viewfinder */}
            <div className="relative w-48 h-48 rounded-xl bg-black border-2 border-emerald-500/60 overflow-hidden flex items-center justify-center">
              {/* Corner targeting brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

              {/* Scanning laser line */}
              <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-md shadow-emerald-400 animate-pulse" />

              <div className="text-center p-2 space-y-1">
                <Camera className="h-6 w-6 text-slate-500 mx-auto" />
                <span className="text-[9px] text-slate-400 font-mono block">
                  Point at peer's Qaidi QR code
                </span>
              </div>
            </div>

            {/* Quick target simulator */}
            <div className="w-full space-y-1 text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                Simulate Scanning Visible Peer:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {peers.slice(0, 4).map((p) => (
                  <button
                    key={p.handle}
                    onClick={() => {
                      setIsScanningActive(true);
                      setScanResult(null);
                      setTimeout(() => {
                        setIsScanningActive(false);
                        const dev = PEER_DEVICE_MODELS[p.handle]?.model || 'Android Smartphone';
                        setScanResult(`Paired with ${p.handle} (${dev})! Direct Wi-Fi P2P link established.`);
                        onLogEvent('QuickShare', `Scanned QR Code of ${p.handle}. P2P link established at ${p.distanceMeters}m.`, 'success');
                      }, 700);
                    }}
                    disabled={isScanningActive}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[9px] font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                  >
                    <span className="font-bold block truncate">{p.handle}</span>
                    <span className="text-slate-500 text-[8px]">{p.distanceMeters}m • {p.rssiDbm}dBm</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSimulateScanPeerQR}
              disabled={isScanningActive}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Scan className="h-3.5 w-3.5" />
              <span>{isScanningActive ? 'Detecting QR Code...' : 'Scan Nearest Peer QR'}</span>
            </button>

            {scanResult && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 w-full text-left">
                {scanResult}
              </div>
            )}
          </div>
        )}

        {/* Transfer Progress Status Drawer */}
        {transferState !== 'IDLE' && (
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                {transferState === 'COMPLETED' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Nearby Share Delivered!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                    <span>Beaming to {selectedTargetPeer || 'Nearby Nodes'}...</span>
                  </>
                )}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {transferProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${transferProgress}%` }}
              />
            </div>

            {transferState === 'COMPLETED' ? (
              <p className="text-[10px] text-slate-300 font-mono">
                Delivered to: {nodesReceived.join(', ')}. Zero duplication applied.
              </p>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Wi-Fi Direct Ch. 6</span>
                <span className="text-emerald-400">{transferSpeedMbps} MB/s</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
