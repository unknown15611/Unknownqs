import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Users,
  Radio,
  Zap,
  Activity,
  X,
  FolderOpen,
  FileAudio,
  Repeat,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Upload
} from 'lucide-react';
import {
  SpeakerSyncSession,
  SpeakerNodeSim,
  INITIAL_SYNC_SESSION,
  createSpeakerHostSession,
  joinSpeakerSession,
  AudioSourceType,
  SLOGAN_PRESETS,
  SPEECH_PRESETS,
  StorageAudioFileMeta,
  SloganChantItem,
  PublicSpeechItem
} from '../core/speakerSync';
import { rssiToSignalPercentage } from '../core/securityAndLockdown';
import {
  isStoragePermissionGranted,
  updateStoragePermissionState
} from '../core/storagePermissions';

interface SpeakerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHandle: string;
  onLogEvent?: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const SpeakerSyncModal: React.FC<SpeakerSyncModalProps> = ({
  isOpen,
  onClose,
  currentHandle,
  onLogEvent
}) => {
  const [session, setSession] = useState<SpeakerSyncSession>(INITIAL_SYNC_SESSION);
  const [role, setRole] = useState<'HOST' | 'LISTENER'>('HOST');
  const [localVolume, setLocalVolume] = useState<number>(95);
  const [isLocalMuted, setIsLocalMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SLOGAN' | 'SPEECH' | 'STORAGE' | 'SIREN'>('SLOGAN');
  const [isLooped, setIsLooped] = useState<boolean>(true);
  const [customFileMeta, setCustomFileMeta] = useState<StorageAudioFileMeta | null>(null);

  // Web Audio Context & Elements
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
    }
    return () => {
      stopAllAudio();
    };
  }, [isOpen]);

  // Periodic simulated playback progress ticker
  useEffect(() => {
    if (session.isPlaying) {
      const timer = window.setInterval(() => {
        setSession(prev => {
          const nextPos = prev.playbackPositionSec + 1;
          if (nextPos >= prev.totalDurationSec) {
            if (isLooped) {
              return { ...prev, playbackPositionSec: 0 };
            }
            return { ...prev, isPlaying: false, playbackPositionSec: 0 };
          }
          return { ...prev, playbackPositionSec: nextPos };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session.isPlaying, isLooped]);

  const startChantRhythm = (bpm: number = 120) => {
    stopTone();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const intervalMs = (60 / bpm) * 1000;
      let step = 0;

      const beat = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = step % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(step % 2 === 0 ? 440 : 587.33, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.035, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.18);
        step = (step + 1) % 4;
      };

      beat();
      intervalRef.current = window.setInterval(beat, intervalMs);
    } catch {
      // AudioContext policy
    }
  };

  const startContinuousTone = (freq: number) => {
    stopTone();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
    } catch {
      // Ignore
    }
  };

  const stopTone = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch {
      // Ignore
    }
  };

  const stopAllAudio = () => {
    stopTone();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const playSelectedAudio = (sourceType: AudioSourceType) => {
    stopAllAudio();
    if (sourceType === 'SLOGAN_CHANT') {
      startChantRhythm(120);
    } else if (sourceType === 'PUBLIC_SPEECH') {
      startChantRhythm(90);
    } else if (sourceType === 'SIREN_ALERT') {
      startContinuousTone(1200);
    } else if (sourceType === 'STORAGE_FILE') {
      if (audioElementRef.current && customFileMeta?.objectUrl) {
        audioElementRef.current.src = customFileMeta.objectUrl;
        audioElementRef.current.loop = isLooped;
        audioElementRef.current.play().catch(() => {});
      } else {
        startChantRhythm(105);
      }
    }
  };

  if (!isOpen) return null;

  const handlePickStorageFile = () => {
    if (!isStoragePermissionGranted()) {
      updateStoragePermissionState('ALLOW');
      onLogEvent?.('StoragePermission', 'READ_MEDIA_AUDIO granted for speaker sync playback.', 'success');
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const meta: StorageAudioFileMeta = {
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'audio/unknown',
      durationSec: 180,
      isCustomUploaded: true,
      objectUrl
    };

    setCustomFileMeta(meta);
    setActiveTab('STORAGE');

    const newSession = createSpeakerHostSession(
      currentHandle,
      'STORAGE_FILE',
      file.name,
      meta
    );
    newSession.isLooped = isLooped;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('STORAGE_FILE');

    onLogEvent?.('SpeakerSync', `Loaded "${file.name}" for synchronized speaker broadcast.`, 'success');
  };

  const handleStartSlogan = (slogan: SloganChantItem) => {
    const newSession = createSpeakerHostSession(
      currentHandle,
      'SLOGAN_CHANT',
      slogan.title
    );
    newSession.isLooped = isLooped;
    newSession.totalDurationSec = slogan.durationSec;
    newSession.activeSloganId = slogan.id;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('SLOGAN_CHANT');
    onLogEvent?.('SpeakerSync', `Started slogan broadcast: ${slogan.title}`, 'success');
  };

  const handleStartSpeech = (speech: PublicSpeechItem) => {
    const newSession = createSpeakerHostSession(
      currentHandle,
      'PUBLIC_SPEECH',
      speech.title
    );
    newSession.isLooped = false;
    newSession.totalDurationSec = speech.durationSec;
    newSession.activeSpeechId = speech.id;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('PUBLIC_SPEECH');
    onLogEvent?.('SpeakerSync', `Started keynote speech: ${speech.title}`, 'success');
  };

  const handleTogglePlay = () => {
    const nextState = !session.isPlaying;
    setSession(prev => ({ ...prev, isPlaying: nextState }));
    if (nextState) {
      playSelectedAudio(session.sourceType);
    } else {
      stopAllAudio();
    }
  };

  const handleJoin = () => {
    const joined = joinSpeakerSession(session, currentHandle);
    setSession(joined);
    setRole('LISTENER');
    playSelectedAudio(session.sourceType);
    onLogEvent?.('SpeakerSync', `Joined synchronized host @${session.hostHandle}.`, 'success');
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 animate-in fade-in select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*"
        className="hidden"
      />
      <audio ref={audioElementRef} className="hidden" />

      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col p-3.5 space-y-2.5 max-h-[88vh]">
        {/* Sleek Compact Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-white">
            <Megaphone className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold">Speaker Sync</h3>
            <span className="text-[8px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              PTP &lt;3ms
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Host vs Listen Switch */}
            <div className="flex bg-slate-950 rounded-md p-0.5 border border-slate-800 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => setRole('HOST')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  role === 'HOST' ? 'bg-emerald-600 text-slate-950 font-extrabold' : 'text-slate-400'
                }`}
              >
                Host
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('LISTENER');
                  handleJoin();
                }}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  role === 'LISTENER' ? 'bg-emerald-600 text-slate-950 font-extrabold' : 'text-slate-400'
                }`}
              >
                Listen
              </button>
            </div>

            <button
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Clean Source Selector Pills */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold text-center">
          {[
            { id: 'SLOGAN', label: '📢 Slogans' },
            { id: 'SPEECH', label: '🎙️ Speeches' },
            { id: 'STORAGE', label: '📂 Storage' },
            { id: 'SIREN', label: '🚨 Siren' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`py-1 rounded-md transition-all ${
                activeTab === t.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Minimalist Content List */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
          {activeTab === 'SLOGAN' && (
            SLOGAN_PRESETS.map(s => {
              const isSelected = session.sourceType === 'SLOGAN_CHANT' && session.activeSloganId === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="truncate max-w-[210px]">
                    <span className="font-bold text-white text-[11px] block truncate">{s.title}</span>
                    <span className="text-[9.5px] text-emerald-400/90 font-urdu block">{s.urduTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartSlogan(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                      isSelected && session.isPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isSelected && session.isPlaying ? <Square className="h-2.5 w-2.5 fill-slate-950" /> : <Play className="h-2.5 w-2.5 fill-slate-950" />}
                    <span>{isSelected && session.isPlaying ? 'Stop' : 'Sync'}</span>
                  </button>
                </div>
              );
            })
          )}

          {activeTab === 'SPEECH' && (
            SPEECH_PRESETS.map(sp => {
              const isSelected = session.sourceType === 'PUBLIC_SPEECH' && session.activeSpeechId === sp.id;
              return (
                <div
                  key={sp.id}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="truncate max-w-[210px]">
                    <span className="font-bold text-white text-[11px] block truncate">{sp.speaker}</span>
                    <span className="text-[9.5px] text-slate-400 truncate block">{sp.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartSpeech(sp)}
                    className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                      isSelected && session.isPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isSelected && session.isPlaying ? <Square className="h-2.5 w-2.5 fill-slate-950" /> : <Play className="h-2.5 w-2.5 fill-slate-950" />}
                    <span>{isSelected && session.isPlaying ? 'Stop' : 'Sync'}</span>
                  </button>
                </div>
              );
            })
          )}

          {activeTab === 'STORAGE' && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-center">
              <button
                type="button"
                onClick={handlePickStorageFile}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Select Any Audio / Video File</span>
              </button>
              {customFileMeta && (
                <div className="flex items-center justify-between text-[10px] text-emerald-300 font-mono px-1">
                  <span className="truncate max-w-[180px]">{customFileMeta.fileName}</span>
                  <span>{(customFileMeta.fileSizeBytes / (1024 * 1024)).toFixed(1)}MB</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'SIREN' && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-300 block">Emergency Siren</span>
                <span className="text-[9.5px] text-slate-400">1.2kHz Acoustic Alarm</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSession = createSpeakerHostSession(currentHandle, 'SIREN_ALERT');
                  setSession(newSession);
                  setRole('HOST');
                  playSelectedAudio('SIREN_ALERT');
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Trigger Siren
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Unified Player Bar */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="truncate max-w-[200px]">
              <span className="text-[9px] text-slate-400 font-mono block">NOW PLAYING:</span>
              <span className="font-bold text-white text-[11px] truncate block">{session.sourceTitle}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !isLooped;
                  setIsLooped(next);
                  setSession(prev => ({ ...prev, isLooped: next }));
                }}
                className={`p-1 rounded text-[9px] font-mono border transition-all ${
                  isLooped
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Continuous loop"
              >
                <Repeat className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow ${
                  session.isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-slate-950'
                }`}
              >
                {session.isPlaying ? <Square className="h-3 w-3 fill-slate-950" /> : <Play className="h-3 w-3 fill-slate-950" />}
                <span>{session.isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="space-y-0.5">
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (session.playbackPositionSec / (session.totalDurationSec || 1)) * 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-[8.5px] font-mono text-slate-400">
              <span>{formatSecs(session.playbackPositionSec)}</span>
              <span>{formatSecs(session.totalDurationSec)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setIsLocalMuted(!isLocalMuted)}
              className="p-1 rounded bg-slate-900 text-slate-300 hover:text-white"
            >
              {isLocalMuted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isLocalMuted ? 0 : localVolume}
              onChange={(e) => {
                setLocalVolume(Number(e.target.value));
                setIsLocalMuted(false);
              }}
              className="flex-1 accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-[9px] font-mono text-slate-300 w-7 text-right">
              {isLocalMuted ? '0%' : `${localVolume}%`}
            </span>
          </div>
        </div>

        {/* Compact Connected Peers Strip */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>SYNCED SPEAKERS ({session.connectedNodes.length}):</span>
            <span className="text-emerald-400">Drift &lt; 2ms</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {session.connectedNodes.map(node => (
              <div
                key={node.id}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-1 shrink-0 text-[9.5px] font-mono"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">@{node.handle}</span>
                <span className="text-emerald-400 text-[8px]">{node.driftMs >= 0 ? `+${node.driftMs.toFixed(1)}ms` : `${node.driftMs.toFixed(1)}ms`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <span>Opus Multicast P2P</span>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
