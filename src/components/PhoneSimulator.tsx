import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  Play,
  Pause,
  Compass,
  Download,
  Wifi,
  WifiOff,
  Battery,
  ShieldCheck,
  ShieldAlert,
  Send,
  Lock,
  Unlock,
  CheckCheck,
  Share2,
  Sparkles,
  Settings,
  ChevronRight,
  Trash2,
  Volume2,
  VolumeX,
  Waves,
  UserX,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowDownToLine,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  Sliders,
  X,
  Film,
  Search,
  Bookmark,
  Radio,
  BookOpen,
  School,
  Github,
  Key,
  Cpu,
  Calculator,
  Layers,
  Clock,
  Check,
  Paperclip,
  Upload,
  Plus,
  EyeOff,
  Languages,
  Tag,
  Zap,
  Bell,
  Activity,
  Signal,
  Sun,
  Library,
  Folder,
  FolderArchive,
  FileText,
  Music,
  Headphones,
  Image as ImageIcon,
  QrCode,
  Radar,
  Scan,
  Bluetooth,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { NativeAdCard } from './NativeAdCard';
import {
  INITIAL_PEERS,
  INITIAL_GROUPS,
  INITIAL_DTN_PACKETS,
  PeerNodeSim,
  MeshGroupSim,
  DtnPacketSim
} from '../data/simulatedMeshState';
import { VideoAttachmentMeta } from '../core/dtnRouting';
import { generateSeedPhrase, deriveKeypairFromSeed } from '../core/bip39';
import {
  ADMOB_APP_ID,
  EXPECTED_RELEASE_CERT_HASH,
  canMemberPostInGroup,
  filterContentUnderIslamicLaw,
  ISLAMIC_LAW_BLOCK_MESSAGE,
  isGlobalSuperAdmin,
  canPromoteToSuperAdmin,
  GLOBAL_SUPER_ADMIN_HANDLE
} from '../core/adminAndAds';
import { encodeUltrasoundFrequencies, decodeUltrasoundFrequencies } from '../core/ultrasoundAcoustic';
import { handleCaptivePortalHttp } from '../core/captivePortal';
import {
  INITIAL_FEATURE_MODULES,
  installFeatureModule,
  FeatureModule
} from '../core/dynamicFeatureDelivery';
import {
  INITIAL_WEATHER,
  generateRainAlerts,
  WeatherCondition,
  RainAlert
} from '../core/weatherMesh';
import {
  isSuperAdminAuthenticated,
  generateRandomQaidiHandle,
  generateHardwareMac,
  PrivateNicknameMap,
  getEffectivePeerDisplayName
} from '../core/authAndIdentity';
import {
  PrivatePacketRecord,
  RadioStatus,
  determineRoutingPath,
  enqueueOfflineChatPacket,
  syncBufferedPacketsToGitHub,
  confirmPacketDeliveredByRecipient
} from '../core/githubOfflineBridge';
import {
  storeOrReferenceMediaBlob,
  auditStorageMetrics,
  PhysicalBlobRecord
} from '../core/zeroDupStorage';
import { ShareMode, SourcePlatform } from '../core/systemShareSheet';
import {
  getDefaultLanguageForLocation,
  translateMessageOffline
} from '../core/autoTranslate';
import {
  createGlobalEmergencyBroadcast,
  dispatchGlobalEmergencyBroadcast,
  RadioEmergencyBroadcast
} from '../core/radioPacketTransmission';

// Modular Feature Views
import { SocialAndReelsView } from './SocialAndReelsView';
import { SdrSpeakerRadioView } from './SdrSpeakerRadioView';
import { QiblaAndCampusView } from './QiblaAndCampusView';
import { GuidesHubView } from './GuidesHubView';
import { NoticeBoardView, NoticeItem } from './NoticeBoardView';
import { SignalStrengthVisualizer } from './SignalStrengthVisualizer';
import { OfflineSatelliteMapView } from './OfflineSatelliteMapView';
import { UserSearchModal } from './UserSearchModal';
import { AuthAndIdentityModal } from './AuthAndIdentityModal';
import { ShareSheetModal } from './ShareSheetModal';
import { GitHubSyncModal } from './GitHubSyncModal';
import { NearbyShareModal } from './NearbyShareModal';
import { UsbOtgSerialView } from './UsbOtgSerialView';
import { NearbyDiscoveryModal } from './NearbyDiscoveryModal';
import { QrCodeManagerModal } from './QrCodeManagerModal';
import { ConnectionAssistantModal } from './ConnectionAssistantModal';
import { SuperAdminConsoleModal } from './SuperAdminConsoleModal';
import {
  rssiToSignalPercentage,
  getSignalQuality,
  shouldEnforceLockdownForCity,
  getUrduLockdownWarning
} from '../core/securityAndLockdown';

interface PhoneSimulatorProps {
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onSelectCodeFile: (fileId: string) => void;
}

