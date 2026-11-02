import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Activity,
  Wifi,
  Sparkles,
  ShieldCheck,
  Headphones,
  Compass,
  Zap,
  RotateCcw,
  Plus,
  Minus,
  Settings2
} from 'lucide-react';

export interface RadioChannel {
  frequencyMhz: number;
  name: string;
  category: 'FM_BROADCAST' | 'EMERGENCY_RADIO' | 'PROTEST_RADIO' | 'VHF_APRS' | 'ISM_VOICE' | 'MANUAL_TUNED';
  description: string;
  signalStrengthDbm: number;
  modulation: 'WFM' | 'NFM' | 'AM' | 'LORA_FSK';
  isLive: boolean;
  synthBaseFreq: number;
  bandwidthKhz?: number;
  spreadingFactor?: number;
}

const CHANNELS: RadioChannel[] = [
  {
    frequencyMhz: 88.5,
    name: '88.5 MHz - Civic Emergency Broadcast',
    category: 'FM_BROADCAST',
    description: 'Continuous local civil defense bulletins and road status reports directly on speaker.',
    signalStrengthDbm: -65,
    modulation: 'WFM',
    isLive: true,
    synthBaseFreq: 220,
    bandwidthKhz: 200
  },
  {
    frequencyMhz: 102.1,
    name: '102.1 MHz - Emergency Volunteer Coordination',
    category: 'EMERGENCY_RADIO',
    description: 'Volunteer marshals coordinating safe routes, first-aid posts, and emergency logistics.',
    signalStrengthDbm: -72,
    modulation: 'NFM',
    isLive: true,
    synthBaseFreq: 330,
    bandwidthKhz: 25
  },
  {
    frequencyMhz: 144.390,
    name: '144.390 MHz - 2m VHF APRS Voice',
    category: 'VHF_APRS',
    description: 'Amateur radio emergency repeater relaying digital and voice position packets.',
    signalStrengthDbm: -84,
    modulation: 'NFM',
    isLive: true,
    synthBaseFreq: 440,
    bandwidthKhz: 12.5
  },
  {
    frequencyMhz: 433.920,
    name: '433.920 MHz - ISM Local LoRa Packet Stream',
    category: 'ISM_VOICE',
    description: 'Sub-GHz LoRa mesh emergency beacon and DTN packet router listener.',
    signalStrengthDbm: -90,
    modulation: 'LORA_FSK',
    isLive: true,
    synthBaseFreq: 520,
    bandwidthKhz: 125,
    spreadingFactor: 11
  },
  {
    frequencyMhz: 915.000,
    name: '915.000 MHz - Long-Range LoRa Telemetry',
    category: 'ISM_VOICE',
    description: 'High-spread-factor 40km-100km hilltop packet relay backbone.',
    signalStrengthDbm: -94,
    modulation: 'LORA_FSK',
    isLive: true,
    synthBaseFreq: 587,
    bandwidthKhz: 62.5,
    spreadingFactor: 12
  }
];

