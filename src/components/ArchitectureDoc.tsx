import React from 'react';
import {
  Shield,
  Radio,
  Battery,
  Lock,
  Layers,
  FileCode,
  DollarSign,
  Key,
  FolderTree,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Volume2
} from 'lucide-react';
import { ANDROID_PROJECT_TREE } from '../data/androidCodebase';

interface ArchitectureDocProps {
  onSelectFile: (fileId: string) => void;
}

export const ArchitectureDoc: React.FC<ArchitectureDocProps> = ({ onSelectFile }) => {
  return (
    <div className="space-y-8 p-6 text-slate-200 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
            <span>OFF-GRID DECENTRALIZED ANDROID ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Qaidi Share: Production-Ready Jetpack Compose Mesh OS
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            A 100% decentralized, server-free, phone-number-free mobile communication engine written in Kotlin for modern Android. Features GitHub Private Fallback Routing, Hardware MAC + qaidi[random] User ID Binding, WhatsApp-Grade Chat & Media Engine, Multi-Channel PTT Audio, TikTok/Facebook Social Wall, In-App YouTube Scrolling Feed, SDR Speaker Radio, Qibla/Campus Finder, and Hidden Master Admin locked exclusively to qaidi156.
          </p>
        </div>
      </div>

      {/* Directory Structure Blueprint */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <FolderTree className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">1. Complete Android Project Directory Structure</h2>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner leading-relaxed">
          <pre>{ANDROID_PROJECT_TREE}</pre>
        </div>
      </section>

      {/* Module 1: MeshConnectivityManager & Radio Duty Cycling */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Radio className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">2. MeshConnectivityManager & Power Management</h2>
          </div>
          <button
            onClick={() => onSelectFile('mesh-connectivity-manager')}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            MeshConnectivityManager.kt →
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The <code className="text-emerald-300">MeshConnectivityManager</code> abstracts four physical radio subsystems on Android devices:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Wi-Fi Direct (P2P Group)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Provides 50–250 Mbps high-throughput bandwidth for offline video chunk swarms and heavy media transfers when nodes are within 50m.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Wi-Fi Aware / NAN (Android 8.0+)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Zero-Access-Point peer discovery. Enables low-latency direct sockets without creating a visible Wi-Fi hotspot or disconnecting from existing networks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> BLE Mesh (Bluetooth Low Energy)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Always-on base discovery layer. Transmits cryptographic beacon headers and tiny DTN control packets with minimal milliamp draw.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Local P2P Wi-Fi Routers
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Discovers shelter, emergency vehicle, or campus routers via mDNS/NSD on port 8988, bridging isolated mesh islands over existing Ethernet or offline LANs.
            </p>
          </div>
        </div>

        {/* Duty Cycling Subsystem */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs space-y-2">
          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
            <Battery className="h-4 w-4" /> Battery Duty Cycling & Instant Wake Interrupt
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            To prevent Android radio power drain, <code className="text-emerald-300">BatteryDutyCycleManager</code> enforces adaptive duty-cycles (e.g. 10s active scanning / 50s deep radio sleep). When high-priority emergency packets arrive or SOS is triggered, a hardware <code className="text-emerald-300">PARTIAL_WAKE_LOCK</code> is acquired to wake radios instantly.
          </p>
        </div>
      </section>

      {/* Module 2: IdentityManager */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Key className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">3. IdentityManager & 12-Word Recovery</h2>
          </div>
          <button
            onClick={() => onSelectFile('identity-manager')}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            IdentityManager.kt →
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The <code className="text-emerald-300">IdentityManager</code> creates a self-sovereign identity without phone numbers, SIM cards, or central authority databases:
        </p>

        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-white">BIP-39 Mnemonic Seed:</strong> Generates 128-bit entropy mapped to a 12-word recovery seed phrase with SHA-256 checksum verification.
          </li>
          <li>
            <strong className="text-white">Dual Keypair Derivation:</strong> Derives an <strong className="text-emerald-300">Ed25519</strong> signing keypair (identity authentication) and converts to <strong className="text-emerald-300">Curve25519 (X25519)</strong> for Diffie-Hellman key agreement in E2EE messaging.
          </li>
          <li>
            <strong className="text-white">AndroidKeyStore MasterKey:</strong> All private keys are stored encrypted via <code className="text-emerald-300">EncryptedSharedPreferences</code> backed by an AES-256-GCM hardware key.
          </li>
          <li>
            <strong className="text-white">Offline Password-Encrypted File Backup:</strong> Backs up and restores keys using PBKDF2 (100,000 iterations) + AES-256-GCM offline <code className="text-emerald-300">.aetherkey</code> files.
          </li>
        </ul>
      </section>

      {/* Module 3: Developer Authority & Tamper Protection */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Shield className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">4. Developer Authority & Anti-Tamper Security</h2>
          </div>
          <button
            onClick={() => onSelectFile('developer-authority-manager')}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            DeveloperAuthorityManager.kt →
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To ensure mesh broadcasts cannot be spoofed by rogue actors:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-300">Cryptographic Master Key Signing</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Global mesh announcements, emergency frequency policies, and GitHub raw updates require an Ed25519 signature from the hardcoded Master Developer Public Key. Unsigned or forged announcements are rejected automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">APK Signature Integrity Check</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              At runtime, <code className="text-cyan-300">verifyAppIntegrity()</code> inspects the active APK signing certificate SHA-256 hash using Android's <code className="text-cyan-300">PackageManager.GET_SIGNING_CERTIFICATES</code> to detect repackaged or reverse-engineered binaries.
            </p>
          </div>
        </div>
      </section>

      {/* Module 4: Hybrid AdMob Integration */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">5. Hybrid AdMob & Offline Zero-Drain Handling</h2>
          </div>
          <button
            onClick={() => onSelectFile('admob-hybrid-manager')}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            AdMobHybridManager.kt →
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Strict Online/Offline Rule:</strong> A communication app built for emergency off-grid situations must never crash or drain precious battery polling for online advertisements when there is no internet.
          </p>
          <ul className="list-disc pl-5 text-[11px] text-slate-400 space-y-1">
            <li><strong className="text-emerald-300">Pure Off-Grid Mesh:</strong> AdMob views are completely collapsed (<code className="text-emerald-300">View.GONE</code> in XML / absent in Jetpack Compose). Network requests are strictly silenced.</li>
            <li><strong className="text-emerald-300">Online Internet:</strong> Google AdMob SDK serves banner ads in public Reels feeds and optional rewarded ads that grant user bonuses (e.g. +500MB offline chunk cache quota).</li>
            <li><strong className="text-emerald-300">Power-Saver Mode:</strong> Automatically suppresses all ads when Android Battery Saver is activated.</li>
          </ul>
        </div>
      </section>

      {/* Module 5: GitHubPublicIndexSyncManager */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <GitBranch className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">6. GitHub Public Index Sync & Strict Separation</h2>
          </div>
          <button
            onClick={() => onSelectFile('github-public-sync-manager')}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            GitHubPublicIndexSyncManager.kt →
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>Strict Air-Gap Separation Mandate</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            The GitHub integration uses raw repository endpoints (<code className="text-slate-200">raw.githubusercontent.com</code>) purely as a free, decentralized public phonebook and bulletin board.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
              <span className="font-bold block mb-0.5">✓ Allowed on GitHub (Public Only):</span>
              • Public user handles (<code className="text-white">@username</code>)<br />
              • Public signing key fingerprints<br />
              • Public Reels title & Merkle root metadata<br />
              • Official community broadcast posts
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200">
              <span className="font-bold block mb-0.5">✗ NEVER Touching GitHub (Air-Gapped):</span>
              • Private 1-on-1 and group chats<br />
              • User media, video chunks, voice audio<br />
              • Seed phrases & private keys<br />
              • Contact lists & private routing topology
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
