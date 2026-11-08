import React from 'react';
import { Folder, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { updateStoragePermissionState, StoragePermissionState } from '../core/storagePermissions';

interface AndroidPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted: () => void;
  onLogEvent?: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const AndroidPermissionModal: React.FC<AndroidPermissionModalProps> = ({
  isOpen,
  onClose,
  onGranted,
  onLogEvent
}) => {
  if (!isOpen) return null;

  const handleDecision = (decision: 'ALLOW' | 'ALLOW_ONCE' | 'DENY') => {
    const result = updateStoragePermissionState(decision);
    if (result.state === 'GRANTED') {
      onLogEvent?.(
        'AndroidPermission',
        `Storage permission granted (${decision === 'ALLOW_ONCE' ? 'Only this time' : 'Full access'}).`,
        'success'
      );
      onGranted();
    } else {
      onLogEvent?.(
        'AndroidPermission',
        'Storage permission denied by user. Local file access blocked.',
        'warn'
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in select-none">
      {/* Authentic Android 13/14 System Permission Card */}
      <div className="w-full max-w-[320px] rounded-[28px] bg-[#1c1b1f] border border-[#49454f]/50 p-6 shadow-2xl text-[#e6e1e5] space-y-4">
        {/* Android Material You Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center border border-[#d0bcff]/30">
            <Folder className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight text-white">
              Allow <span className="font-bold text-[#d0bcff]">Qaidi Mesh</span> to access photos, videos, audio, and files on this device?
            </h3>
            <p className="text-[11px] text-[#cac4d0] leading-snug">
              Required to securely pick and share local photos, offline maps, voice recordings, and encrypted files with mesh peers.
            </p>
          </div>
        </div>

        {/* Security / Privacy Badge */}
        <div className="p-2 rounded-xl bg-black/40 border border-[#49454f]/40 flex items-center gap-2 text-[10px] text-[#938f99]">
          <Shield className="h-3.5 w-3.5 text-[#38e897] shrink-0" />
          <span>Local device only • Zero cloud uploads • End-to-end encrypted</span>
        </div>

        {/* Android Standard Permission Action Buttons */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleDecision('ALLOW')}
            className="w-full py-2.5 rounded-full bg-[#d0bcff] hover:bg-[#bba3ef] text-[#381e72] font-semibold text-xs tracking-wide transition-all shadow-sm active:scale-[0.98]"
          >
            While using the app
          </button>

          <button
            type="button"
            onClick={() => handleDecision('ALLOW_ONCE')}
            className="w-full py-2 rounded-full bg-[#2b2930] hover:bg-[#36343b] text-[#e6e1e5] font-medium text-xs tracking-wide transition-all border border-[#49454f]/50 active:scale-[0.98]"
          >
            Only this time
          </button>

          <button
            type="button"
            onClick={() => handleDecision('DENY')}
            className="w-full py-2 rounded-full hover:bg-white/5 text-[#cac4d0] hover:text-white font-medium text-xs tracking-wide transition-all active:scale-[0.98]"
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};
