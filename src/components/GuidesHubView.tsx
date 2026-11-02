import React, { useState } from 'react';
import {
  BookOpen,
  Radio,
  ShieldAlert,
  Flame,
  Droplets,
  HeartPulse,
  Wrench,
  Download,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Cpu,
  Zap,
  Copy,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import {
  ESP32_LORA_C_PLUS_PLUS_CODE,
  PYTHON_SDR_TRANSMIT_CODE
} from '../core/radioPacketTransmission';

export interface GuideItem {
  id: string;
  category: 'DIY_ANTENNAS' | 'PROTEST_SURVIVAL' | 'FIRST_AID' | 'ESP32_LORA' | 'RADIO_CODE';
  title: string;
  subtitle: string;
  languageBadge: 'English + Urdu' | 'Urdu Primary' | 'English Technical';
  schematicSummary: string;
  steps: string[];
  illustrationType: 'CANTENNA_DIAGRAM' | 'PARABOLIC_DISH' | 'ESP32_BOARD' | 'FIRST_AID_ILLUSTRATION';
  codeSnippet?: string;
  downloadSizeBytes: number;
}

const GUIDES: GuideItem[] = [
  {
    id: 'guide-cantenna',
    category: 'DIY_ANTENNAS',
    title: 'DIY 2.4GHz & 5GHz Can Antenna (Cantenna)',
    subtitle: 'Boost Android Wi-Fi Direct range from 80m to 1.8km using household tin cans',
    languageBadge: 'English + Urdu',
    schematicSummary: 'Can Diameter: 83mm | Length: 133mm | Probe Height: 31mm at 62mm from base | Gain: +14 dBi',
    illustrationType: 'CANTENNA_DIAGRAM',
    steps: [
      'Select a smooth, ungrooved tin food or coffee can (diameter between 80mm-92mm). Clean and remove paper labels.',
      'Measure 62mm (quarter guide wavelength for 2.44GHz) from the solid bottom. Mark and drill a 12mm hole.',
      'Take a straight 12 AWG solid copper wire. Cut it to exactly 31mm length (quarter wavelength). Solder it straight into the center pin of an N-female chassis connector.',
      'Bolt the N-connector firmly into the 12mm hole with the 31mm copper probe protruding perpendicularly into the center cavity.',
      'Connect via low-loss RG-58/LMR-400 pigtail cable to your Android Wi-Fi adapter or OTG mesh dongle. Aim the open front toward distant peer nodes.'
    ],
    downloadSizeBytes: 4.2 * 1024 * 1024
  },
  {
    id: 'guide-parabolic',
    category: 'DIY_ANTENNAS',
    title: 'DIY Parabolic Foil Reflector (Windsurfer)',
    subtitle: 'Directional +9 dBi parabolic booster made from cardboard, aluminum foil, and glue',
    languageBadge: 'English + Urdu',
    schematicSummary: 'Parabolic Focal Distance: 45mm | Width: 160mm | Height: 120mm | Aluminum Foil Shielded',
    illustrationType: 'PARABOLIC_DISH',
    steps: [
      'Cut a piece of stiff cardboard (160mm x 120mm). Score subtle vertical lines to allow bending into a smooth parabolic curve.',
      'Glue heavy-duty aluminum kitchen foil onto the concave inner surface with zero wrinkles.',
      'Position your phone or Wi-Fi antenna precisely at the focal point (45mm in front of the parabolic vertex).',
      'Aim the reflective dish toward rally coordination spots or campus hubs to concentrate radio energy through walls and concrete.'
    ],
    downloadSizeBytes: 2.1 * 1024 * 1024
  },
  {
    id: 'guide-esp32',
    category: 'ESP32_LORA',
    title: 'ESP32 Autonomous LoRa Relay Firmware & Wiring',
    subtitle: 'Transmit text, audio notes, photos, and video chunks over 433MHz/868MHz/915MHz radio without cellular towers',
    languageBadge: 'English Technical',
    schematicSummary: 'ESP32 TTGO T-Beam v1.1 + SX1262 LoRa + 18650 Li-ion + 8.2cm Quarter-Wave Antenna',
    illustrationType: 'ESP32_BOARD',
    codeSnippet: ESP32_LORA_C_PLUS_PLUS_CODE,
    steps: [
      'Connect ESP32 board to computer via USB-C. Open Arduino IDE or PlatformIO.',
      'Install Arduino LoRa library by Sandeep Mistry. Select board: "ESP32 Dev Module".',
      'Copy the provided C++ firmware code below, which handles automated store-and-forward hopping and deduplication.',
      'Attach an 8.2cm wire (quarter-wave for 433 MHz) or SMA rubber ducky antenna. Never transmit without an antenna connected!',
      'Deploy node in weatherproof plastic container with small 5V solar panel on rooftops or balconies to create a city-wide radio relay backbone.'
    ],
    downloadSizeBytes: 6.8 * 1024 * 1024
  },
  {
    id: 'guide-airborne',
    category: 'FIRST_AID',
    title: 'Airborne Irritant & Chemical Smoke Field Decontamination Protocol',
    subtitle: 'Immediate eye and skin relief procedures in Urdu & English',
    languageBadge: 'English + Urdu',
    schematicSummary: '0.9% Normal Saline Solution or 50/50 Liquid Antacid (Maalox) + Clean Water',
    illustrationType: 'FIRST_AID_ILLUSTRATION',
    steps: [
      'DO NOT rub eyes or touch face. Rubbing embeds micro-crystals into corneas.',
      'Flush eyes immediately with sterile saline solution from inner bridge of nose outward. Tilt head so contaminated runoff drains off side of face.',
      'Blow nose and spit frequently to expel trapped particles from mucous membranes.',
      'Strip off contaminated outer clothes by cutting or pulling down (avoid pulling over face).',
      'Wash skin with cold running water and simple vegetable oil soap. Avoid hot showers.'
    ],
    downloadSizeBytes: 2.5 * 1024 * 1024
  }
];

interface GuidesHubViewProps {
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onDownloadGuide: (title: string, sizeBytes: number) => void;
}

export const GuidesHubView: React.FC<GuidesHubViewProps> = ({ onLogEvent, onDownloadGuide }) => {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem>(GUIDES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutorial' | 'schematic' | 'code'>('tutorial');

  const handleCopyCode = () => {
    if (!selectedGuide.codeSnippet) return;
    navigator.clipboard.writeText(selectedGuide.codeSnippet);
    setCopiedCode(true);
    onLogEvent('GuidesHub', 'Copied ESP32 LoRa C++ firmware code to clipboard.', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#021812] text-emerald-100 p-3 space-y-3 overflow-y-auto font-sans">
      {/* Header Banner - Eye Strain Free Deep Green Theme */}
      <div className="p-3 rounded-lg bg-[#032219] border border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>DIY Signal Boosters & Radio Module Hub</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                With Schematics & Code
              </span>
            </h3>
            <p className="text-[10px] text-emerald-400">
              Schematics, step-by-step illustrations, and firmware for maximum range
            </p>
          </div>
        </div>
      </div>

      {/* Guide Category Selector */}
      <div className="grid grid-cols-2 gap-2">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setSelectedGuide(g);
              setActiveTab('tutorial');
              onLogEvent('GuidesHub', `Viewing guide: ${g.title}`, 'info');
            }}
            className={`p-2 rounded-lg border text-left transition-all ${
              selectedGuide.id === g.id
                ? 'bg-[#063326] border-emerald-400 text-white shadow-md'
                : 'bg-[#031d16] border-emerald-900/60 text-emerald-300/80 hover:border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {g.category === 'DIY_ANTENNAS' && <Radio className="h-3.5 w-3.5 text-amber-400" />}
              {g.category === 'ESP32_LORA' && <Cpu className="h-3.5 w-3.5 text-teal-400" />}
              {g.category === 'PROTEST_SURVIVAL' && <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
              <span className="text-[11px] font-bold line-clamp-1">{g.title.split('(')[0]}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#021812] text-emerald-400 border border-emerald-900/60">
              {g.languageBadge}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-view Tab Switcher */}
      <div className="flex rounded-lg bg-[#031f18] p-1 border border-emerald-900/60">
        <button
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
            activeTab === 'tutorial' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-emerald-400/80 hover:text-white'
          }`}
        >
          Step-by-Step
        </button>
        <button
          onClick={() => setActiveTab('schematic')}
          className={`flex-1 py-1 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'schematic' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-emerald-400/80 hover:text-white'
          }`}
        >
          <ImageIcon className="h-3 w-3" />
          <span>Picture & Diagram</span>
        </button>
        {selectedGuide.codeSnippet && (
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'code' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-emerald-400/80 hover:text-white'
            }`}
          >
            <Code className="h-3 w-3" />
            <span>Firmware Code</span>
          </button>
        )}
      </div>

      {/* VIEW 1: STEP-BY-STEP TUTORIAL */}
      {activeTab === 'tutorial' && (
        <div className="p-3 rounded-lg border border-emerald-800/60 bg-[#031d16] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">{selectedGuide.title}</h4>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">{selectedGuide.subtitle}</p>
            </div>
            <button
              onClick={() => onDownloadGuide(selectedGuide.title, selectedGuide.downloadSizeBytes)}
              className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0"
            >
              <Download className="h-3 w-3" />
              <span>Offline Guide</span>
            </button>
          </div>

          <div className="p-2 rounded bg-[#021812] border border-emerald-900/80 text-[10px] font-mono text-emerald-300">
            <span className="text-emerald-500 block mb-0.5">Critical Dimensions:</span>
            {selectedGuide.schematicSummary}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-200 block">Procedure Steps:</span>
            {selectedGuide.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-emerald-100">
                <span className="h-5 w-5 rounded-full bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-300 shrink-0">
                  {idx + 1}
                </span>
                <p className="leading-relaxed text-[11px]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PICTURE & HIGH-FIDELITY SCHEMATIC DIAGRAM */}
      {activeTab === 'schematic' && (
        <div className="p-3 rounded-lg border border-emerald-800/60 bg-[#031d16] space-y-3 text-center">
          <h4 className="text-xs font-bold text-white mb-1">
            {selectedGuide.illustrationType === 'CANTENNA_DIAGRAM' && 'Cantenna Directional Waveguide Schematic'}
            {selectedGuide.illustrationType === 'PARABOLIC_DISH' && 'Parabolic Dish Focal Reflection Diagram'}
            {selectedGuide.illustrationType === 'ESP32_BOARD' && 'ESP32 LoRa Packet Transceiver Hardware Pinout'}
            {selectedGuide.illustrationType === 'FIRST_AID_ILLUSTRATION' && 'Saline Eye Wash & Decontamination Angle'}
          </h4>

          {/* SVG Diagram Rendering */}
          <div className="h-52 w-full rounded-lg bg-[#021812] border border-emerald-900/80 flex items-center justify-center p-2 relative overflow-hidden">
            {selectedGuide.illustrationType === 'CANTENNA_DIAGRAM' && (
              <svg viewBox="0 0 320 180" className="w-full h-full text-emerald-400">
                {/* Tin Can Cylinder Body */}
                <rect x="50" y="45" width="160" height="90" rx="4" fill="#04281e" stroke="#10b981" strokeWidth="2" />
                <ellipse cx="50" cy="90" rx="14" ry="45" fill="#021812" stroke="#10b981" strokeWidth="2" />
                <ellipse cx="210" cy="90" rx="14" ry="45" fill="#064e3b" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

                {/* N-Connector & Copper Probe */}
                <rect x="95" y="32" width="14" height="13" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <line x1="102" y1="45" x2="102" y2="76" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                <circle cx="102" cy="76" r="2" fill="#f59e0b" />

                {/* Waveguide Emission Lobes */}
                <path d="M 220 90 Q 260 50 295 40" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 220 90 Q 275 90 310 90" fill="none" stroke="#34d399" strokeWidth="2" />
                <path d="M 220 90 Q 260 130 295 140" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 2" />

                {/* Dimension Annotations */}
                <text x="75" y="24" fill="#f59e0b" fontSize="8" fontFamily="monospace">Probe: 31mm</text>
                <text x="65" y="150" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Quarter-Guide: 62mm</text>
                <text x="180" y="150" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Total Can: 133mm</text>
                <text x="240" y="105" fill="#34d399" fontSize="9" fontWeight="bold">Directional Beam +14dBi</text>
              </svg>
            )}

            {selectedGuide.illustrationType === 'PARABOLIC_DISH' && (
              <svg viewBox="0 0 320 180" className="w-full h-full text-emerald-400">
                {/* Parabolic Foil Dish Curve */}
                <path d="M 70 20 Q 150 90 70 160" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                <path d="M 72 20 Q 152 90 72 160" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* Focal Antenna */}
                <circle cx="115" cy="90" r="6" fill="#10b981" />
                <rect x="113" y="96" width="4" height="24" fill="#34d399" />
                <text x="95" y="80" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">Focal Point: 45mm</text>

                {/* Reflected Parallel Rays */}
                <line x1="72" y1="40" x2="115" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="72" y1="140" x2="115" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="72" y1="40" x2="280" y2="40" stroke="#10b981" strokeWidth="1.5" />
                <line x1="115" y1="90" x2="290" y2="90" stroke="#10b981" strokeWidth="2" />
                <line x1="72" y1="140" x2="280" y2="140" stroke="#10b981" strokeWidth="1.5" />

                <text x="200" y="105" fill="#a7f3d0" fontSize="9" fontWeight="bold">+9 dBi High Penetration</text>
              </svg>
            )}

            {selectedGuide.illustrationType === 'ESP32_BOARD' && (
              <svg viewBox="0 0 320 180" className="w-full h-full text-emerald-400">
                {/* ESP32 Board PCB */}
                <rect x="70" y="30" width="180" height="120" rx="6" fill="#042f24" stroke="#10b981" strokeWidth="2" />
                {/* MCU Chip */}
                <rect x="130" y="55" width="60" height="60" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="138" y="88" fill="#38bdf8" fontSize="8" fontFamily="monospace">ESP32-D0WD</text>
                {/* LoRa SX1262 Module */}
                <rect x="80" y="55" width="40" height="40" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                <text x="83" y="78" fill="#f59e0b" fontSize="7" fontFamily="monospace">SX1262</text>
                {/* SMA Antenna Port */}
                <rect x="88" y="20" width="10" height="10" fill="#e2e8f0" />
                <line x1="93" y1="20" x2="93" y2="2" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="93" y1="2" x2="93" y2="-20" stroke="#34d399" strokeWidth="2" strokeDasharray="3 2" />
                {/* OLED Display */}
                <rect x="200" y="55" width="42" height="28" rx="2" fill="#000" stroke="#38bdf8" strokeWidth="1" />
                <text x="204" y="72" fill="#38bdf8" fontSize="6" fontFamily="monospace">433.92MHz</text>
              </svg>
            )}

            {selectedGuide.illustrationType === 'FIRST_AID_ILLUSTRATION' && (
              <svg viewBox="0 0 320 180" className="w-full h-full text-emerald-400">
                <circle cx="160" cy="80" r="35" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <ellipse cx="148" cy="75" rx="8" ry="5" fill="#021812" stroke="#34d399" strokeWidth="1" />
                <ellipse cx="172" cy="75" rx="8" ry="5" fill="#021812" stroke="#34d399" strokeWidth="1" />
                {/* Saline Stream from Inner Corner Outward */}
                <path d="M 160 50 Q 140 70 125 110" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="75" y="130" fill="#38bdf8" fontSize="8" fontFamily="monospace">Saline Stream: Drain Outward</text>
                <text x="60" y="145" fill="#f43f5e" fontSize="8" fontFamily="monospace">NEVER Rub Eyes with Hands</text>
              </svg>
            )}
          </div>

          <p className="text-[11px] text-emerald-300">
            Precision dimensions verified for maximal RF resonance and lowest standing wave ratio (SWR &lt; 1.3:1).
          </p>
        </div>
      )}

      {/* VIEW 3: C++ / PYTHON RADIO FIRMWARE CODE */}
      {activeTab === 'code' && selectedGuide.codeSnippet && (
        <div className="p-3 rounded-lg border border-emerald-800/60 bg-[#031d16] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>Autonomous LoRa BitChat Firmware (C++)</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-2.5 rounded bg-[#021812] border border-emerald-900/80 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
            {selectedGuide.codeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
