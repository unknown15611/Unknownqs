import React, { useState } from 'react';
import {
  Search,
  UserCheck,
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
  UserPlus,
  Wifi,
  WifiOff
} from 'lucide-react';

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
    handle: 'qaidi1561561',
    displayName: 'Super Admin (qaidi1561561)',
    hardwareMac: '02:00:00:FF:AA:01',
    isOnlineMesh: true,
    rssiDbm: -54,
    hopsAway: 1,
    lastSeenText: 'Active now',
    isSuperAdmin: true
  },
  {
    handle: 'qaidi48291',
    displayName: 'Qaidi Node 48291',
    hardwareMac: '9C:E6:5E:2B:1A:08',
    isOnlineMesh: true,
    rssiDbm: -68,
    hopsAway: 1,
    lastSeenText: 'Active now'
  },
  {
    handle: 'qaidi77112',
    displayName: 'Lahore Relief Node',
    hardwareMac: '44:85:00:C1:2F:90',
    isOnlineMesh: true,
    rssiDbm: -76,
    hopsAway: 2,
    lastSeenText: '3m ago'
  },
  {
    handle: 'qaidi31205',
    displayName: 'Sector G Mesh Relay',
    hardwareMac: '78:D2:94:11:80:BC',
    isOnlineMesh: false,
    rssiDbm: -92,
    hopsAway: 3,
    lastSeenText: '18m ago'
  },
  {
    handle: 'qaidi90524',
    displayName: 'Volunteer Field Medic',
    hardwareMac: 'A0:2B:B8:33:41:FA',
    isOnlineMesh: true,
    rssiDbm: -62,
    hopsAway: 1,
    lastSeenText: 'Active now'
  },
  {
    handle: 'qaidi55883',
    displayName: 'Rawalpindi Ham Repeater',
    hardwareMac: '50:C7:BF:88:91:02',
    isOnlineMesh: false,
    rssiDbm: -105,
    hopsAway: 4,
    lastSeenText: '1 hour ago'
  }
];

const DEFAULT_GROUPS: SearchableGroup[] = [
  { id: 'group-mesh-ops', name: 'Tactical Mesh Ops', membersCount: 14, isAvailable: true, topic: 'Packet frequency hopping & LoRa relay coordinates' },
  { id: 'group-medical', name: 'Field Medic & Relief', membersCount: 8, isAvailable: true, topic: 'Emergency burn creams, clean saline, & triage' },
  { id: 'group-food-water', name: 'Community Kitchen & Water', membersCount: 12, isAvailable: false, topic: 'Offline supply caches & solar charging hubs' },
  { id: 'group-talagang', name: 'Talagang Autonomous District', membersCount: 6, isAvailable: false, topic: 'Talagang district off-grid neighborhood cluster' }
];

