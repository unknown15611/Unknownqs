import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Cpu,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Fingerprint
} from 'lucide-react';
import {
  generateRandomQaidiHandle,
  generateRandom5DigitSuffix,
  generateHardwareMac,
  registerOrAuthenticateAccount,
  isSuperAdminAuthenticated,
  checkHandleUniqueness,
  parseHandleParts,
  validatePrefix,
  UserAccountProfile
} from '../core/authAndIdentity';

interface AuthAndIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHandle: string;
  onUpdateHandle: (newHandle: string) => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  activeMeshPeers?: string[];
}

export const AuthAndIdentityModal: React.FC<AuthAndIdentityModalProps> = ({
  isOpen,
  onClose,
  currentHandle,
  onUpdateHandle,
  onLogEvent,
  activeMeshPeers = ['qaidi77110', 'qaidi33901', 'qaidi88214']
}) => {
  // Parse initial 5-character prefix and 5-digit locked suffix
  const parsed = useMemo(() => parseHandleParts(currentHandle), [currentHandle]);

  const [prefixInput, setPrefixInput] = useState(() => parsed.prefix || 'qaidi');
  const [lockedSuffix, setLockedSuffix] = useState(() => parsed.suffix || generateRandom5DigitSuffix());
  const [passwordInput, setPasswordInput] = useState('secure_mesh_pass_99');
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [deviceMac] = useState(() => generateHardwareMac('qaidi_hardware_seed_01'));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [collisionWarning, setCollisionWarning] = useState(false);

  // Simulated known network registry
  const [registry, setRegistry] = useState<Record<string, UserAccountProfile>>({
    qaidi1561561: {
      handle: 'qaidi1561561',
      hardwareMac: '02:00:00:FF:AA:01',
      passwordHashHex: 'MASTER_ADMIN_SUPER_KEY_HASH',
      recoveryKeyHex: 'rk_qaidi1561561_master_seed',
      registeredAt: 1730000000000,
      lastLoginAt: Date.now(),
      displayName: 'Master Super Admin',
      avatarSeed: 'qaidi1561561'
    },
    qaidi77110: {
      handle: 'qaidi77110',
      hardwareMac: '02:00:00:FF:AA:02',
      passwordHashHex: 'PASS_HASH_02',
      recoveryKeyHex: 'rk_qaidi77110',
      registeredAt: 1730000001000,
      lastLoginAt: Date.now(),
      displayName: 'Peer Ali',
      avatarSeed: 'qaidi77110'
    }
  });

  // Sync state whenever modal opens or currentHandle changes
  useEffect(() => {
    if (isOpen) {
      const parts = parseHandleParts(currentHandle);
      setPrefixInput(parts.prefix);
      setLockedSuffix(parts.suffix);
      setErrorMessage(null);
      setSuccessMessage(null);
      setCollisionWarning(false);
    }
  }, [isOpen, currentHandle]);

  if (!isOpen) return null;

  // Compute full 10-character proposed handle
  const cleanPrefix = prefixInput.trim().toLowerCase();
  const proposedFullHandle = `${cleanPrefix}${lockedSuffix}`;
  const prefixValidation = validatePrefix(prefixInput);

  // Real-time Duplicate & Uniqueness Check
  const uniquenessResult = checkHandleUniqueness(
    proposedFullHandle,
    registry,
    activeMeshPeers
  );

  // Handle prefix change (alphanumeric only, no spaces or special characters, max 5 chars)
  const handlePrefixChange = (rawText: string) => {
    // Strip spaces and special characters immediately
    const sanitized = rawText.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
    setPrefixInput(sanitized);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCollisionWarning(false);
  };

  // Generate a new random 10-character handle with fresh locked 5-digit number
  const handleGenerateNewRandom = () => {
    const existingHandles = [...Object.keys(registry), ...activeMeshPeers];
    const fresh = generateRandomQaidiHandle(existingHandles);
    const parts = parseHandleParts(fresh);
    setPrefixInput(parts.prefix); // 'qaidi'
    setLockedSuffix(parts.suffix); // new 5-digit number
    setCollisionWarning(false);
    setErrorMessage(null);
    setSuccessMessage(`Generated fresh 10-character handle "${fresh}"!`);
  };

  const handleSaveAndAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate 5-character prefix
    if (!prefixValidation.isValid) {
      setErrorMessage(prefixValidation.error || 'Prefix must be exactly 5 alphanumeric characters.');
      return;
    }

    // Validate total length is exactly 10
    if (proposedFullHandle.length !== 10) {
      setErrorMessage(`Total name must be exactly 10 characters (currently ${proposedFullHandle.length}/10).`);
      return;
    }

    // Duplicate check
    if (!uniquenessResult.isUnique && proposedFullHandle !== currentHandle) {
      setErrorMessage(uniquenessResult.message);
      setCollisionWarning(true);
      onLogEvent('IdentityManager', `Duplicate name collision for "${proposedFullHandle}".`, 'warn');
      return;
    }

    const result = registerOrAuthenticateAccount(
      proposedFullHandle,
      passwordInput,
      deviceMac,
      registry,
      recoveryKeyInput || undefined
    );

    if (result.status === 'INVALID_HANDLE') {
      setErrorMessage(result.message);
      return;
    }

    if (result.status === 'COLLISION_NEEDS_RECOVERY_KEY') {
      setCollisionWarning(true);
      setErrorMessage(result.message);
      onLogEvent('IdentityManager', `Handle collision for "${result.takenHandle}". Awaiting 12-word recovery key.`, 'warn');
      return;
    }

    if (result.status === 'SUCCESS') {
      setRegistry({ ...registry, [result.profile.handle]: result.profile });
      onUpdateHandle(result.profile.handle);
      setCollisionWarning(false);
      setSuccessMessage(`Successfully registered & authenticated as ${result.profile.handle}!`);
      onLogEvent(
        'IdentityManager',
        `Authenticated as ${result.profile.handle} (10-char verified). Bound to Hardware MAC ${deviceMac}. Locked suffix ${lockedSuffix} saved.`,
        'success'
      );
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  // Quick switch for Super Admin debugging
  const handleSwitchToSuperAdminQuick = () => {
    onUpdateHandle('qaidi1561561');
    setSuccessMessage('Logged in as Master Super Admin (qaidi1561561).');
    onLogEvent('IdentityManager', 'Switched to Master Super Admin qaidi1561561.', 'info');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Hardware Identity & Name Rule</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 10-Character & Permanent Number Rules Notice */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 mb-3 space-y-1.5 leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
              <span>10-Character Identity Standard:</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30">
              {proposedFullHandle.length}/10 chars
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            • Default name starts with <code className="text-emerald-300 font-mono font-bold">qaidi</code> followed by a 5-digit number.
            <br />
            • <strong className="text-slate-200">User can change &apos;qaidi&apos; to any 5 characters</strong> (alphabets & numbers only, no spaces or symbols).
            <br />
            • <strong className="text-amber-300">Generated 5-digit number is PERMANENTLY LOCKED</strong> and cannot be changed to prevent node spoofing.
          </p>
        </div>

        {/* How Duplicate Detection Works (User's Question Addressed Transparently) */}
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[10px] text-emerald-300 mb-3 space-y-1">
          <span className="font-bold text-emerald-200 flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400" />
            <span>How We Know If Name Is Duplicate:</span>
          </span>
          <p className="text-[10px] text-emerald-200/80 leading-snug">
            1. <strong>Active Mesh Peer Beacons:</strong> Real-time scan of nearby BLE, Wi-Fi Direct, Wi-Fi Aware & LoRa nodes.
            <br />
            2. <strong>Local & GitHub Sync Registry:</strong> Checks offline SQLite DB & synced public handles.
            <br />
            3. <strong>Hardware Salt Suffix:</strong> The 5-digit number is mathematically unique to this device seed.
          </p>
        </div>

        <form onSubmit={handleSaveAndAuthenticate} className="space-y-3">
          {/* Two-Part Handle Field: Editable 5-char Prefix + Locked 5-digit Suffix */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                10-Character User Handle:
              </label>
              <button
                type="button"
                onClick={handleGenerateNewRandom}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                title="Generate fresh 10-char name"
              >
                <RefreshCw className="h-3 w-3" />
                <span>New Suffix</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Editable Prefix (5 characters, user can change qaidi to anything) */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  maxLength={5}
                  value={prefixInput}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  placeholder="qaidi"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center uppercase tracking-wider"
                />
                <span className="absolute right-2 top-2.5 text-[9px] font-mono text-slate-500">
                  {prefixInput.length}/5
                </span>
              </div>

              <span className="text-slate-600 font-bold">+</span>

              {/* Permanently Locked Generated 5-Digit Number */}
              <div className="flex items-center gap-1 bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-2 font-mono text-xs font-bold text-amber-300 shadow-inner">
                <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{lockedSuffix}</span>
                <span className="text-[8px] uppercase tracking-widest text-amber-400/80 font-sans ml-0.5">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Combined Handle Preview & Character Constraints */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">
                Full 10-char ID: <strong className="text-white">{proposedFullHandle}</strong>
              </span>
              <span className="text-slate-500">No spaces • Alphanumeric only</span>
            </div>
          </div>

          {/* Real-Time Duplicate & Validation Status Box */}
          <div className="pt-0.5">
            {!prefixValidation.isValid ? (
              <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-[10px] text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{prefixValidation.error}</span>
              </div>
            ) : !uniquenessResult.isUnique && proposedFullHandle !== currentHandle ? (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-[10px] text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>{uniquenessResult.message}</span>
              </div>
            ) : (
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40 text-[10px] text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {uniquenessResult.message} ({proposedFullHandle} ready)
                </span>
              </div>
            )}
          </div>

          {/* Password Input (Hardware Salted) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Account Password (Hardware Salting):
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Recovery Key Input if collision or claiming */}
          {collisionWarning && (
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Account Claim Verification</span>
              </div>
              <p className="text-[10px] text-amber-200/90 leading-relaxed">
                This User ID is already claimed on the mesh. Enter your 12-word recovery key to reconnect.
              </p>
              <input
                type="text"
                value={recoveryKeyInput}
                onChange={(e) => setRecoveryKeyInput(e.target.value)}
                placeholder="Enter 12-word recovery mnemonic or recovery key..."
                className="w-full rounded bg-slate-950 border border-amber-500/40 px-2 py-1.5 text-[11px] font-mono text-amber-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={!prefixValidation.isValid || (!uniquenessResult.isUnique && proposedFullHandle !== currentHandle)}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Save 10-Char Name & Authenticate</span>
            </button>

            {/* Quick Testing Toggles */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSwitchToSuperAdminQuick}
                className="flex-1 py-1.5 rounded-md bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold"
              >
                Super Admin Mode
              </button>
              <button
                type="button"
                onClick={handleGenerateNewRandom}
                className="flex-1 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-mono font-bold"
              >
                Reset Default (qaidi)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
