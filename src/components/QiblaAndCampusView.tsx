import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Download,
  Layers,
  CheckCircle2,
  Navigation,
  School,
  Users,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';

export interface CampusHub {
  id: string;
  name: string;
  locationName: string;
  distanceKm: number;
  activeNodesCount: number;
  status: 'ACTIVE_GATHERING' | 'STUDY_CIRCLE' | 'EMERGENCY_AID_STATION';
  coordinates: string;
}

const INITIAL_CAMPUS_HUBS: CampusHub[] = [
  {
    id: 'hub-1',
    name: 'Sector G Central Campus Hub',
    locationName: 'Main Academic Quad & Library',
    distanceKm: 0.8,
    activeNodesCount: 38,
    status: 'ACTIVE_GATHERING',
    coordinates: '31.5204° N, 74.3587° E'
  },
  {
    id: 'hub-2',
    name: 'Engineering Faculty Mesh Gateway',
    locationName: 'Roof Node #4 (Cantennas Active)',
    distanceKm: 1.4,
    activeNodesCount: 22,
    status: 'STUDY_CIRCLE',
    coordinates: '31.5298° N, 74.3490° E'
  },
  {
    id: 'hub-3',
    name: 'Medical Aid & Saline Station',
    locationName: 'Gate 3 Clinic Pavilion',
    distanceKm: 2.1,
    activeNodesCount: 15,
    status: 'EMERGENCY_AID_STATION',
    coordinates: '31.5165° N, 74.3642° E'
  }
];

import { OfflineSatelliteMapView } from './OfflineSatelliteMapView';

interface QiblaAndCampusViewProps {
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const QiblaAndCampusView: React.FC<QiblaAndCampusViewProps> = ({ onLogEvent }) => {
  const [activeTab, setActiveTab] = useState<'qibla' | 'campus' | 'map'>('qibla');

  // Qibla Compass Sensor State
  const [deviceHeading, setDeviceHeading] = useState(258); // Simulated magnetometer heading
  const qiblaAngle = 262; // Standard Qibla azimuth from Pakistan (262° WSW)
  const isAligned = Math.abs(deviceHeading - qiblaAngle) <= 3;

  // Campus Hubs
  const [hubs, setHubs] = useState<CampusHub[]>(INITIAL_CAMPUS_HUBS);
  const [selectedHub, setSelectedHub] = useState<CampusHub>(INITIAL_CAMPUS_HUBS[0]);

  // Simulate smooth compass heading micro-sway
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceHeading(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.round((prev + delta + 360) % 360);
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#021812] text-emerald-100 select-none">
      {/* Top Navigation Switcher */}
      <div className="flex border-b border-[#063f2f] bg-[#031d16] px-2 py-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'qibla'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-emerald-500/70 hover:text-emerald-200'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-emerald-400" />
          <span>Qibla Finder</span>
        </button>
        <button
          onClick={() => setActiveTab('campus')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'campus'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-emerald-500/70 hover:text-emerald-200'
          }`}
        >
          <School className="h-3.5 w-3.5 text-emerald-400" />
          <span>Campus Hubs</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-emerald-500/70 hover:text-emerald-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          <span>Satellite Map</span>
        </button>
      </div>

      {/* VIEW 1: QIBLA COMPASS */}
      {activeTab === 'qibla' && (
        <div className="flex-1 p-4 flex flex-col items-center justify-between text-center overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Qibla Direction Sensor</h3>
            <p className="text-xs text-slate-400">
              Hardware Magnetometer & Accelerometer Orientation
            </p>
          </div>

          {/* Compass Dial */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer Dial Circle */}
            <div className="w-52 h-52 rounded-full border-2 border-slate-700 bg-slate-900/90 relative flex items-center justify-center shadow-2xl">
              {/* Compass Cardinal Points */}
              <span className="absolute top-2 text-[11px] font-bold text-rose-400">N</span>
              <span className="absolute right-2 text-[11px] font-bold text-slate-400">E</span>
              <span className="absolute bottom-2 text-[11px] font-bold text-slate-400">S</span>
              <span className="absolute left-2 text-[11px] font-bold text-slate-400">W</span>

              {/* Kaaba Target Marker (at 262°) */}
              <div
                style={{ transform: `rotate(${qiblaAngle}deg) translateY(-84px)` }}
                className="absolute flex flex-col items-center"
              >
                <div className="w-4 h-4 bg-emerald-400 rounded-sm shadow-md flex items-center justify-center text-[8px] font-extrabold text-slate-950">
                  🕋
                </div>
              </div>

              {/* Rotating Compass Needle */}
              <div
                style={{ transform: `rotate(${deviceHeading}deg)` }}
                className="w-1.5 h-36 relative transition-transform duration-200 ease-out flex flex-col items-center justify-between pointer-events-none"
              >
                {/* North Pointer */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[36px] border-b-rose-500" />
                {/* Center Pivot */}
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-slate-900 z-10" />
                {/* South Pointer */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[36px] border-t-slate-500" />
              </div>
            </div>
          </div>

          {/* Alignment Status Card */}
          <div className="w-full space-y-2">
            <div
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                isAligned
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass className={`h-4 w-4 ${isAligned ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Current Heading: {deviceHeading}°</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">Qibla: {qiblaAngle}° WSW</span>
            </div>

            {isAligned ? (
              <div className="p-2 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>You are facing Qibla! Aligned accurately.</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                Rotate phone {deviceHeading < qiblaAngle ? 'clockwise' : 'counter-clockwise'} towards {qiblaAngle}° to face Holy Kaaba.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CAMPUS HUBS */}
      {activeTab === 'campus' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30">
            <h4 className="text-xs font-bold text-blue-200">Local Campus & Rally Hubs</h4>
            <p className="text-[10px] text-blue-300 mt-0.5">
              Decentralized mesh rally coordination zones & study hubs within radio range.
            </p>
          </div>

          <div className="space-y-2">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => {
                  setSelectedHub(hub);
                  onLogEvent('Campus', `Selected ${hub.name} (${hub.distanceKm} km away).`, 'info');
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedHub.id === hub.id
                    ? 'bg-slate-900 border-blue-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 text-blue-400" />
                    <span>{hub.name}</span>
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {hub.distanceKm} km
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mb-2">{hub.locationName}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Users className="h-3 w-3" />
                    <span>{hub.activeNodesCount} Active Nodes</span>
                  </span>
                  <span className="font-mono">{hub.coordinates}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: OFFLINE SATELLITE MAP */}
      {activeTab === 'map' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <OfflineSatelliteMapView onLogEvent={onLogEvent} />
        </div>
      )}
    </div>
  );
};