const DEFAULT_YOUTUBE_VIDEOS: SearchableYouTubeVideo[] = [
  {
    id: 'yt-1',
    youtubeId: 'cantenna_guide',
    title: 'How to Build an Emergency Cantenna Wi-Fi Booster for Under $5',
    channelName: 'OffGrid Tech Lab',
    durationText: '8:42',
    category: 'DIY Radio',
    url: 'https://youtube.com/watch?v=cantenna_guide'
  },
  {
    id: 'yt-2',
    youtubeId: 'esp32_lora_mesh',
    title: 'ESP32 LoRa Mesh Packet Radio: Firmware Flashing & Relay Setup',
    channelName: 'Mesh Pakistan Network',
    durationText: '12:08',
    category: 'LoRa Mesh',
    url: 'https://youtube.com/watch?v=esp32_lora_mesh'
  },
  {
    id: 'yt-3',
    youtubeId: 'solar_battery_guide',
    title: 'DIY 18650 Battery Pack & Solar Charge Controller for Blackouts',
    channelName: 'Solar Tech Urdu',
    durationText: '10:15',
    category: 'Solar & Energy',
    url: 'https://youtube.com/watch?v=solar_battery_guide'
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
  { id: 'soc-1', title: 'Autonomous multi-hop packet routing deployed across Sector F-7', author: 'qaidi1561561', type: 'POST', time: '10m ago' },
  { id: 'soc-2', title: 'DIY Cantenna Booster Guide MP4 Video Reel (14.2 MB)', author: 'qaidi48291', type: 'REEL', time: '35m ago' },
  { id: 'soc-3', title: 'Relief Center Pinned Map in Offline Satellite View', author: 'qaidi77112', type: 'POST', time: '1h ago' }
];

const DEFAULT_FEATURES: SearchableFeatureItem[] = [
  { id: 'feat-usb', name: 'USB OTG Serial Hardware Bridge', category: 'Hardware', description: 'Auto-detect CH340, CP2102, FTDI LoRa modules & packets', iconName: 'usb' },
  { id: 'feat-map', name: 'Offline Satellite View Map', category: 'Navigation', description: 'Pre-cached high-resolution aerial imagery & supply pins', iconName: 'map' },
  { id: 'feat-radio', name: 'Speaker Acoustic Radio', category: 'Audio', description: 'Software acoustic ultrasound transceiver without extra hardware', iconName: 'radio' },
  { id: 'feat-qibla', name: 'Qibla & Campus Compass', category: 'Orientation', description: 'Real-time magnetic azimuth & verified campus rally points', iconName: 'qibla' },
  { id: 'feat-notice', name: 'Notice Board & Tactical Academy', category: 'Education', description: 'Community broadcast announcements & 100km LoRa tutorials', iconName: 'notice' },
  { id: 'feat-weather', name: 'Weather & Severe Rain Alert', category: 'Sensors', description: 'Offline barometric pressure drop & thunderstorm warnings', iconName: 'weather' },
  { id: 'feat-disguise', name: 'Stealth Calculator & Notepad Disguise', category: 'Privacy', description: 'Disguise app behind a fully working functional calculator', iconName: 'disguise' },
  { id: 'feat-fund', name: 'Solar LoRa Hardware Fund', category: 'Community', description: '100% of native ad revenue pooled to buy repeaters', iconName: 'fund' },
  { id: 'feat-superadmin', name: 'Super Admin Master Console', category: 'Governance', description: 'Emergency broadcast, node quarantine & city lockdown (qaidi1561561 only)', iconName: 'admin' }
];

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPeerToChat: (handle: string, displayName: string) => void;
  onSelectGroup?: (groupId: string) => void;
  onLaunchFeature?: (featureId: string) => void;
  onPlayYouTube?: (video: SearchableYouTubeVideo) => void;
  onShareYouTube?: (video: SearchableYouTubeVideo) => void;
  onLogEvent?: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPeerToChat,
  onSelectGroup,
  onLaunchFeature,
  onPlayYouTube,
  onShareYouTube,
  onLogEvent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState<'ALL' | 'USERS' | 'GROUPS' | 'VIDEOS' | 'FEATURES'>('ALL');
  
  // Offline Waitlist State (Users & Groups)
  const [userWaitlist, setUserWaitlist] = useState<string[]>([]);
  const [groupWaitlist, setGroupWaitlist] = useState<string[]>([]);
  const [customAddInput, setCustomAddInput] = useState('');

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Filter Peers
  const filteredPeers = DEFAULT_PEERS.filter((p) => {
    if (!q) return true;
    return p.handle.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q) || p.hardwareMac.toLowerCase().includes(q);
  });

  // Filter Groups
  const filteredGroups = DEFAULT_GROUPS.filter((g) => {
    if (!q) return true;
    return g.name.toLowerCase().includes(q) || g.topic.toLowerCase().includes(q);
  });

  // Filter YouTube Videos (Also checks if query is a YouTube URL!)
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

  // Handle Adding User to Offline Waitlist
  const handleToggleUserWaitlist = (handle: string) => {
    if (userWaitlist.includes(handle)) {
      setUserWaitlist(prev => prev.filter(h => h !== handle));
      onLogEvent?.('Waitlist', `Removed ${handle} from offline mesh beacon waitlist.`, 'info');
    } else {
      setUserWaitlist(prev => [...prev, handle]);
      onLogEvent?.('Waitlist', `Added ${handle} to offline mesh beacon waitlist. Auto-connects when peer radio is in range!`, 'success');
    }
  };

  // Handle Adding Group to Offline Waitlist
  const handleToggleGroupWaitlist = (groupId: string) => {
    if (groupWaitlist.includes(groupId)) {
      setGroupWaitlist(prev => prev.filter(g => g !== groupId));
      onLogEvent?.('Waitlist', `Removed ${groupId} from rendezvous sync waitlist.`, 'info');
    } else {
      setGroupWaitlist(prev => [...prev, groupId]);
      onLogEvent?.('Waitlist', `Queued ${groupId} in rendezvous sync waitlist. Automatically syncs when in range of a relay node!`, 'success');
    }
  };

  // Handle Adding Manual User Handle to Waitlist
  const handleAddCustomUser = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAddInput.trim().toLowerCase();
    if (!clean) return;
    setUserWaitlist(prev => [...new Set([...prev, clean])]);
    setCustomAddInput('');
    onLogEvent?.('Waitlist', `Added custom user ID ${clean} to auto-connect waitlist.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-emerald-500/40 p-4 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Omni-Search Everything</h3>
              <p className="text-[10px] text-slate-400">Users, Groups, Social, YouTube & Features at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Universal Search Input */}
        <div className="relative mb-2.5 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, group, video, URL, or feature..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
            autoFocus
          />
          <Search className="h-3.5 w-3.5 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2 shrink-0 scrollbar-none text-[10px]">
          {(['ALL', 'USERS', 'GROUPS', 'VIDEOS', 'FEATURES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSearchTab(tab)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all shrink-0 ${
                activeSearchTab === tab
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab === 'ALL' ? '🌐 All' : tab === 'USERS' ? '👤 Users' : tab === 'GROUPS' ? '👥 Groups' : tab === 'VIDEOS' ? '▶ YouTube' : '⚡ Tools'}
            </button>
          ))}
        </div>

        {/* Search Results Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          
          {/* Quick Manual User Add (if no results or direct add) */}
          <form onSubmit={handleAddCustomUser} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex gap-1.5">
            <input
              type="text"
              value={customAddInput}
              onChange={(e) => setCustomAddInput(e.target.value)}
              placeholder="Add user ID to offline waitlist (e.g. qaidi8821)..."
              className="flex-1 bg-transparent text-[11px] text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!customAddInput.trim()}
              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-[10px] flex items-center gap-1"
            >
              <UserPlus className="h-3 w-3" />
              <span>Queue</span>
            </button>
          </form>

          {/* SECTION 1: USERS */}
          {(activeSearchTab === 'ALL' || activeSearchTab === 'USERS') && filteredPeers.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
                <span>👤 Network Users ({filteredPeers.length})</span>
                <span className="text-slate-500 font-normal">Offline waitlist enabled</span>
              </div>
              {filteredPeers.map((peer) => {
                const isWaitlisted = userWaitlist.includes(peer.handle);
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
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-slate-950 ${
                          peer.isOnlineMesh ? 'bg-emerald-400' : 'bg-slate-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white text-[11px]">{peer.handle}</span>
                          {peer.isSuperAdmin && (
                            <span className="text-[8px] px-1 rounded bg-rose-500/20 text-rose-300 font-bold">ADMIN</span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-400 block truncate max-w-[150px]">{peer.displayName}</span>
                        <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-mono">
                          <span>{peer.isOnlineMesh ? `📶 ${peer.rssiDbm} dBm` : 'Offline'}</span>
                          <span>• {peer.lastSeenText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {peer.isOnlineMesh ? (
                        <button
                          onClick={() => {
                            onSelectPeerToChat(peer.handle, peer.displayName);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Chat</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleUserWaitlist(peer.handle)}
                          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                            isWaitlisted
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title={isWaitlisted ? 'Queued in offline waitlist' : 'Add to auto-connect waitlist'}
                        >
                          {isWaitlisted ? <Check className="h-3 w-3 text-amber-400" /> : <Clock className="h-3 w-3 text-slate-400" />}
                          <span>{isWaitlisted ? 'Waitlisted' : 'Waitlist'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2: GROUPS */}
          {(activeSearchTab === 'ALL' || activeSearchTab === 'GROUPS') && filteredGroups.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
                <span>👥 Mesh Groups ({filteredGroups.length})</span>
                <span className="text-slate-500 font-normal">Offline sync</span>
              </div>
              {filteredGroups.map((grp) => {
                const isWaitlisted = groupWaitlist.includes(grp.id);
                return (
                  <div
                    key={grp.id}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-emerald-500/40 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[11px]">{grp.name}</span>
                        <span className="text-[9px] font-mono text-emerald-400">({grp.id})</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 truncate max-w-[200px]">{grp.topic}</p>
                      <span className="text-[8.5px] text-slate-500 font-mono">
                        {grp.membersCount} members • {grp.isAvailable ? 'In Range' : 'Out of Range'}
                      </span>
                    </div>

                    <div>
                      {grp.isAvailable ? (
                        <button
                          onClick={() => {
                            onSelectGroup?.(grp.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]"
                        >
                          Open
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleGroupWaitlist(grp.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                            isWaitlisted
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isWaitlisted ? <Check className="h-3 w-3 text-amber-400" /> : <Clock className="h-3 w-3" />}
                          <span>{isWaitlisted ? 'Waitlisted' : 'Waitlist'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 3: YOUTUBE SURVIVAL & TECH VIDEOS */}
          {(activeSearchTab === 'ALL' || activeSearchTab === 'VIDEOS') && filteredVideos.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-red-400 font-mono uppercase tracking-wider">
                <span>▶ YouTube Tech & Survival Videos ({filteredVideos.length})</span>
                <span className="text-slate-500 font-normal">Zero API Key Needed</span>
              </div>
              {filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-red-500/40 flex items-center justify-between transition-all"
                >
                  <div className="flex-1 mr-2">
                    <span className="font-bold text-white text-[11px] block line-clamp-1">{vid.title}</span>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      <span>{vid.channelName}</span>
                      <span>•</span>
                      <span className="text-red-400 font-mono">{vid.durationText}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{vid.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onPlayYouTube?.(vid);
                        onClose();
                      }}
                      className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1"
                      title="Watch inside app"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>Watch</span>
                    </button>
                    <button
                      onClick={() => {
                        onShareYouTube?.(vid);
                        onClose();
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px]"
                      title="Share to mesh chat"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 4: SOCIAL & REELS */}
          {(activeSearchTab === 'ALL' || activeSearchTab === 'VIDEOS') && filteredSocial.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-purple-400 font-mono uppercase tracking-wider">
                🎬 Social & Reels ({filteredSocial.length})
              </div>
              {filteredSocial.map((soc) => (
                <div
                  key={soc.id}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-purple-500/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-white text-[11px] block line-clamp-1">{soc.title}</span>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                      <span>{soc.author}</span>
                      <span>•</span>
                      <span className="text-purple-400">{soc.type}</span>
                      <span>•</span>
                      <span>{soc.time}</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-500/30">
                    {soc.type}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 5: APP FEATURES & HARDWARE TOOLS */}
          {(activeSearchTab === 'ALL' || activeSearchTab === 'FEATURES') && filteredFeatures.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                ⚡ App Features & Hardware Tools ({filteredFeatures.length})
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {filteredFeatures.map((feat) => (
                  <button
                    key={feat.id}
                    onClick={() => {
                      onLaunchFeature?.(feat.id);
                      onClose();
                    }}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-500/40 flex items-center justify-between text-left transition-all"
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
            </div>
          )}

          {/* Empty state */}
          {filteredPeers.length === 0 && filteredGroups.length === 0 && filteredVideos.length === 0 && filteredFeatures.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <p>No results found for "{searchQuery}".</p>
              <p className="text-[11px] text-slate-400">
                You can paste a direct YouTube video URL, or enter an offline user handle above to queue in your waitlist!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
