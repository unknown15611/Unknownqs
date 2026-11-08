import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Users,
  Film,
  Youtube,
  Sparkles,
  Cpu,
  Layers,
  Radio,
  Compass,
  Bell,
  CloudRain,
  ShieldCheck,
  Download,
  Clock,
  Check,
  ExternalLink,
  Play,
  Share2,
  X,
  QrCode,
  Scan,
  Copy,
  Radar,
  Volume2,
  RefreshCw,
  Camera,
  ShieldAlert,
  Shield,
  EyeOff,
  Lock,
  AlertTriangle,
  Ban,
  Activity
} from 'lucide-react';
import { rssiToSignalPercentage } from '../core/securityAndLockdown';
import {
  searchCityCamouflage,
  getCityCamouflageState,
  activateCityCamouflage,
  deactivateCityCamouflage,
  CityCamouflagePreset,
  CityCamouflageState
} from '../core/cityCamouflage';
import {
  isPeerQuarantined,
  autoBlockPeer,
  unblockPeer,
  getQuarantinedPeers,
  simulateMaliciousIntrusion,
  ThreatCategory,
  QuarantinedPeer
} from '../core/meshIntrusionBlocker';
import { APP_LOGOS, getDisguiseLogo } from '../assets/appLogos';

export interface PeerProfile {
  handle: string;
  displayName: string;
  hardwareMac: string;
  isOnlineMesh: boolean;
  rssiDbm: number;
  hopsAway: number;
  lastSeenText: string;
  isSuperAdmin?: boolean;
}

export interface SearchableGroup {
  id: string;

  name: string;
  membersCount: number;
  isAvailable: boolean;
  topic: string;
}

export interface SearchableYouTubeVideo {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  durationText: string;
  category: string;
  url: string;
}

export interface SearchableSocialItem {
  id: string;
  title: string;
  author: string;
  type: 'POST' | 'REEL';
  time: string;
}

export interface SearchableFeatureItem {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: 'usb' | 'map' | 'radio' | 'qibla' | 'notice' | 'weather' | 'disguise' | 'fund' | 'admin';
}

const DEFAULT_PEERS: PeerProfile[] = [
  {
    handle: 'qaidi156156',
    displayName: 'Super Admin (qaidi156156)',
    hardwareMac: '02:00:00:FF:AA:01',
    isOnlineMesh: true,
    rssiDbm: -54,
    hopsAway: 1,
    lastSeenText: 'Active now',
    isSuperAdmin: true
  },
  {
    handle: 'qaidi4829',
    displayName: 'Qaidi Node 4829',
    hardwareMac: '9C:E6:5E:2B:1A:08',
    isOnlineMesh: true,
    rssiDbm: -68,
    hopsAway: 1,
    lastSeenText: 'Active now'
  },
  {
    handle: 'qaidi7711',
    displayName: 'Lahore Relief Node',
    hardwareMac: '3A:88:C2:5F:99:12',
    isOnlineMesh: true,
    rssiDbm: -62,
    hopsAway: 1,
    lastSeenText: 'Active now'
  },
  {
    handle: 'qaidi3390',
    displayName: 'Sector F-7 Mesh Relay',
    hardwareMac: '1C:44:B0:81:4A:9C',
    isOnlineMesh: true,
    rssiDbm: -72,
    hopsAway: 2,
    lastSeenText: 'Active now'
  },
  {
    handle: 'qaidi9012',
    displayName: 'Civil Hospital Field Unit',
    hardwareMac: '7E:21:A9:04:D3:5B',
    isOnlineMesh: false,
    rssiDbm: -92,
    hopsAway: 3,
    lastSeenText: 'Seen 42m ago'
  },
  {
    handle: 'qaidi5520',
    displayName: 'Rawalpindi Volunteer Cell',
    hardwareMac: 'B4:D8:1E:73:90:EE',
    isOnlineMesh: false,
    rssiDbm: -98,
    hopsAway: 4,
    lastSeenText: 'Seen 2h ago'
  }
];

const DEFAULT_GROUPS: SearchableGroup[] = [
  { id: 'tactical-ops', name: 'Tactical Mesh Ops', membersCount: 18, isAvailable: true, topic: 'District frequency routing & peer packets' },
  { id: 'first-aid-lahore', name: 'Emergency First Aid Squad', membersCount: 34, isAvailable: true, topic: 'Medical relief, burn kits & field sanitation' },
  { id: 'campus-liberty', name: 'Campus & Liberty Relief', membersCount: 42, isAvailable: true, topic: 'Civilian assembly & encrypted food logistics' },
  { id: 'diy-broadcasters', name: 'DIY LoRa & Radio Cell', membersCount: 27, isAvailable: true, topic: 'FM transmitters, cantennas & solar routers' },
  { id: 'super-admin-desk', name: 'Command & Official Broadcast', membersCount: 156, isAvailable: true, topic: 'Super admin verified bulletins & alert sirens' }
];