export type TabId = 'chats' | 'social' | 'call' | 'radio' | 'qibla' | 'map' | 'guides' | 'notice' | 'signal' | 'nearby' | 'weather';

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ onLogEvent, onSelectCodeFile }) => {
  // Navigation Tabs: Default clean core tabs (user can customize in Settings!)
  const [activeTab, setActiveTab] = useState<TabId>('chats');
  const [enabledTabs, setEnabledTabs] = useState<TabId[]>(['chats', 'social', 'call', 'map', 'notice']);
  const [showSignalVisualizerModal, setShowSignalVisualizerModal] = useState<boolean>(false);

  // Network & Battery State
  const [isOnline, setIsOnline] = useState(false);
  const [batteryPct, setBatteryPct] = useState(84);
  const [solarLoraFundRaised, setSolarLoraFundRaised] = useState<number>(24.30);

  // Identity: Defaults to 10-char handle: "qaidi" + 5 random digits (e.g. qaidi48921)
  const [identityHandle, setIdentityHandle] = useState(() => generateRandomQaidiHandle());
  const isSuperAdmin = isSuperAdminAuthenticated(identityHandle);

  // Super Admin Role Delegation (Promote others to Admin / Super Admin)
  const [delegatedAdmins, setDelegatedAdmins] = useState<{ handle: string; role: 'ADMIN' | 'SUPER_ADMIN'; date: string }[]>([
    { handle: 'qaidi1561561', role: 'SUPER_ADMIN', date: 'Origin Master' },
    { handle: 'qaidi7711', role: 'ADMIN', date: 'Delegated 2d ago' }
  ]);
  const [promoteCandidateHandle, setPromoteCandidateHandle] = useState('');
  const [promoteCandidateRole, setPromoteCandidateRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');

  // Private Nicknames: Stored strictly on local device, never broadcast
  const [privateNicknames, setPrivateNicknames] = useState<PrivateNicknameMap>({
    qaidi7711: 'Ali - Cantenna RF Lead',
    qaidi3390: 'Brother Zafar - Saline First Aid',
    qaidi8821: 'Sector Coordinator Usman'
  });
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [tempNicknameValue, setTempNicknameValue] = useState('');

  // Hardware Radios & Private Fallback Routing
  const [radioStatus, setRadioStatus] = useState<RadioStatus>({
    bluetoothEnabled: true,
    locationServicesEnabled: true,
    wifiMeshEnabled: true,
    cellularDataActive: false,
    wifiInternetActive: false
  });
  const [bufferedPrivatePackets, setBufferedPrivatePackets] = useState<PrivatePacketRecord[]>([
    {
      packetId: 'pkt-init-901',
      senderHandle: 'qaidi4829',
      recipientHandle: 'qaidi7711',
      encryptedCiphertext: 'E2EE_ENCRYPTED_EMERGENCY_STATUS',
      ivHex: '9A01C488F2',
      createdAt: Date.now() - 120000,
      status: 'STORED_LOCALLY_ROOM_DB',
      radioStateWhenSent: { bluetoothEnabled: false, locationServicesEnabled: false, wifiMeshEnabled: false }
    }
  ]);

  // Zero-Duplication Local Media Store
  const [mediaStorage, setMediaStorage] = useState<Record<string, PhysicalBlobRecord>>({});

  // Modals State
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareSheetModal, setShowShareSheetModal] = useState(false);
  const [showGitHubSyncModal, setShowGitHubSyncModal] = useState(false);
  const [showMasterAdminModal, setShowMasterAdminModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showAttachVideoModal, setShowAttachVideoModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showOtherFeaturesModal, setShowOtherFeaturesModal] = useState(false);
  const [showNearbyShareModal, setShowNearbyShareModal] = useState(false);
  const [showUsbOtgModal, setShowUsbOtgModal] = useState(false);
  const [showNearbyDiscoveryModal, setShowNearbyDiscoveryModal] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [showConnectionAssistantModal, setShowConnectionAssistantModal] = useState(false);
  const [hotspotEnabled, setHotspotEnabled] = useState(true);
  const [dismissedConnectionBanner, setDismissedConnectionBanner] = useState(false);
  
  // City-Targeted Security, Security PIN Changing & Stealth Disguise System
  const [appSecurityPin, setAppSecurityPin] = useState('1234');
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [newPinCandidate, setNewPinCandidate] = useState('');
  const [confirmPinCandidate, setConfirmPinCandidate] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // App Disguise Mode (CALCULATOR or NOTEPAD)
  const [isAppDisguised, setIsAppDisguised] = useState(false);
  const [disguiseStyle, setDisguiseStyle] = useState<'CALCULATOR' | 'NOTEPAD'>('CALCULATOR');
  
  // Real Working Calculator Engine for Disguise
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcClearOnNext, setCalcClearOnNext] = useState(false);

  // City-Targeted Security
  const [userCity, setUserCity] = useState('Talagang');
  const [activeCityLockdown, setActiveCityLockdown] = useState<string | null>(null);
  const [isDisguiseUnlocked, setIsDisguiseUnlocked] = useState(false);
  const [emergencyNoticeFromBroadcast, setEmergencyNoticeFromBroadcast] = useState<NoticeItem | null>(null);
  const [activeEmergencyBroadcast, setActiveEmergencyBroadcast] = useState<RadioEmergencyBroadcast | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoAttachmentMeta | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // In-App Media Playability (Audio, Photo, Voice Notes, Folders)
  const [activeAudioModal, setActiveAudioModal] = useState<{ title: string; durationSec: number; isPlaying: boolean; isVoiceNote?: boolean } | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<{ title: string; sizeMb: number } | null>(null);
  const [activeFolderModal, setActiveFolderModal] = useState<{ folderName: string; filesCount: number; sizeMb: number } | null>(null);
  const universalFileInputRef = useRef<HTMLInputElement | null>(null);
  const universalFolderInputRef = useRef<HTMLInputElement | null>(null);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTopic, setNewGroupTopic] = useState('');
  const [newGroupAdminsOnly, setNewGroupAdminsOnly] = useState(false);

  // Islamic Law Filter Alert Toast
  const [islamicLawAlert, setIslamicLawAlert] = useState<string | null>(null);

  // Location-Based Auto-Translate State
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [targetLangCode, setTargetLangCode] = useState('ur'); // Default Urdu for Pakistan
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  // Ultrasound Near-Field Acoustic Sharing (Using phone speaker & mic!)
  const [showUltrasoundModal, setShowUltrasoundModal] = useState(false);
  const [ultrasoundState, setUltrasoundState] = useState<'IDLE' | 'TRANSMITTING' | 'LISTENING' | 'SUCCESS'>('IDLE');
  const [ultrasoundPayload, setUltrasoundPayload] = useState('qaidi1561561:LINK');
  const [ultrasoundDecoded, setUltrasoundDecoded] = useState('');

  // Hotspot & Captive Portal Offline APK Download Simulator
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalGuestStep, setPortalGuestStep] = useState<'DISCOVER' | 'PROBE_REDIRECT' | 'PORTAL_PAGE' | 'DOWNLOADING' | 'INSTALL_PROMPT' | 'INSTALLED'>('DISCOVER');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Weather & Severe Rain Alerts
  const [weather, setWeather] = useState<WeatherCondition>(INITIAL_WEATHER);
  const [rainAlerts, setRainAlerts] = useState<RainAlert[]>(() => generateRainAlerts(INITIAL_WEATHER, 3.6));
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Chats & Groups State: Notes are now inside "Message Yourself" in Direct Chats!
  const [chatType, setChatType] = useState<'groups' | 'direct'>('direct');
  const [directChatTarget, setDirectChatTarget] = useState<'self' | 'peer'>('self'); // Defaults to "Message Yourself"!
  const [groups, setGroups] = useState<MeshGroupSim[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<MeshGroupSim>(INITIAL_GROUPS[0]);
  const [peers, setPeers] = useState<PeerNodeSim[]>(INITIAL_PEERS);
  const [selectedPeer, setSelectedPeer] = useState<PeerNodeSim>(INITIAL_PEERS[0]);
  const [dtnPackets, setDtnPackets] = useState<DtnPacketSim[]>(INITIAL_DTN_PACKETS);
  const [savedNotes, setSavedNotes] = useState<string[]>([
    '💡 HOW QAIDI SHARE WORKS: 1. Turn on Bluetooth & Wi-Fi. 2. Your phone automatically joins the encrypted neighborhood mesh. 3. Zero SIM card or cellular internet needed — messages hop phone-to-phone.',
    '☀️ SOLAR LORA REPEATER FUND: 100% of Native Ad revenue is pooled to purchase autonomous solar panels & LoRa repeaters, expanding city-wide off-grid range to 35km+!',
    '🔐 10-CHARACTER USERNAME STANDARD: Your name starts with "qaidi" + 5 locked random digits (e.g. qaidi48921). In Settings, you can customize "qaidi" to any 5 letters/numbers, but the 5-digit number remains permanently locked.',
    '📻 EMERGENCY RADIO & WALKIE-TALKIE: LoRa 433.175 MHz • Opus 16kbps PTT Voice: #lahore-relief channel • FM Emergency Broadcast: 98.5 MHz RDS.',
    '🚨 STEALTH DISGUISE & SECURITY: Enable Calculator or Notepad disguise mode in Settings. Enter your 4-digit PIN to unlock real encrypted chats.'
  ]);
  const [chatText, setChatText] = useState('');
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);

  // Voice Note Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // Multi-Channel PTT Voice Audio State
  const [isInGroupCall, setIsInGroupCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>(['qaidi7711']);
  const [backgroundListeningChannels, setBackgroundListeningChannels] = useState<string[]>([
    '#lahore-relief',
    '#protest-safety'
  ]);
  const [activePttChannel, setActivePttChannel] = useState<string>('#lahore-relief');
  const [isPttTransmitting, setIsPttTransmitting] = useState(false);

  // Smart Network-Aware Auto-App-Updater
  const [showCellularUpdatePrompt, setShowCellularUpdatePrompt] = useState(false);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [appUpdateVersion, setAppUpdateVersion] = useState('v2.4.1 (Hotfix)');

  // Dynamic Feature Delivery
  const [featureModules, setFeatureModules] = useState<FeatureModule[]>(INITIAL_FEATURE_MODULES);
  const [showFeatureStoreModal, setShowFeatureStoreModal] = useState(false);
  const [downloadingModuleId, setDownloadingModuleId] = useState<string | null>(null);

  // Security & Panic Wipe
  const [seedPhrase, setSeedPhrase] = useState<string[]>(() => generateSeedPhrase(0.4));
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [isWiped, setIsWiped] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Check if current user is admin in the active group
  const isUserGroupAdmin = selectedGroup.admins.includes(identityHandle);
  const canPostInGroup = isSuperAdmin || canMemberPostInGroup(
    { handle: identityHandle, role: isUserGroupAdmin ? 'GROUP_ADMIN' : 'MEMBER', joinedAt: 0 },
    selectedGroup.onlyAdminsCanPost
  );

  const activeRainAlerts = rainAlerts.filter(a => !dismissedAlertIds.includes(a.id));

  // Audio tone helper
  const playFriendlyTone = (freq: number = 587, duration: number = 0.08) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_e) {}
  };

  // Global Emergency Broadcast SOS Ping Trigger (Synchronizes push alert to Notice Board)
  const handleTriggerGlobalEmergencyBroadcast = (customMsg?: string) => {
    const msg = customMsg || 'NETWORK-WIDE EMERGENCY PING: High-priority beacon active across all mesh nodes.';
    const broadcast = createGlobalEmergencyBroadcast(
      identityHandle,
      msg,
      'CIVIL_ALERT',
      { latitude: 33.7294, longitude: 73.0931, mgrsGrid: '43SED893245' }
    );
    const result = dispatchGlobalEmergencyBroadcast(broadcast, peers.map(p => p.handle));
    setActiveEmergencyBroadcast(result.broadcast);

    // Synchronize into Notice Board
    setEmergencyNoticeFromBroadcast({
      id: `notice-push-${Date.now()}`,
      category: 'COMMUNITY_ANNOUNCEMENT',
      title: '🚨 EMERGENCY PUSH ALERT: Network-Wide Civil Beacon',
      author: `${identityHandle} (Super Admin Alert)`,
      createdAtText: 'Live Broadcast • Pushed to Mesh Notice Board',
      isPinned: true,
      isOfflineCached: true,
      summary: msg,
      content: [
        'Network-Wide Emergency Broadcast initiated.',
        `Originator Node: ${identityHandle}`,
        `Payload: ${msg}`,
        'All mesh nodes must prioritize relaying this critical packet and monitor emergency channel.'
      ],
      tags: ['SOS', 'Emergency', 'Push Alert', 'Broadcast'],
      downloadSizeBytes: 512 * 1024
    });

    playFriendlyTone(987, 0.15);
    setTimeout(() => playFriendlyTone(1318, 0.25), 180);
    onLogEvent('EmergencyBroadcast', result.logSummary, 'error');
  };

  // Security PIN Changing Handler
  const handleUpdateSecurityPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    if (currentPinAttempt !== appSecurityPin) {
      setPinChangeMsg({ text: 'Current PIN is incorrect.', isError: true });
      return;
    }

    if (!/^\d{4}$/.test(newPinCandidate)) {
      setPinChangeMsg({ text: 'New PIN must be exactly 4 digits (e.g. 1234).', isError: true });
      return;
    }

    if (newPinCandidate !== confirmPinCandidate) {
      setPinChangeMsg({ text: 'New PIN and confirmation do not match.', isError: true });
      return;
    }

    setAppSecurityPin(newPinCandidate);
    setCurrentPinAttempt('');
    setNewPinCandidate('');
    setConfirmPinCandidate('');
    setPinChangeMsg({ text: 'Security PIN changed successfully!', isError: false });
    playFriendlyTone(880, 0.15);
    onLogEvent('SecurityPIN', 'App Security PIN successfully updated.', 'success');
  };

  // Calculator Disguise Keypad Handler
  const handleCalcInput = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('0');
      setCalcExpression('');
      setCalcMemory(null);
      setCalcOperator(null);
      setCalcClearOnNext(false);
      return;
    }

    if (btn === '=') {
      // Secret check: Did user type their PIN into calculator?
      if (calcDisplay === appSecurityPin) {
        setIsAppDisguised(false);
        setIsDisguiseUnlocked(true);
        setActiveCityLockdown(null);
        setCalcDisplay('0');
        playFriendlyTone(980, 0.2);
        onLogEvent('AppDisguise', 'Calculator PIN verified. Secret access to Qaidi Share granted!', 'success');
        return;
      }

      // Normal working calculator evaluation
      if (calcOperator && calcMemory !== null) {
        const current = parseFloat(calcDisplay);
        let res = current;
        if (calcOperator === '+') res = calcMemory + current;
        if (calcOperator === '-') res = calcMemory - current;
        if (calcOperator === '×') res = calcMemory * current;
        if (calcOperator === '÷') res = current !== 0 ? calcMemory / current : 0;
        
        // Round to max 6 decimals
        const rounded = Math.round(res * 1000000) / 1000000;
        setCalcDisplay(String(rounded));
        setCalcExpression(`${calcMemory} ${calcOperator} ${current} =`);
        setCalcMemory(null);
        setCalcOperator(null);
        setCalcClearOnNext(true);
      }
      return;
    }

    if (btn === '+' || btn === '-' || btn === '×' || btn === '÷') {
      const currentVal = parseFloat(calcDisplay);
      setCalcMemory(currentVal);
      setCalcOperator(btn);
      setCalcExpression(`${calcDisplay} ${btn}`);
      setCalcClearOnNext(true);
      return;
    }

    if (btn === '±') {
      if (calcDisplay !== '0') {
        setCalcDisplay(calcDisplay.startsWith('-') ? calcDisplay.slice(1) : '-' + calcDisplay);
      }
      return;
    }

    if (btn === '%') {
      const val = parseFloat(calcDisplay) / 100;
      setCalcDisplay(String(val));
      return;
    }

    if (btn === '.') {
      if (!calcDisplay.includes('.')) {
        setCalcDisplay(calcDisplay + '.');
      }
      return;
    }

    // Digit pressed (0-9)
    if (calcDisplay === '0' || calcClearOnNext) {
      setCalcDisplay(btn);
      setCalcClearOnNext(false);
    } else {
      if (calcDisplay.length < 10) {
        setCalcDisplay(calcDisplay + btn);
      }
    }
  };

  // Voice note recording simulation
  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    playFriendlyTone(440, 0.08);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    onLogEvent('VoiceNote', 'Recording encrypted voice note via hardware microphone...', 'info');
  };

  const handleStopAndSendVoiceNote = () => {
    if (!isRecordingVoice) return;
    clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    playFriendlyTone(660, 0.1);

    const duration = recordingSeconds || 2;
    const isGroup = chatType === 'groups';
    const isPeerUnavailable = !isGroup && (selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false);

    const newPkt: DtnPacketSim = {
      id: `voice-${Date.now().toString().slice(-4)}`,
      source: identityHandle,
      destination: isGroup ? selectedGroup.name : selectedPeer.handle,
      preview: `🎤 Voice note (${duration}s)`,
      createdAt: Date.now(),
      hopsLeft: 5,
      isUrgent: false,
      status: isPeerUnavailable ? 'STORED_IN_ROOM_DB' : 'DELIVERED',
      relayToken: 'VOICE_OPUS_TOKEN',
      groupId: isGroup ? selectedGroup.id : undefined,
    };

    setDtnPackets(prev => [...prev, newPkt]);
    if (isPeerUnavailable) {
      onLogEvent('DelayTolerantStore', `Peer ${selectedPeer.handle} is currently offline. Voice note queued in local Room DB for opportunistic auto-forwarding.`, 'info');
    } else {
      onLogEvent('VoiceNote', `Sent ${duration}s encrypted voice note over mesh.`, 'success');
    }
  };

  // Send Text Message with Islamic Law Content Filter & Message Yourself Notes routing
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    // MANDATORY ISLAMIC LAW CONTENT MODERATION FILTER
    const filterCheck = filterContentUnderIslamicLaw(chatText);
    if (!filterCheck.allowed) {
      setIslamicLawAlert(ISLAMIC_LAW_BLOCK_MESSAGE);
      setChatText('');
      playFriendlyTone(320, 0.2);
      onLogEvent('IslamicLawModeration', 'Message blocked by Islamic Law: Prohibited content automatically removed and disavowed.', 'error');
      setTimeout(() => setIslamicLawAlert(null), 5000);
      return;
    }

    playFriendlyTone(660, 0.06);

    // MESSAGE YOURSELF IN CHAT: Saves note directly into user's personal thread
    if (chatType === 'direct' && directChatTarget === 'self') {
      setSavedNotes([chatText, ...savedNotes]);
      setChatText('');
      onLogEvent('MessageYourself', 'Saved personal note in your Message Yourself private vault.', 'info');
      return;
    }

    const isGroup = chatType === 'groups';
    const isPeerUnavailable = !isGroup && (selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false);
    const route = isPeerUnavailable ? 'BUFFER_IN_LOCAL_ROOM_DB' : determineRoutingPath(radioStatus, true);

    if (route === 'BUFFER_IN_LOCAL_ROOM_DB') {
      // Buffer packet in Room DB because peer is unavailable or Bluetooth/location is OFF
      const { updatedQueue } = enqueueOfflineChatPacket(
        `offline-pkt-${Date.now().toString().slice(-4)}`,
        identityHandle,
        isGroup ? selectedGroup.name : selectedPeer.handle,
        chatText,
        'IV_HEX_LOCAL',
        radioStatus,
        bufferedPrivatePackets
      );
      setBufferedPrivatePackets(updatedQueue);
      onLogEvent(
        'DelayTolerantStore',
        isPeerUnavailable
          ? `Peer ${selectedPeer.handle} is offline/out of range: Message queued in local Room DB. Will auto-forward via mesh when peer or relay comes into range.`
          : `Radios inactive: Encrypted chat buffered in Room DB. Will sync via Stealth Dark Relay when online.`,
        'warn'
      );
    }

    const newPkt: DtnPacketSim = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      source: identityHandle,
      destination: isGroup ? selectedGroup.name : selectedPeer.handle,
      preview: chatText,
      createdAt: Date.now(),
      hopsLeft: 6,
      isUrgent: false,
      status: (route === 'BUFFER_IN_LOCAL_ROOM_DB' || isPeerUnavailable) ? 'STORED_IN_ROOM_DB' : 'DELIVERED',
      relayToken: isGroup ? 'GROUP_E2EE' : 'DIRECT_E2EE',
      groupId: isGroup ? selectedGroup.id : undefined,
    };

    setDtnPackets(prev => [...prev, newPkt]);
    setChatText('');
    onLogEvent(
      isGroup ? 'GroupChat' : 'DirectChat',
      isPeerUnavailable
        ? `Queued in Room DB for offline peer ${newPkt.destination}`
        : `Message dispatched to ${newPkt.destination}`,
      'success'
    );
  };

  // Create Group Freely Handler
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const formattedId = `#${newGroupName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
    const newGrp: MeshGroupSim = {
      id: formattedId,
      name: newGroupName.trim(),
      description: 'Decentralized mesh group',
      creator: identityHandle,
      members: [identityHandle, 'qaidi7711', 'qaidi3390'],
      admins: [identityHandle],
      onlyAdminsCanPost: newGroupAdminsOnly,
      avatarColor: 'bg-emerald-600'
    };

    setGroups(prev => [newGrp, ...prev]);
    setSelectedGroup(newGrp);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupTopic('');
    playFriendlyTone(880, 0.15);
    onLogEvent('GroupManager', `Created group "${newGrp.name}" (${newGrp.id}) freely.`, 'success');
  };

  // Set Private Nickname Handler
  const handleSavePrivateNickname = () => {
    if (!tempNicknameValue.trim()) return;
    setPrivateNicknames(prev => ({
      ...prev,
      [selectedPeer.handle]: tempNicknameValue.trim()
    }));
    setShowNicknameModal(false);
    onLogEvent('PrivateNicknames', `Assigned private local nickname "${tempNicknameValue.trim()}" to peer ${selectedPeer.handle}.`, 'info');
  };

  // Tap-to-Translate Handler
  const handleTranslateMessage = (msgId: string, text: string) => {
    const res = translateMessageOffline(text, targetLangCode);
    setTranslatedMessages(prev => ({ ...prev, [msgId]: res.translatedText }));
    playFriendlyTone(784, 0.05);
    onLogEvent('AutoTranslate', `Translated to ${res.targetLanguageName}: "${res.translatedText}"`, 'info');
  };

  // Video Sharing in Chat with Zero-Duplication Local Storage
  const handleShareVideoInChat = (video: VideoAttachmentMeta) => {
    playFriendlyTone(784, 0.1);
    setShowAttachVideoModal(false);

    // Store in zero-duplication single-instance storage
    const storeRes = storeOrReferenceMediaBlob(
      mediaStorage,
      video.videoId,
      video.title,
      video.sizeMb * 1024 * 1024,
      'H264_VIDEO_OPTIMIZED'
    );
    setMediaStorage(storeRes.updatedStorage);

    const isGroup = chatType === 'groups';
    const isPeerUnavailable = !isGroup && (selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false);
    const newPkt: DtnPacketSim = {
      id: `vid-${Date.now().toString().slice(-4)}`,
      source: identityHandle,
      destination: isGroup ? selectedGroup.name : selectedPeer.handle,
      preview: `Shared Video: ${video.title}`,
      createdAt: Date.now(),
      hopsLeft: 6,
      isUrgent: false,
      status: isPeerUnavailable ? 'STORED_IN_ROOM_DB' : 'DELIVERED',
      relayToken: 'VIDEO_SWARM_TOKEN',
      groupId: isGroup ? selectedGroup.id : undefined,
      videoAttachment: video,
    };

    setDtnPackets(prev => [...prev, newPkt]);
    onLogEvent(
      'ZeroDupStorage',
      `Shared "${video.title}" (${video.sizeMb}MB). Single-instance content hash: ${storeRes.contentHash.slice(0, 8)}. ${isPeerUnavailable ? 'Queued in local Room DB for offline peer.' : 'Transmitted over active mesh.'}`,
      'success'
    );
  };

  // Trigger Network-Aware App Update Check
  const handleCheckForAppUpdate = () => {
    onLogEvent('AppUpdater', 'Checking network for signed OTA binary release...', 'info');

    // If on Mobile Data (Cellular), ask user confirmation first!
    if (radioStatus.cellularDataActive && !radioStatus.wifiInternetActive && !radioStatus.wifiMeshEnabled) {
      setShowCellularUpdatePrompt(true);
      onLogEvent('AppUpdater', 'Cellular SIM connection detected: Paused auto-download to protect user data budget. Prompting confirmation.', 'warn');
      return;
    }

    // Over Wi-Fi or Mesh, update automatically!
    executeAppUpdate();
  };

  const executeAppUpdate = () => {
    setIsUpdatingApp(true);
    setShowCellularUpdatePrompt(false);
    onLogEvent('AppUpdater', 'Downloading Qaidi Share update package over local mesh/Wi-Fi...', 'info');

    setTimeout(() => {
      setIsUpdatingApp(false);
      setAppUpdateVersion('v2.5.0 (Latest Release)');
      playFriendlyTone(880, 0.2);
      onLogEvent('AppUpdater', 'App updated seamlessly to v2.5.0! Anti-tamper signature verified against release key.', 'success');
    }, 1800);
  };

  // Universal Storage File Selector (Any File Format Allowed)
  const handleUniversalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext);
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
      const isVoice = f.name.toLowerCase().includes('voice') || f.name.toLowerCase().includes('audio_note');
      const sizeMb = +(f.size / (1024 * 1024)).toFixed(2) || 0.1;

      let previewText = `📁 [File]: ${f.name} (${sizeMb} MB)`;
      if (isVoice) previewText = `🎤 [Voice Note]: ${f.name} (0:45 • Play In-App)`;
      else if (isAudio) previewText = `🎵 [Audio Track]: ${f.name} (3:20 • Play In-App)`;
      else if (isImage) previewText = `🖼 [Photo]: ${f.name} (${sizeMb} MB • Tap to View)`;
      else if (isVideo) previewText = `🎬 [Video]: ${f.name} (${sizeMb} MB • Play In-App)`;

      const isGroup = chatType === 'groups';
      const isPeerUnavailable = !isGroup && (selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false);

      const newPkt: DtnPacketSim = {
        id: `pkt-file-${Date.now()}-${i}`,
        source: identityHandle,
        destination: isGroup ? selectedGroup.name : selectedPeer.handle,
        preview: previewText,
        createdAt: Date.now(),
        hopsLeft: 6,
        isUrgent: false,
        status: isPeerUnavailable ? 'STORED_IN_ROOM_DB' : 'DELIVERED',
        relayToken: 'STORAGE-SHARE',
        groupId: chatType === 'groups' ? selectedGroup.id : undefined,
        videoAttachment: isVideo ? {
          videoId: `vid-${Date.now()}-${i}`,
          title: f.name,
          sizeMb: sizeMb,
          durationSec: 120,
          totalChunks: 20,
          cachedChunks: 20,
          merkleRoot: '0x' + Math.random().toString(16).slice(2, 10)
        } : undefined
      };
      setDtnPackets(prev => [...prev, newPkt]);
      onLogEvent(
        'PhoneStorage',
        `Attached & ${isPeerUnavailable ? 'queued in Room DB for offline peer' : 'sent'} ${f.name} (${sizeMb} MB) directly from phone storage.`,
        'success'
      );
    }
    setShowFileUploadModal(false);
  };

  // Whole Folder / Directory Selector (webkitdirectory)
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const folderName = files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'Storage_Folder_Bundle';
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) totalSize += files[i].size;
    const sizeMb = +(totalSize / (1024 * 1024)).toFixed(2) || 0.5;

    const isGroup = chatType === 'groups';
    const isPeerUnavailable = !isGroup && (selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false);

    const newPkt: DtnPacketSim = {
      id: `pkt-folder-${Date.now()}`,
      source: identityHandle,
      destination: isGroup ? selectedGroup.name : selectedPeer.handle,
      preview: `📂 [Entire Folder]: "${folderName}" (${files.length} files • ${sizeMb} MB • Tap to Explore)`,
      createdAt: Date.now(),
      hopsLeft: 6,
      isUrgent: false,
      status: isPeerUnavailable ? 'STORED_IN_ROOM_DB' : 'DELIVERED',
      relayToken: 'FOLDER-SWARM',
      groupId: isGroup ? selectedGroup.id : undefined
    };
    setDtnPackets(prev => [...prev, newPkt]);
    onLogEvent(
      'PhoneStorage',
      `Bundled & ${isPeerUnavailable ? 'queued in local Room DB for offline peer' : 'transmitted'} whole directory "${folderName}" (${files.length} files, ${sizeMb} MB) over mesh DTN.`,
      'success'
    );
    setShowFileUploadModal(false);
  };

  // Toggle Radio Status helper
  const handleToggleRadio = (key: keyof RadioStatus) => {
    const nextVal = !radioStatus[key];
    setRadioStatus(prev => ({ ...prev, [key]: !prev[key] }));
    onLogEvent('RadioManager', `Toggled ${String(key)}: ${nextVal ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  // Enable All Needed Radios
  const handleEnableAllRadios = () => {
    setRadioStatus(prev => ({
      ...prev,
      bluetoothEnabled: true,
      locationServicesEnabled: true,
      wifiMeshEnabled: true
    }));
    setHotspotEnabled(true);
    setDismissedConnectionBanner(false);
    playFriendlyTone(987, 0.12);
    // Opportunistically flush queued Room DB packets to DELIVERED
    setDtnPackets(prev => prev.map(p => p.status === 'STORED_IN_ROOM_DB' ? { ...p, status: 'DELIVERED' } : p));
    onLogEvent('MeshRadio', 'All required hardware radios activated (Bluetooth, Wi-Fi, Hotspot, Location). Queued packets dispatched over mesh.', 'success');
  };

  // Group Updates from QR / Admin actions
  const handleUpdateGroup = (updatedGroup: MeshGroupSim) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    if (selectedGroup.id === updatedGroup.id) {
      setSelectedGroup(updatedGroup);
    }
  };

  // Select peer by handle from QR or Radar
  const handleSelectPeerByHandle = (handle: string) => {
    let peer = peers.find(p => p.handle.toLowerCase() === handle.toLowerCase());
    if (!peer) {
      peer = {
        id: `peer-${Date.now()}`,
        handle: handle.startsWith('@') ? handle : handle,
        transports: ['BLE_MESH', 'WIFI_DIRECT'],
        activeTransport: 'BLE_MESH',
        rssiDbm: -70,
        hopCount: 1,
        distanceMeters: 14,
        angleDeg: 45,
        publicKeyHex: `04${handle.slice(-6)}a1b2c3d4e5f6`,
        lastSeenSecAgo: 1,
        isRelayNode: false
      };
      setPeers(prev => [peer!, ...prev]);
    }
    setSelectedPeer(peer);
    setChatType('direct');
    setDirectChatTarget('peer');
    setActiveTab('chats');
  };

  // Select group by ID from QR scan
  const handleSelectGroupById = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setChatType('groups');
      setActiveTab('chats');
    }
  };

  // Trigger GitHub Private Sync
  const handleTriggerGitHubSync = () => {
    const result = syncBufferedPacketsToGitHub(bufferedPrivatePackets, true);
    setBufferedPrivatePackets(result.syncedQueue);
    onLogEvent(
      'GitHubBridge',
      `Synchronized ${result.syncedCount} offline packets to private GitHub rendezvous repo. Awaiting recipient delivery receipt.`,
      'success'
    );
  };

  // Transmit Ultrasound
  const handleTransmitUltrasound = () => {
    setUltrasoundState('TRANSMITTING');
    playFriendlyTone(980, 0.2);
    onLogEvent('UltrasoundAcoustic', 'Emitting 18.5kHz-19.6kHz inaudible ultrasonic chirp via phone speaker...', 'info');

    const encoded = encodeUltrasoundFrequencies(ultrasoundPayload);

    setTimeout(() => {
      setUltrasoundState('SUCCESS');
      const decoded = decodeUltrasoundFrequencies(encoded.frequencies);
      setUltrasoundDecoded(decoded.payload);
      playFriendlyTone(1200, 0.12);
      onLogEvent('UltrasoundAcoustic', `Ultrasound packet decoded successfully: "${decoded.payload}" via microphone!`, 'success');
    }, 1800);
  };

  // Download Modular Dynamic Feature
  const handleDownloadDynamicFeature = (moduleId: string) => {
    setDownloadingModuleId(moduleId);
    const mod = featureModules.find(m => m.id === moduleId);
    if (!mod) return;
    onLogEvent('DynamicFeatures', `Downloading split module "${mod.name}" (${mod.sizeKb} KB) from peer over Wi-Fi Aware.`, 'info');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 34;
      setFeatureModules(prev =>
        prev.map(m => (m.id === moduleId ? { ...m, downloadProgressPct: Math.min(100, progress) } : m))
      );

      if (progress >= 100) {
        clearInterval(interval);
        const result = installFeatureModule(featureModules, moduleId);
        setFeatureModules(result.updatedModules);
        setDownloadingModuleId(null);
        playFriendlyTone(880, 0.15);
        onLogEvent('DynamicFeatures', `Module "${mod.name}" dynamically loaded into runtime! Verified with Master Key signature.`, 'success');
      }
    }, 220);
  };

  // User Customization: Toggle tab in bottom dock
  const toggleTabInBottomNav = (tabId: TabId) => {
    if (enabledTabs.includes(tabId)) {
      if (enabledTabs.length <= 1) return;
      const next = enabledTabs.filter(t => t !== tabId);
      setEnabledTabs(next);
      if (activeTab === tabId) setActiveTab(next[0]);
    } else {
      setEnabledTabs([...enabledTabs, tabId]);
    }
  };

  // Panic Wipe Handler
  const handleExecutePanic = () => {
    setIsWiped(true);
    setShowPanicModal(false);
    setDtnPackets([]);
    setSavedNotes([]);
    setMediaStorage({});
    setBufferedPrivatePackets([]);
    onLogEvent('SecurityPanic', 'EMERGENCY ZEROIZATION: All local messages, keys, and cached media permanently wiped.', 'error');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* PHONE FRAME SHELL */}
      <div className="relative flex flex-col h-full bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* 1. AUTHENTIC SLIM ANDROID STATUS BAR: Time, Speed, VoLTE, 4G/3G Cellular, Wi-Fi, Battery */}
        <div className="px-2.5 py-0.5 bg-slate-950 border-b border-slate-900/60 flex items-center justify-between text-[9px] text-slate-400 font-mono z-30 leading-none">
          {/* Left: Time & Data Speed */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-200">12:30</span>
            <span className="text-[8px] text-slate-400 font-mono hidden sm:inline">104 KB/s</span>
          </div>

          {/* Right: VoLTE, Cellular 4G/3G, Wi-Fi, Battery */}
          <div className="flex items-center gap-1.5 text-[9px]">
            {/* VoLTE Badge */}
            <span className="text-[7.5px] font-bold text-slate-300 font-mono border border-slate-700/80 rounded px-0.5 leading-none">
              VoLTE
            </span>
            {/* Cellular 4G LTE Indicator */}
            <div className="flex items-center gap-0.5 text-slate-200" title="Cellular 4G LTE Active">
              <Signal className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-[8px] font-bold font-mono">4G</span>
            </div>
            {/* Wi-Fi Mesh Indicator */}
            <span title="Wi-Fi Aware & Direct Mesh Active">
              <Wifi className="h-2.5 w-2.5 text-emerald-400" />
            </span>
            {/* Battery Indicator */}
            <div className="flex items-center gap-0.5 text-emerald-400 font-mono">
              <span>{batteryPct}%</span>
              <Battery className="h-2.5 w-2.5 inline" />
            </div>
          </div>
        </div>

        {/* 2. ULTRA-SLIM TOP ACTION BAR: Identity & Omni-Search */}
        <div className="px-2.5 py-1 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between z-20 shadow-sm text-xs">
          {/* Left: User Node Avatar, Handle & Signal */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 text-left hover:opacity-85 transition-opacity"
            title="Click to view hardware identity or switch node"
          >
            <div className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono shadow-sm">
              {identityHandle.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-white font-mono leading-none">{identityHandle}</span>
              {isSuperAdmin && (
                <span className="text-[7.5px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold leading-none animate-pulse">
                  SUPER ADMIN
                </span>
              )}
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold leading-none">
                {rssiToSignalPercentage(-65)}% 📶
              </span>
            </div>
          </button>

          {/* Right: Super Admin Tools (Only for Super Admin) & Universal OmniSearch Button */}
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
            {isSuperAdmin && (
              <button
                onClick={() => setShowMasterAdminModal(true)}
                title="Super Admin Master Governance Console (Restricted to qaidi1561561)"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/50 shadow-sm transition-all font-bold text-[9px]"
              >
                <ShieldCheck className="h-3 w-3 text-amber-400 animate-pulse" />
                <span>Admin Tools</span>
              </button>
            )}
            <button
              onClick={() => setShowUserSearchModal(true)}
              title="Omni-Search: Users, Groups, Videos, Tools & Waitlists"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
            >
              <Search className="h-3 w-3 text-emerald-400" />
              <span className="text-[9px] font-sans">Search</span>
            </button>
          </div>
        </div>

        {/* Active Global Emergency Broadcast Banner */}
        {activeEmergencyBroadcast && (
          <div className="px-3 py-2 bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-b border-rose-500 flex items-start justify-between text-xs text-rose-100 z-30 animate-in slide-in-from-top-2 shadow-xl">
            <div className="flex items-start gap-2 flex-1">
              <Radio className="h-4 w-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[10px] uppercase bg-rose-600 text-white px-1.5 py-0.2 rounded font-mono">
                    GLOBAL EMERGENCY BROADCAST
                  </span>
                  <span className="text-[10px] font-mono text-rose-300">
                    HIGH PRIORITY • {activeEmergencyBroadcast.nodesAcknowledged.length} NODES ACK
                  </span>
                </div>
                <p className="text-[11px] text-rose-100 font-medium mt-0.5 leading-snug">
                  {activeEmergencyBroadcast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveEmergencyBroadcast(null)}
              className="text-rose-300 hover:text-white p-1 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Islamic Law Content Blocked Alert Banner */}
        {islamicLawAlert && (
          <div className="px-3 py-2 bg-rose-950/90 border-b border-rose-500/60 flex items-start gap-2 text-xs text-rose-200 animate-in slide-in-from-top-2 z-20">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white block">Islamic Law Content Moderation</span>
              <p className="text-[11px] leading-snug">{islamicLawAlert}</p>
            </div>
            <button onClick={() => setIslamicLawAlert(null)} className="text-rose-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Rain Alert Banner (if active) */}
        {activeRainAlerts.length > 0 && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border-b border-amber-500/40 flex items-center justify-between text-xs animate-in fade-in">
            <div onClick={() => setShowWeatherModal(true)} className="flex items-center gap-2 cursor-pointer flex-1">
              <CloudLightning className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-[11px] text-amber-200 font-semibold truncate">
                Severe Rain Warning: 3.6 hPa drop detected. High thunderstorm probability.
              </span>
            </div>
            <button
              onClick={() => setDismissedAlertIds(prev => [...prev, activeRainAlerts[0].id])}
              className="text-amber-400 hover:text-white p-1 ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Connection Setup Prompt: Ask users to turn on Bluetooth, Wi-Fi, Hotspot, and Location */}
        {(!radioStatus.bluetoothEnabled || !radioStatus.wifiMeshEnabled || !radioStatus.locationServicesEnabled || !hotspotEnabled) && !dismissedConnectionBanner && (
          <div className="px-2.5 py-1.5 bg-gradient-to-r from-amber-950/90 via-emerald-950/80 to-slate-900 border-b border-amber-500/40 flex items-center justify-between text-xs z-20 animate-in slide-in-from-top-1">
            <div
              onClick={() => setShowConnectionAssistantModal(true)}
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-amber-300 block leading-tight">
                  Enable Radios to Connect
                </span>
                <span className="text-[8.5px] text-slate-300 leading-none">
                  Turn on Bluetooth, Wi-Fi, Hotspot & Location to form off-grid connection
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                onClick={() => setShowConnectionAssistantModal(true)}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9.5px]"
              >
                Turn On
              </button>
              <button
                onClick={() => setDismissedConnectionBanner(true)}
                className="text-slate-400 hover:text-white p-0.5 text-xs"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY VIEW CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-950 relative flex flex-col">
          {isWiped ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                <Trash2 className="h-7 w-7" />
              </div>
              <h2 className="text-sm font-bold text-rose-300">Data Cleared Permanently</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                All local chats, keys, and media files have been securely zeroized.
              </p>
              <button
                onClick={() => {
                  setIsWiped(false);
                  setSeedPhrase(generateSeedPhrase(0.5));
                }}
                className="py-2 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950"
              >
                Re-initialize Fresh Profile
              </button>
            </div>
          ) : activeTab === 'chats' ? (
            /* ================= TAB 1: WHATSAPP-GRADE CHATS & GROUPS ================= */
            <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-hidden">
              {/* WhatsApp-Style Switcher: ONLY GROUPS & DIRECT CHATS (Notes are inside Message Yourself!) */}
              <div className="flex rounded-lg bg-[#031d16] p-1 border border-[#063f2f]">
                <button
                  onClick={() => setChatType('groups')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                    chatType === 'groups'
                      ? 'bg-emerald-600 text-slate-950 font-bold'
                      : 'text-emerald-400/70 hover:text-emerald-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Groups ({groups.length})</span>
                </button>
                <button
                  onClick={() => setChatType('direct')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                    chatType === 'direct'
                      ? 'bg-emerald-600 text-slate-950 font-bold'
                      : 'text-emerald-400/70 hover:text-emerald-200'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Direct Chats</span>
                </button>
              </div>

              {/* Quick Actions Strip: Nearby Discovery Radar & QR Code Hub */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowNearbyDiscoveryModal(true)}
                  className="py-1 px-2.5 rounded-lg bg-[#04281e] hover:bg-[#06382a] border border-emerald-500/30 text-[10.5px] text-emerald-300 font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  title="Discover nearby BLE & Wi-Fi mesh peers on 360° radar"
                >
                  <Radar className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Nearby Radar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrCodeModal(true)}
                  className="py-1 px-2.5 rounded-lg bg-[#04281e] hover:bg-[#06382a] border border-emerald-500/30 text-[10.5px] text-emerald-300 font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  title="Share or scan QR codes to add users and groups"
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                  <span>QR Add & Scan</span>
                </button>
              </div>

              {/* Chat Thread Header: Groups */}
              {chatType === 'groups' && (
                <div className="p-2.5 rounded-lg bg-[#031d16] border border-[#063f2f] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{selectedGroup.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">({selectedGroup.id})</span>
                    </h4>
                    <p className="text-[10px] text-emerald-400/80">
                      {selectedGroup.members.length} members • {selectedGroup.onlyAdminsCanPost ? 'Admins only' : 'Everyone can post'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Free Group Creation Button */}
                    <button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="px-2 py-1 rounded bg-[#042a20] hover:bg-[#063f2f] text-[10px] text-emerald-300 border border-[#095741] font-bold flex items-center gap-1"
                      title="Create a new mesh group freely"
                    >
                      <Plus className="h-3 w-3 text-emerald-400" />
                      <span>New Group</span>
                    </button>

                    {/* QR Code & Admin Join Requests */}
                    <button
                      onClick={() => setShowQrCodeModal(true)}
                      className="relative px-2 py-1 rounded bg-[#042a20] hover:bg-[#063f2f] text-[10px] text-emerald-300 border border-[#095741] font-semibold flex items-center gap-1"
                      title="Manage Group QR Code & Pending Join Requests"
                    >
                      <QrCode className="h-3 w-3 text-emerald-400" />
                      <span>QR & Admin</span>
                      {(selectedGroup.pendingJoinRequests?.length ?? 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[8.5px] animate-pulse">
                          {selectedGroup.pendingJoinRequests?.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setShowGroupSettingsModal(true)}
                      className="px-2 py-1 rounded bg-[#042a20] hover:bg-[#063f2f] text-[10px] text-emerald-300 border border-[#095741] font-semibold"
                    >
                      Permissions
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Thread Header: Direct Chats with PINNED "Message Yourself (Notes)" */}
              {chatType === 'direct' && (
                <div className="space-y-1.5">
                  {/* Pinned "Message Yourself (Notes & Vault)" */}
                  <div
                    onClick={() => setDirectChatTarget('self')}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      directChatTarget === 'self'
                        ? 'bg-[#042d22] border-emerald-500 shadow-md'
                        : 'bg-[#031d16] border-[#063f2f] hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                        <Bookmark className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">Message Yourself</span>
                          <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                            Notes Vault
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-400/80 block">Personal saved notes, audio memos & reminders</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/70">
                      {savedNotes.length} notes
                    </span>
                  </div>

                  {/* Active Peer Card */}
                  <div
                    onClick={() => setDirectChatTarget('peer')}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      directChatTarget === 'peer'
                        ? 'bg-[#042d22] border-emerald-500 shadow-md'
                        : 'bg-[#031d16] border-[#063f2f] hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#042a20] border border-[#095741] flex items-center justify-center text-xs font-bold text-emerald-300 font-mono">
                        {selectedPeer.handle.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white font-mono">{selectedPeer.handle}</h4>
                          {privateNicknames[selectedPeer.handle] && (
                            <span className="text-[9px] px-1.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              {privateNicknames[selectedPeer.handle]}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-400/80">
                          {getEffectivePeerDisplayName(selectedPeer.handle, selectedPeer.handle, privateNicknames)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {selectedPeer.status === 'OFFLINE' || selectedPeer.isReachable === false ? (
                            <span className="text-[8.5px] text-amber-300 font-semibold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              Offline / Out of Range • Store-and-Forward Active
                            </span>
                          ) : (
                            <span className="text-[8.5px] text-emerald-300 font-medium flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                              Reachable • {selectedPeer.activeTransport} ({selectedPeer.distanceMeters}m)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTempNicknameValue(privateNicknames[selectedPeer.handle] || '');
                          setShowNicknameModal(true);
                        }}
                        title="Set Private Local Nickname"
                        className="p-1 rounded bg-[#042a20] hover:bg-[#063f2f] text-emerald-300 border border-[#095741] text-[10px]"
                      >
                        <Tag className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserSearchModal(true);
                        }}
                        className="px-2 py-0.5 rounded bg-[#042a20] hover:bg-[#063f2f] text-[10px] text-emerald-300 border border-[#095741] font-semibold"
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Auto-Translate Strip */}
              {chatType === 'direct' && directChatTarget === 'peer' && (
                <div className="px-2 py-1 rounded bg-[#031d16] border border-[#053124] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Languages className="h-3 w-3" />
                    <span>Region: Pakistan (Urdu translation)</span>
                  </div>
                  <button
                    onClick={() => setAutoTranslateEnabled(!autoTranslateEnabled)}
                    className={`px-1.5 py-0.5 rounded font-mono ${
                      autoTranslateEnabled
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#042a20] text-emerald-500/70 border border-[#063f2f]'
                    }`}
                  >
                    {autoTranslateEnabled ? 'Auto-Translate: ON' : 'Tap to Translate'}
                  </button>
                </div>
              )}

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-2 p-1">
                {chatType === 'direct' && directChatTarget === 'self' ? (
                  /* Render Saved Notes inside Message Yourself */
                  savedNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#031d16] border border-[#063f2f] text-xs text-emerald-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                        <span className="flex items-center gap-1 font-bold">
                          <Bookmark className="h-3 w-3 text-emerald-400" />
                          <span>Personal Note #{savedNotes.length - idx}</span>
                        </span>
                        <span>Saved Locally in Phone</span>
                      </div>
                      <p className="leading-relaxed text-emerald-100">{note}</p>
                    </div>
                  ))
                ) : (
                  dtnPackets
                    .filter(pkt => chatType === 'groups' ? pkt.groupId === selectedGroup.id : !pkt.groupId)
                    .map((pkt, msgIdx) => {
                      const isSelf = pkt.source === identityHandle;
                      const hasTranslation = translatedMessages[pkt.id];
                      const isAudioOrVoice = pkt.preview.includes('Audio') || pkt.preview.includes('Voice Note') || pkt.preview.includes('.mp3') || pkt.preview.includes('.wav');
                      const isPhoto = pkt.preview.includes('Photo') || pkt.preview.includes('.jpg') || pkt.preview.includes('.png');
                      const isFolder = pkt.preview.includes('Folder');
                      return (
                        <React.Fragment key={pkt.id}>
                          {/* Native Ad card between chat messages every 3 messages */}
                          {msgIdx > 0 && msgIdx % 3 === 0 && (
                            <NativeAdCard
                              adIndex={msgIdx}
                              variant="chat"
                              onLogEvent={onLogEvent}
                              onAdRevenueGained={(val) => setSolarLoraFundRaised(prev => +(prev + val).toFixed(2))}
                            />
                          )}

                          <div
                            className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] p-2.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                                isSelf
                                  ? 'bg-[#042d22] border-[#095e46] text-emerald-50'
                                  : 'bg-[#031d16] border-[#063f2f] text-emerald-100'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[10px] text-emerald-400/80">
                                <span className="font-mono font-bold text-emerald-300">
                                  {privateNicknames[pkt.source] ? `${privateNicknames[pkt.source]} (${pkt.source})` : pkt.source}
                                </span>
                                <span className="font-mono text-[9px]">{pkt.relayToken}</span>
                              </div>

                              <p>{pkt.preview}</p>

                              {/* In-App Playable Audio / Voice Note Player */}
                              {isAudioOrVoice && (
                                <div className="mt-1.5 p-2 rounded-lg bg-black/60 border border-emerald-500/40 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setActiveAudioModal({
                                        title: pkt.preview.replace(/^[^\w]+/, ''),
                                        durationSec: 120,
                                        isPlaying: true,
                                        isVoiceNote: pkt.preview.includes('Voice')
                                      })}
                                      className="h-6 w-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow"
                                    >
                                      <Play className="h-3 w-3 fill-slate-950 translate-x-0.2" />
                                    </button>
                                    <span className="text-[10px] text-emerald-300 font-mono font-semibold">Play Audio</span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono">In-App</span>
                                </div>
                              )}

                              {/* In-App Photo View Button */}
                              {isPhoto && (
                                <div className="mt-1.5 p-1.5 rounded-lg bg-black/60 border border-emerald-500/40 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-300">Attached Photo</span>
                                  <button
                                    type="button"
                                    onClick={() => setActivePhotoModal({
                                      title: pkt.preview.replace(/^[^\w]+/, ''),
                                      sizeMb: 1.4
                                    })}
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <ImageIcon className="h-2.5 w-2.5" />
                                    <span>View Photo</span>
                                  </button>
                                </div>
                              )}

                              {/* In-App Folder Explorer Button */}
                              {isFolder && (
                                <div className="mt-1.5 p-1.5 rounded-lg bg-black/60 border border-amber-500/40 flex items-center justify-between">
                                  <span className="text-[10px] text-amber-300">Directory Bundle</span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveFolderModal({
                                      folderName: 'Shared_Directory_Bundle',
                                      filesCount: 8,
                                      sizeMb: 4.8
                                    })}
                                    className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <Folder className="h-2.5 w-2.5" />
                                    <span>Explore</span>
                                  </button>
                                </div>
                              )}

                            {/* Translation display for incoming peer messages */}
                            {!isSelf && (
                              <div className="pt-1 border-t border-[#063f2f] text-[10px]">
                                {autoTranslateEnabled || hasTranslation ? (
                                  <div className="text-emerald-300/90 italic font-sans">
                                    <span className="text-[9px] text-emerald-400 font-mono not-italic mr-1">
                                      [Urdu]:
                                    </span>
                                    {hasTranslation || translateMessageOffline(pkt.preview, targetLangCode).translatedText}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleTranslateMessage(pkt.id, pkt.preview)}
                                    className="text-[9px] text-emerald-400 hover:text-white flex items-center gap-1 font-mono"
                                  >
                                    <Languages className="h-2.5 w-2.5" />
                                    <span>Translate to Urdu</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Video Attachment with Download */}
                            {pkt.videoAttachment && (
                              <div className="mt-2 p-2 rounded-lg bg-black/60 border border-[#063f2f] space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[11px] text-white truncate">
                                    {pkt.videoAttachment.title}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    {pkt.videoAttachment.sizeMb} MB
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-[#063f2f]">
                                  <button
                                    onClick={() => setActiveVideoModal(pkt.videoAttachment || null)}
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <Play className="h-2.5 w-2.5 fill-slate-950" />
                                    <span>Play Video</span>
                                  </button>
                                  <button
                                    onClick={() => onLogEvent('MediaDownload', `Saved ${pkt.videoAttachment?.title} locally.`, 'success')}
                                    className="px-2 py-0.5 rounded bg-[#042a20] hover:bg-[#063f2f] text-emerald-300 text-[10px] flex items-center gap-1"
                                  >
                                    <Download className="h-2.5 w-2.5" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Delivery checkmarks with interactive hop forwarding */}
                            <div className="flex items-center justify-end gap-1.5 text-[9px] text-emerald-400/80 pt-0.5">
                              {pkt.status === 'DELIVERED' ? (
                                <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                                  <CheckCheck className="h-3 w-3" /> Delivered
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-amber-300 flex items-center gap-0.5 font-medium">
                                    <Clock className="h-3 w-3 animate-spin text-amber-400" /> Queued in Room DB
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDtnPackets(prev => prev.map(p => p.id === pkt.id ? { ...p, status: 'DELIVERED' } : p));
                                      playFriendlyTone(880, 0.12);
                                      onLogEvent('MeshHopRelay', `Delivered queued packet ${pkt.id} to ${pkt.destination} via opportunistic mesh hop.`, 'success');
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[8.5px] font-bold flex items-center gap-0.5 transition-colors"
                                    title="Simulate peer coming into range or intermediate hop forwarding packet"
                                  >
                                    <Zap className="h-2.5 w-2.5 text-amber-400" />
                                    <span>Hop Deliver</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Chat Composer Bar with PROMINENT Video / File Upload Button */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-[#063f2f] flex items-center gap-1.5">
                {/* PROMINENT FILE / VIDEO UPLOAD BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowFileUploadModal(true)}
                  className="p-2 rounded-lg bg-[#042a20] hover:bg-[#063f2f] text-emerald-300 border border-[#095741] transition-colors"
                  title="Upload Video, Photo, or File"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder={
                    chatType === 'direct' && directChatTarget === 'self'
                      ? 'Type note to message yourself...'
                      : canPostInGroup
                      ? 'Type encrypted message...'
                      : 'Only admins can send messages'
                  }
                  disabled={chatType === 'groups' && !canPostInGroup}
                  className="flex-1 rounded-lg bg-[#031d16] border border-[#063f2f] px-3 py-2 text-xs text-white placeholder-emerald-500/40 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />

                {/* Voice Note Button (Hold / Click to Record) */}
                <button
                  type="button"
                  onMouseDown={handleStartVoiceRecording}
                  onMouseUp={handleStopAndSendVoiceNote}
                  onTouchStart={handleStartVoiceRecording}
                  onTouchEnd={handleStopAndSendVoiceNote}
                  className={`p-2 rounded-lg border transition-all ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                      : 'bg-[#042a20] hover:bg-[#063f2f] text-emerald-300 border-[#095741]'
                  }`}
                  title="Hold to Record Voice Note"
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  disabled={!chatText.trim() || (chatType === 'groups' && !canPostInGroup)}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : activeTab === 'social' ? (
            /* ================= TAB 2: SOCIAL WALL & REELS & YOUTUBE ================= */
            <SocialAndReelsView
              currentHandle={identityHandle}
              isOnline={radioStatus.wifiInternetActive || isOnline}
              onLogEvent={onLogEvent}
              onDownloadFile={(name, size) => {
                storeOrReferenceMediaBlob(mediaStorage, name, name, size, 'H264_VIDEO_OPTIMIZED');
                onLogEvent('ZeroDupStorage', `Downloaded ${name} (${Math.round(size / (1024 * 1024))}MB) into local zero-duplication store.`, 'success');
              }}
              onShareToChat={(text, mediaType, mediaTitle) => {
                const newPkt: DtnPacketSim = {
                  id: `pkt-yt-${Date.now()}`,
                  source: identityHandle,
                  destination: chatType === 'groups' ? selectedGroup.name : selectedPeer.handle,
                  preview: text,
                  createdAt: Date.now(),
                  hopsLeft: 6,
                  isUrgent: false,
                  status: 'DELIVERED',
                  relayToken: 'DIRECT-SHARE',
                  groupId: chatType === 'groups' ? selectedGroup.id : undefined,
                  videoAttachment: mediaType === 'VIDEO' ? {
                    videoId: `v-yt-${Date.now()}`,
                    title: mediaTitle || 'YouTube Guide',
                    durationSec: 420,
                    sizeMb: 14.5,
                    totalChunks: 20,
                    cachedChunks: 20,
                    merkleRoot: '0x' + Math.random().toString(16).slice(2, 10)
                  } : undefined
                };
                setDtnPackets(prev => [...prev, newPkt]);
                setActiveTab('chats');
                onLogEvent('YouTubeShare', `Video shared to Mesh Chat: "${mediaTitle || text}"`, 'success');
              }}
              onShareToNotice={(title, content, _category) => {
                setEmergencyNoticeFromBroadcast({
                  id: `notice-yt-${Date.now()}`,
                  title,
                  category: 'COMMUNITY_ANNOUNCEMENT',
                  createdAtText: 'Just now • Shared from YouTube Feed',
                  author: identityHandle,
                  summary: title,
                  content: [
                    `Shared Video Guide: ${title}`,
                    `Details: ${content}`,
                    'Verified for community mesh distribution and offline education.'
                  ],
                  tags: ['YouTube', 'Video Guide', 'Mesh Share'],
                  downloadSizeBytes: 1024 * 512,
                  isPinned: false,
                  isOfflineCached: true
                });
                setActiveTab('notice');
                onLogEvent('NoticeBoard', `Posted video guide to Notice Board: "${title}"`, 'success');
              }}
            />
          ) : activeTab === 'radio' ? (
            /* ================= TAB 3: SDR SPEAKER RADIO ================= */
            <SdrSpeakerRadioView onLogEvent={onLogEvent} />
          ) : activeTab === 'qibla' ? (
            /* ================= TAB 4: QIBLA & CAMPUS & SATELLITE MAP ================= */
            <QiblaAndCampusView onLogEvent={onLogEvent} />
          ) : (activeTab === 'guides' || activeTab === 'notice') ? (
            /* ================= TAB 5: NOTICE BOARD & TACTICAL ACADEMY ================= */
            <NoticeBoardView
              currentHandle={identityHandle}
              isSuperAdmin={isSuperAdmin}
              externalEmergencyNotice={emergencyNoticeFromBroadcast}
              onBroadcastPushNotification={(title, summary) => {
                handleTriggerGlobalEmergencyBroadcast(`${title} - ${summary}`);
              }}
              onLogEvent={onLogEvent}
              onDownloadNotice={(title, size) => onLogEvent('NoticeBoard', `Saved notice "${title}" for offline reading.`, 'success')}
            />
          ) : activeTab === 'signal' ? (
            /* ================= TAB: SIGNAL STRENGTH & TOPOLOGY ================= */
            <SignalStrengthVisualizer
              peers={peers}
              onLogEvent={onLogEvent}
            />
          ) : activeTab === 'call' ? (
            /* ================= TAB 6: MULTI-CHANNEL PTT & LIVE 2-WAY GROUP CALL ================= */
            <div className="flex-1 p-3 flex flex-col justify-between space-y-3 overflow-y-auto">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <PhoneCall className="h-4 w-4 text-emerald-400" />
                    <span>Multi-Channel Audio PTT</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Full-Duplex Op Codec
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Listen to multiple group channels simultaneously in background. Hold PTT button to transmit to your active channel.
                </p>

                {/* Multi-Channel Listening Toggles */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Background Listening Channels:
                  </span>
                  {['#lahore-relief', '#protest-safety', '#campus-quad'].map((ch) => {
                    const isListening = backgroundListeningChannels.includes(ch);
                    const isTransmitActive = activePttChannel === ch;
                    return (
                      <div
                        key={ch}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                          isTransmitActive
                            ? 'bg-emerald-950/40 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className={`h-3.5 w-3.5 ${isListening ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="font-mono font-bold">{ch}</span>
                          {isTransmitActive && (
                            <span className="text-[9px] px-1.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                              Transmit Target
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setActivePttChannel(ch);
                              onLogEvent('PttVoice', `Active transmit target set to ${ch}`, 'info');
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-semibold"
                          >
                            Set Target
                          </button>
                          <button
                            onClick={() => {
                              setBackgroundListeningChannels(prev =>
                                isListening ? prev.filter(c => c !== ch) : [...prev, ch]
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isListening
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isListening ? 'Listening' : 'Muted'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Large Push-To-Talk Button */}
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <button
                  onMouseDown={() => {
                    setIsPttTransmitting(true);
                    playFriendlyTone(784, 0.1);
                    onLogEvent('PttVoice', `Transmitting live voice packet to ${activePttChannel}...`, 'success');
                  }}
                  onMouseUp={() => {
                    setIsPttTransmitting(false);
                    playFriendlyTone(440, 0.08);
                  }}
                  className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all shadow-2xl ${
                    isPttTransmitting
                      ? 'bg-rose-600 border-rose-400 text-white scale-95 shadow-rose-600/50'
                      : 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/40'
                  }`}
                >
                  <Mic className="h-10 w-10 mb-1" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {isPttTransmitting ? 'TRANSMITTING' : 'HOLD TO TALK'}
                  </span>
                  <span className="text-[10px] font-mono mt-0.5 opacity-80">{activePttChannel}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  Audio sent via Opus 16kbps over local Wi-Fi / BLE mesh
                </span>
              </div>
            </div>
          ) : activeTab === 'map' ? (
            /* ================= TAB 6: OFFLINE LOCAL SATELLITE VIEW MAP ================= */
            <OfflineSatelliteMapView onLogEvent={onLogEvent} />
          ) : null}
        </div>

        {/* BOTTOM DOCK NAVIGATION: Ultra-Slim, Minimalist, Max Screen Real Estate (No Hub Button) */}
        <div className="px-1 py-0.5 bg-slate-900/95 border-t border-slate-800/80 flex items-center justify-around z-20 backdrop-blur-md h-8">
          {enabledTabs.includes('chats') && (
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'chats' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Chats</span>
            </button>
          )}

          {enabledTabs.includes('social') && (
            <button
              onClick={() => setActiveTab('social')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'social' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Social</span>
            </button>
          )}

          {enabledTabs.includes('call') && (
            <button
              onClick={() => setActiveTab('call')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'call' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">PTT</span>
            </button>
          )}

          {enabledTabs.includes('map') && (
            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'map' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Map</span>
            </button>
          )}

          {enabledTabs.includes('radio') && (
            <button
              onClick={() => setActiveTab('radio')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'radio' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Radio</span>
            </button>
          )}

          {enabledTabs.includes('qibla') && (
            <button
              onClick={() => setActiveTab('qibla')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                activeTab === 'qibla' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Qibla</span>
            </button>
          )}

          {(enabledTabs.includes('guides') || enabledTabs.includes('notice')) && (
            <button
              onClick={() => setActiveTab('notice')}
              className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none ${
                (activeTab === 'notice' || activeTab === 'guides') ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="h-3 w-3" />
              <span className="text-[8px] tracking-tight mt-0.5">Notice</span>
            </button>
          )}

          {/* 3 Books Icon: Library & All Features Hub (Moved to Bottom Dock) */}
          <button
            onClick={() => setShowOtherFeaturesModal(true)}
            className="flex flex-col items-center justify-center py-0.5 px-1.5 rounded transition-all leading-none text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
            title="Library & All Features (📚 3 Books)"
          >
            <Library className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[8px] tracking-tight mt-0.5 font-bold">Library</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: SETTINGS & CUSTOMIZATION */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Settings & Customization</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Dock Tab Customization */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-emerald-400" /> Customize Bottom Bar Tabs
              </span>
              <p className="text-[10px] text-slate-400">Select what to keep in bottom dock; all others reside in 'Other Features':</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'chats' as TabId, label: '💬 Chats' },
                  { id: 'social' as TabId, label: '🎬 Social & Reels' },
                  { id: 'call' as TabId, label: '📞 PTT Call' },
                  { id: 'map' as TabId, label: '🛰️ Satellite Map' },
                  { id: 'radio' as TabId, label: '📻 Speaker Radio' },
                  { id: 'qibla' as TabId, label: '🧭 Qibla/Campus' },
                  { id: 'notice' as TabId, label: '📢 Notice Board' },
                  { id: 'signal' as TabId, label: '📶 Signal Quality' }
                ].map(item => {
                  const isChecked = enabledTabs.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleTabInBottomNav(item.id)}
                      className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                        isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Off-Grid Features & Tools Hub */}
            <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>All Features & Hardware Tools</span>
                </p>
                <p className="text-[10px] text-slate-400">USB OTG LoRa, Weather, Satellite, Hotspot</p>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowOtherFeaturesModal(true);
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold"
              >
                Open Hub
              </button>
            </div>

            {/* Smart Auto-App-Updater */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Smart Network-Aware Updater</p>
                <p className="text-[10px] text-slate-400">{appUpdateVersion}</p>
              </div>
              <button
                onClick={handleCheckForAppUpdate}
                disabled={isUpdatingApp}
                className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
              >
                {isUpdatingApp ? 'Updating...' : 'Check Update'}
              </button>
            </div>

            {/* Dynamic Features Store */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Dynamic Feature Modules</p>
                <p className="text-[10px] text-slate-400">Install features without updating app</p>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowFeatureStoreModal(true);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-bold border border-slate-700"
              >
                Features ({featureModules.filter(m => !m.isInstalled).length})
              </button>
            </div>

            {/* Offline Captive Portal Hotspot APK Share */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Wi-Fi Hotspot APK Share</p>
                <p className="text-[10px] text-slate-400">Auto sign-in page for friends</p>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowPortalModal(true);
                  setPortalGuestStep('DISCOVER');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-bold border border-slate-700"
              >
                Open
              </button>
            </div>

            {/* Ultrasound Acoustic Share */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Ultrasound Sound Wave Sharing</p>
                <p className="text-[10px] text-slate-400">18.5kHz-20kHz speaker transmission</p>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowUltrasoundModal(true);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-bold border border-slate-700"
              >
                Open
              </button>
            </div>

            {/* SUPER ADMIN DEVELOPER DASHBOARD (COMPLETELY INVISIBLE UNLESS LOGGED IN AS qaidi1561561!) */}
            {isSuperAdmin && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">
                    Master Governance Control
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 font-bold">
                    qaidi1561561
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/80 leading-relaxed">
                  Stealth admin control: completely invisible to regular users so the network is perceived as free and decentralized.
                </p>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowMasterAdminModal(true);
                  }}
                  className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Open Governance Dashboard
                </button>
              </div>
            )}

            {/* Security PIN & Change PIN Feature */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    <span>App Security PIN</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Current PIN: •••• ({appSecurityPin})</p>
                </div>
                <button
                  onClick={() => {
                    setPinChangeMsg(null);
                    setCurrentPinAttempt('');
                    setNewPinCandidate('');
                    setConfirmPinCandidate('');
                    setShowPinChangeModal(true);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                >
                  Change PIN
                </button>
              </div>
            </div>

            {/* Stealth App Disguise Feature */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-purple-400" />
                  <span>App Stealth Disguise</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300">
                  {disguiseStyle}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Disguise the entire app as an innocent dark Calculator or daily Notepad. Enter PIN <span className="font-mono text-purple-300 font-bold">"{appSecurityPin}"</span> followed by '=' to instantly reveal.
              </p>
              <div className="flex gap-2 pt-1">
                <select
                  value={disguiseStyle}
                  onChange={(e) => setDisguiseStyle(e.target.value as any)}
                  className="flex-1 rounded bg-slate-900 border border-slate-800 text-xs text-white px-2 py-1"
                >
                  <option value="CALCULATOR">Functional Calculator Disguise</option>
                  <option value="NOTEPAD">Notepad Grocery Disguise</option>
                </select>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setIsAppDisguised(true);
                    setIsDisguiseUnlocked(false);
                    onLogEvent('AppDisguise', `Activated ${disguiseStyle} stealth disguise. Type PIN followed by '=' to reveal.`, 'warn');
                  }}
                  className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  Disguise App
                </button>
              </div>
            </div>

            {/* 12-Word Recovery Phrase */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">12-Word Recovery Phrase</p>
                <p className="text-[10px] text-slate-400">BIP-39 identity backup</p>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowSeedModal(true);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-bold border border-slate-700"
              >
                View
              </button>
            </div>

            {/* Panic Wipe */}
            <button
              onClick={() => {
                setShowSettingsModal(false);
                setShowPanicModal(true);
              }}
              className="w-full py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors"
            >
              Emergency Instant Wipe
            </button>
          </div>
        </div>
      )}

      {/* EXCLUSIVE SUPER ADMIN TOOLS SUITE (qaidi1561561 only!) */}
      <SuperAdminConsoleModal
        isOpen={showMasterAdminModal}
        onClose={() => setShowMasterAdminModal(false)}
        currentHandle={identityHandle}
        isSuperAdmin={isSuperAdmin}
        dtnPackets={dtnPackets}
        onPurgePackets={(packetIds) => {
          if (packetIds && packetIds.length > 0) {
            setDtnPackets(prev => prev.filter(p => !packetIds.includes(p.id)));
          } else {
            setDtnPackets(prev => prev.slice(0, 3));
          }
          onLogEvent('SuperAdmin', 'Purged DTN packet swarm buffers.', 'info');
        }}
        groups={groups}
        peers={peers}
        solarLoraFundRaised={solarLoraFundRaised}
        onAddSolarFund={(amount) => {
          setSolarLoraFundRaised(prev => +(prev + amount).toFixed(2));
          playFriendlyTone(880, 0.15);
          onLogEvent('SuperAdmin', `Added $${amount.toFixed(2)} to Solar LoRa Repeater treasury fund.`, 'success');
        }}
        activeCityLockdown={activeCityLockdown}
        onSetCityLockdown={(city) => {
          setActiveCityLockdown(city);
          if (city) {
            setIsDisguiseUnlocked(false);
          }
        }}
        onTriggerGlobalBroadcast={(msg, _sev) => {
          handleTriggerGlobalEmergencyBroadcast(msg);
        }}
        delegatedAdmins={delegatedAdmins}
        onUpdateDelegatedAdmins={(admins) => setDelegatedAdmins(admins)}
        onLogEvent={onLogEvent}
      />

      {/* MODAL: 3 BOOKS ICON - LIBRARY & ALL FEATURES HUB (CONSOLIDATED SETTINGS & TOOLS) */}
      {showOtherFeaturesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Library & All Features (📚 3 Books)</h3>
              </div>
              <button onClick={() => setShowOtherFeaturesModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              All settings, hardware bridges, and emergency tools unified under the 3 Books Library.
            </p>

            {/* SUPER ADMIN TOOLS (EXCLUSIVE TO SUPER ADMIN qaidi1561561) */}
            {isSuperAdmin ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border-2 border-amber-500/60 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span>SUPER ADMIN CONSOLE</span>
                  </div>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
                    qaidi1561561 ONLY
                  </span>
                </div>
                <p className="text-[10px] text-amber-100/90 leading-snug">
                  Full sovereign governance: Network emergency alerts, node blacklisting, regional lockdowns, packet sniffer, and LoRa frequency hopping.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtherFeaturesModal(false);
                    setShowMasterAdminModal(true);
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <ShieldCheck className="h-3.5 w-3.5 fill-slate-950" />
                  <span>Launch Super Admin Tools</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <div>
                    <span className="text-[10.5px] font-semibold text-slate-300 block">Super Admin Tools</span>
                    <span className="text-[9px] text-slate-500">Restricted exclusively to super admin @qaidi1561561</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtherFeaturesModal(false);
                    setShowAuthModal(true);
                  }}
                  className="text-[9.5px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono font-bold"
                >
                  Super Admin Auth
                </button>
              </div>
            )}

            {/* Solar LoRa Hardware Fund Banner */}
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-950/40 to-emerald-950/40 border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white text-[11px] block">Solar LoRa Repeater Fund</span>
                  <span className="text-[10px] text-amber-300 font-mono">${solarLoraFundRaised.toFixed(2)} / $45.00 goal</span>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
                100% Ad Funded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* USB OTG Universal Serial LoRa Bridge */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowUsbOtgModal(true);
                }}
                className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/50 flex flex-col items-start gap-1 text-left transition-colors col-span-2 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span>USB OTG Hardware Bridge</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-100 font-mono">CH340/CP2102/FTDI</span>
                </div>
                <span className="text-[10px] text-slate-300">Auto-detect USB sticks, serial packet parsing & ACK retries</span>
              </button>


              {/* Security PIN Change Lock (Merged from Settings) */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowPinChangeModal(true);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">App Security PIN</span>
                <span className="text-[10px] text-slate-400">Change secret 4-digit PIN</span>
              </button>

              {/* Stealth Disguise Modes (Merged from Settings) */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setIsAppDisguised(true);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-purple-500/30 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Calculator className="h-4 w-4 text-purple-400" />
                <span className="font-bold text-white">Stealth Disguise</span>
                <span className="text-[10px] text-slate-400">Working Calculator / Notes</span>
              </button>

              {/* Weather & Severe Rain Alert */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowWeatherModal(true);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <CloudRain className="h-4 w-4 text-sky-400" />
                <span className="font-bold text-white">Weather & Rain Alerts</span>
                <span className="text-[10px] text-slate-400">Offline barometric sensor</span>
              </button>

              {/* 1. Offline Satellite Map */}
              <button
                onClick={() => {
                  setActiveTab('map');
                  setShowOtherFeaturesModal(false);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Satellite View Map</span>
                <span className="text-[10px] text-slate-400">Offline cached aerial grid</span>
              </button>

              {/* 2. Speaker Radio */}
              <button
                onClick={() => {
                  setActiveTab('radio');
                  setShowOtherFeaturesModal(false);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Radio className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Speaker Radio</span>
                <span className="text-[10px] text-slate-400">Direct audio without extra HW</span>
              </button>

              {/* 3. Qibla & Campus */}
              <button
                onClick={() => {
                  setActiveTab('qibla');
                  setShowOtherFeaturesModal(false);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Compass className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Qibla & Campus</span>
                <span className="text-[10px] text-slate-400">Compass & rally hubs</span>
              </button>

              {/* 4. Notice Board & Radio Academy */}
              <button
                onClick={() => {
                  setActiveTab('notice');
                  setShowOtherFeaturesModal(false);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Bell className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Notice Board & Academy</span>
                <span className="text-[10px] text-slate-400">LoRa 100km & DIY Broadcaster</span>
              </button>

              {/* Signal Strength & Topology Optimizer */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowSignalVisualizerModal(true);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Signal & Topology</span>
                <span className="text-[10px] text-slate-400">Antenna & Link Optimizer</span>
              </button>

              {/* 12-Word Recovery Phrase (Merged from Settings) */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowSeedModal(true);
                }}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Key className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-white">12-Word Seed</span>
                <span className="text-[10px] text-slate-400">BIP-39 identity backup</span>
              </button>

              {/* Emergency Panic Instant Wipe (Merged from Settings) */}
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowPanicModal(true);
                }}
                className="p-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/80 flex flex-col items-start gap-1 text-left transition-colors"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span className="font-bold text-white">Emergency Panic Wipe</span>
                <span className="text-[10px] text-rose-300">Instant secure zeroization</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  setShowOtherFeaturesModal(false);
                  setShowSettingsModal(true);
                }}
                className="text-emerald-400 hover:text-white font-semibold flex items-center gap-1 text-[11px]"
              >
                <Sliders className="h-3.5 w-3.5" /> Customize Bottom Tabs
              </button>
              <button
                onClick={() => setShowOtherFeaturesModal(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-bold text-[11px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN INPUTS FOR PHONE STORAGE FILE AND FOLDER PICKING */}
      <input
        ref={universalFileInputRef}
        type="file"
        multiple
        onChange={handleUniversalFileSelect}
        className="hidden"
      />
      <input
        ref={universalFolderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in browsers
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderSelect}
        className="hidden"
      />

      {/* MODAL: UNIVERSAL PHONE STORAGE FILE & FOLDER SHARING */}
      {showFileUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Share from Phone Storage</h3>
              </div>
              <button onClick={() => setShowFileUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Share any file format directly from device memory. Full in-app playability for audio, video, photos, and voice notes!
            </p>

            {/* Direct Phone Storage Pickers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => universalFileInputRef.current?.click()}
                className="p-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 flex flex-col items-center justify-center gap-1.5 text-center transition-colors group shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-[11px]">Any File Format</span>
                <span className="text-[9px] text-emerald-300/80 font-mono">APK, PDF, ZIP, MP3, MP4</span>
              </button>

              <button
                type="button"
                onClick={() => universalFolderInputRef.current?.click()}
                className="p-3 rounded-lg bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/50 flex flex-col items-center justify-center gap-1.5 text-center transition-colors group shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Folder className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-[11px]">Entire Folder</span>
                <span className="text-[9px] text-amber-300/80 font-mono">Whole directories</span>
              </button>
            </div>

            {/* In-App Playable Media Samples */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">
                Sample Media with In-App Playability:
              </span>
              {[
                {
                  type: 'AUDIO',
                  title: 'Emergency_Radio_Broadcast_Feed.mp3',
                  sizeMb: 2.8,
                  desc: '3:20 Audio Track • In-App Playable',
                  icon: Music
                },
                {
                  type: 'VOICE',
                  title: 'Voice_Note_Campus_Quad.wav',
                  sizeMb: 0.6,
                  desc: '0:45 Voice Note • In-App Waveform',
                  icon: Mic
                },
                {
                  type: 'PHOTO',
                  title: 'Offline_Satellite_Grid_Sector7.jpg',
                  sizeMb: 1.4,
                  desc: 'High-Res Aerial Photo • In-App Viewer',
                  icon: ImageIcon
                },
                {
                  type: 'VIDEO',
                  title: 'Cantenna_Waveguide_Assembly.mp4',
                  sizeMb: 6.8,
                  desc: '2:32 H.264 Video • In-App Player',
                  icon: Video
                },
                {
                  type: 'FOLDER',
                  title: 'LoRa_Firmware_Binaries_Folder',
                  sizeMb: 12.4,
                  desc: 'Complete Directory • 8 Files',
                  icon: FolderArchive
                }
              ].map((item, idx) => {
                const IconCmp = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IconCmp className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white text-[11px] block truncate max-w-[170px]">
                          {item.title}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">{item.desc}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newPkt: DtnPacketSim = {
                          id: `pkt-sample-${Date.now()}-${idx}`,
                          source: identityHandle,
                          destination: chatType === 'groups' ? selectedGroup.name : selectedPeer.handle,
                          preview: item.type === 'AUDIO' ? `🎵 [Audio Track]: ${item.title}` : item.type === 'VOICE' ? `🎤 [Voice Note]: ${item.title}` : item.type === 'PHOTO' ? `🖼 [Photo]: ${item.title}` : item.type === 'VIDEO' ? `🎬 [Video]: ${item.title}` : `📂 [Entire Folder]: ${item.title} (8 files)`,
                          createdAt: Date.now(),
                          hopsLeft: 6,
                          isUrgent: false,
                          status: 'DELIVERED',
                          relayToken: 'STORAGE-SHARE',
                          groupId: chatType === 'groups' ? selectedGroup.id : undefined,
                          videoAttachment: item.type === 'VIDEO' ? {
                            videoId: `vid-s-${idx}`,
                            title: item.title,
                            sizeMb: item.sizeMb,
                            durationSec: 152,
                            totalChunks: 20,
                            cachedChunks: 20,
                            merkleRoot: '0x' + Math.random().toString(16).slice(2, 10)
                          } : undefined
                        };
                        setDtnPackets(prev => [...prev, newPkt]);
                        setShowFileUploadModal(false);
                        onLogEvent('StorageShare', `Shared ${item.title} into chat with in-app playability!`, 'success');
                      }}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]"
                    >
                      Send
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowFileUploadModal(false)}
              className="w-full py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* IN-APP AUDIO & VOICE NOTE PLAYER MODAL */}
      {activeAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {activeAudioModal.title}
                </h3>
              </div>
              <button onClick={() => setActiveAudioModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Waveform Visualization */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center gap-1 h-20">
              {[40, 65, 80, 50, 95, 70, 30, 85, 100, 60, 45, 90, 75, 40, 85, 95, 60, 70, 35, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${activeAudioModal.isPlaying ? Math.max(15, (h * Math.sin(Date.now() / 200 + i) + 100) / 2) : h * 0.4}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${activeAudioModal.isPlaying ? 'bg-emerald-400' : 'bg-slate-700'}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{activeAudioModal.isVoiceNote ? 'Voice Note' : 'Opus 24kHz Audio'}</span>
              <span>0:45 / 3:20</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setActiveAudioModal(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null)}
                className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg font-bold"
              >
                {activeAudioModal.isPlaying ? <Pause className="h-5 w-5 fill-slate-950" /> : <Play className="h-5 w-5 fill-slate-950 translate-x-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP PHOTO VIEWER MODAL */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/50 bg-slate-900 p-3 shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {activePhotoModal.title}
              </span>
              <button onClick={() => setActivePhotoModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="w-full aspect-square rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-2">
              <ImageIcon className="h-16 w-16 text-emerald-400/80 animate-pulse" />
              <span className="text-xs font-bold text-white">{activePhotoModal.title}</span>
              <span className="text-[10px] text-emerald-400 font-mono">{activePhotoModal.sizeMb} MB • Encrypted Offline Photo</span>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP FOLDER EXPLORER MODAL */}
      {activeFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl border border-amber-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {activeFolderModal.folderName}
                </h3>
              </div>
              <button onClick={() => setActiveFolderModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Entire directory packaged as Merkle-verified DTN bundle ({activeFolderModal.filesCount} files, {activeFolderModal.sizeMb} MB).
            </p>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 space-y-1">
              <div>📄 manifest.json (4 KB)</div>
              <div>📄 firmware_mesh_v2.bin (1.8 MB)</div>
              <div>📄 offline_keys.pem (2 KB)</div>
              <div>📄 data_dictionary.db (8.2 MB)</div>
            </div>
            <button
              onClick={() => {
                onLogEvent('StorageShare', `Extracted folder ${activeFolderModal.folderName} to local device storage!`, 'success');
                setActiveFolderModal(null);
              }}
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Extract & Download All Files
            </button>
          </div>
        </div>
      )}

      {/* MODAL: FREE GROUP CREATION */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleCreateGroup} className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Create New Mesh Group</h3>
              </div>
              <button type="button" onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Create groups freely for local relief, study hubs, or campus rallies.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Group Name:</label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Relief Zone East"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Topic / Description:</label>
              <input
                type="text"
                value={newGroupTopic}
                onChange={(e) => setNewGroupTopic(e.target.value)}
                placeholder="e.g. First aid supplies and route updates"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Admins Only Posting</span>
                <span className="text-[10px] text-slate-400">Only group admins can send messages</span>
              </div>
              <input
                type="checkbox"
                checked={newGroupAdminsOnly}
                onChange={(e) => setNewGroupAdminsOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SET PRIVATE NICKNAME */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Private Local Nickname</h3>
              </div>
              <button onClick={() => setShowNicknameModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Set a private nickname for <span className="font-mono font-bold text-white">{selectedPeer.handle}</span>. Stored only on your phone, never seen by others.
            </p>

            <input
              type="text"
              value={tempNicknameValue}
              onChange={(e) => setTempNicknameValue(e.target.value)}
              placeholder="e.g. Ali Bhai (Saline Team)"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrivateNickname}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Save Locally
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELLULAR DATA UPDATE CONFIRMATION PROMPT */}
      {showCellularUpdatePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-amber-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-white">Cellular SIM Data Detected</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are currently connected via mobile cellular data. Would you like to download the update (2.1 MB Lite Edition) using your carrier data, or wait until connected to Wi-Fi/mesh?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowCellularUpdatePrompt(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Wait for Wi-Fi
              </button>
              <button
                onClick={executeAppUpdate}
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Download Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL OMNI-SEARCH MODAL (Users, Offline Waitlists, Groups, Videos, Features) */}
      <UserSearchModal
        isOpen={showUserSearchModal}
        onClose={() => setShowUserSearchModal(false)}
        onSelectPeerToChat={(handle, name) => {
          setSelectedPeer({
            id: `peer-${handle.replace(/[@_]/g, '')}`,
            handle,
            transports: ['BLE_MESH', 'WIFI_DIRECT'],
            activeTransport: 'WIFI_DIRECT',
            rssiDbm: -60,
            hopCount: 1,
            distanceMeters: 14,
            angleDeg: 45,
            publicKeyHex: '4F881A22C9',
            lastSeenSecAgo: 0,
            isRelayNode: false,
          });
          setChatType('direct');
          onLogEvent('UserSearch', `Started 1-on-1 private chat with ${handle}`, 'info');
        }}
        onSelectGroup={(groupId) => {
          const grp = groups.find(g => g.id === groupId);
          if (grp) setSelectedGroup(grp);
          setChatType('groups');
          setActiveTab('chats');
          onLogEvent('OmniSearch', `Opened mesh group: ${groupId}`, 'info');
        }}
        onLaunchFeature={(featId) => {
          if (featId === 'feat-usb') setShowUsbOtgModal(true);
          else if (featId === 'feat-map') setActiveTab('map');
          else if (featId === 'feat-radio') setActiveTab('radio');
          else if (featId === 'feat-qibla') setActiveTab('qibla');
          else if (featId === 'feat-notice') setActiveTab('notice');
          else if (featId === 'feat-weather') setShowWeatherModal(true);
          else if (featId === 'feat-disguise') setIsAppDisguised(true);
          else if (featId === 'feat-superadmin') setShowMasterAdminModal(true);
          else setShowOtherFeaturesModal(true);
          onLogEvent('OmniSearch', `Launched tool: ${featId}`, 'success');
        }}
        onPlayYouTube={(vid) => {
          setActiveTab('social');
          onLogEvent('OmniSearch', `Playing YouTube video: ${vid.title}`, 'info');
        }}
        onShareYouTube={(vid) => {
          const newPkt: DtnPacketSim = {
            id: `pkt-yt-search-${Date.now()}`,
            source: identityHandle,
            destination: chatType === 'groups' ? selectedGroup.name : selectedPeer.handle,
            preview: `🎥 Shared: ${vid.title} (${vid.url})`,
            createdAt: Date.now(),
            hopsLeft: 6,
            isUrgent: false,
            status: 'DELIVERED',
            relayToken: 'DIRECT-SHARE',
            groupId: chatType === 'groups' ? selectedGroup.id : undefined
          };
          setDtnPackets(prev => [...prev, newPkt]);
          setActiveTab('chats');
          onLogEvent('OmniSearch', `Shared YouTube video to chat: ${vid.title}`, 'success');
        }}
        onLogEvent={onLogEvent}
      />

      {/* HARDWARE IDENTITY & AUTH MODAL */}
      <AuthAndIdentityModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentHandle={identityHandle}
        onUpdateHandle={(newHandle) => setIdentityHandle(newHandle)}
        onLogEvent={onLogEvent}
        activeMeshPeers={['qaidi77110', 'qaidi33901', 'qaidi88214']}
      />

      {/* SYSTEM SHARE SHEET MODAL */}
      <ShareSheetModal
        isOpen={showShareSheetModal}
        onClose={() => setShowShareSheetModal(false)}
        onLogEvent={onLogEvent}
        onConfirmShare={(title, mode, platform) => {
          setActiveTab('social');
        }}
      />

      {/* GITHUB PRIVATE FALLBACK SYNC MODAL */}
      <GitHubSyncModal
        isOpen={showGitHubSyncModal}
        onClose={() => setShowGitHubSyncModal(false)}
        radioStatus={radioStatus}
        onToggleRadio={handleToggleRadio}
        bufferedPackets={bufferedPrivatePackets}
        onTriggerSync={handleTriggerGitHubSync}
      />

      {/* WEATHER DETAILS MODAL */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-sky-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sky-400">
                <CloudRain className="h-5 w-5" />
                <h3 className="text-sm font-bold text-white">Location Weather & Rain Alerts</h3>
              </div>
              <button onClick={() => setShowWeatherModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{weather.locationName}</h4>
                  <p className="text-[10px] text-slate-400">Barometer Sensor & GPS Active</p>
                </div>
                <span className="text-2xl font-bold text-sky-400">{weather.temperatureC}°C</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-slate-900">
                <div className="p-1.5 rounded bg-slate-900">
                  <span className="text-slate-400 block">Rain Chance</span>
                  <span className="text-xs font-bold text-sky-300">{weather.rainProbabilityPct}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900">
                  <span className="text-slate-400 block">Wind</span>
                  <span className="text-xs font-bold text-slate-200">{weather.windSpeedKmh} km/h</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900">
                  <span className="text-slate-400 block">Pressure</span>
                  <span className="text-xs font-bold text-amber-400">{weather.barometerHpa} hPa</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWeatherModal(false)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ATTACH VIDEO MODAL */}
      {showAttachVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Share Video Over Mesh Swarm</h3>
              <button onClick={() => setShowAttachVideoModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[
                {
                  videoId: 'vid-cantenna-guide-01',
                  title: 'DIY Cantenna Range Extender Assembly',
                  durationSec: 48,
                  totalChunks: 20,
                  cachedChunks: 20,
                  merkleRoot: '2B1E4A9C8D00F912',
                  sizeMb: 5.2,
                },
                {
                  videoId: 'vid-saline-eyewash-relief',
                  title: 'Field Medical: Emergency Eyewash & Decontamination',
                  durationSec: 36,
                  totalChunks: 14,
                  cachedChunks: 14,
                  merkleRoot: '9F4B3C2A8E1D7700',
                  sizeMb: 3.5,
                }
              ].map(vid => (
                <div
                  key={vid.videoId}
                  onClick={() => handleShareVideoInChat(vid)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-100">{vid.title}</p>
                    <p className="text-[10px] text-slate-400">{vid.sizeMb} MB • {vid.durationSec}s</p>
                  </div>
                  <Share2 className="h-4 w-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white line-clamp-1">{activeVideoModal.title}</h3>
                <p className="text-[10px] text-emerald-400">Offline P2P Video Playback</p>
              </div>
              <button onClick={() => setActiveVideoModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-video rounded-lg bg-black flex items-center justify-center border border-slate-800">
              <button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="h-12 w-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              >
                {isVideoPlaying ? <Pause className="h-5 w-5 fill-slate-950" /> : <Play className="h-5 w-5 fill-slate-950 ml-0.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Size: {activeVideoModal.sizeMb} MB</span>
              <span className="text-emerald-400 font-mono">Merkle Root Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* ULTRASOUND ACOUSTIC MODAL */}
      {showUltrasoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Waves className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">Ultrasound Sound Wave Sharing</h3>
              </div>
              <button onClick={() => setShowUltrasoundModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Transmit contacts & keys via inaudible sound waves (18.5kHz-20kHz) using phone speaker & microphone—zero external hardware!
            </p>

            <button
              onClick={handleTransmitUltrasound}
              disabled={ultrasoundState === 'TRANSMITTING'}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Waves className="h-4 w-4" />
              <span>{ultrasoundState === 'TRANSMITTING' ? 'Beaming Ultrasound...' : 'Emit Ultrasound Wave'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CAPTIVE PORTAL APK SHARE MODAL */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <ArrowDownToLine className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">Offline Hotspot APK Share</h3>
              </div>
              <button onClick={() => setShowPortalModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                SSID: QaidiShare-Mesh-AP
              </span>
              <h4 className="text-xs font-bold text-white">Download Qaidi Share Lite APK</h4>
              <p className="text-[11px] text-slate-300">
                When friends connect to your hotspot, they are directed to the captive portal to download the APK completely offline.
              </p>
              <button
                onClick={() => onLogEvent('CaptivePortal', 'Serving qaidi_share_lite.apk (2.1 MB) to guest device.', 'success')}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Download Qaidi Share Lite APK (2.1 MB)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12-WORD SEED PHRASE MODAL */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">12-Word Recovery Phrase</h3>
              <button onClick={() => setShowSeedModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              {seedPhrase.map((word, idx) => (
                <div key={idx} className="p-1.5 rounded bg-slate-900 text-[10px] font-mono text-center">
                  <span className="text-slate-500 mr-1">{idx + 1}.</span>
                  <span className="text-emerald-400 font-bold">{word}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSeedModal(false)}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* PANIC WIPE CONFIRMATION MODAL */}
      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-rose-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-sm font-bold text-rose-300">Emergency Instant Wipe</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently destroy all encryption keys, message histories, and cached media on this phone.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowPanicModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePanic}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
              >
                Wipe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP SETTINGS MODAL */}
      {showGroupSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Group Permissions ({selectedGroup.id})</h3>
              <button onClick={() => setShowGroupSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Only Admins Can Post</p>
                <p className="text-[10px] text-slate-400">WhatsApp Broadcast Mode</p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...selectedGroup, onlyAdminsCanPost: !selectedGroup.onlyAdminsCanPost };
                  setSelectedGroup(updated);
                  setGroups(groups.map(g => g.id === updated.id ? updated : g));
                  onLogEvent('GroupAdmin', `Posting set to: ${updated.onlyAdminsCanPost ? 'Admins Only' : 'Everyone'}`, 'info');
                }}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  selectedGroup.onlyAdminsCanPost
                    ? 'bg-emerald-600 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedGroup.onlyAdminsCanPost ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300">Group Members:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {selectedGroup.members.map((m) => (
                  <div key={m} className="p-2 rounded bg-slate-950 text-xs flex items-center justify-between">
                    <span className="font-mono text-slate-200">{m}</span>
                    {selectedGroup.admins.includes(m) && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEARBY SHARE MODAL (Quick Share, QR Code & Peoples in Network) */}
      <NearbyShareModal
        isOpen={showNearbyShareModal}
        onClose={() => setShowNearbyShareModal(false)}
        peers={peers}
        groups={groups}
        senderHandle={identityHandle}
        onLogEvent={onLogEvent}
      />

      {/* USB OTG UNIVERSAL SERIAL HARDWARE BRIDGE MODAL */}
      {showUsbOtgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 shadow-2xl max-h-[94vh] overflow-hidden flex flex-col">
            <UsbOtgSerialView
              onClose={() => setShowUsbOtgModal(false)}
              onLogEvent={onLogEvent}
              currentHandle={identityHandle}
            />
          </div>
        </div>
      )}

      {/* NEARBY DISCOVERY RADAR MODAL */}
      <NearbyDiscoveryModal
        isOpen={showNearbyDiscoveryModal}
        onClose={() => setShowNearbyDiscoveryModal(false)}
        peers={peers}
        currentHandle={identityHandle}
        onSelectPeer={(peer) => {
          setSelectedPeer(peer);
          setChatType('direct');
          setDirectChatTarget('peer');
        }}
        onLogEvent={onLogEvent}
        radioStatus={radioStatus}
        onOpenConnectionAssistant={() => setShowConnectionAssistantModal(true)}
        onOpenQrModal={() => setShowQrCodeModal(true)}
      />

      {/* QR CODE & GROUP HUB MODAL */}
      <QrCodeManagerModal
        isOpen={showQrCodeModal}
        onClose={() => setShowQrCodeModal(false)}
        identityHandle={identityHandle}
        groups={groups}
        peers={peers}
        onUpdateGroup={handleUpdateGroup}
        onSelectPeerByHandle={handleSelectPeerByHandle}
        onSelectGroupById={handleSelectGroupById}
        onLogEvent={onLogEvent}
      />

      {/* CONNECTION SETUP ASSISTANT MODAL */}
      <ConnectionAssistantModal
        isOpen={showConnectionAssistantModal}
        onClose={() => setShowConnectionAssistantModal(false)}
        radioStatus={radioStatus}
        hotspotEnabled={hotspotEnabled}
        onToggleRadio={handleToggleRadio}
        onToggleHotspot={() => {
          const next = !hotspotEnabled;
          setHotspotEnabled(next);
          onLogEvent('ConnectionAssistant', `Mobile Hotspot tethering ${next ? 'ACTIVATED' : 'DEACTIVATED'}.`, next ? 'success' : 'info');
        }}
        onEnableAllRadios={handleEnableAllRadios}
        onLogEvent={onLogEvent}
      />
      {/* MODAL: CHANGE SECURITY PIN */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Key className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">Change App Security PIN</h3>
              </div>
              <button
                onClick={() => setShowPinChangeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Set a secret 4-digit PIN used to unlock Calculator/Notepad stealth disguises and security locks.
            </p>

            <form onSubmit={handleUpdateSecurityPin} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter current 4-digit PIN (default: 1234)"
                  value={currentPinAttempt}
                  onChange={(e) => setCurrentPinAttempt(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">New 4-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter new 4-digit PIN"
                  value={newPinCandidate}
                  onChange={(e) => setNewPinCandidate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm New PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Re-enter new 4-digit PIN"
                  value={confirmPinCandidate}
                  onChange={(e) => setConfirmPinCandidate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {pinChangeMsg && (
                <div
                  className={`p-2 rounded text-xs leading-snug font-medium ${
                    pinChangeMsg.isError
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {pinChangeMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinChangeModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold shadow-md"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL STEALTH APP DISGUISE OVERLAY (Calculator or Notepad) */}
      {(isAppDisguised || (activeCityLockdown && shouldEnforceLockdownForCity(userCity, activeCityLockdown))) && !isDisguiseUnlocked && (
        disguiseStyle === 'CALCULATOR' ? (
          /* ================= DISGUISE 1: AUTHENTIC FUNCTIONAL CALCULATOR ================= */
          <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-in fade-in font-sans">
            {/* Top Bar with Subtle Secret Unlock / Switch */}
            <div className="flex items-center justify-between pt-1 px-1 text-slate-600">
              <span className="text-xs font-mono tracking-wider uppercase opacity-60">Calculator</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDisguiseStyle('NOTEPAD')}
                  className="text-[10px] text-slate-600 hover:text-slate-400 font-mono"
                  title="Switch to Notepad disguise"
                >
                  Notes
                </button>
                <button
                  onClick={() => {
                    const entered = prompt(`Enter 4-digit security PIN to unlock:`);
                    if (entered === appSecurityPin) {
                      setIsAppDisguised(false);
                      setIsDisguiseUnlocked(true);
                      setActiveCityLockdown(null);
                      onLogEvent('AppDisguise', 'Disguise unlocked with PIN.', 'success');
                    } else if (entered !== null) {
                      alert("Incorrect PIN.");
                    }
                  }}
                  className="text-slate-700 hover:text-slate-400 p-1"
                  title="Unlock"
                >
                  <Lock className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Calculator Display */}
            <div className="flex-1 flex flex-col justify-end px-3 py-4 text-right overflow-hidden">
              <span className="text-xs text-slate-500 font-mono tracking-wide h-5">
                {calcExpression}
              </span>
              <span className="text-5xl font-light text-white font-mono tracking-tight truncate">
                {calcDisplay}
              </span>
            </div>

            {/* Calculator Keypad */}
            <div className="grid grid-cols-4 gap-2.5 pb-2">
              {['C', '±', '%', '÷'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className={`h-14 rounded-full font-medium text-lg transition-transform active:scale-95 shadow-sm ${
                    btn === '÷'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['7', '8', '9', '×'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className={`h-14 rounded-full font-medium text-lg transition-transform active:scale-95 shadow-sm ${
                    btn === '×'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['4', '5', '6', '-'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className={`h-14 rounded-full font-medium text-lg transition-transform active:scale-95 shadow-sm ${
                    btn === '-'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['1', '2', '3', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className={`h-14 rounded-full font-medium text-lg transition-transform active:scale-95 shadow-sm ${
                    btn === '+'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {/* Bottom Row: 0 (wide), ., = */}
              <button
                onClick={() => handleCalcInput('0')}
                className="col-span-2 h-14 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg flex items-center justify-start pl-6 active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                onClick={() => handleCalcInput('.')}
                className="h-14 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg active:scale-95 shadow-sm"
              >
                .
              </button>
              <button
                onClick={() => handleCalcInput('=')}
                className="h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg active:scale-95 shadow-sm"
                title="Calculate or Unlock with PIN"
              >
                =
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-700 font-mono py-1">
              Secret: Enter 4-digit PIN & press '=' to reveal app
            </div>
          </div>
        ) : (
          /* ================= DISGUISE 2: NOTEPAD GROCERY / STUDY DISGUISE ================= */
          <div className="absolute inset-0 z-50 bg-amber-50 flex flex-col text-slate-900 font-sans p-4 animate-in fade-in select-none">
            {/* Notepad Header */}
            <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-sm">
                <span>📝</span>
                <span>Quick Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDisguiseStyle('CALCULATOR')}
                  className="text-[10px] text-amber-800/70 hover:text-amber-900 underline"
                >
                  Calculator Mode
                </button>
                <button
                  onClick={() => {
                    const entered = prompt(`Enter 4-digit security PIN (Default: ${appSecurityPin}):`);
                    if (entered === appSecurityPin) {
                      setIsAppDisguised(false);
                      setIsDisguiseUnlocked(true);
                      setActiveCityLockdown(null);
                      onLogEvent('SecurityLockdown', 'Disguise unlocked with valid 4-digit PIN.', 'success');
                    } else if (entered !== null) {
                      alert("Incorrect PIN. Access denied.");
                    }
                  }}
                  className="p-1 rounded text-amber-800/40 hover:text-amber-800"
                  title="Unlock"
                >
                  🔒
                </button>
              </div>
            </div>

            {/* Roman Urdu Active Alert Toast (Discreet when city lockdown active) */}
            {activeCityLockdown && (
              <div className="p-2 mb-3 rounded bg-amber-100 border border-amber-300 text-[11px] text-amber-900 leading-snug">
                <span className="font-bold block">⚠️ {userCity.toUpperCase()} SECURITY ALERT:</span>
                {getUrduLockdownWarning(userCity)}
              </div>
            )}

            {/* Realistic Ordinary Grocery & Work Notes */}
            <div className="flex-1 space-y-3 text-xs overflow-y-auto">
              <div className="p-2.5 rounded bg-white border border-amber-200 shadow-xs space-y-1">
                <span className="text-[10px] text-amber-700 font-bold block">Daily Grocery List:</span>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                  <li>Atta / Flour 10 kg</li>
                  <li>Cooking oil 5 Liters</li>
                  <li>Basmati Rice 5 kg</li>
                  <li>Eggs 2 dozen</li>
                </ul>
              </div>

              <div className="p-2.5 rounded bg-white border border-amber-200 shadow-xs space-y-1">
                <span className="text-[10px] text-amber-700 font-bold block">Electrician Contact:</span>
                <p className="text-[11px] text-slate-700">Chaudhry Electrician Talagang: 0300-5519821</p>
              </div>

              <div className="p-2.5 rounded bg-white border border-amber-200 shadow-xs space-y-1">
                <span className="text-[10px] text-amber-700 font-bold block">Physics Chapter 4 Formulae:</span>
                <p className="text-[11px] text-slate-700">V = I * R (Ohm's Law), P = V * I</p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[10px] text-amber-800">
              <span>Last edited: Today, 12:45 PM</span>
              <button
                onClick={() => {
                  const pin = prompt(`Enter 4-digit PIN to restore mesh mode:`);
                  if (pin === appSecurityPin) {
                    setIsAppDisguised(false);
                    setIsDisguiseUnlocked(true);
                    setActiveCityLockdown(null);
                    onLogEvent('SecurityLockdown', 'Disguise unlocked with PIN.', 'success');
                  } else if (pin) {
                    alert("Incorrect PIN");
                  }
                }}
                className="font-bold underline text-amber-900"
              >
                Unlock Mode
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
