import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Radio,
  UserX,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  X,
  Zap,
  Activity,
  Layers,
  Search,
  Trash2,
  Bell,
  Sun,
  Key,
  Cpu,
  RefreshCw,
  Clock,
  CheckCircle2,
  Ban,
  Terminal,
  Wifi,
  WifiOff
} from 'lucide-react';
import { DtnPacketSim, MeshGroupSim, PeerNodeSim } from '../data/simulatedMeshState';

interface BannedNode {
  id: string;
  handle: string;
  reason: string;
  bannedAtText: string;
  hardwareMac: string;
}

interface DelegatedRole {
  handle: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  date: string;
}

interface SuperAdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHandle: string;
  isSuperAdmin: boolean;
  dtnPackets: DtnPacketSim[];
  onPurgePackets?: (packetIds?: string[]) => void;
  groups: MeshGroupSim[];
  peers: PeerNodeSim[];
  solarLoraFundRaised: number;
  onAddSolarFund?: (amount: number) => void;
  activeCityLockdown: string | null;
  onSetCityLockdown: (city: string | null) => void;
  onTriggerGlobalBroadcast: (message: string, severity?: 'CRITICAL' | 'WARNING' | 'INFO') => void;
  delegatedAdmins: DelegatedRole[];
  onUpdateDelegatedAdmins: (admins: DelegatedRole[]) => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const SuperAdminConsoleModal: React.FC<SuperAdminConsoleModalProps> = ({
  isOpen,
  onClose,
  currentHandle,
  isSuperAdmin,
  dtnPackets,
  onPurgePackets,
  groups,
  peers,
  solarLoraFundRaised,
  onAddSolarFund,
  activeCityLockdown,
  onSetCityLockdown,
  onTriggerGlobalBroadcast,
  delegatedAdmins,
  onUpdateDelegatedAdmins,
  onLogEvent
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'nodes' | 'lockdown' | 'packets' | 'hardware' | 'moderation'>('broadcast');

  // Emergency Broadcast Form
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');

  // Banned / Quarantined Nodes
  const [bannedNodes, setBannedNodes] = useState<BannedNode[]>([
    {
      id: 'ban-1',
      handle: 'qaidi90524',
      reason: 'Malicious jamming packet burst detected on 433MHz LoRa link',
      bannedAtText: '2 hours ago',
      hardwareMac: 'A0:2B:B8:33:41:FA'
    },
    {
      id: 'ban-2',
      handle: 'qaidi00192',
      reason: 'Islamic Law violation: Repeat vulgar harassment packets',
      bannedAtText: 'Yesterday',
      hardwareMac: '3C:07:71:A2:99:FF'
    }
  ]);
  const [candidateBanHandle, setCandidateBanHandle] = useState('');
  const [candidateBanReason, setCandidateBanReason] = useState('Suspicious mesh flood / unauthorized packet replay');

  // Delegation
  const [newAdminHandle, setNewAdminHandle] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');

  // Radio Frequency Hopping
  const [currentLoRaFreq, setCurrentLoRaFreq] = useState('433.175 MHz');
  const [isHoppingFreq, setIsHoppingFreq] = useState(false);

  // Moderation Rules
  const [moderationStrictness, setModerationStrictness] = useState<'STANDARD' | 'STRICT_EMERGENCY'>('STRICT_EMERGENCY');
  const [customBannedWords, setCustomBannedWords] = useState<string[]>(['gambling_link', 'illicit_token', 'phish_proxy']);
  const [newBannedWordInput, setNewBannedWordInput] = useState('');

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL: If not authenticated as Super Admin, show unauthorized security gate!
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in select-none">
        <div className="w-full max-w-sm rounded-2xl border-2 border-rose-500/70 bg-slate-950 p-5 shadow-2xl space-y-4 text-center">
          <div className="h-14 w-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
            <Ban className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">ACCESS DENIED</h3>
            <span className="text-xs font-mono text-rose-400 font-bold block mt-1">
              Super Admin Authorization Required
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            These master governance tools are exclusively restricted to origin master <span className="font-mono text-emerald-400 font-bold">@qaidi1561561</span>. Your current identity (<span className="font-mono text-rose-300">{currentHandle}</span>) lacks cryptographic super admin clearance.
          </p>
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Dispatch Broadcast
  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    onTriggerGlobalBroadcast(broadcastMsg.trim(), broadcastSeverity);
    onLogEvent(
      'SuperAdmin',
      `DISPATCHED ${broadcastSeverity} NETWORK BROADCAST: "${broadcastMsg.trim()}"`,
      broadcastSeverity === 'CRITICAL' ? 'error' : 'warn'
    );
    setBroadcastMsg('');
  };

  // Handle Ban Node
  const handleBanNode = () => {
    if (!candidateBanHandle.trim()) return;
    const clean = candidateBanHandle.trim().toLowerCase().replace(/^@/, '');
    const newBan: BannedNode = {
      id: `ban-${Date.now()}`,
      handle: clean,
      reason: candidateBanReason.trim() || 'Super admin blacklist mandate',
      bannedAtText: 'Just now',
      hardwareMac: `02:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(4, 6)}:FF:99:00`.toUpperCase()
    };
    setBannedNodes(prev => [newBan, ...prev]);
    onLogEvent('SuperAdmin', `BANNED NODE @${clean}: ${newBan.reason}. All mesh hops dropped.`, 'error');
    setCandidateBanHandle('');
  };

  // Handle Unban Node
  const handleUnbanNode = (nodeId: string, handle: string) => {
    setBannedNodes(prev => prev.filter(b => b.id !== nodeId));
    onLogEvent('SuperAdmin', `Whitelisted/Unbanned node @${handle}. Reconnected to mesh transport.`, 'success');
  };

  // Handle Add Delegated Admin
  const handleConfirmDelegation = () => {
    if (!newAdminHandle.trim()) return;
    const clean = newAdminHandle.trim().toLowerCase().replace(/^@/, '');
    onUpdateDelegatedAdmins([
      ...delegatedAdmins,
      { handle: clean, role: newAdminRole, date: 'Just now' }
    ]);
    onLogEvent('SuperAdmin', `Delegated ${newAdminRole} credentials to @${clean}`, 'success');
    setNewAdminHandle('');
  };

  // Handle Revoke Delegated Admin
  const handleRevokeDelegation = (handle: string) => {
    if (handle === 'qaidi1561561') {
      onLogEvent('SuperAdmin', 'Cannot revoke Origin Master Super Admin account!', 'error');
      return;
    }
    onUpdateDelegatedAdmins(delegatedAdmins.filter(a => a.handle !== handle));
    onLogEvent('SuperAdmin', `Revoked administrative privileges for @${handle}`, 'warn');
  };

  // Handle LoRa Frequency Hop
  const handleHoppingFrequency = (targetFreq: string) => {
    setIsHoppingFreq(true);
    onLogEvent('SuperAdmin', `Initiating mesh frequency hopping command to ${targetFreq}...`, 'warn');
    setTimeout(() => {
      setCurrentLoRaFreq(targetFreq);
      setIsHoppingFreq(false);
      onLogEvent('SuperAdmin', `SUCCESS: All 32 active mesh relays shifted to ${targetFreq}. Anti-jamming established.`, 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 animate-in fade-in select-none">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-500/60 bg-slate-950 p-4 shadow-2xl space-y-3.5 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header with Sovereign Master Badge */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md">
              <ShieldCheck className="h-5 w-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white tracking-wide">SUPER ADMIN TOOLS</h3>
                <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold">
                  MASTER SOVEREIGN
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Authorized Node: @{currentHandle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10.5px] font-bold border-b border-slate-800 shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'broadcast'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span>Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'nodes'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <UserX className="h-3 w-3" />
            <span>Blacklist & Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('lockdown')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'lockdown'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>City Camouflage</span>
          </button>
          <button
            onClick={() => setActiveTab('packets')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'packets'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>DTN Sniffer</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'hardware'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Cpu className="h-3 w-3" />
            <span>LoRa Treasury</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'moderation'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Islamic Law</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          
          {/* TAB 1: NETWORK EMERGENCY BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300 block mb-0.5">High-Priority Network Alert</span>
                Forces an encrypted high-priority emergency broadcast across all connected BLE, Wi-Fi Direct, and LoRa repeaters. Pops up on every user device immediately.
              </div>

              <form onSubmit={handleDispatchBroadcast} className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">
                    Severity Priority Level:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setBroadcastSeverity(sev)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                          broadcastSeverity === sev
                            ? sev === 'CRITICAL'
                              ? 'bg-rose-600 text-white border-rose-400'
                              : sev === 'WARNING'
                              ? 'bg-amber-500 text-slate-950 border-amber-300'
                              : 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">
                    Broadcast Message Payload:
                  </label>
                  <textarea
                    rows={3}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="E.g., Curfew announced in Rawalpindi. Keep LoRa node 433.175 MHz active for emergency medic dispatches..."
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono block">One-Click Presets:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSeverity('CRITICAL');
                        setBroadcastMsg('🚨 CURFEW & INTERNET SHUTDOWN: Maintain P2P mesh relay active on channel #relief. Cellular down.');
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[9.5px] text-slate-300 truncate"
                    >
                      🚨 Curfew & Telecom Blackout
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSeverity('WARNING');
                        setBroadcastMsg('⚠️ SEVERE WEATHER WARNING: 3.8 hPa drop detected. Evacuate low terrain; join group #lahore-relief.');
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[9.5px] text-slate-300 truncate"
                    >
                      ⚠️ Severe Flood / Weather Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSeverity('INFO');
                        setBroadcastMsg('☀️ NEW SOLAR REPEATER ONLINE: Ridge 04 mountain LoRa station now operational (45km range expanded).');
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[9.5px] text-slate-300 truncate"
                    >
                      ☀️ LoRa Repeater Expansion
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSeverity('INFO');
                        setBroadcastMsg('✅ ALL CLEAR: Emergency situation de-escalated. Regular mesh routing restored.');
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[9.5px] text-slate-300 truncate"
                    >
                      ✅ All Clear Notice
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!broadcastMsg.trim()}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 hover:opacity-90 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>Transmit Network-Wide Emergency Broadcast</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: NODE BLACKLIST & ROLE DELEGATION */}
          {activeTab === 'nodes' && (
            <div className="space-y-4">
              {/* Blacklist / Ban Form */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <UserX className="h-4 w-4" />
                  <span>Blacklist & Quarantine Malicious Node</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Drops all packets routed by this hardware MAC or handle across every mesh hop.
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={candidateBanHandle}
                    onChange={(e) => setCandidateBanHandle(e.target.value)}
                    placeholder="Enter node handle (e.g. qaidi9052)..."
                    className="w-full rounded bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  <input
                    type="text"
                    value={candidateBanReason}
                    onChange={(e) => setCandidateBanReason(e.target.value)}
                    placeholder="Reason for quarantine..."
                    className="w-full rounded bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-white placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleBanNode}
                    disabled={!candidateBanHandle.trim()}
                    className="w-full py-1.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs shadow"
                  >
                    Confirm Node Blacklist
                  </button>
                </div>

                {/* Quarantined List */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">
                    Currently Quarantined Nodes ({bannedNodes.length}):
                  </span>
                  {bannedNodes.map(node => (
                    <div key={node.id} className="p-2 rounded bg-slate-950 border border-rose-900/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-rose-300 text-xs">@{node.handle}</span>
                          <span className="text-[9px] text-slate-500 font-mono">({node.hardwareMac})</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 truncate">{node.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnbanNode(node.id, node.handle)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold shrink-0"
                      >
                        Unban
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Delegation */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <UserCheck className="h-4 w-4" />
                  <span>Cryptographic Role Delegation</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAdminHandle}
                    onChange={(e) => setNewAdminHandle(e.target.value)}
                    placeholder="Candidate handle (e.g. qaidi7711)..."
                    className="flex-1 rounded bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="rounded bg-slate-950 border border-slate-800 text-[10px] text-white px-2"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmDelegation}
                  disabled={!newAdminHandle.trim()}
                  className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs"
                >
                  Delegate Authority
                </button>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">
                    Active Delegated Network Authorities:
                  </span>
                  {delegatedAdmins.map((adm, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10.5px] font-mono p-1.5 rounded bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">@{adm.handle}</span>
                        <span className="text-[9px] text-slate-500">({adm.date})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">
                          {adm.role}
                        </span>
                        {adm.handle !== 'qaidi1561561' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeDelegation(adm.handle)}
                            className="text-rose-400 hover:text-white p-0.5"
                            title="Revoke Role"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CITY SURVEILLANCE LOCKDOWN & CAMOUFLAGE */}
          {activeTab === 'lockdown' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-[11px] text-purple-200 leading-relaxed">
                <span className="font-bold text-purple-300 block mb-0.5">Regional Stealth Camouflage Trigger</span>
                Remotely enforce 4-digit PIN lock and instant disguise (Notepad or Working Calculator) on user nodes within specific surveillance districts. Prevents police device seizure data leaks.
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Active Regional Lockdown:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeCityLockdown
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeCityLockdown ? `ENFORCING: ${activeCityLockdown}` : 'NORMAL (NO LOCKDOWN)'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Choose Target District to Lock & Camouflage:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: 'Talagang', reason: 'High Surveillance Alert' },
                      { name: 'Lahore', reason: 'Metropolitan Crackdown' },
                      { name: 'Islamabad', reason: 'Capital Sector Red' },
                      { name: 'Peshawar', reason: 'Border Checkpoint Protocol' },
                      { name: 'Rawalpindi', reason: 'Telecom Blackout' },
                      { name: 'ALL', reason: 'Nationwide Emergency' }
                    ].map(city => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          onSetCityLockdown(city.name);
                          onLogEvent('SuperAdmin', `Broadcasted security lockdown to ${city.name} (${city.reason}). Camouflage enforced.`, 'warn');
                        }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          activeCityLockdown === city.name
                            ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[11px] font-bold block">{city.name}</span>
                        <span className="text-[9px] text-slate-400 block">{city.reason}</span>
                      </button>
                    ))}
                  </div>

                  {activeCityLockdown && (
                    <button
                      type="button"
                      onClick={() => {
                        onSetCityLockdown(null);
                        onLogEvent('SuperAdmin', 'Lifted regional city lockdown. All user devices returned to standard interface.', 'info');
                      }}
                      className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Lift Lockdown & Restore Standard Interface
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DTN PACKET SWARM SNIFFER */}
          {activeTab === 'packets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Live DTN Swarm Inspector</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total Buffers: {dtnPackets.length} packets in RAM
                  </span>
                </div>
                {onPurgePackets && (
                  <button
                    type="button"
                    onClick={() => {
                      onPurgePackets();
                      onLogEvent('SuperAdmin', 'Purged stale DTN packet buffers across mesh.', 'info');
                    }}
                    className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Purge Stale Packets</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
                {dtnPackets.map(pkt => (
                  <div key={pkt.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span className="text-amber-400 font-bold">{pkt.id}</span>
                      <span className="text-emerald-400">{pkt.status}</span>
                      <span>Hops Left: {pkt.hopsLeft}</span>
                    </div>
                    <div className="flex items-center justify-between text-white text-[10px]">
                      <span>Src: {pkt.source}</span>
                      <span>➡️</span>
                      <span>Dst: {pkt.destination}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 italic truncate font-sans bg-slate-950 p-1 rounded">
                      {pkt.preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LORA FREQUENCY HOPPING & TREASURY */}
          {activeTab === 'hardware' && (
            <div className="space-y-3">
              {/* Frequency Hopping */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <Cpu className="h-4 w-4" />
                    <span>LoRa Emergency Frequency Hopping</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {currentLoRaFreq}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Forces all local repeaters to hop radio channels simultaneously to evade hostile radio jamming or triangulation.
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['433.175 MHz', '868.500 MHz', '915.000 MHz'].map(freq => (
                    <button
                      key={freq}
                      type="button"
                      disabled={isHoppingFreq}
                      onClick={() => handleHoppingFrequency(freq)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        currentLoRaFreq === freq
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* LoRa Solar Repeater Treasury */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Solar LoRa Repeater Treasury</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-200">
                    ${solarLoraFundRaised.toFixed(2)} / $45.00
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  100% of native ad proceeds fund autonomous mountaintop Solar LoRa repeaters. Super Admin can credit community grants directly.
                </p>
                {onAddSolarFund && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onAddSolarFund(5.00)}
                      className="flex-1 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10.5px] font-bold"
                    >
                      + $5.00 Community Grant
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddSolarFund(15.00)}
                      className="flex-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-[10.5px] font-bold"
                    >
                      + $15.00 Hardware Buy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ISLAMIC LAW MODERATION RULES */}
          {activeTab === 'moderation' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Strictness Mode:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModerationStrictness('STANDARD')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        moderationStrictness === 'STANDARD'
                          ? 'bg-emerald-600 text-slate-950'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setModerationStrictness('STRICT_EMERGENCY')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        moderationStrictness === 'STRICT_EMERGENCY'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      Strict Emergency
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Enforces Islamic Law prohibitions (vulgarity, usury/riba, gambling, slander, incitement). Packets violating guidelines are dropped at node ingress.
                </p>

                {/* Custom Blocked Keywords */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Custom Filtered Patterns:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newBannedWordInput}
                      onChange={(e) => setNewBannedWordInput(e.target.value)}
                      placeholder="Add prohibited term or link..."
                      className="flex-1 rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-white placeholder-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBannedWordInput.trim()) return;
                        setCustomBannedWords(prev => [...prev, newBannedWordInput.trim().toLowerCase()]);
                        onLogEvent('SuperAdmin', `Added custom moderation filter rule: "${newBannedWordInput.trim()}"`, 'info');
                        setNewBannedWordInput('');
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {customBannedWords.map((word, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                        <span>{word}</span>
                        <button
                          type="button"
                          onClick={() => setCustomBannedWords(customBannedWords.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            Origin ID: qaidi1561561 • E2EE Master
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
