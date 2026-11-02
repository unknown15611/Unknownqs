import React, { useState } from 'react';
import {
  Smartphone,
  FileCode,
  Layers,
  Terminal,
  Download,
  ShieldAlert,
  Radio,
  Github,
  BookOpen,
  CheckCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureDoc } from './components/ArchitectureDoc';
import { LiveConsole, LogEntry } from './components/LiveConsole';
import { CODE_FILES } from './data/androidCodebase';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<'simulator' | 'code' | 'architecture' | 'logs'>('simulator');
  const [selectedFileId, setSelectedFileId] = useState<string>('mesh-connectivity-manager');

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '12:30:01',
      module: 'IdentityManager',
      message: 'Hardware-backed AndroidKeyStore master key initialized with AES-256-GCM scheme.',
      level: 'success',
    },
    {
      id: 'log-2',
      timestamp: '12:30:02',
      module: 'MeshConnectivityManager',
      message: 'Starting hybrid radio transports: Wi-Fi Aware, Wi-Fi Direct, BLE Mesh, and Local Router AP socket.',
      level: 'info',
    },
    {
      id: 'log-3',
      timestamp: '12:30:03',
      module: 'BatteryDutyCycleManager',
      message: 'Duty profile set to BALANCED (10s scan / 50s sleep, ~16% on-time).',
      level: 'info',
    },
    {
      id: 'log-4',
      timestamp: '12:30:04',
      module: 'AdMobHybridManager',
      message: 'Off-grid mesh mode detected: Ad spaces completely collapsed with 0% battery drain.',
      level: 'info',
    },
    {
      id: 'log-5',
      timestamp: '12:30:05',
      module: 'DeveloperAuthorityManager',
      message: 'Anti-tamper check passed: Runtime APK signing certificate matches release SHA-256 fingerprint.',
      level: 'success',
    },
  ]);

  const addLog = (module: string, message: string, level: LogEntry['level'] = 'info') => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      module,
      message,
      level,
    };
    // Defer state update so it never executes synchronously during another component's render cycle
    queueMicrotask(() => {
      setLogs(prev => [newEntry, ...prev.slice(0, 150)]);
    });
  };

  const handleSelectCodeFileFromPhone = (fileId: string) => {
    setSelectedFileId(fileId);
    setActiveMainTab('code');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Main Navigation Header - Ultra-Slim */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-sm shadow-emerald-500/20">
              <Radio className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">Qaidi Share</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Compose
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline font-mono">
                • Off-Grid Mesh
              </span>
            </div>
          </div>

          {/* Main Navigation Tabs - Ultra-Slim */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-0.5 border border-slate-800">
            <button
              onClick={() => setActiveMainTab('simulator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeMainTab === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setActiveMainTab('code')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeMainTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Kotlin Code</span>
            </button>

            <button
              onClick={() => setActiveMainTab('architecture')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeMainTab === 'architecture'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Architecture</span>
            </button>

            <button
              onClick={() => setActiveMainTab('logs')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeMainTab === 'logs'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Logcat ({logs.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col">
        {activeMainTab === 'simulator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Phone Simulator Frame (5 cols on large screens) */}
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator
                onLogEvent={addLog}
                onSelectCodeFile={handleSelectCodeFileFromPhone}
              />
            </div>

            {/* Accompanying Live Inspector & Class Highlights (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Highlight Banner */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> ARCHITECTURAL SPECS & KEY HIGHLIGHTS
                  </span>
                  <button
                    onClick={() => setActiveMainTab('code')}
                    className="text-xs text-emerald-400 hover:underline font-mono"
                  >
                    View All 11+ Kotlin Classes →
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interact with the live Android emulator on the left: test circular radar scanning, Walkie-Talkie Push-to-Talk audio, DTN Store-and-Forward packet routing, 12-word BIP39 seed generation, emergency panic zeroization, and the Hybrid AdMob offline collapse feature.
                </p>
              </div>

              {/* Quick Class Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handleSelectCodeFileFromPhone('mesh-connectivity-manager')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">MeshConnectivityManager.kt</span>
                    <Radio className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Intelligent transport selection (Wi-Fi Direct, Aware, BLE, Routers) & battery duty cycling.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectCodeFileFromPhone('identity-manager')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">IdentityManager.kt</span>
                    <CheckCircle className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    12-word BIP-39 recovery seed, Curve25519 & Ed25519 key derivation, and AndroidKeyStore.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectCodeFileFromPhone('developer-authority-manager')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">DeveloperAuthorityManager.kt</span>
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Cryptographic master key announcement signing, biometric authentication & APK anti-tamper.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectCodeFileFromPhone('admob-hybrid-manager')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">AdMobHybridManager.kt</span>
                    <Smartphone className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Online monetization with zero battery drain and silent view collapse in off-grid mesh.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectCodeFileFromPhone('github-public-sync-manager')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400">GitHubPublicIndexSyncManager.kt</span>
                    <Github className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Public handle registry & community broadcast boards with strict air-gap boundary.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectCodeFileFromPhone('crypto-engine')}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">MeshCryptoEngine.kt</span>
                    <Terminal className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Signal-protocol style Double Ratchet, Curve25519 ECDH + AES-256-GCM & zero-knowledge onion hops.
                  </p>
                </div>
              </div>

              {/* Embedded Live Console Stream */}
              <div className="h-64">
                <LiveConsole logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          </div>
        ) : activeMainTab === 'code' ? (
          <div className="h-[780px]">
            <CodeExplorer
              selectedFileId={selectedFileId}
              onSelectFile={id => setSelectedFileId(id)}
            />
          </div>
        ) : activeMainTab === 'architecture' ? (
          <div className="h-full overflow-y-auto">
            <ArchitectureDoc onSelectFile={handleSelectCodeFileFromPhone} />
          </div>
        ) : (
          <div className="h-[780px]">
            <LiveConsole logs={logs} onClear={() => setLogs([])} />
          </div>
        )}
      </main>
    </div>
  );
}