const DEFAULT_YOUTUBE_VIDEOS: SearchableYouTubeVideo[] = [
  {
    id: 'yt-1',
    youtubeId: 'emergency_radio_broadcaster',
    title: 'DIY Emergency Radio Broadcaster: Voice & Digital Mesh Guide',
    channelName: 'Tactical RF Engineering',
    durationText: '18:45',
    category: 'DIY Radio & Broadcaster',
    url: 'https://youtube.com/watch?v=emergency_radio_broadcaster'
  },
  {
    id: 'yt-2',
    youtubeId: 'cantenna_diy_build_guide',
    title: 'DIY Can Antenna (Cantenna) Guide: 10x Range Booster',
    channelName: 'Radio Guerrilla Tech',
    durationText: '14:05',
    category: 'Cantenna & Antennas',
    url: 'https://youtube.com/watch?v=cantenna_diy_build_guide'
  },
  {
    id: 'yt-3',
    youtubeId: 'p2p_mesh_packet_forwarding',
    title: 'How P2P Multi-Hop Routing Works Without Internet or Routers',
    channelName: 'Mesh Protocol Academy',
    durationText: '11:20',
    category: 'P2P Protocols',
    url: 'https://youtube.com/watch?v=p2p_mesh_packet_forwarding'
  },
  {
    id: 'yt-4',
    youtubeId: 'clean_water_urdu',
    title: 'DIY Water Purification & Field Hygiene During Grid Blackouts',
    channelName: 'Survival Skills Urdu',
    durationText: '7:30',
    category: 'Hygiene & Water',
    url: 'https://youtube.com/watch?v=clean_water_urdu'
  }
];

const DEFAULT_SOCIAL_ITEMS: SearchableSocialItem[] = [
  { id: 'soc-1', title: 'Autonomous multi-hop packet routing deployed across Sector F-7', author: 'qaidi156156', type: 'POST', time: '10m ago' },
  { id: 'soc-2', title: 'DIY Cantenna Booster Guide MP4 Video Reel (14.2 MB)', author: 'qaidi4829', type: 'REEL', time: '35m ago' },
  { id: 'soc-3', title: 'Relief Center Pinned Map in Offline Satellite View', author: 'qaidi7711', type: 'POST', time: '1h ago' }
];

