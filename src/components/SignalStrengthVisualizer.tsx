import React, { useState } from 'react';
import {
  Activity,
  Compass,
  Radio,
  Wifi,
  Zap,
  ArrowUp,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders,
  ShieldCheck,
  Info,
  Sparkles,
  X
} from 'lucide-react';
import { PeerNodeSim } from '../data/simulatedMeshState';

interface SignalStrengthVisualizerProps {
  peers: PeerNodeSim[];
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onClose?: () => void;
}

export const SignalStrengthVisualizer: React.FC<SignalStrengthVisualizerProps> = ({
  peers,
  onLogEvent,
  onClose
}) => {
  // Antenna Placement Simulation Parameters
  const [antennaHeadingDeg, setAntennaHeadingDeg] = useState<number>(45); // 0° = North, 90° = East
  const [antennaElevationMeters, setAntennaElevationMeters] = useState<number>(2.5); // Mast height
  const [antennaType, setAntennaType] = useState<'OMNI' | 'CANTENNA_DIRECTIONAL' | 'YAGI_HIGH_GAIN'>('CANTENNA_DIRECTIONAL');
  const [selectedPeerHandle, setSelectedPeerHandle] = useState<string>(peers[0]?.handle || 'qaidi7711');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Calculate effective RSSI and SNR given antenna heading & elevation
  const calculateEffectiveSignal = (peer: PeerNodeSim) => {
    let effectiveRssi = peer.rssiDbm;
    let effectiveSnr = Math.round((peer.rssiDbm + 100) / 2); // Approximate SNR scale
    let isAlignedWithBeam = false;

    // Elevation gain: +1.5 dB per meter elevated above 1m (Fresnel zone clearance)
    const elevationBonus = Math.min(8, Math.max(0, Math.round((antennaElevationMeters - 1.0) * 1.5)));
    effectiveRssi += elevationBonus;
    effectiveSnr += Math.round(elevationBonus * 0.7);

    // Directional beam gain
    if (antennaType !== 'OMNI') {
      const angleDiff = Math.abs((peer.angleDeg - antennaHeadingDeg + 360) % 360);
      const beamHalfWidth = antennaType === 'CANTENNA_DIRECTIONAL' ? 35 : 20;

      if (angleDiff <= beamHalfWidth) {
        isAlignedWithBeam = true;
        const maxGain = antennaType === 'CANTENNA_DIRECTIONAL' ? 14 : 18;
        const gain = Math.round(maxGain * (1 - (angleDiff / beamHalfWidth) * 0.5));
        effectiveRssi += gain;
        effectiveSnr += Math.round(gain * 0.8);
      } else if (angleDiff >= 120 && angleDiff <= 240) {
        // Back-lobe attenuation
        effectiveRssi -= 12;
        effectiveSnr -= 6;
      }
    }

    effectiveRssi = Math.min(-35, Math.max(-115, effectiveRssi));
    effectiveSnr = Math.min(22, Math.max(-18, effectiveSnr));

    // Packet Delivery Ratio (PDR %)
    const pdr = Math.min(100, Math.max(10, Math.round(100 - Math.max(0, (-effectiveRssi - 65) * 1.8))));

    return {
      rssi: effectiveRssi,
      snr: effectiveSnr,
      pdr,
      isAlignedWithBeam
    };
  };

  const handleTestLinkPing = (peerHandle: string) => {
    setIsPinging(true);
    setPingResult(null);
    playPingTone();

    setTimeout(() => {
      setIsPinging(false);
      const peer = peers.find(p => p.handle === peerHandle) || peers[0];
      const sig = calculateEffectiveSignal(peer);
      const res = `Ping ${peerHandle}: 3/3 delivered. Latency 18ms. RSSI: ${sig.rssi} dBm (PDR: ${sig.pdr}%).`;
      setPingResult(res);
      onLogEvent('LinkOptimizer', res, 'success');
    }, 600);
  };

  const playPingTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_e) {}
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 space-y-3 overflow-y-auto">
      {/* Top Banner */}
      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Signal Strength & Topology Optimizer</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Live RF Analysis
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Tune antenna bearing & elevation to maximize mesh link budget
            </p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Interactive 360° Radar & Antenna Beam Visualizer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 flex flex-col items-center relative overflow-hidden">
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Compass className="h-3 w-3 text-emerald-400" />
            <span>BEARING: {antennaHeadingDeg}° ({antennaHeadingDeg >= 315 || antennaHeadingDeg < 45 ? 'NORTH' : antennaHeadingDeg < 135 ? 'EAST' : antennaHeadingDeg < 225 ? 'SOUTH' : 'WEST'})</span>
          </span>
          <span className="text-emerald-400 font-bold">
            {antennaType.replace('_', ' ')}
          </span>
        </div>

        {/* Circular Radar Display */}
        <div className="relative w-48 h-48 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center my-1 shadow-inner shadow-black">
          {/* Concentric Signal Rings */}
          <div className="absolute w-36 h-36 rounded-full border border-slate-800/80" />
          <div className="absolute w-24 h-24 rounded-full border border-slate-800/80" />
          <div className="absolute w-12 h-12 rounded-full border border-slate-800/80" />

          {/* Crosshairs */}
          <div className="absolute inset-x-0 h-[1px] bg-slate-800" />
          <div className="absolute inset-y-0 w-[1px] bg-slate-800" />

          {/* Directional Antenna Beam Cone Overlay */}
          {antennaType !== 'OMNI' && (
            <div
              className="absolute w-44 h-44 rounded-full pointer-events-none transition-transform duration-200"
              style={{
                transform: `rotate(${antennaHeadingDeg - 90}deg)`,
                background: antennaType === 'CANTENNA_DIRECTIONAL'
                  ? 'conic-gradient(from -35deg at 50% 50%, rgba(16,185,129,0.3) 0deg, rgba(16,185,129,0.3) 70deg, transparent 70deg)'
                  : 'conic-gradient(from -20deg at 50% 50%, rgba(16,185,129,0.45) 0deg, rgba(16,185,129,0.45) 40deg, transparent 40deg)'
              }}
            />
          )}

          {/* Center User Node */}
          <div className="relative z-10 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md shadow-emerald-500/50 flex items-center justify-center text-[8px] font-black text-slate-950">
            YOU
          </div>

          {/* Peer Nodes Plotted on Radar */}
          {peers.map((peer) => {
            const rad = (peer.angleDeg - 90) * (Math.PI / 180);
            const distRadius = Math.min(85, Math.max(25, (peer.distanceMeters / 120) * 85));
            const x = Math.cos(rad) * distRadius;
            const y = Math.sin(rad) * distRadius;
            const sig = calculateEffectiveSignal(peer);
            const isSelected = selectedPeerHandle === peer.handle;

            return (
              <div
                key={peer.handle}
                onClick={() => setSelectedPeerHandle(peer.handle)}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={`absolute z-20 cursor-pointer flex flex-col items-center transition-all ${
                  isSelected ? 'scale-125' : 'hover:scale-110'
                }`}
                title={`${peer.handle} (${sig.rssi} dBm, PDR: ${sig.pdr}%)`}
              >
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center text-[7px] font-mono font-bold ${
                    sig.rssi >= -70
                      ? 'bg-emerald-500 border-white text-slate-950 shadow-sm shadow-emerald-500/60'
                      : sig.rssi >= -85
                      ? 'bg-amber-400 border-slate-900 text-slate-950'
                      : 'bg-rose-500 border-slate-900 text-white'
                  }`}
                >
                  {sig.isAlignedWithBeam ? '★' : '•'}
                </div>
                <span className="text-[7px] font-mono bg-slate-950/90 px-1 rounded text-white whitespace-nowrap mt-0.5 border border-slate-800">
                  {peer.handle}
                </span>
              </div>
            );
          })}
        </div>

        {/* Antenna Controls */}
        <div className="w-full mt-3 space-y-2.5 pt-2 border-t border-slate-800 text-[10px]">
          {/* Heading Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Rotate Antenna Heading:</span>
              <span className="text-emerald-400 font-bold">{antennaHeadingDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              step="5"
              value={antennaHeadingDeg}
              onChange={(e) => setAntennaHeadingDeg(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Elevation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Antenna Mast Elevation:</span>
              <span className="text-emerald-400 font-bold">{antennaElevationMeters.toFixed(1)} meters</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={antennaElevationMeters}
              onChange={(e) => setAntennaElevationMeters(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Antenna Type Selector */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-slate-400 mr-1">Antenna:</span>
            {[
              { id: 'CANTENNA_DIRECTIONAL', label: 'Cantenna (+14 dBi)' },
              { id: 'YAGI_HIGH_GAIN', label: 'Yagi (+18 dBi)' },
              { id: 'OMNI', label: 'Omni (2 dBi)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setAntennaType(t.id as any)}
                className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors ${
                  antennaType === t.id
                    ? 'bg-emerald-600 text-slate-950 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Peer Link Diagnostics */}
      {selectedPeerHandle && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          {(() => {
            const peer = peers.find(p => p.handle === selectedPeerHandle) || peers[0];
            const sig = calculateEffectiveSignal(peer);

            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                      @
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{peer.handle}</h4>
                      <p className="text-[10px] text-slate-400">
                        {peer.distanceMeters}m away • Bearing {peer.angleDeg}°
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestLinkPing(peer.handle)}
                    disabled={isPinging}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Zap className="h-3 w-3" />
                    <span>{isPinging ? 'Pinging...' : 'Test Link'}</span>
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">RSSI (Power)</span>
                    <span className={`text-xs font-bold font-mono ${
                      sig.rssi >= -70 ? 'text-emerald-400' : sig.rssi >= -85 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {sig.rssi} dBm
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">SNR (Noise)</span>
                    <span className="text-xs font-bold font-mono text-emerald-300">
                      +{sig.snr} dB
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">PDR (Packet Rate)</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {sig.pdr}%
                    </span>
                  </div>
                </div>

                {pingResult && (
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                    {pingResult}
                  </div>
                )}

                {/* AI / Algorithmic Placement Advice */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-1 text-[10px]">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Antenna Placement Recommendation:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {sig.isAlignedWithBeam
                      ? `✓ Perfectly aligned! Your ${antennaType.replace('_', ' ')} beam is directed at ${peer.handle}. Providing +14 dBi forward gain with clear 1st Fresnel zone.`
                      : `Rotate antenna to ${peer.angleDeg}° to place ${peer.handle} in direct beam path. This will increase link budget by +14 dB and raise PDR to 99%.`}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Peer Summary List */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          All Visible Mesh Neighbors:
        </span>
        <div className="space-y-1">
          {peers.map((peer) => {
            const sig = calculateEffectiveSignal(peer);
            return (
              <div
                key={peer.handle}
                onClick={() => setSelectedPeerHandle(peer.handle)}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  selectedPeerHandle === peer.handle
                    ? 'bg-slate-900 border-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-white">{peer.handle}</span>
                  <span className="text-[10px] text-slate-400">{peer.distanceMeters}m</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={sig.rssi >= -70 ? 'text-emerald-400' : sig.rssi >= -85 ? 'text-amber-400' : 'text-rose-400'}>
                    {sig.rssi} dBm
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    PDR: {sig.pdr}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
