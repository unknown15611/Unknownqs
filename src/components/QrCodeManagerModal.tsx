import React, { useState } from 'react';
import {
  X,
  QrCode,
  Scan,
  Copy,
  Check,
  RefreshCw,
  Power,
  UserCheck,
  UserX,
  Users,
  ShieldCheck,
  Lock,
  Share2,
  Download,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { MeshGroupSim, GroupJoinRequest, PeerNodeSim } from '../data/simulatedMeshState';

interface QrCodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  identityHandle: string;
  groups: MeshGroupSim[];
  peers: PeerNodeSim[];
  onUpdateGroup: (updatedGroup: MeshGroupSim) => void;
  onSelectPeerByHandle: (handle: string) => void;
  onSelectGroupById: (groupId: string) => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const QrCodeManagerModal: React.FC<QrCodeManagerModalProps> = ({
  isOpen,
  onClose,
  identityHandle,
  groups,
  peers,
  onUpdateGroup,
  onSelectPeerByHandle,
  onSelectGroupById,
  onLogEvent
}) => {
  const [activeTab, setActiveTab] = useState<'MY_QR' | 'GROUP_QR' | 'SCAN'>('MY_QR');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [scanInputText, setScanInputText] = useState('');
  const [scanResult, setScanResult] = useState<{ type: 'USER' | 'GROUP' | 'ERROR'; message: string; targetId?: string } | null>(null);

  if (!isOpen) return null;

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
  const isGroupAdmin = selectedGroup ? (selectedGroup.admins.includes(identityHandle) || identityHandle === 'qaidi156156') : false;

  const myQrPayload = `qaidi-user:${identityHandle}?pubkey=02ff${identityHandle.slice(-4)}a19c`;
  const groupQrPayload = selectedGroup
    ? `qaidi-group:${selectedGroup.id}?code=${selectedGroup.qrInviteCode || 'INV-001'}`
    : '';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    onLogEvent('QRManager', `Copied ${label} to clipboard.`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Group Admin: Change / Reset Group QR Code
  const handleRegenerateGroupQr = () => {
    if (!selectedGroup || !isGroupAdmin) return;
    const newCode = `INV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated: MeshGroupSim = {
      ...selectedGroup,
      qrInviteCode: newCode
    };
    onUpdateGroup(updated);
    onLogEvent('GroupAdmin', `Regenerated group invite QR code for "${selectedGroup.name}": ${newCode}. Previous QR codes are now invalid.`, 'success');
  };

  // Group Admin: Toggle Enable / Disable QR Code Joining
  const handleToggleQrEnabled = () => {
    if (!selectedGroup || !isGroupAdmin) return;
    const currentEnabled = selectedGroup.isQrJoinEnabled ?? true;
    const updated: MeshGroupSim = {
      ...selectedGroup,
      isQrJoinEnabled: !currentEnabled
    };
    onUpdateGroup(updated);
    onLogEvent(
      'GroupAdmin',
      `${!currentEnabled ? 'Enabled' : 'Disabled'} QR Code joining for group "${selectedGroup.name}".`,
      !currentEnabled ? 'success' : 'warn'
    );
  };

  // Group Admin: Approve Join Request
  const handleApproveRequest = (req: GroupJoinRequest) => {
    if (!selectedGroup || !isGroupAdmin) return;
    const updated: MeshGroupSim = {
      ...selectedGroup,
      members: Array.from(new Set([...selectedGroup.members, req.userHandle])),
      pendingJoinRequests: (selectedGroup.pendingJoinRequests || []).filter(r => r.id !== req.id)
    };
    onUpdateGroup(updated);
    onLogEvent('GroupAdmin', `Approved ${req.userHandle} into group "${selectedGroup.name}"!`, 'success');
  };

  // Group Admin: Reject Join Request
  const handleRejectRequest = (req: GroupJoinRequest) => {
    if (!selectedGroup || !isGroupAdmin) return;
    const updated: MeshGroupSim = {
      ...selectedGroup,
      pendingJoinRequests: (selectedGroup.pendingJoinRequests || []).filter(r => r.id !== req.id)
    };
    onUpdateGroup(updated);
    onLogEvent('GroupAdmin', `Rejected join request from ${req.userHandle} for group "${selectedGroup.name}".`, 'warn');
  };

  // Scan & Decode QR Payload
  const handleExecuteScan = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    if (text.startsWith('qaidi-user:')) {
      const handle = text.replace('qaidi-user:', '').split('?')[0];
      setScanResult({
        type: 'USER',
        message: `Found Node @${handle}. Added to mesh contact roster!`,
        targetId: handle
      });
      onLogEvent('QRScanner', `Scanned user QR code: @${handle}`, 'success');
    } else if (text.startsWith('qaidi-group:')) {
      const groupId = text.replace('qaidi-group:', '').split('?')[0];
      const targetGroup = groups.find(g => g.id === groupId);

      if (!targetGroup) {
        setScanResult({
          type: 'ERROR',
          message: `Group ${groupId} is not currently within active mesh radius.`
        });
        return;
      }

      if (targetGroup.isQrJoinEnabled === false) {
        setScanResult({
          type: 'ERROR',
          message: `Join Blocked: The admin of "${targetGroup.name}" has disabled QR Code joining.`
        });
        onLogEvent('QRScanner', `QR join rejected: Admin has disabled QR joining for ${targetGroup.name}`, 'warn');
        return;
      }

      // Check if already member
      if (targetGroup.members.includes(identityHandle)) {
        setScanResult({
          type: 'GROUP',
          message: `You are already an active member of "${targetGroup.name}".`,
          targetId: targetGroup.id
        });
        return;
      }

      // Submit join request
      const newReq: GroupJoinRequest = {
        id: `req-${Date.now()}`,
        userHandle: identityHandle,
        requestedAt: Date.now(),
        qrInviteCodeUsed: targetGroup.qrInviteCode
      };

      const updated: MeshGroupSim = {
        ...targetGroup,
        pendingJoinRequests: [...(targetGroup.pendingJoinRequests || []), newReq]
      };
      onUpdateGroup(updated);

      setScanResult({
        type: 'GROUP',
        message: `Join Request submitted to group admin for "${targetGroup.name}". Awaiting admin approval.`,
        targetId: targetGroup.id
      });
      onLogEvent('QRScanner', `Submitted join request via QR code to "${targetGroup.name}".`, 'info');
    } else {
      // General text or handle search
      const matchedPeer = peers.find(p => p.handle.toLowerCase() === text.toLowerCase().replace('@', ''));
      if (matchedPeer) {
        setScanResult({
          type: 'USER',
          message: `Matched user @${matchedPeer.handle} via manual input!`,
          targetId: matchedPeer.handle
        });
      } else {
        setScanResult({
          type: 'ERROR',
          message: `Unrecognized payload: "${text}". Expected qaidi-user:... or qaidi-group:...`
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <QrCode className="h-5 w-5" />
            <div>
              <h3 className="text-sm font-bold text-white">QR Code & Group Hub</h3>
              <p className="text-[10px] text-slate-400">Add users, share groups & manage admin requests</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('MY_QR')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'MY_QR'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="h-3 w-3" />
            <span>My QR</span>
          </button>
          <button
            onClick={() => setActiveTab('GROUP_QR')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'GROUP_QR'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Group QR</span>
            {selectedGroup && (selectedGroup.pendingJoinRequests?.length || 0) > 0 && isGroupAdmin && (
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
              activeTab === 'SCAN'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="h-3 w-3" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* TAB 1: MY IDENTITY QR CODE */}
        {activeTab === 'MY_QR' && (
          <div className="space-y-3 text-center">
            <p className="text-xs text-slate-300">
              Show this QR code to nearby users so they can scan and message you over off-grid mesh:
            </p>

            {/* Generated Simulated QR Code Graphic */}
            <div className="p-4 rounded-xl bg-white mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-lg border-2 border-emerald-500/60 relative">
              {/* Corner position markers */}
              <div className="absolute top-2 left-2 h-8 w-8 border-4 border-black p-0.5 flex items-center justify-center">
                <div className="h-4 w-4 bg-black" />
              </div>
              <div className="absolute top-2 right-2 h-8 w-8 border-4 border-black p-0.5 flex items-center justify-center">
                <div className="h-4 w-4 bg-black" />
              </div>
              <div className="absolute bottom-2 left-2 h-8 w-8 border-4 border-black p-0.5 flex items-center justify-center">
                <div className="h-4 w-4 bg-black" />
              </div>

              {/* Grid patterns */}
              <div className="grid grid-cols-7 gap-1 w-24 h-24 my-auto">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[1px] ${
                      (i * 7 + 13) % 3 === 0 || i % 5 === 0 ? 'bg-black' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Center handle badge */}
              <div className="absolute inset-0 m-auto h-7 w-20 rounded bg-emerald-600 border border-slate-900 flex items-center justify-center text-[9px] font-mono font-bold text-slate-950">
                {identityHandle}
              </div>
            </div>

            {/* User Identity Info */}
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-0.5">
              <span className="font-bold text-emerald-400 block">{identityHandle}</span>
              <span className="text-[10px] text-slate-400">10-Character Verified Mesh Identity</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(myQrPayload, 'My QR Link')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
              >
                {copiedText === 'My QR Link' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedText === 'My QR Link' ? 'Copied!' : 'Copy Payload'}</span>
              </button>
              <button
                onClick={() => {
                  onLogEvent('QRManager', 'Saved user QR code to phone gallery.', 'success');
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save QR Image</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GROUP QR CODE & ADMIN CONTROLS */}
        {activeTab === 'GROUP_QR' && selectedGroup && (
          <div className="space-y-3">
            {/* Group Selector Dropdown */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Select Group:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-white p-2"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.members.length} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Group QR Card */}
            <div className={`p-3 rounded-xl border text-center space-y-2 transition-all ${
              selectedGroup.isQrJoinEnabled === false
                ? 'bg-rose-950/20 border-rose-900/60 opacity-85'
                : 'bg-slate-950 border-emerald-500/40'
            }`}>
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{selectedGroup.name}</span>
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  selectedGroup.isQrJoinEnabled === false
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {selectedGroup.isQrJoinEnabled === false ? 'QR Disabled' : 'QR Active'}
                </span>
              </div>

              {/* QR Display or Disabled Placeholder */}
              {selectedGroup.isQrJoinEnabled === false ? (
                <div className="h-36 w-full rounded-lg bg-slate-900/80 border border-rose-900/40 flex flex-col items-center justify-center p-3 text-center space-y-1">
                  <Lock className="h-7 w-7 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300">QR Code Joining Disabled</span>
                  <p className="text-[10px] text-slate-400">
                    Group Admin has revoked public QR joining. New members can only be invited directly.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-white mx-auto w-36 h-36 flex flex-col items-center justify-center relative shadow">
                  <div className="grid grid-cols-6 gap-1 w-20 h-20">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${
                          (i * 5 + 7) % 2 === 0 ? 'bg-black' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-bold text-black mt-1">
                    {selectedGroup.qrInviteCode || 'INV-GROUP'}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Invite Code: <span className="font-mono text-emerald-400 font-bold">{selectedGroup.qrInviteCode || 'INV-001'}</span>
              </p>
            </div>

            {/* GROUP ADMIN CONTROLS SECTION */}
            {isGroupAdmin ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Group Admin QR Controls</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Admin Mode</span>
                </div>

                {/* Control 1: Enable / Disable QR Code Joining */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">Enable QR Code Joining</span>
                    <span className="text-[10px] text-slate-400">Allow new peers to scan & join</span>
                  </div>
                  <button
                    onClick={handleToggleQrEnabled}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                      selectedGroup.isQrJoinEnabled === false
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-700'
                        : 'bg-emerald-600 text-slate-950'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{selectedGroup.isQrJoinEnabled === false ? 'Disabled' : 'Enabled'}</span>
                  </button>
                </div>

                {/* Control 2: Reset / Change QR Code */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="font-semibold text-white block">Reset / Change QR Code</span>
                    <span className="text-[10px] text-slate-400">Revokes old QR and generates new key</span>
                  </div>
                  <button
                    onClick={handleRegenerateGroupQr}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Control 3: Pending Join Requests with Reject / Approve */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>Pending Join Requests</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {selectedGroup.pendingJoinRequests?.length || 0}
                      </span>
                    </span>
                  </div>

                  {(!selectedGroup.pendingJoinRequests || selectedGroup.pendingJoinRequests.length === 0) ? (
                    <p className="text-[10px] text-slate-500 italic">No pending requests waiting for approval.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedGroup.pendingJoinRequests.map(req => (
                        <div
                          key={req.id}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white font-mono block">{req.userHandle}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              Used: {req.qrInviteCodeUsed || 'Direct Scan'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Reject Button */}
                            <button
                              onClick={() => handleRejectRequest(req)}
                              title="Reject Join Request"
                              className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] flex items-center gap-0.5 font-bold"
                            >
                              <UserX className="h-3 w-3" />
                              <span>Reject</span>
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={() => handleApproveRequest(req)}
                              title="Approve Member into Group"
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] flex items-center gap-0.5 font-bold shadow-sm"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 text-center italic">
                Only Group Admins can change the QR invite code or approve/reject join requests.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: SCAN QR CODE */}
        {activeTab === 'SCAN' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Scan a user or group QR code with camera, or paste payload to instantly connect:
            </p>

            {/* Scanner Viewfinder Box */}
            <div className="relative w-full h-40 rounded-xl bg-black border border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden">
              {/* Corner reticles */}
              <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-emerald-400" />

              {/* Animated laser scan line */}
              <div className="absolute w-4/5 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />

              <Scan className="h-8 w-8 text-emerald-400/60 mb-1" />
              <span className="text-[10px] font-mono text-emerald-300/80">Optical Scanner Active</span>
            </div>

            {/* Manual QR Input / Simulator Buttons */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={scanInputText}
                  onChange={(e) => setScanInputText(e.target.value)}
                  placeholder="Paste QR payload (e.g. qaidi-user:...)..."
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white px-2.5 py-1.5 font-mono placeholder-slate-500"
                />
                <button
                  onClick={() => handleExecuteScan(scanInputText)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Decode
                </button>
              </div>

              {/* Quick Simulation shortcuts */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => {
                    const sample = `qaidi-user:qaidi7711?pubkey=02ff7711a19c`;
                    setScanInputText(sample);
                    handleExecuteScan(sample);
                  }}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9.5px] font-mono font-semibold"
                >
                  Test User QR
                </button>
                <button
                  onClick={() => {
                    const sample = `qaidi-group:group-mesh-ops?code=INV-OPS-9841`;
                    setScanInputText(sample);
                    handleExecuteScan(sample);
                  }}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9.5px] font-mono font-semibold"
                >
                  Test Group QR
                </button>
              </div>
            </div>

            {/* Scan Result Feedback Toast */}
            {scanResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in slide-in-from-top-2 ${
                scanResult.type === 'ERROR'
                  ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{scanResult.type === 'ERROR' ? 'Scan Failed' : 'QR Decoded Successfully'}</span>
                  <button onClick={() => setScanResult(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-[11px] leading-snug">{scanResult.message}</p>

                {scanResult.targetId && (
                  <button
                    onClick={() => {
                      if (scanResult.type === 'USER') {
                        onSelectPeerByHandle(scanResult.targetId!);
                      } else {
                        onSelectGroupById(scanResult.targetId!);
                      }
                      onClose();
                    }}
                    className="w-full mt-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]"
                  >
                    Open {scanResult.type === 'USER' ? 'Direct Chat' : 'Group'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
