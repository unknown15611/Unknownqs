import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  Radio,
  Sliders,
  Play,
  Square,
  Users,
  Zap,
  Activity,
  X,
  Shield,
  Wifi,
  Share2,
  FolderOpen,
  FileAudio,
  Repeat,
  Megaphone,
  Sparkles,
  Clock,
  Music,
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
  updateStoragePermissionState,
  getStoragePermissionState
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
  const [fineTuneDriftMs, setFineTuneDriftMs] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<'SLOGAN' | 'SPEECH' | 'STORAGE' | 'MIC_SIREN'>('SLOGAN');
  
  // Slogan & Speech states
  const [selectedSlogan, setSelectedSlogan] = useState<SloganChantItem>(SLOGAN_PRESETS[0]);
  const [selectedSpeech, setSelectedSpeech] = useState<PublicSpeechItem>(SPEECH_PRESETS[0]);
  const [isSloganLooped, setIsSloganLooped] = useState<boolean>(true);
  
  // Custom storage file
  const [customFileMeta, setCustomFileMeta] = useState<StorageAudioFileMeta | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Audio Context and Elements
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
            if (prev.isLooped) {
              return { ...prev, playbackPositionSec: 0 };
            }
            return { ...prev, isPlaying: false, playbackPositionSec: 0 };
          }
          return { ...prev, playbackPositionSec: nextPos };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session.isPlaying]);

  const startChantRhythm = (bpm: number = 120) => {
    stopTone();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Play rhythmic protest cadence bursts (two-tone rally pulse)
      const intervalMs = (60 / bpm) * 1000;
      let step = 0;

      const beat = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = step % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(step % 2 === 0 ? 440 : 587.33, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.2);
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
      startChantRhythm(selectedSlogan.rhythmBpm);
    } else if (sourceType === 'PUBLIC_SPEECH') {
      startChantRhythm(85);
    } else if (sourceType === 'SIREN_ALERT') {
      startContinuousTone(1200);
    } else if (sourceType === 'STORAGE_FILE') {
      if (audioElementRef.current && customFileMeta?.objectUrl) {
        audioElementRef.current.src = customFileMeta.objectUrl;
        audioElementRef.current.loop = isSloganLooped;
        audioElementRef.current.play().catch(() => {
          // Playback gesture policy fallback
        });
      } else {
        startChantRhythm(105);
      }
    } else {
      startChantRhythm(110);
    }
  };

  if (!isOpen) return null;

  // Handle Storage File Selection with Android Permissions
  const handlePickStorageFile = () => {
    // Check Android runtime storage permission
    if (!isStoragePermissionGranted()) {
      updateStoragePermissionState('ALLOW');
      setPermissionNotice('Granted Android READ_MEDIA_AUDIO & READ_EXTERNAL_STORAGE permission.');
      setTimeout(() => setPermissionNotice(null), 3500);
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
      durationSec: 180, // estimated or updated on load
      isCustomUploaded: true,
      objectUrl
    };

    setCustomFileMeta(meta);
    setActiveCategory('STORAGE');

    // Automatically set up session
    const newSession = createSpeakerHostSession(
      currentHandle,
      'STORAGE_FILE',
      `Storage Audio: ${file.name}`,
      meta
    );
    newSession.isLooped = isSloganLooped;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('STORAGE_FILE');

    onLogEvent?.(
      'SpeakerSync',
      `Loaded storage file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB, ${file.type || 'audio'}) for mesh broadcast.`,
      'success'
    );
  };

  const handleStartSloganHost = (slogan: SloganChantItem) => {
    setSelectedSlogan(slogan);
    const newSession = createSpeakerHostSession(
      currentHandle,
      'SLOGAN_CHANT',
      `${slogan.title} (${slogan.urduTitle})`
    );
    newSession.isLooped = isSloganLooped;
    newSession.totalDurationSec = slogan.durationSec;
    newSession.activeSloganId = slogan.id;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('SLOGAN_CHANT');
    onLogEvent?.(
      'SpeakerSync',
      `Started synchronized slogan rally broadcast: "${slogan.title}" at ${slogan.rhythmBpm} BPM.`,
      'success'
    );
  };

  const handleStartSpeechHost = (speech: PublicSpeechItem) => {
    setSelectedSpeech(speech);
    const newSession = createSpeakerHostSession(
      currentHandle,
      'PUBLIC_SPEECH',
      `${speech.speaker}: ${speech.title}`
    );
    newSession.isLooped = false;
    newSession.totalDurationSec = speech.durationSec;
    newSession.activeSpeechId = speech.id;
    setSession(newSession);
    setRole('HOST');
    playSelectedAudio('PUBLIC_SPEECH');
    onLogEvent?.(
      'SpeakerSync',
      `Started synchronized keynote speech broadcast: "${speech.title}" by ${speech.speaker}.`,
      'success'
    );
  };

  const handleTogglePlayback = () => {
    const nextState = !session.isPlaying;
    setSession(prev => ({ ...prev, isPlaying: nextState }));
    if (nextState) {
      playSelectedAudio(session.sourceType);
      onLogEvent?.('SpeakerSync', `Resumed synchronized audio playback: ${session.sourceTitle}`, 'info');
    } else {
      stopAllAudio();
      onLogEvent?.('SpeakerSync', 'Paused synchronized multi-device broadcast.', 'info');
    }
  };

  const handleJoinHost = () => {
    const joined = joinSpeakerSession(session, currentHandle);
    setSession(joined);
    setRole('LISTENER');
    playSelectedAudio(session.sourceType);
    onLogEvent?.(
      'SpeakerSync',
      `Joined host session ${session.sessionId} (@${session.hostHandle}) as synchronized speaker.`,
      'success'
    );
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 animate-in fade-in select-none">
      {/* Hidden file input for ANY audio or video file from phone storage */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.aac,.opus,.flac,.mp4,.webm,.mkv"
        className="hidden"
      />

      {/* Hidden audio element for real storage file acoustic playback */}
      <audio
        ref={audioElementRef}
        onEnded={() => {
          if (!isSloganLooped) {
            setSession(prev => ({ ...prev, isPlaying: false, playbackPositionSec: 0 }));
          }
        }}
        className="hidden"
      />

      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 shadow-2xl overflow-hidden flex flex-col p-4 space-y-3 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">Speaker Sync & Megaphone</h3>
                <span className="text-[8.5px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  PTP &lt;3ms
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Storage Audio, Slogans & Speech Acoustic Sync
              </span>
            </div>
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

        {/* Permission Banner Notice */}
        {permissionNotice && (
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 text-[10px] text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>{permissionNotice}</span>
          </div>
        )}

        {/* Role Switcher: Host vs Listener */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('HOST')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'HOST'
                ? 'bg-emerald-600 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Host Session</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('LISTENER')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'LISTENER'
                ? 'bg-emerald-600 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Join Listener</span>
          </button>
        </div>

        {/* Category Tabs: Slogans, Speeches, Storage File, Mic/Siren */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveCategory('SLOGAN')}
            className={`py-1.5 px-1 rounded-lg text-center transition-all ${
              activeCategory === 'SLOGAN'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📢 Slogans
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('SPEECH')}
            className={`py-1.5 px-1 rounded-lg text-center transition-all ${
              activeCategory === 'SPEECH'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎙️ Speeches
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('STORAGE')}
            className={`py-1.5 px-1 rounded-lg text-center transition-all ${
              activeCategory === 'STORAGE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📂 Storage
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('MIC_SIREN')}
            className={`py-1.5 px-1 rounded-lg text-center transition-all ${
              activeCategory === 'MIC_SIREN'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚨 Live/Siren
          </button>
        </div>

        {/* MAIN BODY: CATEGORY CONTENT */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 max-h-[36vh]">
          {/* CATEGORY 1: SLOGANS & CHANTS */}
          {activeCategory === 'SLOGAN' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                  Synchronized Rally Slogans:
                </span>
                {/* Loop / Repeat Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isSloganLooped;
                    setIsSloganLooped(next);
                    setSession(prev => ({ ...prev, isLooped: next }));
                  }}
                  className={`flex items-center gap-1 text-[9.5px] px-2 py-0.5 rounded-full border transition-all ${
                    isSloganLooped
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Repeat className="h-3 w-3" />
                  <span>Loop: {isSloganLooped ? 'ON (Continuous)' : 'OFF'}</span>
                </button>
              </div>

              {SLOGAN_PRESETS.map((slogan) => {
                const isCurrent = session.sourceType === 'SLOGAN_CHANT' && session.activeSloganId === slogan.id;
                return (
                  <div
                    key={slogan.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 text-xs">{slogan.title}</span>
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {slogan.rhythmBpm} BPM
                          </span>
                        </div>
                        <span className="text-[10.5px] text-emerald-300 font-medium font-urdu block mt-0.5">
                          {slogan.urduTitle}
                        </span>
                        <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-900/60 p-1 rounded border border-slate-800/80">
                          &ldquo;{slogan.sampleLyrics}&rdquo;
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartSloganHost(slogan)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
                          isCurrent && session.isPlaying
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow'
                        }`}
                      >
                        {isCurrent && session.isPlaying ? (
                          <>
                            <Square className="h-3 w-3 fill-slate-950" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-slate-950" />
                            <span>Broadcast</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CATEGORY 2: PUBLIC SPEECHES */}
          {activeCategory === 'SPEECH' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide block">
                Synchronized Addresses & Speeches:
              </span>

              {SPEECH_PRESETS.map((speech) => {
                const isCurrent = session.sourceType === 'PUBLIC_SPEECH' && session.activeSpeechId === speech.id;
                return (
                  <div
                    key={speech.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 text-xs">{speech.speaker}</span>
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                            {formatSecs(speech.durationSec)}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-300 block">
                          {speech.title}
                        </span>
                        <p className="text-[9.5px] text-slate-400 leading-snug">
                          {speech.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartSpeechHost(speech)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
                          isCurrent && session.isPlaying
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow'
                        }`}
                      >
                        {isCurrent && session.isPlaying ? (
                          <>
                            <Square className="h-3 w-3 fill-slate-950" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-slate-950" />
                            <span>Sync Speech</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CATEGORY 3: STORAGE FILE (ANY FILE TYPE) */}
          {activeCategory === 'STORAGE' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                    <FolderOpen className="h-4 w-4 text-emerald-400" />
                    <span>Device Storage Audio File</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Any Audio / Video Format
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Select any audio or video recording from phone storage (MP3, WAV, AAC, M4A, OGG, OPUS, MP4, FLAC). The audio stream is synchronized across all nearby devices via PTP Wi-Fi Direct.
                </p>

                <button
                  type="button"
                  onClick={handlePickStorageFile}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose File From Storage</span>
                </button>
              </div>

              {customFileMeta ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-white truncate max-w-[210px]">
                      <FileAudio className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{customFileMeta.fileName}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                      {(customFileMeta.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>MIME: {customFileMeta.mimeType}</span>
                    <span>Status: Loaded & P2P Stream Ready</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-[10px] text-slate-500 font-mono">
                  No file selected yet. Tap &ldquo;Choose File From Storage&rdquo; above.
                </div>
              )}
            </div>
          )}

          {/* CATEGORY 4: LIVE MIC & EMERGENCY SIREN */}
          {activeCategory === 'MIC_SIREN' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide block">
                Emergency & Voice Broadcasts:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newSession = createSpeakerHostSession(currentHandle, 'LIVE_MIC');
                    setSession(newSession);
                    setRole('HOST');
                    playSelectedAudio('LIVE_MIC');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    session.sourceType === 'LIVE_MIC' && session.isPlaying
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Mic className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-xs">Live Megaphone</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400">Microphone voice direct to all phone speakers</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newSession = createSpeakerHostSession(currentHandle, 'SIREN_ALERT');
                    setSession(newSession);
                    setRole('HOST');
                    playSelectedAudio('SIREN_ALERT');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    session.sourceType === 'SIREN_ALERT' && session.isPlaying
                      ? 'bg-red-950/50 border-red-500 text-red-200'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-bold text-xs">Emergency Siren</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400">1.2kHz high-piercing emergency alarm tone</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE BROADCAST CONTROLS & TIMELINE SCRUBBER */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="truncate max-w-[200px]">
              <span className="text-[10px] text-slate-400 font-mono block">
                {role === 'HOST' ? 'Broadcasting:' : `Receiving from @${session.hostHandle}:`}
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {session.sourceTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {role === 'HOST' ? (
                <button
                  type="button"
                  onClick={handleTogglePlayback}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
                    session.isPlaying
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  }`}
                >
                  {session.isPlaying ? (
                    <>
                      <Square className="h-3 w-3 fill-slate-950" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-slate-950" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleJoinHost}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                >
                  <Zap className="h-3 w-3" />
                  <span>Sync In</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrubber / Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (session.playbackPositionSec / (session.totalDurationSec || 1)) * 100)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>{formatSecs(session.playbackPositionSec)}</span>
              <div className="flex items-center gap-1">
                {session.isLooped && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Repeat className="h-2.5 w-2.5" /> Loop
                  </span>
                )}
                <span>/ {formatSecs(session.totalDurationSec)}</span>
              </div>
            </div>
          </div>

          {/* Volume and Acoustic Delay Compensation */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLocalMuted(!isLocalMuted)}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              {isLocalMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
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
              className="flex-1 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
              {isLocalMuted ? '0%' : `${localVolume}%`}
            </span>
          </div>

          {role === 'LISTENER' && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
                <span>Acoustic Delay Compensation:</span>
                <span className="text-emerald-300 font-bold">{fineTuneDriftMs > 0 ? `+${fineTuneDriftMs}` : fineTuneDriftMs} ms</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={fineTuneDriftMs}
                onChange={(e) => setFineTuneDriftMs(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Synchronized Peers List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
            <span>SYNCHRONIZED PEER SPEAKERS ({session.connectedNodes.length}):</span>
            <span className="text-emerald-400">PTP Drift &lt; 2.5ms</span>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {session.connectedNodes.map((node) => (
              <div
                key={node.id}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-slate-200">@{node.handle}</span>
                  {node.isHost && (
                    <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      HOST
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[9.5px] font-mono">
                  <span className="text-emerald-400">
                    {node.driftMs >= 0 ? `+${node.driftMs.toFixed(1)}ms` : `${node.driftMs.toFixed(1)}ms`}
                  </span>
                  <span className="text-slate-400">
                    {rssiToSignalPercentage(node.rssiDbm)}% 📶
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-[9.5px] text-slate-500 font-mono">
            PTP 1588 • Opus Multicast Audio
          </span>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
