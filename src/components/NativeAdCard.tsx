import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Sun,
  Radio,
  Zap,
  BatteryCharging,
  DollarSign,
  ShieldCheck,
  X,
  HeartHandshake
} from 'lucide-react';

export interface NativeAdData {
  id: string;
  advertiser: string;
  headline: string;
  description: string;
  ctaText: string;
  tag: string;
  iconType: 'solar' | 'lora' | 'battery' | 'satellite';
  badge: string;
  cpcValue: number; // e.g. 0.45 USD per interaction
  targetUrl: string;
  imageUrl?: string;
}

export const SAMPLE_NATIVE_ADS: NativeAdData[] = [
  {
    id: 'ad-solar-lora-1',
    advertiser: 'Heltec Automation',
    headline: 'Solar LoRa Repeater Station Kit 868/915MHz',
    description: 'Autonomous 24/7 off-grid mesh repeater with built-in MPPT solar controller, IP67 waterproof case & SX1262 chip.',
    ctaText: 'View Hardware ($39)',
    tag: 'Hardware Sponsor',
    iconType: 'solar',
    badge: 'Solar LoRa Fund',
    cpcValue: 0.65,
    targetUrl: 'https://heltec.org'
  },
  {
    id: 'ad-rak-wireless-2',
    advertiser: 'RAKwireless WisBlock',
    headline: 'Meshtastic Modular LoRa Starter Kit',
    description: 'Plug-and-play modular LoRa transceiver. Up to 15km range with zero cellular infrastructure or subscription fees.',
    ctaText: 'Explore Kits',
    tag: 'Official Partner',
    iconType: 'lora',
    badge: 'AdMob Native',
    cpcValue: 0.45,
    targetUrl: 'https://store.rakwireless.com'
  },
  {
    id: 'ad-anker-solar-3',
    advertiser: 'Anker Solix Outdoor',
    headline: 'Portable 30W Foldable USB-C Solar Charger',
    description: 'High-efficiency monocrystalline solar cells. Power all your mobile nodes, walkie-talkies and powerbanks in the wild.',
    ctaText: 'Claim 20% Off',
    tag: 'Energy Sponsor',
    iconType: 'battery',
    badge: 'AdMob Sponsored',
    cpcValue: 0.55,
    targetUrl: 'https://anker.com'
  },
  {
    id: 'ad-satellite-backhaul-4',
    advertiser: 'Starlink Mini Hardware',
    headline: 'Ultra-Portable DC 12V Satellite Gateway',
    description: 'High-speed emergency internet uplink for mesh gateway nodes during total regional telecom blackout.',
    ctaText: 'Learn More',
    tag: 'Telecom Sponsor',
    iconType: 'satellite',
    badge: 'AdMob Native Advanced',
    cpcValue: 0.85,
    targetUrl: 'https://starlink.com'
  }
];

interface NativeAdCardProps {
  adIndex?: number;
  variant?: 'chat' | 'notice' | 'compact';
  onLogEvent?: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onAdRevenueGained?: (amount: number) => void;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({
  adIndex = 0,
  variant = 'chat',
  onLogEvent,
  onAdRevenueGained
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const ad = SAMPLE_NATIVE_ADS[adIndex % SAMPLE_NATIVE_ADS.length];

  if (isDismissed) return null;

  const handleAdClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasInteracted) {
      setHasInteracted(true);
      if (onAdRevenueGained) {
        onAdRevenueGained(ad.cpcValue);
      }
      if (onLogEvent) {
        onLogEvent(
          'AdMobRevenue',
          `Native Ad Interaction: "${ad.headline}" by ${ad.advertiser}. Earned +$${ad.cpcValue.toFixed(2)} for Community Solar LoRa Repeater Fund!`,
          'success'
        );
      }
    }
  };

  const getIcon = () => {
    switch (ad.iconType) {
      case 'solar':
        return <Sun className="h-4 w-4 text-amber-400" />;
      case 'lora':
        return <Radio className="h-4 w-4 text-emerald-400" />;
      case 'battery':
        return <BatteryCharging className="h-4 w-4 text-cyan-400" />;
      case 'satellite':
        return <Zap className="h-4 w-4 text-purple-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
    }
  };

  if (variant === 'chat') {
    return (
      <div className="my-2.5 mx-1 p-2.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/25 via-slate-900/90 to-amber-950/25 shadow-md text-xs relative animate-in fade-in">
        {/* Top Sponsored Header Bar */}
        <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold font-mono uppercase tracking-wider">
              Ad • Sponsored
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {ad.advertiser}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-emerald-300 font-mono flex items-center gap-0.5 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/20">
              <Sun className="h-2.5 w-2.5 text-amber-400" />
              <span>Solar LoRa Fund</span>
            </span>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title="Dismiss ad"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            {getIcon()}
          </div>

          <div className="flex-1 space-y-1">
            <h5 className="font-bold text-white text-xs leading-snug">
              {ad.headline}
            </h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {ad.description}
            </p>

            <div className="pt-1.5 flex items-center justify-between gap-2">
              <div className="text-[9px] text-emerald-400/90 font-mono">
                {hasInteracted ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <HeartHandshake className="h-3 w-3 inline text-emerald-400" />
                    +${ad.cpcValue.toFixed(2)} added to Solar LoRa Fund!
                  </span>
                ) : (
                  <span>Clicks fund solar repeater nodes</span>
                )}
              </div>

              <button
                onClick={handleAdClick}
                className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all shrink-0"
              >
                <span>{ad.ctaText}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Notice Board Variant (Card Style that blends seamlessly between notice bulletins)
  return (
    <div className="my-3 p-3.5 rounded-xl border border-amber-500/35 bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/20 shadow-lg text-xs relative animate-in fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold font-mono uppercase tracking-wider">
            Sponsored Ad
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
            {ad.tag}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            via Google AdMob Native
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono flex items-center gap-1">
            <Sun className="h-3 w-3 text-amber-400" />
            <span>Solar LoRa Community Fund</span>
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-500 hover:text-slate-300 p-0.5"
            title="Dismiss ad"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md">
          {getIcon()}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white leading-snug">
              {ad.headline}
            </h4>
            <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 ml-2">
              {ad.advertiser}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {ad.description}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <DollarSign className="h-3 w-3 text-emerald-400" />
              <span>
                {hasInteracted ? (
                  <strong className="text-emerald-300">
                    +$0.{Math.round(ad.cpcValue * 100)} Revenue credited to Solar LoRa fund!
                  </strong>
                ) : (
                  <span>Ad revenue funds community solar LoRa nodes</span>
                )}
              </span>
            </div>

            <button
              onClick={handleAdClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
