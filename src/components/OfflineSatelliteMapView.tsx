import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  MapPin,
  Download,
  Share2,
  Navigation,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Eye,
  Crosshair,
  CheckCircle2,
  RefreshCw,
  Info,
  Droplets,
  HeartPulse,
  Utensils,
  Shield,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  X,
  Maximize2,
  Minimize2,
  LocateFixed,
  Route,
  Activity,
  Sliders,
  Check,
  Zap,
  Map as MapIcon
} from 'lucide-react';
import {
  createGlobalEmergencyBroadcast,
  dispatchGlobalEmergencyBroadcast,
  RadioEmergencyBroadcast
} from '../core/radioPacketTransmission';

export type AidPointCategory = 'WATER_AID' | 'FIRST_AID' | 'FOOD_AID' | 'SAFE_HAVEN' | 'HAZARD_CORDON';

export interface AidPoint {
  id: string;
  name: string;
  category: AidPointCategory;
  city: string;
  lat: number;
  lng: number;
  xPct: number; // 0-100% position on local vector canvas
  yPct: number; // 0-100% position on local vector canvas
  description: string;
  reporterHandle: string;
  reportedAt: string;
  realVotes: number;
  fakeVotes: number;
  userVoted?: 'REAL' | 'FAKE';
  isVerifiedOfficial?: boolean;
  distanceMeters: number;
  suppliesAvailable?: string[];
}

export interface OfflineCityPack {
  id: string;
  cityName: string;
  province: string;
  sizeMb: number;
  tileCount: number;
  centerCoords: { lat: number; lng: number };
  isDownloaded: boolean;
  downloadProgress: number; // 0-100
  downloadDate?: string;
  keySectors: string[];
}

const DEFAULT_CITY_PACKS: OfflineCityPack[] = [
  {
    id: 'pack-lahore',
    cityName: 'Lahore',
    province: 'Punjab',
    sizeMb: 34.2,
    tileCount: 1650,
    centerCoords: { lat: 31.5204, lng: 74.3587 },
    isDownloaded: true,
    downloadProgress: 100,
    downloadDate: 'Cached 2h ago',
    keySectors: ['Mall Road', 'Liberty Chowk', 'Campus Quad', 'Canal Road', 'Model Town']
  },
  {
    id: 'pack-islamabad',
    cityName: 'Islamabad',
    province: 'Federal Capital',
    sizeMb: 28.6,
    tileCount: 1380,
    centerCoords: { lat: 33.7294, lng: 73.0931 },
    isDownloaded: true,
    downloadProgress: 100,
    downloadDate: 'Cached 4h ago',
    keySectors: ['Red Zone', 'Blue Area', 'F-6/F-7 Sectors', 'Faizabad', 'D-Chowk']
  },
  {
    id: 'pack-karachi',
    cityName: 'Karachi',
    province: 'Sindh',
    sizeMb: 46.1,
    tileCount: 2200,
    centerCoords: { lat: 24.8607, lng: 67.0011 },
    isDownloaded: false,
    downloadProgress: 0,
    keySectors: ['Saddar Bazaar', 'Clifton', 'MA Jinnah Road', 'Karachi Port', 'Gulshan']
  },
  {
    id: 'pack-rawalpindi',
    cityName: 'Rawalpindi',
    province: 'Punjab',
    sizeMb: 22.8,
    tileCount: 1100,
    centerCoords: { lat: 33.5651, lng: 73.0169 },
    isDownloaded: false,
    downloadProgress: 0,
    keySectors: ['Faizabad Interchange', 'Raja Bazaar', 'Murree Road', 'Saddar']
  },
  {
    id: 'pack-peshawar',
    cityName: 'Peshawar',
    province: 'KPK',
    sizeMb: 19.5,
    tileCount: 950,
    centerCoords: { lat: 34.0151, lng: 71.5249 },
    isDownloaded: false,
    downloadProgress: 0,
    keySectors: ['University Town', 'Khyber Bazaar', 'Ring Road', 'Hayatabad']
  },
  {
    id: 'pack-faisalabad',
    cityName: 'Faisalabad',
    province: 'Punjab',
    sizeMb: 21.0,
    tileCount: 1020,
    centerCoords: { lat: 31.4187, lng: 73.0791 },
    isDownloaded: false,
    downloadProgress: 0,
    keySectors: ['Clock Tower (8 Bazaars)', 'D Ground', 'Jaranwala Road', 'Sargodha Road']
  }
];