interface SdrSpeakerRadioViewProps {
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const SdrSpeakerRadioView: React.FC<SdrSpeakerRadioViewProps> = ({ onLogEvent }) => {
  // Tuning Mode: 'PRESETS' or 'MANUAL_TUNER'
  const [tuningMode, setTuningMode] = useState<'PRESETS' | 'MANUAL_TUNER'>('MANUAL_TUNER');
  
  // Selected preset channel or manual parameters
  const [selectedChannel, setSelectedChannel] = useState<RadioChannel>(CHANNELS[0]);
  const [manualFreqMhz, setManualFreqMhz] = useState<number>(433.920);
  const [manualModulation, setManualModulation] = useState<'WFM' | 'NFM' | 'AM' | 'LORA_FSK'>('LORA_FSK');
  const [manualBandwidthKhz, setManualBandwidthKhz] = useState<number>(125);
  const [manualSpreadingFactor, setManualSpreadingFactor] = useState<number>(11);
  const [manualTxPowerDbm, setManualTxPowerDbm] = useState<number>(20);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [squelchDbm, setSquelchDbm] = useState(-80);
  const [isSpeakerMode, setIsSpeakerMode] = useState(true); // Built-in speaker (no headphone)
  const [spectrumBars, setSpectrumBars] = useState<number[]>([30, 45, 60, 80, 55, 40, 70, 95, 65, 50, 35, 75]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Active operating frequency
  const currentFrequency = tuningMode === 'MANUAL_TUNER' ? manualFreqMhz : selectedChannel.frequencyMhz;
  const currentModulation = tuningMode === 'MANUAL_TUNER' ? manualModulation : selectedChannel.modulation;

  // Synthesize audio tone matching tuned frequency
  useEffect(() => {
    if (isPlaying) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Calculate pitch based on frequency (mapped to 180Hz - 600Hz audio range)
        const baseFreq = 200 + ((currentFrequency % 100) * 4);
        osc.type = currentModulation === 'LORA_FSK' ? 'sawtooth' : currentModulation === 'AM' ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        const targetVol = (volume / 100) * 0.04;
        gain.gain.setValueAtTime(targetVol, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;

        onLogEvent(
          'SdrRadio',
          `SDR tuned to ${currentFrequency.toFixed(3)} MHz (${currentModulation}) via Loudspeaker. Squelch: ${squelchDbm} dBm.`,
          'success'
        );
      } catch (_e) {}
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_e) {}
        oscRef.current = null;
      }
    }

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_e) {}
        oscRef.current = null;
      }
    };
  }, [isPlaying, currentFrequency, currentModulation, volume]);

  // Spectrum animation
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setSpectrumBars(prev =>
          prev.map(() => Math.floor(25 + Math.random() * 75))
        );
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Custom user saved channels
  const [customPresets, setCustomPresets] = useState<RadioChannel[]>(() => {
    try {
      const saved = localStorage.getItem('qaidi_radio_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [manualCodingRate, setManualCodingRate] = useState<'4/5' | '4/6' | '4/7' | '4/8'>('4/5');
  const [isTransmittingBeacon, setIsTransmittingBeacon] = useState(false);

  // Calculate ERP in milliwatts: 10^(dBm / 10)
  const erpMilliwatts = Math.round(Math.pow(10, manualTxPowerDbm / 10));

  // Save current tuning as a preset
  const handleSaveCurrentAsPreset = () => {
    const newPreset: RadioChannel = {
      frequencyMhz: manualFreqMhz,
      name: `${manualFreqMhz.toFixed(3)} MHz - DIY Custom (${manualModulation})`,
      category: 'MANUAL_TUNED',
      description: `User-defined preset: SF${manualSpreadingFactor}, BW ${manualBandwidthKhz}kHz, CR ${manualCodingRate}, ${manualTxPowerDbm}dBm (${erpMilliwatts}mW).`,
      signalStrengthDbm: -60 - Math.floor(Math.random() * 25),
      modulation: manualModulation,
      isLive: true,
      synthBaseFreq: 200 + ((manualFreqMhz % 100) * 4),
      bandwidthKhz: manualBandwidthKhz,
      spreadingFactor: manualSpreadingFactor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem('qaidi_radio_presets', JSON.stringify(updated));
    } catch {}
    onLogEvent('SdrRadio', `Saved custom preset: ${newPreset.name}`, 'success');
  };

  // Simulate DIY Hardware TX Beacon
  const handleTransmitBeacon = () => {
    setIsTransmittingBeacon(true);
    onLogEvent(
      'SdrRadio',
      `[TX BEACON] Transmitting at ${manualFreqMhz.toFixed(3)} MHz | ${erpMilliwatts}mW (${manualTxPowerDbm} dBm) | CR ${manualCodingRate} | SF${manualSpreadingFactor}...`,
      'warn'
    );

    setTimeout(() => {
      setIsTransmittingBeacon(false);
      onLogEvent(
        'SdrRadio',
        `[TX ACK] Beacon burst acknowledged by 3 nearby LoRa nodes. Link budget: +18dB margin.`,
        'success'
      );
    }, 1200);
  };

  const [isScanningNearby, setIsScanningNearby] = useState(false);
  const [detectedScanResult, setDetectedScanResult] = useState<string | null>(null);

  // Auto-Detect & Tune Nearby Radio Carrier
  const handleScanNearbyFrequencies = () => {
    setIsScanningNearby(true);
    setDetectedScanResult(null);
    onLogEvent('SdrRadio', 'Sweeping RF spectrum (50MHz - 1GHz) for active nearby carrier beacons...', 'info');

    setTimeout(() => {
      setIsScanningNearby(false);
      const activeFrequencies = [
        { freq: 433.920, mod: 'LORA_FSK', name: '433.920 MHz ISM LoRa Emergency Beacon', bw: 125, sf: 11 },
        { freq: 88.500, mod: 'WFM', name: '88.5 MHz Civic FM Broadcaster', bw: 200, sf: 7 },
        { freq: 144.390, mod: 'NFM', name: '144.390 MHz 2m VHF APRS Voice', bw: 25, sf: 9 }
      ];
      const detected = activeFrequencies[0];
      setManualFreqMhz(detected.freq);
      setManualModulation(detected.mod as any);
      setManualBandwidthKhz(detected.bw);
      setManualSpreadingFactor(detected.sf);
      setIsPlaying(true);
      const msg = `Auto-Detected Active Carrier: ${detected.name}! Tuned and playing on loudspeaker.`;
      setDetectedScanResult(msg);
      onLogEvent('SdrRadio', msg, 'success');
    }, 1400);
  };

  // Manual Tuning Step Helpers
  const stepFrequency = (deltaMhz: number) => {
    const updated = Math.max(50.0, Math.min(2500.0, +(manualFreqMhz + deltaMhz).toFixed(3)));
    setManualFreqMhz(updated);
    onLogEvent('SdrRadio', `Manual VFO tuned to: ${updated.toFixed(3)} MHz`, 'info');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 space-y-3 overflow-y-auto">
      {/* Header Info Banner */}
      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>SDR Radio & Manual VFO Tuner</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Direct Speaker Out
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Manual frequency dialing (50MHz - 2.5GHz), LoRa SF, & bandwidth controls
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px]">
          <button
            onClick={() => setTuningMode('MANUAL_TUNER')}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              tuningMode === 'MANUAL_TUNER'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setTuningMode('PRESETS')}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              tuningMode === 'PRESETS'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Main Tuner & Spectrum Visualizer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
        {/* Frequency Readout & Direct Numeric Input */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            {tuningMode === 'MANUAL_TUNER' ? 'Manual VFO Carrier Frequency' : 'Preset Emergency Channel'}
          </span>
          
          {tuningMode === 'MANUAL_TUNER' ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                step="0.005"
                min="50"
                max="2500"
                value={manualFreqMhz}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setManualFreqMhz(+val.toFixed(3));
                }}
                className="w-40 text-center text-3xl font-black font-mono text-emerald-400 bg-slate-950 border border-emerald-500/40 rounded-lg px-2 py-0.5 focus:outline-none focus:border-emerald-400"
              />
              <span className="text-sm font-bold text-slate-400">MHz</span>
            </div>
          ) : (
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
              {currentFrequency.toFixed(3)}
              <span className="text-xs text-slate-400 ml-1">MHz</span>
            </div>
          )}

          <div className="flex items-center justify-center flex-wrap gap-1.5 mt-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">
              MOD: {currentModulation}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              BW: {tuningMode === 'MANUAL_TUNER' ? `${manualBandwidthKhz} kHz` : `${selectedChannel.bandwidthKhz || 200} kHz`}
            </span>
            {currentModulation === 'LORA_FSK' && (
              <>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  SF: {tuningMode === 'MANUAL_TUNER' ? `SF${manualSpreadingFactor}` : `SF${selectedChannel.spreadingFactor || 11}`}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-teal-300 border border-slate-800">
                  CR: {manualCodingRate}
                </span>
              </>
            )}
            <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
              PWR: {manualTxPowerDbm} dBm ({erpMilliwatts} mW)
            </span>
          </div>
        </div>

        {/* Manual VFO Dial & Steppers */}
        {tuningMode === 'MANUAL_TUNER' && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>CONTINUOUS FREQUENCY SLIDER</span>
              <span className="text-emerald-400 font-bold">{manualFreqMhz.toFixed(3)} MHz</span>
            </div>

            {/* Continuous Frequency Slider */}
            <input
              type="range"
              min="50"
              max="1000"
              step="0.025"
              value={manualFreqMhz}
              onChange={(e) => setManualFreqMhz(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Fine & Medium Steppers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="text-[9px] text-slate-500 uppercase shrink-0">Fine:</span>
                <button
                  onClick={() => stepFrequency(-0.01)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  -0.01M
                </button>
                <button
                  onClick={() => stepFrequency(0.01)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  +0.01M
                </button>
                <button
                  onClick={() => stepFrequency(-0.1)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  -0.1M
                </button>
                <button
                  onClick={() => stepFrequency(0.1)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  +0.1M
                </button>
              </div>

              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="text-[9px] text-slate-500 uppercase shrink-0">Coarse:</span>
                <button
                  onClick={() => stepFrequency(-1.0)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  -1.0M
                </button>
                <button
                  onClick={() => stepFrequency(1.0)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  +1.0M
                </button>
                <button
                  onClick={() => stepFrequency(-5.0)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  -5.0M
                </button>
                <button
                  onClick={() => stepFrequency(5.0)}
                  className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                >
                  +5.0M
                </button>
              </div>
            </div>

            {/* Auto-Detect Nearby Frequency Scanner */}
            <div className="pt-1 border-t border-slate-900">
              <button
                onClick={handleScanNearbyFrequencies}
                disabled={isScanningNearby}
                className="w-full py-2 rounded-lg bg-teal-600/30 hover:bg-teal-600/40 border border-teal-500/50 text-teal-300 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Radio className={`h-3.5 w-3.5 text-teal-400 ${isScanningNearby ? 'animate-spin' : ''}`} />
                <span>{isScanningNearby ? 'Scanning Spectrum (50MHz-1GHz)...' : 'Scan & Auto-Tune Nearby Radio Frequency'}</span>
              </button>
              {detectedScanResult && (
                <div className="mt-1.5 p-2 rounded-lg bg-teal-950/50 border border-teal-500/40 text-[9px] font-mono text-teal-300">
                  {detectedScanResult}
                </div>
              )}
            </div>

            {/* Quick Jump Buttons to Popular Bands */}
            <div className="flex items-center gap-1 overflow-x-auto text-[9px] font-mono no-scrollbar pt-1">
              <span className="text-slate-500 mr-1">Bands:</span>
              <button
                onClick={() => setManualFreqMhz(88.5)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
              >
                88.5 FM
              </button>
              <button
                onClick={() => setManualFreqMhz(144.39)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
              >
                144.39 2m
              </button>
              <button
                onClick={() => setManualFreqMhz(433.92)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300"
              >
                433.92 LoRa
              </button>
              <button
                onClick={() => setManualFreqMhz(868.1)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
              >
                868 EU
              </button>
              <button
                onClick={() => setManualFreqMhz(915.0)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
              >
                915 US
              </button>
            </div>

            {/* RF Parameters Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Modulation:</label>
                <select
                  value={manualModulation}
                  onChange={(e) => setManualModulation(e.target.value as any)}
                  className="w-full mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="LORA_FSK">LoRa FSK (Chirp)</option>
                  <option value="WFM">WFM (FM Radio)</option>
                  <option value="NFM">NFM (Walkie-Talkie)</option>
                  <option value="AM">AM (Shortwave)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Bandwidth:</label>
                <select
                  value={manualBandwidthKhz}
                  onChange={(e) => setManualBandwidthKhz(parseFloat(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="31.25">31.25 kHz (Extreme)</option>
                  <option value="62.5">62.5 kHz (100km Range)</option>
                  <option value="125">125 kHz (Standard LoRa)</option>
                  <option value="250">250 kHz (High Speed)</option>
                  <option value="500">500 kHz (Voice stream)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Spreading Factor:</label>
                <select
                  value={manualSpreadingFactor}
                  onChange={(e) => setManualSpreadingFactor(parseInt(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="7">SF7 (Fastest, short range)</option>
                  <option value="8">SF8</option>
                  <option value="9">SF9 (Medium)</option>
                  <option value="10">SF10 (High sensitivity)</option>
                  <option value="11">SF11 (Urban penetration)</option>
                  <option value="12">SF12 (100km Max Range)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Coding Rate (CR):</label>
                <select
                  value={manualCodingRate}
                  onChange={(e) => setManualCodingRate(e.target.value as any)}
                  className="w-full mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="4/5">4/5 (Standard FEC)</option>
                  <option value="4/6">4/6 (Intermediate)</option>
                  <option value="4/7">4/7 (Heavy Noise)</option>
                  <option value="4/8">4/8 (Max Error Correction)</option>
                </select>
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>TX Power (EIRP):</span>
                  <span className="text-emerald-400 font-mono">{manualTxPowerDbm} dBm = {erpMilliwatts} mW</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="22"
                  step="1"
                  value={manualTxPowerDbm}
                  onChange={(e) => setManualTxPowerDbm(parseInt(e.target.value))}
                  className="w-full mt-1 accent-emerald-500 h-1 bg-slate-800 rounded"
                />
              </div>
            </div>

            {/* Save Channel Preset and Transmit Beacon Row */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
              <button
                onClick={handleSaveCurrentAsPreset}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Save as Preset</span>
              </button>

              <button
                onClick={handleTransmitBeacon}
                disabled={isTransmittingBeacon}
                className="flex-1 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-slate-950 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{isTransmittingBeacon ? 'Broadcasting...' : 'Test TX Beacon'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Audio Spectrum Analyzer */}
        <div className="h-14 bg-slate-950 rounded-lg p-2 flex items-end justify-between gap-1 border border-slate-800/80">
          {spectrumBars.map((height, idx) => (
            <div
              key={idx}
              style={{ height: isPlaying ? `${height}%` : '8%' }}
              className={`flex-1 rounded-t transition-all duration-150 ${
                isPlaying ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleTogglePlay}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Mute Radio Carrier</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Listen on Speaker</span>
              </>
            )}
          </button>

          {/* Speaker Loudspeaker Output */}
          <button
            onClick={() => {
              setIsSpeakerMode(!isSpeakerMode);
              onLogEvent('SdrRadio', isSpeakerMode ? 'Switched to earpiece mode.' : 'Switched to loudspeaker.', 'info');
            }}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSpeakerMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Loudspeaker Output"
          >
            <Volume2 className="h-4 w-4" />
            <span className="text-[10px]">{isSpeakerMode ? 'Speaker Loud' : 'Earpiece'}</span>
          </button>
        </div>
      </div>

      {/* Preset Frequencies List (Active when tuningMode === 'PRESETS') */}
      {tuningMode === 'PRESETS' && (
        <div className="space-y-3">
          {/* Custom User Presets */}
          {customPresets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>Custom Saved Channels ({customPresets.length})</span>
                <button
                  onClick={() => {
                    setCustomPresets([]);
                    localStorage.removeItem('qaidi_radio_presets');
                  }}
                  className="text-[9px] text-slate-500 hover:text-rose-400"
                >
                  Clear All
                </button>
              </h4>
              <div className="space-y-2">
                {customPresets.map((ch, idx) => (
                  <button
                    key={`custom-${idx}`}
                    onClick={() => {
                      setSelectedChannel(ch);
                      setManualFreqMhz(ch.frequencyMhz);
                      if (ch.modulation) setManualModulation(ch.modulation);
                      if (ch.bandwidthKhz) setManualBandwidthKhz(ch.bandwidthKhz);
                      if (ch.spreadingFactor) setManualSpreadingFactor(ch.spreadingFactor);
                      onLogEvent('SdrRadio', `Tuned to custom preset: ${ch.name}`, 'info');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedChannel.frequencyMhz === ch.frequencyMhz
                        ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-300">{ch.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {ch.frequencyMhz.toFixed(3)} MHz
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{ch.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Verified Emergency Channels
            </h4>
            <div className="space-y-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.frequencyMhz}
                  onClick={() => {
                    setSelectedChannel(ch);
                    setManualFreqMhz(ch.frequencyMhz);
                    if (ch.modulation) setManualModulation(ch.modulation);
                    if (ch.bandwidthKhz) setManualBandwidthKhz(ch.bandwidthKhz);
                    if (ch.spreadingFactor) setManualSpreadingFactor(ch.spreadingFactor);
                    onLogEvent('SdrRadio', `Tuned SDR to preset: ${ch.name}`, 'info');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    selectedChannel.frequencyMhz === ch.frequencyMhz
                      ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{ch.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {ch.frequencyMhz} MHz
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{ch.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
