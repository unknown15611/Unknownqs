import React, { useState } from 'react';
import {
  Share2,
  Download,
  Link,
  ShieldCheck,
  Youtube,
  Facebook,
  Image,
  Film,
  X,
  CheckCircle2
} from 'lucide-react';
import {
  detectSourcePlatform,
  generateAntiMisinformationBadge,
  processShareIntent,
  ShareMode,
  SourcePlatform
} from '../core/systemShareSheet';

interface ShareSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onConfirmShare: (title: string, mode: ShareMode, platform: SourcePlatform) => void;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  isOpen,
  onClose,
  onLogEvent,
  onConfirmShare
}) => {
  const [shareText, setShareText] = useState('https://youtu.be/cantenna_range_extender_guide');
  const [chosenMode, setChosenMode] = useState<ShareMode>('DOWNLOAD_FILE_AND_LINK');
  const [destination, setDestination] = useState<'PUBLIC_SOCIAL_WALL' | 'CHAT_DIRECT'>('PUBLIC_SOCIAL_WALL');

  if (!isOpen) return null;

  const platform = detectSourcePlatform(shareText);
  const badge = generateAntiMisinformationBadge(platform, shareText);

  const handleExecuteShare = () => {
    const payload = processShareIntent(
      {
        action: 'android.intent.action.SEND',
        mimeType: 'text/plain',
        sharedText: shareText
      },
      chosenMode,
      destination
    );

    onLogEvent(
      'SystemShareSheet',
      `Intercepted Intent.ACTION_SEND from ${platform}. Mode: ${chosenMode}. Watermark badge attached (Hash: ${badge.mediaHashHex}).`,
      'success'
    );

    onConfirmShare(shareText, chosenMode, platform);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Android System Share Sheet</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Originating App Detected */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {platform === 'YOUTUBE' && <Youtube className="h-4 w-4 text-red-500" />}
            {platform === 'FACEBOOK' && <Facebook className="h-4 w-4 text-blue-500" />}
            {platform === 'GALLERY' && <Image className="h-4 w-4 text-purple-400" />}
            <span className="text-xs font-semibold text-white">{badge.platformLabel}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            ACTION_SEND
          </span>
        </div>

        {/* Shared URL / Content Input */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Shared Media Link / Path:
          </label>
          <input
            type="text"
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dual Share Mode Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
            Select Share Mode:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setChosenMode('DOWNLOAD_FILE_AND_LINK')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                chosenMode === 'DOWNLOAD_FILE_AND_LINK'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-emerald-300">
                <Download className="h-3.5 w-3.5" />
                <span>Download Media + Mesh Link</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Saves MP4/JPEG file locally & seeds across mesh peers for 100% offline viewing.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setChosenMode('LINK_ONLY')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                chosenMode === 'LINK_ONLY'
                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-blue-300">
                <Link className="h-3.5 w-3.5" />
                <span>Send Link-Only</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Lightweight 1 KB packet payload. Conserves radio bandwidth and battery.
              </p>
            </button>
          </div>
        </div>

        {/* Anti-Misinformation Badge Preview */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Anti-Misinformation Watermark Overlay</span>
          </div>
          <div className="p-2 rounded bg-black/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
            <span>{badge.platformLabel}</span>
            <span className="text-slate-400">{badge.originalTimestampText}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block">
            SHA-256 Tamper Hash: {badge.mediaHashHex} • Embedded into video frames
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleExecuteShare}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Broadcast via Qaidi Share</span>
        </button>
      </div>
    </div>
  );
};