const INITIAL_AID_POINTS: AidPoint[] = [
  {
    id: 'aid-water-01',
    name: 'Liberty Clean Water & Rehydration Depot',
    category: 'WATER_AID',
    city: 'Lahore',
    lat: 31.5124,
    lng: 74.3412,
    xPct: 34,
    yPct: 42,
    description: 'Clean drinking water drums and electrolyte packets distributed by volunteers.',
    reporterHandle: 'qaidi7711',
    reportedAt: '15m ago',
    realVotes: 28,
    fakeVotes: 1,
    isVerifiedOfficial: true,
    distanceMeters: 240,
    suppliesAvailable: ['1000L Mineral Water', 'ORS Packets', 'Clean Paper Cups']
  },
  {
    id: 'aid-medical-01',
    name: 'Sector F-7 Volunteer First Aid & Saline Post',
    category: 'FIRST_AID',
    city: 'Islamabad',
    lat: 33.7211,
    lng: 73.0588,
    xPct: 58,
    yPct: 32,
    description: 'Active particulate and smoke eye relief station. 2 volunteer doctors present with sterile saline & burn creams.',
    reporterHandle: 'qaidi3390',
    reportedAt: '8m ago',
    realVotes: 44,
    fakeVotes: 0,
    isVerifiedOfficial: true,
    distanceMeters: 410,
    suppliesAvailable: ['0.9% Normal Saline', 'Eye Relief Spray', 'Sterile Gauze', 'Asthma Inhalers']
  },
  {
    id: 'aid-food-01',
    name: 'Community Kitchen & Warm Meals Hub',
    category: 'FOOD_AID',
    city: 'Lahore',
    lat: 31.5280,
    lng: 74.3310,
    xPct: 45,
    yPct: 62,
    description: 'Free warm rice, lentils, and bread for peaceful gathering participants and families.',
    reporterHandle: 'qaidi4829',
    reportedAt: '25m ago',
    realVotes: 19,
    fakeVotes: 1,
    isVerifiedOfficial: false,
    distanceMeters: 620,
    suppliesAvailable: ['Cooked Rice & Daal', 'Roti Bread', 'Dates & Bananas']
  },
  {
    id: 'aid-shelter-01',
    name: 'Campus Library Sanctuary & Battery Charging',
    category: 'SAFE_HAVEN',
    city: 'Lahore',
    lat: 31.5302,
    lng: 74.3201,
    xPct: 22,
    yPct: 28,
    description: 'Quiet indoor refuge with off-grid solar generators for charging phones and LoRa devices.',
    reporterHandle: 'qaidi1561561',
    reportedAt: '1h ago',
    realVotes: 52,
    fakeVotes: 0,
    isVerifiedOfficial: true,
    distanceMeters: 780,
    suppliesAvailable: ['Solar Charging Station', 'First Aid Kit', 'Offline Wi-Fi Mesh AP']
  },
  {
    id: 'aid-cordon-01',
    name: 'Traffic Congestion & Road Detour Alert (Block 4)',
    category: 'HAZARD_CORDON',
    city: 'Lahore',
    lat: 31.5180,
    lng: 74.3520,
    xPct: 75,
    yPct: 55,
    description: 'Road repair barricades and shipping containers. Severe traffic jam. Use alternative route.',
    reporterHandle: 'qaidi8821',
    reportedAt: '4m ago',
    realVotes: 61,
    fakeVotes: 2,
    isVerifiedOfficial: true,
    distanceMeters: 310,
    suppliesAvailable: ['Danger Warning', 'Detour: Use Canal Road North']
  }
];