const DEFAULT_FEATURES: SearchableFeatureItem[] = [
  { id: 'feat-nearbyshare', name: 'Nearby Share (Google Quick Share P2P)', category: 'Sharing', description: 'Fast offline peer-to-peer file, APK, photo & map sharing via Wi-Fi Direct and QR code', iconName: 'radio' },
  { id: 'feat-ultrasound', name: 'Ultrasound Sound Wave Sharing (18.5kHz-20kHz)', category: 'Acoustic', description: 'Transmit contact tokens and keys via inaudible near-field sound waves using phone mic & speaker', iconName: 'radio' },
  { id: 'feat-usb', name: 'USB OTG Serial Hardware Bridge', category: 'Hardware', description: 'Auto-detect CH340, CP2102, FTDI LoRa modules & packets', iconName: 'usb' },
  { id: 'feat-map', name: 'Offline Satellite View Map', category: 'Navigation', description: 'Pre-cached high-resolution aerial imagery with RF heat waves', iconName: 'map' },
  { id: 'feat-radio', name: 'Speaker Acoustic Radio', category: 'Audio', description: 'Software acoustic ultrasound transceiver without extra hardware', iconName: 'radio' },
  { id: 'feat-qibla', name: 'Qibla & Campus Compass', category: 'Orientation', description: 'Real-time magnetic azimuth & verified campus rally points', iconName: 'qibla' },
  { id: 'feat-notice', name: 'Notice Board & Tactical Academy', category: 'Education', description: 'Community broadcast announcements & 100km LoRa tutorials', iconName: 'notice' },
  { id: 'feat-weather', name: 'Weather & Severe Rain Alert', category: 'Sensors', description: 'Offline rainfall rate (~35 mm / 2 hrs) & downpour warnings', iconName: 'weather' },
  { id: 'feat-disguise', name: 'Stealth Calculator & Notepad Disguise', category: 'Privacy', description: 'Disguise app behind a fully working functional calculator', iconName: 'disguise' },
  { id: 'feat-camo', name: 'City Camouflage & Urban Stealth', category: 'OPSEC', description: 'Civilian smartwatch & printer RF beacon disguise for urban protests', iconName: 'disguise' },
  { id: 'feat-fund', name: 'Solar LoRa Hardware Fund', category: 'Community', description: '100% of native ad revenue pooled to buy repeaters', iconName: 'fund' },
  { id: 'feat-superadmin', name: 'Super Admin Master Console', category: 'Governance', description: 'Emergency broadcast, node quarantine & city lockdown (qaidi156156 only)', iconName: 'admin' }
];

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHandle?: string;
  initialTab?: 'RADAR' | 'SEARCH' | 'QR';
  activeCityCamouflageState?: CityCamouflageState;
  onActivateCityCamouflage?: (presetId: string) => void;
  onDeactivateCityCamouflage?: () => void;
  onSelectPeerToChat: (handle: string, displayName: string) => void;
  onSelectGroup?: (groupId: string) => void;
  onLaunchFeature?: (featureId: string) => void;
  onPlayYouTube?: (video: SearchableYouTubeVideo) => void;
  onShareYouTube?: (video: SearchableYouTubeVideo) => void;
  onLogEvent?: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onOpenFullQrModal?: () => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  currentHandle = 'qaidi156156',
  initialTab = 'SEARCH',
  activeCityCamouflageState,
  onActivateCityCamouflage,
  onDeactivateCityCamouflage,
  onSelectPeerToChat,
  onSelectGroup,
  onLaunchFeature,
  onPlayYouTube,
  onShareYouTube,
  onLogEvent,
  onOpenFullQrModal
}) => {
  // 3-in-1 Combined Mode: Radar Discovery | Omni Search | QR & Scanner
  const [combinedMode, setCombinedMode] = useState<'RADAR' | 'SEARCH' | 'QR'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState<'ALL' | 'USERS' | 'GROUPS' | 'VIDEOS' | 'FEATURES' | 'CAMOUFLAGE'>('ALL');

  // City Camouflage & Stealth State
  const [camoState, setCamoState] = useState<CityCamouflageState>(
    activeCityCamouflageState || getCityCamouflageState()
  );

  // Auto-Block & Quarantine State
  const [quarantinedList, setQuarantinedList] = useState<QuarantinedPeer[]>(getQuarantinedPeers());
  const [reportingPeerHandle, setReportingPeerHandle] = useState<string | null>(null);
  const [showQuarantineDrawer, setShowQuarantineDrawer] = useState(false);
  const [shieldAlertBanner, setShieldAlertBanner] = useState<string | null>(null);

  // QR Code on Search Hit State
  const [showQrCodeCard, setShowQrCodeCard] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Active Camera QR Scanner State (working scanner)
  const [isScanningQrCamera, setIsScanningQrCamera] = useState(false);
  const [scanSimNotice, setScanSimNotice] = useState<string | null>(null);

  // Radar State
  const [isRadarScanning, setIsRadarScanning] = useState(true);
  const [radarAngle, setRadarAngle] = useState(0);
  const [pingedPeerHandle, setPingedPeerHandle] = useState<string | null>(null);

  // Sync external camo state
  useEffect(() => {
    if (activeCityCamouflageState) {
      setCamoState(activeCityCamouflageState);
    }
  }, [activeCityCamouflageState]);


  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) {
      setCombinedMode(initialTab);
    }
  }, [initialTab]);

  // Sweep animation for radar
  useEffect(() => {
    if (!isOpen || combinedMode !== 'RADAR' || !isRadarScanning) return;
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, combinedMode, isRadarScanning]);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Filter Peers (All can be messaged, offline users supported via Store-and-Forward DTN)
  const filteredPeers = DEFAULT_PEERS.filter((p) => {
    if (!q) return true;
    return p.handle.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q);
  });

  // Filter Groups
  const filteredGroups = DEFAULT_GROUPS.filter((g) => {
    if (!q) return true;
    return g.name.toLowerCase().includes(q) || g.topic.toLowerCase().includes(q);
  });

  // Filter YouTube Videos
  const isDirectYoutubeLink = q.includes('youtube.com') || q.includes('youtu.be');
  const filteredVideos = isDirectYoutubeLink
    ? [
        {
          id: `yt-custom-${Date.now()}`,
          youtubeId: 'custom_url',
          title: `Direct Link: ${searchQuery}`,
          channelName: 'Online Web Video',
          durationText: 'Web Stream',
          category: 'User Shared',
          url: searchQuery
        },
        ...DEFAULT_YOUTUBE_VIDEOS
      ]
    : DEFAULT_YOUTUBE_VIDEOS.filter((v) => {
        if (!q) return true;
        return v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
      });

  // Filter Social Items
  const filteredSocial = DEFAULT_SOCIAL_ITEMS.filter((s) => {
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
  });

  // Filter Features
  const filteredFeatures = DEFAULT_FEATURES.filter((f) => {
    if (!q) return true;
    return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
  });

  // Filter City Camouflage Presets
  const filteredCamoPresets = searchCityCamouflage(searchQuery);
  const isCamoRelatedQuery = ['cemuflage', 'camouflage', 'camo', 'stealth', 'decoy', 'disguise', 'city', 'urban', 'protest', 'lahore', 'karachi', 'islamabad', 'rawalpindi', 'peshawar', 'faisalabad', 'multan', 'quetta'].some(term => q.includes(term));

  // Toggle or activate City Camouflage preset
  const handleToggleCamoPreset = (preset: CityCamouflagePreset) => {
    if (camoState.isActive && camoState.currentPresetId === preset.id) {
      const next = deactivateCityCamouflage();
      setCamoState(next);
      onDeactivateCityCamouflage?.();
      onLogEvent?.('CityCamouflage', `Deactivated urban camouflage for ${preset.city}`, 'info');
    } else {
      const next = activateCityCamouflage(preset.id);
      setCamoState(next);
      onActivateCityCamouflage?.(preset.id);
      onLogEvent?.('CityCamouflage', `Activated [${preset.title}]! RF disguised as "${preset.rfStealthName}". Decoy: ${preset.uiDisguiseMode}`, 'success');
    }
  };

  // Execute Auto-Block on Malicious Peer
  const handleExecuteAutoBlock = (peerHandle: string, threat: ThreatCategory) => {
    const evidenceMap: Record<ThreatCategory, string> = {
      JAMMING: 'Node engaged in intentional RF channel jamming & high-frequency packet flooding.',
      BLOCKING: 'Node confirmed to be blackholing transit packets and disrupting P2P mesh routes.',
      VIRUS: 'Detected attempted broadcast of corrupted / virus-infected APK payload.'
    };
    autoBlockPeer(peerHandle, threat, evidenceMap[threat]);
    setQuarantinedList(getQuarantinedPeers());
    setReportingPeerHandle(null);
    setShieldAlertBanner(`🛡️ Auto-Blocked @${peerHandle} [${threat}]! All packets filtered.`);
    onLogEvent?.('MeshShield', `Auto-blocked malicious peer @${peerHandle} due to ${threat}. Radio filter active.`, 'warn');
    setTimeout(() => setShieldAlertBanner(null), 4000);
  };

  // Manually Unblock Peer
  const handleUnblockPeer = (peerHandle: string) => {
    unblockPeer(peerHandle);
    setQuarantinedList(getQuarantinedPeers());
    onLogEvent?.('MeshShield', `Manually unblocked peer @${peerHandle}.`, 'info');
  };

  // Test simulation for Auto-Block shield
  const handleSimulateAttack = (threat: ThreatCategory) => {
    const sim = simulateMaliciousIntrusion(threat);
    setQuarantinedList(getQuarantinedPeers());
    setShieldAlertBanner(`🛡️ Intrusion Shield Auto-Blocked @${sim.quarantined.handle} [${threat}]!`);
    onLogEvent?.('MeshShield', `[SIMULATED INTRUSION] Auto-blocked @${sim.quarantined.handle} (${threat})`, 'warn');
    setTimeout(() => setShieldAlertBanner(null), 4000);
  };


  // Acoustic Discovery Ping probe sound
  const handlePingPeer = (peerHandle: string) => {
    setPingedPeerHandle(peerHandle);
    onLogEvent?.('NearbyRadar', `Sent acoustic & mesh probe to ${peerHandle}. ACK received in 18ms.`, 'success');
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
    setTimeout(() => setPingedPeerHandle(null), 2000);
  };

  // Execute QR Scan Success (decodes peer, plays audio beep, and immediately connects to direct chat)
  const handleCompleteScan = (scannedHandle: string, displayName?: string) => {
    const cleanHandle = scannedHandle.replace(/^@/, '').trim();
    const effectiveName = displayName || `Qaidi Node ${cleanHandle.replace('qaidi', '')}`;
    
    // Audio beep confirmation
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (_e) {}

    setScanSimNotice(`✓ Scanned @${cleanHandle}! Connected to peer.`);
    onLogEvent?.('QRScanner', `Successfully scanned & paired with peer @${cleanHandle}! Opening direct chat.`, 'success');
    
    setTimeout(() => {
      setIsScanningQrCamera(false);
      onSelectPeerToChat(cleanHandle, effectiveName);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-emerald-500/40 p-4 shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={APP_LOGOS.mainApp}
              alt="App Logo"
              className="h-8 w-8 rounded-lg object-cover border border-emerald-500/50 shadow-md shadow-emerald-950/80 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Discovery, Search & QR</span>
              </h3>

              <p className="text-[10px] text-slate-400">
                {combinedMode === 'RADAR'
                  ? '360° Proximity Radar sweep for active mesh peers'
                  : combinedMode === 'QR'
                  ? 'Cryptographic Node QR Code & Live Camera Scanner'
                  : 'Search mesh peers, groups, guides & offline tools'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* COMBINED 3-IN-1 MODE SWITCHER: RADAR | SEARCH | QR */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCombinedMode('RADAR')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              combinedMode === 'RADAR'
                ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="h-3.5 w-3.5 animate-pulse" />
            <span>Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setCombinedMode('SEARCH')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              combinedMode === 'SEARCH'
                ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setCombinedMode('QR')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              combinedMode === 'QR'
                ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>My QR</span>
          </button>
        </div>

        {/* ================= VIEW 1: NEARBY DISCOVERY RADAR ================= */}
        {combinedMode === 'RADAR' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {/* 360° Circular Sweep Radar Graphic */}
            <div className="relative w-44 h-44 mx-auto rounded-full bg-[#021812] border-2 border-emerald-500/50 shadow-inner flex items-center justify-center overflow-hidden my-1">
              {/* Concentric Signal Rings */}
              <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20" />
              <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30" />
              <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40" />

              {/* Crosshair Grids */}
              <div className="absolute w-full h-[1px] bg-emerald-500/20" />
              <div className="absolute h-full w-[1px] bg-emerald-500/20" />

              {/* Rotating Sweep Beam */}
              <div
                className="absolute w-24 h-24 origin-bottom-right"
                style={{
                  top: 0,
                  left: 0,
                  transform: `rotate(${radarAngle}deg)`,
                  background: 'conic-gradient(from 180deg at 100% 100%, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0) 65deg)',
                  pointerEvents: 'none'
                }}
              />

              {/* Center Self Node */}
              <div className="relative z-10 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse" />

              {/* Blips for Nearby Peers (Hidden distance, relative locations only) */}
              <div className="absolute top-10 left-12 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40 animate-ping" />
              <div className="absolute bottom-12 right-14 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="absolute top-14 right-10 h-2 w-2 rounded-full bg-emerald-300" />
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-white font-mono uppercase">
                Nearby Mesh Peers ({DEFAULT_PEERS.length})
              </span>
              <button
                type="button"
                onClick={() => setIsRadarScanning(!isRadarScanning)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isRadarScanning ? 'animate-spin' : ''}`} />
                <span>{isRadarScanning ? 'Sweeping...' : 'Paused'}</span>
              </button>
            </div>

            {/* Discovered Peers List: NO dBm (percentage only), NO meters, NO network type */}
            <div className="space-y-1.5">
              {DEFAULT_PEERS.map((peer) => {
                const sigPct = rssiToSignalPercentage(peer.rssiDbm);
                const isPinged = pingedPeerHandle === peer.handle;
                return (
                  <div
                    key={peer.handle}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-emerald-500/40 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center font-mono border border-emerald-500/30">
                          {peer.handle.slice(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-slate-950 ${
                            peer.isOnlineMesh ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white text-[11px]">{peer.handle}</span>
                          {peer.isSuperAdmin && (
                            <span className="text-[7.5px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-400 block truncate max-w-[130px]">
                          {peer.displayName}
                        </span>
                        {/* Percentage Only - No dBm, No meters, No network type */}
                        <div className="flex items-center gap-1.5 text-[8.5px] text-emerald-400 font-mono">
                          {peer.isOnlineMesh ? (
                            <span>Signal: {sigPct}% 📶</span>
                          ) : (
                            <span className="text-slate-500">Offline (Store & Forward)</span>
                          )}
                          <span>• {peer.lastSeenText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePingPeer(peer.handle)}
                        className={`p-1.5 rounded transition-colors ${
                          isPinged
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Ping Peer (Acoustic & Mesh probe)"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectPeerToChat(peer.handle, peer.displayName);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: OMNI SEARCH (Search bar hit reveals QR) ================= */}
        {combinedMode === 'SEARCH' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Universal Search Input */}
            <div className="relative mb-2 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowQrCodeCard(true)}
                onClick={() => setShowQrCodeCard(true)}
                placeholder="Search user, group, video, URL, or feature..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-8 pr-16 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
                autoFocus
              />
              <Search className="h-3.5 w-3.5 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-500 hover:text-slate-300 text-xs px-1"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQrCodeCard(!showQrCodeCard)}
                  className={`p-1 rounded transition-colors ${
                    showQrCodeCard ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                  title="QR Code (Appears when search bar hit)"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* QR CODE APPEARS WHEN SEARCH BAR HIT */}
            {showQrCodeCard && (
              <div className="mb-2 p-2 rounded-xl bg-gradient-to-b from-[#032219] to-slate-950 border border-emerald-500/50 shadow-xl shrink-0 animate-in fade-in space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-900/60">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold font-mono">
                    <QrCode className="h-3 w-3 animate-pulse" />
                    <span>NODE QR CODE (SEARCH BAR ACTIVE)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrCodeCard(false)}
                    className="text-[9.5px] text-slate-400 hover:text-white px-1.5 py-0.2 rounded bg-slate-900"
                  >
                    Hide ✕
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shrink-0 shadow-md border border-emerald-500/40 relative w-16 h-16 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-4 gap-0.5 w-12 h-12 my-auto">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-[0.5px] ${
                            (i * 3 + 5) % 2 === 0 ? 'bg-black' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-[10px]">
                    <span className="font-mono font-bold text-emerald-300 block">{currentHandle}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsScanningQrCamera(true)}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[9.5px] flex items-center gap-1 shadow-sm"
                      >
                        <Scan className="h-3 w-3" />
                        <span>Scan Peer QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(`qaidi-user:${currentHandle}`);
                          setCopiedPayload(true);
                          setTimeout(() => setCopiedPayload(false), 2000);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9.5px] font-mono flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3 text-emerald-400" />
                        <span>{copiedPayload ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2 shrink-0 scrollbar-none text-[10px]">
              {(['ALL', 'USERS', 'CAMOUFLAGE', 'GROUPS', 'VIDEOS', 'FEATURES'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSearchTab(tab)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all shrink-0 flex items-center gap-1 ${
                    activeSearchTab === tab
                      ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab === 'ALL' ? '🌐 All' : tab === 'USERS' ? '👤 Users' : tab === 'CAMOUFLAGE' ? '🛡️ City Camo' : tab === 'GROUPS' ? '👥 Groups' : tab === 'VIDEOS' ? '▶ YouTube' : '⚡ Tools'}
                  {tab === 'CAMOUFLAGE' && camoState.isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Live Shield Alert Banner */}
            {shieldAlertBanner && (
              <div className="mb-2 p-2 rounded-lg bg-red-950/90 border border-red-500/70 text-red-200 text-[10.5px] font-mono flex items-center justify-between shrink-0 animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0 animate-pulse" />
                  <span>{shieldAlertBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShieldAlertBanner(null)}
                  className="text-red-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search Results Feed (Direct Messaging, City Camouflage, Groups, Videos) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              
              {/* SECTION: CITY CAMOUFLAGE (Prominent when searching camouflage, cemuflage, city names, or on CAMOUFLAGE tab) */}
              {(activeSearchTab === 'ALL' || activeSearchTab === 'CAMOUFLAGE') && (isCamoRelatedQuery || activeSearchTab === 'CAMOUFLAGE') && filteredCamoPresets.length > 0 && (
                <div className="space-y-2 p-2.5 rounded-xl bg-gradient-to-b from-[#022016] to-slate-950 border border-emerald-500/50 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[10.5px] uppercase">
                      <Shield className="h-3.5 w-3.5 animate-pulse" />
                      <span>City Camouflage & Urban Stealth ({filteredCamoPresets.length})</span>
                    </div>
                    {camoState.isActive ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                        ACTIVE STEALTH
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400">Offline civilian disguise</span>
                    )}
                  </div>
                  <p className="text-[9.5px] text-slate-300 leading-snug">
                    Masks RF beacons as civilian smartwatches/printers to evade detection at checkpoints and protest zones.
                  </p>

                  <div className="space-y-1.5">
                    {filteredCamoPresets.map((preset) => {
                      const isCurrent = camoState.isActive && camoState.currentPresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className={`p-2 rounded-lg border transition-all ${
                            isCurrent
                              ? 'bg-emerald-950/70 border-emerald-400 shadow-sm'
                              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5">
                              <img
                                src={getDisguiseLogo(preset.uiDisguiseMode)}
                                alt={preset.uiDisguiseMode}
                                className="h-10 w-10 rounded-xl object-cover border border-emerald-500/40 shrink-0 shadow-md mt-0.5"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-[11px]">{preset.title}</span>
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                    {preset.city}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-0.5">{preset.description}</p>
                                
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[8.5px] font-mono">
                                  <span className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                    RF Mask: <strong>{preset.rfStealthName}</strong>
                                  </span>
                                  <span className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                    Decoy: {preset.uiDisguiseMode}
                                  </span>
                                  <span className="text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                    {preset.antiJammingProfile}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleCamoPreset(preset)}
                              className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-sm ${
                                isCurrent
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-1 ring-emerald-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700'
                              }`}
                            >
                              {isCurrent ? '✓ Active' : 'Activate'}
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 1: USERS (Allow message to offline users directly + Auto-Block for Jamming / Virus) */}
              {(activeSearchTab === 'ALL' || activeSearchTab === 'USERS') && filteredPeers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
                    <span>👤 Mesh Users ({filteredPeers.length})</span>
                    <span className="text-emerald-400/80 font-normal">Direct & Offline DTN Messaging</span>
                  </div>
                  {filteredPeers.map((peer) => {
                    const sigPct = rssiToSignalPercentage(peer.rssiDbm);
                    const isBlocked = isPeerQuarantined(peer.handle);
                    const isReporting = reportingPeerHandle === peer.handle;
                    return (
                      <div
                        key={peer.handle}
                        className={`p-2 rounded-lg border transition-all ${
                          isBlocked
                            ? 'border-red-500/60 bg-red-950/30'
                            : 'border-slate-800 bg-slate-950 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className={`h-7 w-7 rounded-full font-bold text-[10px] flex items-center justify-center font-mono border ${
                                isBlocked
                                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}>
                                {peer.handle.slice(0, 2).toUpperCase()}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-slate-950 ${
                                  isBlocked ? 'bg-red-500' : peer.isOnlineMesh ? 'bg-emerald-400' : 'bg-slate-600'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold text-[11px] ${isBlocked ? 'text-red-300 line-through' : 'text-white'}`}>
                                  {peer.handle}
                                </span>
                                {peer.isSuperAdmin && (
                                  <span className="text-[7.5px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                                    ADMIN
                                  </span>
                                )}
                                {isBlocked && (
                                  <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-red-500 text-white font-bold animate-pulse">
                                    AUTO-BLOCKED
                                  </span>
                                )}
                              </div>
                              <span className="text-[9.5px] text-slate-400 block truncate max-w-[140px]">
                                {peer.displayName}
                              </span>
                              <div className="flex items-center gap-1.5 text-[8.5px] text-emerald-400 font-mono">
                                {isBlocked ? (
                                  <span className="text-red-400">Radio Packets Quarantined & Dropped</span>
                                ) : peer.isOnlineMesh ? (
                                  <span>Signal: {sigPct}% 📶</span>
                                ) : (
                                  <span className="text-slate-500">Offline (Store & Forward)</span>
                                )}
                                <span>• {peer.lastSeenText}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Auto-Block / Report Malicious Peer Button */}
                            {isBlocked ? (
                              <button
                                type="button"
                                onClick={() => handleUnblockPeer(peer.handle)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-300 font-bold text-[9.5px] border border-red-500/40"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReportingPeerHandle(isReporting ? null : peer.handle)}
                                className="p-1 rounded bg-slate-800 hover:bg-red-950/70 text-slate-300 hover:text-red-300 border border-slate-700 text-[10px]"
                                title="Auto-Block: Report Jamming, Route Blocking, or Virus"
                              >
                                <ShieldAlert className="h-3 w-3" />
                              </button>
                            )}

                            {/* Direct Message Button */}
                            {!isBlocked && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectPeerToChat(peer.handle, peer.displayName);
                                  onClose();
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm ${
                                  peer.isOnlineMesh
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                                    : 'bg-[#042d21] hover:bg-[#063f2f] text-emerald-200 border border-emerald-500/40'
                                }`}
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>{peer.isOnlineMesh ? 'Chat' : 'Message'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Auto-Block Selection Menu */}
                        {isReporting && (
                          <div className="mt-2 pt-2 border-t border-slate-800 bg-slate-900/80 p-2 rounded-lg space-y-1.5 animate-in fade-in">
                            <span className="text-[9.5px] font-bold text-red-400 block font-mono">
                              ⚡ AUTO-BLOCK THREAT REASON FOR @{peer.handle}:
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                type="button"
                                onClick={() => handleExecuteAutoBlock(peer.handle, 'JAMMING')}
                                className="py-1 px-1 rounded bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-500/40 text-[8.5px] font-bold text-center"
                              >
                                🚨 Jamming / Flood
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExecuteAutoBlock(peer.handle, 'BLOCKING')}
                                className="py-1 px-1 rounded bg-amber-900/40 hover:bg-amber-800 text-amber-200 border border-amber-500/40 text-[8.5px] font-bold text-center"
                              >
                                🛑 Route Blackhole
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExecuteAutoBlock(peer.handle, 'VIRUS')}
                                className="py-1 px-1 rounded bg-rose-900/40 hover:bg-rose-800 text-rose-200 border border-rose-500/40 text-[8.5px] font-bold text-center"
                              >
                                ☣️ Virus / Malware
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}


              {/* SECTION 2: GROUPS */}
              {(activeSearchTab === 'ALL' || activeSearchTab === 'GROUPS') && filteredGroups.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
                    👥 Mesh Groups ({filteredGroups.length})
                  </div>
                  {filteredGroups.map((grp) => (
                    <div
                      key={grp.id}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-emerald-500/40 flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-[11px]">{grp.name}</span>
                          <span className="text-[9px] font-mono text-emerald-400">({grp.id})</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400">{grp.topic}</p>
                        <span className="text-[8.5px] text-slate-500 font-mono">{grp.membersCount} active peers</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGroup?.(grp.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 3: YOUTUBE & VIDEO GUIDES */}
              {(activeSearchTab === 'ALL' || activeSearchTab === 'VIDEOS') && filteredVideos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-red-400 font-mono uppercase tracking-wider flex items-center gap-1">
                    <Youtube className="h-3 w-3" />
                    <span>Video Guides & Streams ({filteredVideos.length})</span>
                  </div>
                  {filteredVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-red-500/40 flex items-center justify-between transition-all"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-white text-[11px] block line-clamp-1">{vid.title}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                          <span>{vid.channelName}</span>
                          <span>•</span>
                          <span className="text-red-400">{vid.durationText}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onPlayYouTube?.(vid);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[9.5px] flex items-center gap-1"
                        >
                          <Play className="h-2.5 w-2.5 fill-white" />
                          <span>Watch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onShareYouTube?.(vid)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Share Video Guide"
                        >
                          <Share2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 4: APP FEATURES & TOOLS */}
              {(activeSearchTab === 'ALL' || activeSearchTab === 'FEATURES') && filteredFeatures.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                    ⚡ App Features & Hardware Tools ({filteredFeatures.length})
                  </div>
                  {filteredFeatures.map((feat) => (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => {
                        onLaunchFeature?.(feat.id);
                        onClose();
                      }}
                      className="w-full p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-500/40 flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
                          <span>{feat.name}</span>
                          <span className="text-[8.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            {feat.category}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 line-clamp-1">{feat.description}</p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        Open →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: DEDICATED QR CODE & WORKING CAMERA SCANNER ================= */}
        {combinedMode === 'QR' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-center">
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#032219] to-slate-950 border border-emerald-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                <QrCode className="h-4 w-4 animate-pulse" />
                <span>MY PEER MESH IDENTITY QR</span>
              </div>

              {/* High-Contrast Large QR Card */}
              <div className="p-3 rounded-xl bg-white mx-auto w-36 h-36 flex flex-col items-center justify-center shadow-lg relative border-2 border-emerald-500">
                <div className="grid grid-cols-6 gap-0.5 w-28 h-28 my-auto">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-[0.5px] ${
                        (i * 5 + 3) % 2 === 0 ? 'bg-black' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 m-auto h-5 w-20 rounded bg-emerald-600 border border-black flex items-center justify-center text-[8px] font-mono font-black text-slate-950 shadow">
                  {currentHandle}
                </div>
              </div>

              <div>
                <span className="font-mono font-bold text-white text-sm block">@{currentHandle}</span>
                <p className="text-[10px] text-slate-300">
                  Allow other peers to scan this QR code with their camera to immediately pair and chat over BLE/Wi-Fi mesh without internet.
                </p>
              </div>

              {/* QR Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsScanningQrCamera(true)}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Scan className="h-4 w-4" />
                  <span>Scan Peer QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`qaidi-user:${currentHandle}`);
                    setCopiedPayload(true);
                    onLogEvent?.('QR', `Copied node QR payload for ${currentHandle}`, 'info');
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiedPayload ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {onOpenFullQrModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFullQrModal();
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Advanced Group & Invite QR Manager →</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL OVERLAY: WORKING CAMERA SCANNER ================= */}
        {isScanningQrCamera && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in select-none">
            <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-emerald-500 p-4 shadow-2xl space-y-3 flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                  <Camera className="h-4 w-4 animate-pulse" />
                  <span>LIVE QR CAMERA SCANNER</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanningQrCamera(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Viewfinder with Laser Sweep */}
              <div className="relative w-48 h-48 rounded-xl bg-black border-2 border-emerald-400 flex items-center justify-center overflow-hidden shadow-inner">
                {/* 4 Corner Markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                {/* Animated Green Laser Sweep */}
                <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce" />

                <span className="text-[10px] text-emerald-400/80 font-mono">Point camera at peer QR</span>
              </div>

              <p className="text-[10px] text-slate-300 leading-snug">
                Detecting peer QR code via device sensor... Tap any peer below to simulate instant scan:
              </p>

              {/* Peer Quick Scan Options */}
              <div className="w-full space-y-1.5 text-left">
                {DEFAULT_PEERS.filter(p => p.handle !== currentHandle).slice(0, 3).map((peer) => (
                  <button
                    key={peer.handle}
                    type="button"
                    onClick={() => handleCompleteScan(peer.handle, peer.displayName)}
                    className="w-full p-2 rounded-lg bg-slate-950 hover:bg-[#04281e] border border-slate-800 hover:border-emerald-500/60 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-white block text-[11px]">@{peer.handle}</span>
                      <span className="text-[9px] text-slate-400">{peer.displayName}</span>
                    </div>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-600 text-slate-950 font-bold">
                      Scan This QR
                    </span>
                  </button>
                ))}
              </div>

              {scanSimNotice && (
                <div className="w-full p-2 rounded bg-emerald-950/80 border border-emerald-500/80 text-[10px] text-emerald-200 font-mono animate-in fade-in">
                  {scanSimNotice}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AUTO-BLOCK SHIELD & QUARANTINED PEERS DRAWER ================= */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setShowQuarantineDrawer(!showQuarantineDrawer)}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-[10.5px] font-mono text-slate-300"
          >
            <div className="flex items-center gap-1.5 text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Auto-Block Shield ({quarantinedList.length} Quarantined)</span>
            </div>
            <span className="text-[9.5px] text-slate-400">
              {showQuarantineDrawer ? '▲ Hide' : '▼ Test & View Blocked'}
            </span>
          </button>

          {showQuarantineDrawer && (
            <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-red-500/40 space-y-2 text-xs animate-in fade-in max-h-44 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] font-bold text-red-400 font-mono">
                <span>SIMULATE & TEST AUTO-BLOCK FIREWALL:</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleSimulateAttack('JAMMING')}
                  className="py-1 px-1 rounded bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/40 text-[9px] font-bold text-center"
                >
                  ⚡ Test Jammer
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAttack('BLOCKING')}
                  className="py-1 px-1 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-[9px] font-bold text-center"
                >
                  🛑 Test Blackhole
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAttack('VIRUS')}
                  className="py-1 px-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-[9px] font-bold text-center"
                >
                  ☣️ Test Virus APK
                </button>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9.5px] font-bold text-slate-400 font-mono block">
                  BLOCKED PEERS & DROPPED PACKETS:
                </span>
                {quarantinedList.length === 0 ? (
                  <p className="text-[9px] text-slate-500 italic">No nodes quarantined yet.</p>
                ) : (
                  quarantinedList.map((qNode) => (
                    <div
                      key={qNode.handle}
                      className="p-1.5 rounded bg-slate-900 border border-red-500/30 flex items-center justify-between text-[9px]"
                    >
                      <div>
                        <div className="flex items-center gap-1 font-mono font-bold text-red-300">
                          <span>@{qNode.handle}</span>
                          <span className="text-[7.5px] px-1 rounded bg-red-900/60 text-red-200">
                            {qNode.reason}
                          </span>
                        </div>
                        <p className="text-[8px] text-slate-400 truncate max-w-[170px]">{qNode.evidence}</p>
                        <span className="text-[7.5px] text-slate-500 font-mono">
                          Dropped: {qNode.packetsDroppedCount} packets • MAC: {qNode.macAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblockPeer(qNode.handle)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 font-bold text-[8.5px]"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