interface OfflineSatelliteMapViewProps {
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const OfflineSatelliteMapView: React.FC<OfflineSatelliteMapViewProps> = ({ onLogEvent }) => {
  // Map Rendering Mode: 'satellite' (Photorealistic Aerial) vs 'google_vector' (Google Maps style streets & blocks)
  const [mapStyle, setMapStyle] = useState<'google_vector' | 'satellite'>('google_vector');

  // Active City Pack
  const [cityPacks, setCityPacks] = useState<OfflineCityPack[]>(DEFAULT_CITY_PACKS);
  const [activeCityId, setActiveCityId] = useState<string>('pack-lahore');
  const activeCity = cityPacks.find(c => c.id === activeCityId) || cityPacks[0];

  // Aid Points & Filtering
  const [aidPoints, setAidPoints] = useState<AidPoint[]>(INITIAL_AID_POINTS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<AidPoint | null>(null);

  // Map Navigation & Interaction State (Google Maps Style Pan/Zoom)
  const [zoomLevel, setZoomLevel] = useState<number>(14); // 12x to 18x
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Offline Geolocation Tracking Overlay Demonstration
  const [offlineTrackingEnabled, setOfflineTrackingEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{ xPct: number; yPct: number; heading: number }>({
    xPct: 40,
    yPct: 48,
    heading: 42
  });

  // UI Modals
  const [showCityDownloadModal, setShowCityDownloadModal] = useState(false);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [showRouteOverlay, setShowRouteOverlay] = useState(false);
  const [showLocationShareModal, setShowLocationShareModal] = useState(false);
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(false);
  const [locationShareType, setLocationShareType] = useState<'STATIC' | 'LIVE'>('LIVE');
  const [selectedTrustedPeer, setSelectedTrustedPeer] = useState('@charlie_rescue');
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<RadioEmergencyBroadcast | null>(null);
  const [votingFeedback, setVotingFeedback] = useState<string | null>(null);

  // Form State for Adding New Aid Point
  const [newPointCategory, setNewPointCategory] = useState<AidPointCategory>('WATER_AID');
  const [newPointName, setNewPointName] = useState('');
  const [newPointDesc, setNewPointDesc] = useState('');
  const [newPointSupplies, setNewPointSupplies] = useState('');

  // Simulated GPS dead-reckoning drift animation
  useEffect(() => {
    if (!offlineTrackingEnabled) return;
    const interval = setInterval(() => {
      setUserLocation(prev => {
        // Small gentle drift to simulate inertial sensor walking tracking
        const dx = (Math.random() - 0.48) * 0.4;
        const dy = (Math.random() - 0.48) * 0.4;
        const newHeading = (prev.heading + (Math.random() - 0.5) * 6 + 360) % 360;
        return {
          xPct: Math.max(10, Math.min(90, prev.xPct + dx)),
          yPct: Math.max(10, Math.min(90, prev.yPct + dy)),
          heading: Math.round(newHeading)
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [offlineTrackingEnabled]);

  // Handle Drag / Pan Map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bound pan
    const maxPan = 300 * (zoomLevel / 14);
    setPanOffset({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Recenter to user position
  const handleRecenter = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(15);
    onLogEvent('OfflineMap', 'Recentered to offline IMU/Wi-Fi ranging fix.', 'info');
  };

  // Vote Real or Fake Handler
  const handleVote = (pointId: string, voteType: 'REAL' | 'FAKE') => {
    setAidPoints(prev =>
      prev.map(p => {
        if (p.id !== pointId) return p;
        if (p.userVoted === voteType) return p; // Already voted this

        let newReal = p.realVotes;
        let newFake = p.fakeVotes;

        if (p.userVoted === 'REAL') newReal--;
        if (p.userVoted === 'FAKE') newFake--;

        if (voteType === 'REAL') newReal++;
        if (voteType === 'FAKE') newFake++;

        return {
          ...p,
          realVotes: newReal,
          fakeVotes: newFake,
          userVoted: voteType
        };
      })
    );

    const target = aidPoints.find(p => p.id === pointId);
    if (voteType === 'REAL') {
      setVotingFeedback(`Marked "${target?.name}" as REAL Aid Point (+1 Community Trust).`);
      onLogEvent('CommunityVerification', `Verified real aid point "${target?.name}" via mesh consensus.`, 'success');
    } else {
      setVotingFeedback(`Flagged "${target?.name}" as FAKE / UNRELIABLE. Alerting nearby peers.`);
      onLogEvent('CommunityVerification', `Caution: Voted FAKE on "${target?.name}". Disputing coordinates.`, 'warn');
    }

    setTimeout(() => setVotingFeedback(null), 3000);
  };

  // Add New Aid Point Handler
  const handleCreateAidPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointName.trim()) return;

    // Drop new point near user's current GPS location with slight random offset
    const randomOffset = () => (Math.random() - 0.5) * 12;
    const newPoint: AidPoint = {
      id: `aid-custom-${Date.now()}`,
      name: newPointName.trim(),
      category: newPointCategory,
      city: activeCity.cityName,
      lat: activeCity.centerCoords.lat + (Math.random() - 0.5) * 0.015,
      lng: activeCity.centerCoords.lng + (Math.random() - 0.5) * 0.015,
      xPct: Math.max(15, Math.min(85, userLocation.xPct + randomOffset())),
      yPct: Math.max(15, Math.min(85, userLocation.yPct + randomOffset())),
      description: newPointDesc.trim() || 'Community reported resource point.',
      reporterHandle: 'qaidi4829',
      reportedAt: 'Just now',
      realVotes: 1, // Creator vote
      fakeVotes: 0,
      userVoted: 'REAL',
      isVerifiedOfficial: false,
      distanceMeters: Math.round(Math.random() * 300 + 100),
      suppliesAvailable: newPointSupplies ? newPointSupplies.split(',').map(s => s.trim()) : ['Community Supplies']
    };

    setAidPoints([newPoint, ...aidPoints]);
    setSelectedPoint(newPoint);
    setShowAddPointModal(false);
    setNewPointName('');
    setNewPointDesc('');
    setNewPointSupplies('');

    onLogEvent('AidPointManager', `Broadcasted new ${newPointCategory} "${newPoint.name}" to mesh network.`, 'success');
  };

  // City Download Handler
  const handleDownloadCity = (cityId: string) => {
    const pack = cityPacks.find(c => c.id === cityId);
    if (!pack) return;

    onLogEvent('OfflineMap', `Initiating high-res vector & satellite tile download for ${pack.cityName} (${pack.sizeMb} MB)...`, 'info');

    // Simulate progressive download
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setCityPacks(prev =>
        prev.map(c => {
          if (c.id !== cityId) return c;
          return {
            ...c,
            downloadProgress: Math.min(100, currentProgress),
            isDownloaded: currentProgress >= 100,
            downloadDate: currentProgress >= 100 ? 'Downloaded just now' : undefined
          };
        })
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        onLogEvent('OfflineMap', `Successfully cached full Google-style offline map for ${pack.cityName}.`, 'success');
      }
    }, 300);
  };

  // Trigger Global Emergency Broadcast from Map HUD
  const handleTriggerEmergencyPing = () => {
    const broadcast = createGlobalEmergencyBroadcast(
      'qaidi4829',
      `EMERGENCY MAP BROADCAST: Sector alert near ${activeCity.cityName}. High priority ping dispatched across all nodes.`,
      'CIVIL_ALERT',
      {
        latitude: activeCity.centerCoords.lat,
        longitude: activeCity.centerCoords.lng,
        mgrsGrid: '43SED893245'
      }
    );
    const result = dispatchGlobalEmergencyBroadcast(broadcast, ['qaidi7711', 'qaidi3390', 'qaidi8821']);
    setActiveEmergencyAlert(result.broadcast);
    onLogEvent('EmergencyBroadcast', result.logSummary, 'error');
  };

  // Filtered Aid Points
  const filteredPoints = aidPoints.filter(p => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Verification Trust Score
  const getTrustStats = (point: AidPoint) => {
    const total = point.realVotes + point.fakeVotes;
    if (total === 0) return { pct: 100, isSuspicious: false };
    const pct = Math.round((point.realVotes / total) * 100);
    return {
      pct,
      isSuspicious: pct < 50 || point.fakeVotes >= 5
    };
  };

  // Helper for Category Badges & Colors
  const getCategoryMeta = (cat: AidPointCategory) => {
    switch (cat) {
      case 'WATER_AID':
        return {
          label: 'Water Aid',
          icon: <Droplets className="h-3.5 w-3.5" />,
          bgColor: 'bg-sky-500',
          textColor: 'text-sky-300',
          pinBorder: 'border-sky-400'
        };
      case 'FIRST_AID':
        return {
          label: 'First Aid / Medical',
          icon: <HeartPulse className="h-3.5 w-3.5" />,
          bgColor: 'bg-rose-500',
          textColor: 'text-rose-300',
          pinBorder: 'border-rose-400'
        };
      case 'FOOD_AID':
        return {
          label: 'Food Aid',
          icon: <Utensils className="h-3.5 w-3.5" />,
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-300',
          pinBorder: 'border-amber-400'
        };
      case 'SAFE_HAVEN':
        return {
          label: 'Safe Haven & Shelter',
          icon: <Shield className="h-3.5 w-3.5" />,
          bgColor: 'bg-emerald-500',
          textColor: 'text-emerald-300',
          pinBorder: 'border-emerald-400'
        };
      case 'HAZARD_CORDON':
        return {
          label: 'Police Cordon / Gas Alert',
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          bgColor: 'bg-red-600',
          textColor: 'text-red-300',
          pinBorder: 'border-red-500'
        };
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#1e2329] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. TOP FLOATING GOOGLE MAPS SEARCH & CONTROL BAR */}
      <div className="absolute top-2 left-2 right-2 z-30 flex flex-col gap-1.5 pointer-events-none">
        {/* Search Bar Container */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl pointer-events-auto">
          <div className="pl-2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search aid points, water, first aid, sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none py-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Style Switcher: Google Vector vs Satellite */}
          <button
            onClick={() => setMapStyle(prev => prev === 'google_vector' ? 'satellite' : 'google_vector')}
            title="Toggle Google Vector Map vs Satellite Aerial View"
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
              mapStyle === 'satellite'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>{mapStyle === 'satellite' ? 'Satellite' : 'Vector Map'}</span>
          </button>

          {/* City / Offline Sector Packs Modal Trigger */}
          <button
            onClick={() => setShowCityDownloadModal(true)}
            title="Download Offline City Maps"
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1"
          >
            <Download className="h-3 w-3 text-emerald-400" />
            <span className="hidden xs:inline">{activeCity.cityName}</span>
          </button>
        </div>

        {/* Quick Filter Category Chips (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto px-0.5">
          <div className="px-2.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 text-[9px] font-mono text-emerald-400 flex items-center gap-1 shrink-0 shadow-md">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>OPSEC: Mesh Hardware Nodes Hidden</span>
          </div>
          {[
            { id: 'ALL', label: 'All Aid', icon: <MapPin className="h-3 w-3" /> },
            { id: 'WATER_AID', label: '💧 Water Aid', icon: <Droplets className="h-3 w-3 text-sky-400" /> },
            { id: 'FIRST_AID', label: '🩺 Medical Aid', icon: <HeartPulse className="h-3 w-3 text-rose-400" /> },
            { id: 'FOOD_AID', label: '🍲 Food Aid', icon: <Utensils className="h-3 w-3 text-amber-400" /> },
            { id: 'SAFE_HAVEN', label: '🛡️ Safe Havens', icon: <Shield className="h-3 w-3 text-emerald-400" /> },
            { id: 'HAZARD_CORDON', label: '⚠️ Cordons/Gas', icon: <AlertTriangle className="h-3 w-3 text-red-400" /> }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedCategoryFilter(chip.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 shadow-md backdrop-blur-md border transition-all ${
                selectedCategoryFilter === chip.id
                  ? 'bg-emerald-600 text-slate-950 border-emerald-500'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. EMERGENCY BROADCAST BANNER (IF ACTIVE) */}
      {activeEmergencyAlert && (
        <div className="absolute top-20 left-2 right-2 z-40 p-2.5 rounded-xl bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border border-rose-500 shadow-2xl flex items-start justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2 flex-1">
            <Radio className="h-4 w-4 text-rose-400 animate-pulse mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[10px] uppercase bg-rose-600 text-white px-1.5 rounded">
                  NETWORK-WIDE EMERGENCY PING
                </span>
                <span className="text-[10px] font-mono text-rose-200">
                  {activeEmergencyAlert.nodesAcknowledged.length} NODES ACKNOWLEDGED
                </span>
              </div>
              <p className="text-[11px] text-white font-medium mt-0.5">{activeEmergencyAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveEmergencyAlert(null)}
            className="text-rose-300 hover:text-white p-1 ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3. COMMUNITY VOTING FEEDBACK TOAST */}
      {votingFeedback && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-semibold shadow-2xl animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{votingFeedback}</span>
        </div>
      )}

      {/* 4. MAIN INTERACTIVE MAP CANVAS (VECTOR / SATELLITE WITH PAN & ZOOM) */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing ${
          mapStyle === 'satellite' ? 'bg-[#0f1715]' : 'bg-[#1a232a]'
        }`}
      >
        {/* Dynamic Zoom & Pan Transform Container */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 14})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative w-full h-full min-w-[700px] min-h-[700px]"
        >
          {/* MAP BACKGROUND LAYER */}
          {mapStyle === 'google_vector' ? (
            /* Clean Google Maps Style Vector Rendering */
            <svg className="w-full h-full absolute inset-0 select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Land / District Blocks */}
              <rect x="0" y="0" width="100%" height="100%" fill="#1f2937" />
              
              {/* Parks and green spaces */}
              <path d="M 50 80 Q 180 50 240 160 T 320 280 L 150 320 Z" fill="#132e23" opacity="0.8" />
              <path d="M 450 350 Q 580 320 620 450 T 520 600 L 400 520 Z" fill="#132e23" opacity="0.7" />
              <path d="M 120 450 Q 220 400 280 500 T 200 640 L 90 580 Z" fill="#132e23" opacity="0.6" />

              {/* River / Canal Waterway (e.g. Lahore Canal / Rawal Stream) */}
              <path
                d="M -50 480 Q 250 420 450 250 T 850 120"
                fill="none"
                stroke="#0e3a53"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M -50 480 Q 250 420 450 250 T 850 120"
                fill="none"
                stroke="#17608a"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Minor City Street Grid */}
              <g stroke="#2d3748" strokeWidth="2" opacity="0.7">
                {[...Array(24)].map((_, i) => (
                  <line key={`vg-${i}`} x1={i * 45} y1="0" x2={i * 45} y2="100%" />
                ))}
                {[...Array(24)].map((_, i) => (
                  <line key={`hg-${i}`} x1="0" y1={i * 45} x2="100%" y2={i * 45} />
                ))}
              </g>

              {/* Major Avenues / Highways (Yellow/Orange Google Maps styling) */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Secondary Avenues */}
                <path d="M 0 200 L 800 200" stroke="#4a5568" strokeWidth="10" />
                <path d="M 0 200 L 800 200" stroke="#718096" strokeWidth="6" />

                <path d="M 380 0 L 380 800" stroke="#4a5568" strokeWidth="10" />
                <path d="M 380 0 L 380 800" stroke="#718096" strokeWidth="6" />

                {/* Primary Expressways / Arterials */}
                <path d="M 0 540 Q 350 400 800 500" stroke="#744210" strokeWidth="14" />
                <path d="M 0 540 Q 350 400 800 500" stroke="#d69e2e" strokeWidth="8" />

                <path d="M 220 0 Q 300 400 680 800" stroke="#744210" strokeWidth="14" />
                <path d="M 220 0 Q 300 400 680 800" stroke="#d69e2e" strokeWidth="8" />
              </g>

              {/* Building Outlines in City Sectors */}
              <g fill="#283548" stroke="#374151" strokeWidth="1">
                <rect x="180" y="220" width="35" height="25" rx="2" />
                <rect x="225" y="220" width="40" height="25" rx="2" />
                <rect x="180" y="255" width="85" height="30" rx="2" />
                <rect x="420" y="220" width="50" height="40" rx="2" />
                <rect x="480" y="220" width="45" height="40" rx="2" />
                <rect x="420" y="270" width="105" height="35" rx="2" />
                <rect x="280" y="440" width="45" height="35" rx="2" />
                <rect x="335" y="440" width="45" height="35" rx="2" />
              </g>

              {/* District & Street Text Labels (Google Maps Aesthetic) */}
              <g fill="#a0aec0" fontFamily="sans-serif" fontSize="10" fontWeight="bold">
                <text x="290" y="190">MALL ROAD BOULEVARD</text>
                <text x="390" y="340" transform="rotate(90, 390, 340)">CANAL BANK ROAD</text>
                <text x="70" y="140" fill="#68d391">GULBERG GREEN CORRIDOR</text>
                <text x="440" y="400" fill="#68d391">CAMPUS BOTANICAL PARK</text>
                <text x="440" y="250" fill="#cbd5e0" fontSize="9">LIBERTY SECTOR B</text>
                <text x="200" y="275" fill="#cbd5e0" fontSize="9">SECTOR G CIVIC CENTER</text>
              </g>
            </svg>
          ) : (
            /* Photorealistic Tactical Satellite View with Aerial Textures */
            <div className="w-full h-full absolute inset-0 bg-[#0a1813] select-none pointer-events-none">
              {/* Satellite Terrain Texture Simulation */}
              <div
                className="w-full h-full opacity-60"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 35% 25%, #183e2f 0%, transparent 60%),
                    radial-gradient(circle at 75% 75%, #0f2c22 0%, transparent 60%),
                    linear-gradient(45deg, #091c15 25%, transparent 25%),
                    linear-gradient(-45deg, #091c15 25%, transparent 25%)
                  `,
                  backgroundSize: '100% 100%, 100% 100%, 60px 60px, 60px 60px'
                }}
              />
              {/* MGRS Tactical Grid Overlay */}
              <div
                className="w-full h-full absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #10b981 1px, transparent 1px),
                    linear-gradient(to bottom, #10b981 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px'
                }}
              />
              {/* Satellite Road Lines */}
              <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0 200 L 800 200" stroke="#2563eb" strokeWidth="3" opacity="0.6" strokeDasharray="6,4" />
                <path d="M 380 0 L 380 800" stroke="#2563eb" strokeWidth="3" opacity="0.6" strokeDasharray="6,4" />
                <path d="M 0 540 Q 350 400 800 500" stroke="#f59e0b" strokeWidth="4" opacity="0.7" />
                <path d="M 220 0 Q 300 400 680 800" stroke="#f59e0b" strokeWidth="4" opacity="0.7" />
              </svg>
            </div>
          )}

          {/* SAFE EVACUATION ROUTE OVERLAY (IF TOGGLED) */}
          {showRouteOverlay && selectedPoint && (
            <svg className="w-full h-full absolute inset-0 pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              {/* Animated Walking Route Line */}
              <line
                x1={`${userLocation.xPct}%`}
                y1={`${userLocation.yPct}%`}
                x2={`${selectedPoint.xPct}%`}
                y2={`${selectedPoint.yPct}%`}
                stroke="url(#routeGrad)"
                strokeWidth="5"
                strokeDasharray="8,6"
                className="animate-pulse"
              />
            </svg>
          )}

          {/* OFFLINE GEOLOCATION USER MARKER (PULSING BLUE DOT + HEADING CONE) */}
          {offlineTrackingEnabled && (
            <div
              style={{
                left: `${userLocation.xPct}%`,
                top: `${userLocation.yPct}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-20 pointer-events-auto cursor-pointer"
              onClick={handleRecenter}
            >
              {/* Heading FOV Cone */}
              <div
                style={{
                  transform: `rotate(${userLocation.heading}deg)`,
                  transformOrigin: 'center center'
                }}
                className="absolute -inset-6 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="w-16 h-16 rounded-full opacity-30"
                  style={{
                    background: 'conic-gradient(from 330deg, transparent 0deg, #3b82f6 30deg, transparent 60deg)'
                  }}
                />
              </div>

              {/* Ranging Accuracy Radar Pulse */}
              <div className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" />

              {/* Center User Dot */}
              <div className="relative h-5 w-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>

              {/* Floating "You" Label */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded bg-blue-950/90 text-[9px] font-bold text-blue-200 border border-blue-500/40">
                You (Offline GPS)
              </div>
            </div>
          )}

          {/* AID POINTS PINS (WATER, FIRST AID, FOOD, SHELTER, CORDONS) */}
          {filteredPoints.map((point) => {
            const meta = getCategoryMeta(point.category);
            const trust = getTrustStats(point);
            const isSelected = selectedPoint?.id === point.id;

            return (
              <div
                key={point.id}
                style={{
                  left: `${point.xPct}%`,
                  top: `${point.yPct}%`,
                  transform: 'translate(-50%, -100%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(point);
                  setShowRouteOverlay(true);
                  onLogEvent('AidPoint', `Selected aid marker: ${point.name} (${point.distanceMeters}m away)`, 'info');
                }}
                className={`absolute z-20 cursor-pointer group transition-all duration-200 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* Google Maps Style Teardrop Pin */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`h-7 w-7 rounded-full ${meta.bgColor} text-white flex items-center justify-center shadow-2xl border-2 ${
                      isSelected ? 'border-white ring-4 ring-emerald-500/50' : 'border-slate-900'
                    }`}
                  >
                    {meta.icon}
                  </div>

                  {/* Pin Point Needle */}
                  <div className={`w-1.5 h-2 ${meta.bgColor} -mt-0.5 rounded-b-full`} />

                  {/* Trust Score Mini Badge */}
                  <div
                    className={`-mt-1 px-1 rounded-full text-[8px] font-mono font-bold shadow ${
                      trust.isSuspicious
                        ? 'bg-red-950 text-red-300 border border-red-500'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}
                  >
                    {trust.pct}%
                  </div>

                  {/* Hover / Active Label */}
                  <div
                    className={`absolute bottom-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-[9px] font-bold text-white whitespace-nowrap transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {point.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. FLOATING MAP ACTION BUTTONS (GOOGLE MAPS AESTHETIC) */}
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Recenter GPS Button */}
        <button
          onClick={handleRecenter}
          title="Recenter to your offline location"
          className="h-10 w-10 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-blue-400 shadow-xl flex items-center justify-center transition-transform active:scale-95"
        >
          <LocateFixed className="h-5 w-5" />
        </button>

        {/* Zoom In (+) */}
        <button
          onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))}
          title="Zoom In"
          className="h-9 w-9 rounded-t-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-xl flex items-center justify-center font-bold text-sm"
        >
          +
        </button>

        {/* Zoom Out (-) */}
        <button
          onClick={() => setZoomLevel(prev => Math.max(12, prev - 1))}
          title="Zoom Out"
          className="h-9 w-9 rounded-b-xl bg-slate-900/95 hover:bg-slate-800 border-x border-b border-slate-700 text-slate-200 shadow-xl flex items-center justify-center font-bold text-sm -mt-2"
        >
          -
        </button>

        {/* Offline Tracking Demonstration Toggle Switch */}
        <button
          onClick={() => {
            setOfflineTrackingEnabled(!offlineTrackingEnabled);
            onLogEvent('OfflineTracking', `Inertial Dead-Reckoning & Wi-Fi Ranging: ${!offlineTrackingEnabled ? 'ENABLED' : 'DISABLED'}`, 'info');
          }}
          title="Toggle Offline Tracking Mode (No GPS/Cellular Required)"
          className={`h-9 px-2 rounded-xl border text-[10px] font-bold flex items-center gap-1 shadow-xl transition-all ${
            offlineTrackingEnabled
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
              : 'bg-slate-900/95 text-slate-400 border-slate-700'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>{offlineTrackingEnabled ? 'PDR ON' : 'PDR OFF'}</span>
        </button>

        {/* Add Aid Point FAB */}
        <button
          onClick={() => setShowAddPointModal(true)}
          title="Add New Aid Point (Water, Medical, Food, Shelter)"
          className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold shadow-2xl flex items-center justify-center transition-transform active:scale-90"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
      </div>

      {/* 6. BOTTOM HUD: OFFLINE STATUS & EMERGENCY PING BUTTON */}
      <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs z-20 backdrop-blur-md">
        {/* Active City & Offline Cache Status */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="font-bold text-white block text-[11px] leading-tight">
              {activeCity.cityName} • Offline Cached
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeCity.sizeMb} MB • 0% Cellular Data Used
            </span>
          </div>
        </div>

        {/* Manual Location Sharing & Emergency Ping Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowLocationShareModal(true)}
            title="Manual Location Sharing with Trusted Contact"
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isLocationSharingActive
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Share2 className="h-3.5 w-3.5 text-blue-400" />
            <span>{isLocationSharingActive ? 'Live Sharing ON' : 'Share Location'}</span>
          </button>

          {/* Global Emergency Ping Button */}
          <button
            onClick={handleTriggerEmergencyPing}
            title="Trigger Network-Wide Emergency Broadcast Ping"
            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-lg shadow-rose-950/60 transition-all active:scale-95 animate-pulse"
          >
            <Radio className="h-3.5 w-3.5 text-white" />
            <span className="hidden sm:inline">SOS PING</span>
          </button>
        </div>
      </div>

      {/* 7. SELECTED AID POINT DETAILS BOTTOM SHEET (COMMUNITY REAL/FAKE VOTING) */}
      {selectedPoint && (
        <div className="absolute bottom-12 left-2 right-2 z-40 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl ${getCategoryMeta(selectedPoint.category).bgColor} text-white shadow-lg`}>
                {getCategoryMeta(selectedPoint.category).icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">{selectedPoint.name}</h3>
                  {selectedPoint.isVerifiedOfficial && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      Official
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Reported by {selectedPoint.reporterHandle} • {selectedPoint.reportedAt} • {selectedPoint.distanceMeters}m away
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPoint(null);
                setShowRouteOverlay(false);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            {selectedPoint.description}
          </p>

          {/* Supplies Tags */}
          {selectedPoint.suppliesAvailable && selectedPoint.suppliesAvailable.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedPoint.suppliesAvailable.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          )}

          {/* Community Real / Fake Consensus Voting Bar */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Community Verification:</span>
              <span className={`font-bold font-mono ${getTrustStats(selectedPoint).isSuspicious ? 'text-red-400' : 'text-emerald-400'}`}>
                {getTrustStats(selectedPoint).pct}% Verified ({selectedPoint.realVotes} Real • {selectedPoint.fakeVotes} Fake)
              </span>
            </div>

            {/* Verification Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${getTrustStats(selectedPoint).pct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
              <div
                style={{ width: `${100 - getTrustStats(selectedPoint).pct}%` }}
                className="h-full bg-rose-500 transition-all duration-300"
              />
            </div>

            {/* Voting Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleVote(selectedPoint.id, 'REAL')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedPoint.userVoted === 'REAL'
                    ? 'bg-emerald-600 text-slate-950 shadow-lg'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80'
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Mark as Real Aid ({selectedPoint.realVotes})</span>
              </button>

              <button
                onClick={() => handleVote(selectedPoint.id, 'FAKE')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedPoint.userVoted === 'FAKE'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80'
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>Mark as Fake / Trap ({selectedPoint.fakeVotes})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL LOCATION SHARING MODAL (TRUSTED CONTACTS ONLY) */}
      {showLocationShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Share Location With Trusted Peer</h3>
              </div>
              <button onClick={() => setShowLocationShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-emerald-400 block text-[11px]">OPSEC Security Guaranteed:</span>
              <p className="text-[10px] text-slate-400">
                Your location will ONLY be sent encrypted over the peer-to-peer mesh directly to your selected trusted contact. No public map, repeater, or authority can intercept this coordinate.
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Trusted Friend / Peer:</label>
                <select
                  value={selectedTrustedPeer}
                  onChange={(e) => setSelectedTrustedPeer(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="@charlie_rescue">@charlie_rescue (Google Pixel 8 Pro)</option>
                  <option value="@bob_mesh">@bob_mesh (Samsung Galaxy S23)</option>
                  <option value="qaidi7711">qaidi7711 (Ali - Cantenna RF Lead)</option>
                  <option value="qaidi3390">qaidi3390 (Brother Zafar - First Aid)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sharing Mode:</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setLocationShareType('LIVE')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      locationShareType === 'LIVE'
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Live Real-Time P2P</span>
                  </button>
                  <button
                    onClick={() => setLocationShareType('STATIC')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      locationShareType === 'STATIC'
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Static Snapshot</span>
                  </button>
                </div>
              </div>
            </div>

            {isLocationSharingActive ? (
              <button
                onClick={() => {
                  setIsLocationSharingActive(false);
                  setShowLocationShareModal(false);
                  onLogEvent('OPSEC', `Stopped location sharing with ${selectedTrustedPeer}. Coordinates cleared.`, 'warn');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Stop Sharing Location Now
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLocationSharingActive(true);
                  setShowLocationShareModal(false);
                  onLogEvent('OPSEC', `Started ${locationShareType} encrypted location sharing with ${selectedTrustedPeer}.`, 'success');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Start Sharing With {selectedTrustedPeer}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. CITY & OFFLINE SECTOR PACKS DOWNLOAD MODAL */}
      {showCityDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Offline City Map Packs</h3>
              </div>
              <button onClick={() => setShowCityDownloadModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Download your local city or target gathering areas. Cached maps allow 100% full-screen navigation without cellular internet or Google Maps servers.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cityPacks.map(city => (
                <div
                  key={city.id}
                  className={`p-3 rounded-xl border transition-all ${
                    city.id === activeCityId
                      ? 'bg-slate-950 border-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{city.cityName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({city.province})</span>
                        {city.isDownloaded && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                            Cached
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {city.sizeMb} MB • {city.tileCount} high-res tiles
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {city.isDownloaded ? (
                        <button
                          onClick={() => {
                            setActiveCityId(city.id);
                            setShowCityDownloadModal(false);
                            onLogEvent('OfflineMap', `Switched active offline map to ${city.cityName}.`, 'success');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            city.id === activeCityId
                              ? 'bg-emerald-600 text-slate-950'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {city.id === activeCityId ? 'Active' : 'Select'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadCity(city.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Download Progress Bar */}
                  {city.downloadProgress > 0 && city.downloadProgress < 100 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>Caching offline tiles...</span>
                        <span>{city.downloadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${city.downloadProgress}%` }}
                          className="h-full bg-emerald-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Key Sectors Included */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {city.keySectors.map((sec, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCityDownloadModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 9. ADD NEW AID POINT MODAL */}
      {showAddPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateAidPoint}
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Broadcast New Aid Point</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPointModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Share critical supplies or hazard warnings with all mesh participants. Other users can verify or flag this point.
            </p>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Aid Point Category
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'WATER_AID', label: '💧 Water Aid' },
                  { id: 'FIRST_AID', label: '🩺 First Aid / Medical' },
                  { id: 'FOOD_AID', label: '🍲 Food Aid' },
                  { id: 'SAFE_HAVEN', label: '🛡️ Safe Shelter' },
                  { id: 'HAZARD_CORDON', label: '⚠️ Danger / Cordon' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewPointCategory(c.id as AidPointCategory)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                      newPointCategory === c.id
                        ? 'bg-emerald-600 text-slate-950 font-bold border-emerald-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Point Name / Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Location Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Liberty Roundabout Water Station"
                value={newPointName}
                onChange={(e) => setNewPointName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description & Available Supplies */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Supplies & Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 500L clean drinking water, volunteer medics present, ORS packets."
                value={newPointDesc}
                onChange={(e) => setNewPointDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Water, Sterile Saline, Blankets"
                value={newPointSupplies}
                onChange={(e) => setNewPointSupplies(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddPointModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50"
              >
                Broadcast Point
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
