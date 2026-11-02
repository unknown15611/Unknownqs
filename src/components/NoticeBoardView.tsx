import React, { useState, useEffect } from 'react';
import {
  Bell,
  Radio,
  Wifi,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Download,
  CheckCircle2,
  Share2,
  Plus,
  X,
  Tag,
  Calendar,
  User,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Cpu,
  Layers,
  ChevronRight,
  Flame,
  Wrench,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  HardDriveDownload,
  FileCheck,
  BookOpen,
  Lock,
  Sun,
  DollarSign
} from 'lucide-react';
import { NativeAdCard } from './NativeAdCard';
import {
  ESP32_LORA_C_PLUS_PLUS_CODE,
  PYTHON_SDR_TRANSMIT_CODE
} from '../core/radioPacketTransmission';

export interface NoticeItem {
  id: string;
  category: 'LORA_TECH' | 'P2P_MESH' | 'LONG_RANGE' | 'DIY_BROADCASTER' | 'FIELD_SAFETY' | 'COMMUNITY_ANNOUNCEMENT';
  title: string;
  author: string;
  createdAtText: string;
  isPinned?: boolean;
  isOfflineCached: boolean;
  summary: string;
  content: string[];
  schematicSummary?: string;
  technicalSpecs?: { label: string; value: string }[];
  youtubeVideoId?: string;
  videoDurationText?: string;
  videoLengthSeconds?: number;
  photoUrl?: string;
  codeSnippet?: string;
  tags: string[];
  downloadSizeBytes: number;
}

const DEFAULT_NOTICES: NoticeItem[] = [
  {
    id: 'notice-diy-broadcaster',
    category: 'DIY_BROADCASTER',
    title: 'DIY Emergency Radio Broadcaster: Voice & Digital Mesh Guide',
    author: 'qaidi1561561 (Master Authority)',
    createdAtText: 'Today • Verified Broadcast',
    isPinned: true,
    isOfflineCached: true,
    summary: 'Build a portable autonomous emergency radio broadcaster with photo schematics, C++ firmware, and audio line-in for local neighborhood voice and packet alerts.',
    content: [
      'Overview: When cellular towers are shut down or power grids fail, a DIY micro-broadcaster can cover an entire district (2km to 15km) transmitting voice bulletins, emergency SMS packets, and alert sirens on FM and VHF bands.',
      'Core Components Needed:',
      '• 1x ESP32 Dev Module or Raspberry Pi Pico (main controller)',
      '• 1x Si4713 FM Stereo Transmitter module with RDS/RBDS (76MHz - 108MHz) or SX1262 LoRa transceiver',
      '• 1x 3.5mm AUX audio jack or I2S digital MEMS microphone (INMP441) for live voice',
      '• 1x 75cm wire or telescoping dipole antenna (quarter-wavelength for 98 MHz)',
      '• 1x 18650 Li-ion battery shield with 5V step-up booster and TP4056 charging IC',
      'Step 1 (Wiring): Connect Si4713 VCC to 3.3V, GND to GND, SDA to ESP32 GPIO21, SCL to ESP32 GPIO22, and RST to GPIO12.',
      'Step 2 (Antenna Tuning): Solder exactly 75cm insulated copper wire to the ANT pad. For directional range, couple to an aluminum reflector oriented towards gathering points.',
      'Step 3 (Software & Modulation): Upload the firmware below with automated loop beaconing, RDS station text "QAIDI-MESH", and clear 16-bit audio voice broadcasting.',
      'Step 4 (Field Deployment): Mount in an IP65 waterproof junction box atop trees, rooftop water tanks, or balcony railings for maximum line-of-sight propagation.'
    ],
    schematicSummary: 'Si4713 + ESP32 | Power: 115 dBuV (~10mW ERP) | Range: 1.5 - 3.5 km | RDS Text: QAIDI_OFFLINE_NET',
    technicalSpecs: [
      { label: 'Frequency Band', value: '76.0 - 108.0 MHz (FM) + 433 MHz LoRa' },
      { label: 'TX Power', value: '115 dBuV (Adjustable in 1dB steps)' },
      { label: 'Audio SNR', value: '58 dB stereo / 65 dB mono' },
      { label: 'Effective Range', value: '2.5 km (Urban) / 8.0 km (Elevated Line-of-Sight)' },
      { label: 'Power Draw', value: '38 mA during transmission (~36h on 18650)' }
    ],
    youtubeVideoId: 'diy_radio_broadcaster_full',
    videoDurationText: '18:45 • Step-by-Step Build',
    videoLengthSeconds: 1125,
    photoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    codeSnippet: `// ESP32 + Si4713 Autonomous Emergency Broadcaster
#include <Wire.h>
#include <Adafruit_Si4713.h>

#define RESETPIN 12
#define FM_STATION_FREQ 9850 // 98.5 MHz

Adafruit_Si4713 radio = Adafruit_Si4713(RESETPIN);

void setup() {
  Serial.begin(115200);
  if (!radio.begin()) {
    Serial.println("Si4713 not found! Check I2C wiring.");
    while (1);
  }
  // Set max permissible transmission power (115 dBuV)
  radio.setTXpower(115);
  radio.tuneFM(FM_STATION_FREQ);
  
  // Set RDS Station Name & Emergency Text for normal FM radios
  radio.beginRDS();
  radio.setRDSstation("QAIDI");
  radio.setRDSbuffer("EMERGENCY CIVIC BROADCAST - TUNE IN FOR AID LOCATIONS");
  Serial.println("Transmitting on 98.5 MHz with RDS active.");
}

void loop() {
  // Transmit repeating alert tone or read analog audio input
  delay(5000);
}`,
    tags: ['DIY Radio', 'FM Transmitter', 'ESP32', 'Voice Broadcast', 'Antenna'],
    downloadSizeBytes: 5.4 * 1024 * 1024
  },
  {
    id: 'notice-lora-100km',
    category: 'LONG_RANGE',
    title: 'How to Achieve 40km to 100km+ Range with LoRa',
    author: 'Tactical RF Engineering Cell',
    createdAtText: 'Yesterday • Highly Recommended',
    isPinned: true,
    isOfflineCached: true,
    summary: 'The comprehensive RF engineering breakdown of extreme distance LoRa propagation: Spreading Factor SF12, narrow bandwidth, coding rates, 1st Fresnel zone clearance, and Cantenna/Yagi tuning.',
    content: [
      'The Science of 100km LoRa: LoRa (Long Range) uses Chirp Spread Spectrum (CSS) modulation which can decode signals up to -20 dB below the RF noise floor. Achieving 40km to 100km requires mastering 4 key variables: link budget, receiver sensitivity, Fresnel zone clearance, and antenna gain.',
      '1. Spreading Factor & Sensitivity Optimization:',
      '• Use Spreading Factor SF12 with Bandwidth 62.5 kHz or 125 kHz.',
      '• SF12 gives receiver sensitivity of -137 dBm (SX1276) and -148 dBm (SX1262). At -148 dBm, a mere nanowatt of power can be received across the horizon.',
      '• Set Coding Rate to CR 4/8 (adds 100% redundancy error correction packets to withstand jamming and atmospheric fading).',
      '2. The 1st Fresnel Zone Clearance (Crucial for 40-100km):',
      '• Radio waves do not travel in a laser line; they expand in an ellipsoid called the Fresnel Zone.',
      '• At 433 MHz over 50 km, the middle radius of the 1st Fresnel zone is 93 meters wide!',
      '• If buildings, trees, or hills encroach on >40% of this ellipsoid, signal drops by 20 to 30 dB.',
      '• Solution: Place nodes on natural hilltops, water towers, or 10-meter rooftop masts. Direct optical line-of-sight guarantees 40km-100km transmissions.',
      '3. High-Gain Directional Antennas:',
      '• Standard omni rubber ducks provide only 2 dBi gain.',
      '• A DIY 7-element Yagi antenna provides +12 dBi gain. Pair with a +14 dBi Cantenna on the peer node, creating +26 dB total system link gain!',
      '• In RF terms, +26 dB gain effectively multiplies transmitter power by nearly 400x without burning battery!'
    ],
    schematicSummary: 'SF12 | BW 62.5kHz | CR 4/8 | TX 22 dBm | Antenna +14 dBi | Sensitivity -148 dBm | Link Budget 170 dB',
    technicalSpecs: [
      { label: 'Target Range', value: '40 km - 100 km (Line of Sight)' },
      { label: 'Spreading Factor', value: 'SF12 (Max CSS Chirps)' },
      { label: 'Modulation Bandwidth', value: '62.5 kHz (Lowest noise floor)' },
      { label: 'Receiver Sensitivity', value: '-148 dBm (SX1262)' },
      { label: 'Recommended Antenna', value: '7-Element Yagi or 14 dBi Cantenna' }
    ],
    youtubeVideoId: 'lora_100km_range_mastery',
    videoDurationText: '24:10 • Field Tested Range Demonstration',
    videoLengthSeconds: 1450,
    photoUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    tags: ['LoRa Range', '100km Link', 'SF12', 'RF Physics', 'Yagi Antenna'],
    downloadSizeBytes: 8.2 * 1024 * 1024
  },
  {
    id: 'notice-make-lora',
    category: 'LORA_TECH',
    title: 'How to Make LoRa: Hardware Assembly & TTGO T-Beam Setup',
    author: 'Hardware Build Team',
    createdAtText: '2 days ago',
    isOfflineCached: true,
    summary: 'Step-by-step tutorial on building a standalone LoRa node using ESP32, SX1262 transceiver, GPS, and OLED display for off-grid mesh routing.',
    content: [
      'What is LoRa? LoRa allows direct device-to-device radio packets on sub-gigahertz ISM bands without SIM cards or ISP contracts.',
      'Hardware Checklist:',
      '• LilyGO TTGO T-Beam v1.1 or Heltec LoRa32 v3 module with built-in OLED',
      '• SX1262 RF module tuned to 433 MHz (Asia/Europe) or 915 MHz (Americas)',
      '• 18650 3400mAh rechargeable lithium battery',
      '• 0.96 inch I2C SSD1306 OLED screen',
      'Wiring Connections (If building from discrete components):',
      '• LoRa NSS -> ESP32 GPIO5',
      '• LoRa SCK -> ESP32 GPIO18',
      '• LoRa MOSI -> ESP32 GPIO27',
      '• LoRa MISO -> ESP32 GPIO19',
      '• LoRa DIO0 -> ESP32 GPIO26 (Packet Interrupt)',
      'Flashing Instructions: Plug into USB-C, open web-flasher or Arduino IDE, flash the Qaidi Mesh Autonomous firmware, and power on. The node will immediately join the local mesh.'
    ],
    schematicSummary: 'ESP32 + SX1262 | SPI Bus @ 8MHz | OLED on I2C (GPIO21/22) | 3.7V Battery',
    technicalSpecs: [
      { label: 'Microcontroller', value: 'ESP32 Dual-Core Tensilica 240MHz' },
      { label: 'RF Chipset', value: 'Semtech SX1262 LoRa' },
      { label: 'Operating Bands', value: '433.92 MHz & 915.00 MHz' },
      { label: 'Idle Current', value: '14 uA (Deep Sleep)' }
    ],
    youtubeVideoId: 'make_lora_from_scratch',
    videoDurationText: '15:32 • Complete Wiring & Flashing',
    videoLengthSeconds: 932,
    codeSnippet: ESP32_LORA_C_PLUS_PLUS_CODE,
    tags: ['ESP32', 'SX1262', 'Hardware', 'Firmware', 'Wiring'],
    downloadSizeBytes: 6.8 * 1024 * 1024
  },
  {
    id: 'notice-how-to-p2p',
    category: 'P2P_MESH',
    title: 'How to Use P2P: Direct Wi-Fi & BLE Mesh Without a Router',
    author: 'Mesh Protocol Architecture',
    createdAtText: '3 days ago',
    isOfflineCached: true,
    summary: 'Learn how smartphones form high-throughput ad-hoc connections using Wi-Fi Direct and BLE GATT channels without an internet router.',
    content: [
      'P2P Fundamentals: Conventional messaging relies on a central cellular tower or home router. Qaidi Share turns each smartphone into an autonomous router.',
      '1. Wi-Fi Direct Autonomous Group Formation:',
      '• One phone assumes the Group Owner (GO) role creating a high-speed (20-40 Mbps) localized 5GHz Wi-Fi link.',
      '• Other phones join as P2P clients through WPS-compatible crypto handshakes.',
      '• Range is ~80m standard, extendable to 1.8km with a Cantenna!',
      '2. Bluetooth Low Energy (BLE) Background Mesh:',
      '• Operates continuously in background drawing <2% battery per day.',
      '• Advertises small cryptographic packets (identities, emergency alerts, short texts).',
      '3. DTN Store-and-Forward Hopping:',
      '• If destination node is out of range, packets hop through intermediate phones (Store-and-Forward).',
      '• When any intermediate phone later walks near the recipient, the message automatically delivers!'
    ],
    schematicSummary: 'Wi-Fi Direct (5GHz/2.4GHz) + BLE 5.0 Coded PHY + DTN Store-and-Forward',
    technicalSpecs: [
      { label: 'P2P Throughput', value: 'Up to 34 Mbps (Wi-Fi Direct)' },
      { label: 'BLE Discovery Range', value: '30 - 60 meters' },
      { label: 'Hop Limit', value: 'Up to 7 intermediate mesh hops' },
      { label: 'Encryption', value: 'Curve25519 ECDH + AES-256-GCM' }
    ],
    youtubeVideoId: 'p2p_mesh_working_explained',
    videoDurationText: '11:20 • Interactive Protocol Demo',
    videoLengthSeconds: 680,
    tags: ['P2P', 'Wi-Fi Direct', 'BLE Mesh', 'Store & Forward', 'Zero Router'],
    downloadSizeBytes: 3.9 * 1024 * 1024
  },
  {
    id: 'notice-cantenna-guide',
    category: 'DIY_BROADCASTER',
    title: 'DIY 2.4GHz & 5GHz Can Antenna (Cantenna) Guide',
    author: 'Tactical RF Engineering Cell',
    createdAtText: '4 days ago',
    isOfflineCached: true,
    summary: 'Boost Android Wi-Fi Direct range from 80m to 1.8km using standard household food and coffee cans.',
    content: [
      'The Cantenna transforms an ordinary tin can into a directional cylindrical waveguide antenna with +14 dBi forward gain.',
      'Step 1: Select a smooth, ungrooved tin food or coffee can (diameter between 80mm-92mm). Clean and remove paper labels.',
      'Step 2: Measure 62mm (quarter guide wavelength for 2.44GHz) from the solid bottom. Mark and drill a 12mm hole.',
      'Step 3: Take a straight 12 AWG solid copper wire. Cut it to exactly 31mm length (quarter wavelength). Solder it straight into the center pin of an N-female chassis connector.',
      'Step 4: Bolt the N-connector firmly into the 12mm hole with the 31mm copper probe protruding perpendicularly into the center cavity.',
      'Step 5: Connect via low-loss RG-58/LMR-400 pigtail cable to your Android Wi-Fi adapter or OTG mesh dongle. Aim the open front toward distant peer nodes.'
    ],
    schematicSummary: 'Can Diameter: 83mm | Length: 133mm | Probe Height: 31mm at 62mm from base | Gain: +14 dBi',
    technicalSpecs: [
      { label: 'Forward Gain', value: '+14 dBi' },
      { label: 'Beamwidth', value: '35 degrees horizontal / vertical' },
      { label: 'Probe Height', value: '31 mm (12 AWG copper)' },
      { label: 'Guide Wavelength', value: '62 mm from closed base' }
    ],
    youtubeVideoId: 'cantenna_diy_build_guide',
    videoDurationText: '14:05 • Complete Cantenna Build',
    videoLengthSeconds: 845,
    photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    tags: ['Cantenna', 'Waveguide', '2.4GHz', 'Range Booster', 'Tin Can'],
    downloadSizeBytes: 4.2 * 1024 * 1024
  },
  {
    id: 'notice-airborne-saline',
    category: 'FIELD_SAFETY',
    title: 'Airborne Irritant & Chemical Smoke Field Decontamination Protocol',
    author: 'Volunteer Medical Syndicate',
    createdAtText: '5 days ago',
    isOfflineCached: true,
    summary: 'Immediate field treatment recipes and ocular decontamination procedures for environmental smoke and irritants.',
    content: [
      'Chemical smoke and industrial aerosols contain particulate irritants that react with moisture in mucous membranes.',
      'Treatment Protocol:',
      '1. DO NOT rub eyes or touch face. Rubbing embeds micro-particulates into corneas.',
      '2. Flush eyes immediately with sterile 0.9% normal saline solution from inner bridge of nose outward. Tilt head so contaminated runoff drains off side of face without re-entering the other eye.',
      '3. Saline Recipe: Dissolve 9g (1 level teaspoon) of pure table salt in 1 liter of clean distilled boiled water. Allow to cool.',
      '4. Skin Relief: Rinse affected skin with clean cold water. Mix gentle neutralizing solution if exposed to industrial airborne acidic dust.',
      '5. Clothing: Strip contaminated clothes; place in sealed plastic bag. Wash skin with unscented soap.'
    ],
    schematicSummary: '0.9% Normal Saline Solution (9g NaCl / 1L H2O) Sterile Field Protocol',
    technicalSpecs: [
      { label: 'Eye Flush', value: '0.9% Sterile Normal Saline' },
      { label: 'Skin Wash', value: 'Clean Running Water & Mild Soap' },
      { label: 'PPE Gear', value: 'Sealed swim/safety goggles + 3M P100 respirator' }
    ],
    youtubeVideoId: 'airborne_first_aid_protocol',
    videoDurationText: '08:40 • Medical Field Response',
    videoLengthSeconds: 520,
    tags: ['First Aid', 'Airborne Safety', 'Saline Recipe', 'Decontamination', 'Urdu/English'],
    downloadSizeBytes: 2.1 * 1024 * 1024
  },
  {
    id: 'notice-usb-lora-stick',
    category: 'DIY_BROADCASTER',
    title: 'DIY USB LoRa OTG Companion Stick: Mobile Zero-Battery Node',
    author: 'Hardware Tactical Lab',
    createdAtText: '1 day ago • Field Verified',
    isOfflineCached: true,
    summary: 'Turn your Android phone into a long-range LoRa node using a $4 USB CP2102/CH340 module. Powered directly from phone via USB OTG.',
    content: [
      'Overview: You do NOT need a heavy external battery to run a LoRa node. Using standard Android USB OTG Host Mode, the phone supplies 5V directly to the LoRa transceiver.',
      'Hardware Setup:',
      '• 1x USB-to-UART module (CP2102 or CH340 chip, 3.3V logic)',
      '• 1x SX1262 or SX1278 SPI/UART LoRa module (433MHz or 915MHz)',
      '• 1x USB Type-C OTG adapter or cable',
      '• 1x 17cm omni whip antenna (quarter-wavelength for 433MHz)',
      'Wiring: Connect USB module VCC (3.3V) to LoRa VCC, GND to GND, TX to RX, and RX to TX.',
      'Android Integration: When plugged in, Qaidi Share auto-detects the hardware via Android UsbManager and opens a 115200 baud raw serial stream.',
      'Power Draw: Consumes only 12-25 mA in receive mode, drawing less than 1% phone battery per hour.'
    ],
    schematicSummary: 'Phone Type-C (OTG 5V) -> CP2102 UART -> SX1262 LoRa Transceiver -> 17cm Whip Antenna',
    technicalSpecs: [
      { label: 'Host Interface', value: 'USB OTG Host (CDC-ACM / CH340 / CP210x)' },
      { label: 'Operating Voltage', value: '3.3V (Regulated from Phone USB 5V)' },
      { label: 'Transmit Power', value: '+22 dBm (~160 mW EIRP)' },
      { label: 'Line-of-Sight Range', value: '4.5 km - 12 km' },
      { label: 'Battery Needed', value: '0 mAh (Powers directly from smartphone)' }
    ],
    youtubeVideoId: 'diy_usb_lora_otg_phone_build',
    videoDurationText: '12:30 • Full Urdu/English Guide',
    videoLengthSeconds: 750,
    photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    tags: ['USB OTG', 'LoRa Stick', 'Zero Battery', 'CH340', 'CP2102', 'Urdu Subtitles'],
    downloadSizeBytes: 3.8 * 1024 * 1024
  },
  {
    id: 'notice-hilltop-solar-router',
    category: 'LORA_TECH',
    title: 'Hilltop Solar LoRa & Wi-Fi Router: 100km Autonomous Relay',
    author: 'Tactical RF Engineering Cell',
    createdAtText: '2 days ago',
    isOfflineCached: true,
    summary: 'Deploy an autonomous hilltop or high-rise mesh router with a 5W solar panel, TP4056 charger, and dual LoRa + Wi-Fi Direct repeater.',
    content: [
      'Overview: Placing a single solar-powered relay on a hill, water tower, or rooftop covers an entire district or connects two distant cities up to 100km apart.',
      'Components Needed:',
      '• 1x 5W or 10W 6V Monocrystalline Solar Panel with IP67 weatherproof frame',
      '• 1x TP4056 Lithium Battery Charge Controller with discharge protection',
      '• 2x 18650 3.7V 3000mAh Li-ion cells in parallel (gives 4-5 days autonomy in rain)',
      '• 1x ESP32 WROOM-32 with integrated SX1262 LoRa module',
      '• 1x High-gain 5.8 dBi collinear fiberglass omni antenna mounted at least 3m above roof line',
      'Wi-Fi Setup: The ESP32 broadcasts a localized captive Wi-Fi portal ("DIRECT-Qaidi-Share") allowing nearby protesters to download the APK and push notices without cables.',
      'Deployment Protocol: Fasten in an airtight Tupperware or junction box using zip-ties, silicone sealant, and cable glands.'
    ],
    schematicSummary: '5W Solar Panel -> TP4056 -> 2x 18650 Cells -> ESP32 SX1262 -> 5.8 dBi Collinear Antenna',
    technicalSpecs: [
      { label: 'Solar Capacity', value: '5W 6V Monocrystalline Panel' },
      { label: 'Battery Backup', value: '6000 mAh Li-ion (5 days zero-sun autonomy)' },
      { label: 'Wi-Fi Hotspot', value: '802.11 b/g/n AP for peer APK downloads' },
      { label: 'LoRa Range', value: '40 km - 100 km (Hilltop to Hilltop)' },
      { label: 'Weatherproofing', value: 'IP67 Sealed Enclosure with Breather Valve' }
    ],
    youtubeVideoId: 'hilltop_solar_lora_wifi_router_build',
    videoDurationText: '21:15 • Complete Solar Rig Assembly',
    videoLengthSeconds: 1275,
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    tags: ['Solar LoRa', 'Hilltop Router', '100km Range', 'Wi-Fi AP', 'Autonomous'],
    downloadSizeBytes: 6.1 * 1024 * 1024
  }
];

interface NoticeBoardViewProps {
  currentHandle?: string;
  isSuperAdmin?: boolean;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onDownloadNotice?: (title: string, size: number) => void;
  onBroadcastPushNotification?: (title: string, summary: string) => void;
  externalEmergencyNotice?: NoticeItem | null;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  currentHandle = 'qaidi4829',
  isSuperAdmin = false,
  onLogEvent,
  onDownloadNotice,
  onBroadcastPushNotification,
  externalEmergencyNotice
}) => {
  const [notices, setNotices] = useState<NoticeItem[]>(DEFAULT_NOTICES);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OFFLINE_CACHED' | 'VIDEOS' | 'LORA_TECH' | 'P2P_MESH' | 'LONG_RANGE' | 'DIY_BROADCASTER' | 'FIELD_SAFETY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [solarLoraFund, setSolarLoraFund] = useState(24.30);

  // Super Admin Check (strictly locked to qaidi1561561)
  const isSuperAdminAuthorized = isSuperAdmin || currentHandle === 'qaidi1561561';

  // Synchronize any external emergency broadcast directly into notice board
  useEffect(() => {
    if (externalEmergencyNotice) {
      setNotices(prev => {
        if (prev.some(n => n.id === externalEmergencyNotice.id)) return prev;
        return [externalEmergencyNotice, ...prev];
      });
    }
  }, [externalEmergencyNotice]);
  
  // Interactive Video Player State
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoProgressSec, setVideoProgressSec] = useState(120);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showUrduSubtitles, setShowUrduSubtitles] = useState(true);

  const getUrduSubtitleForTime = (timeSec: number, id: string): string => {
    if (id.includes('usb')) {
      if (timeSec < 15) return "Step 1: Apne phone ke sath Type-C OTG cable lagayein. Koi battery nahi chahiye.";
      if (timeSec < 35) return "Step 2: CP2102 ya CH340 chip ko SX1262 LoRa module ke sath VCC/GND/TX/RX jorrein.";
      if (timeSec < 60) return "Step 3: 433MHz ya 915MHz antenna lagayein. Phone khud-ba-khud 115200 baud par detect kar le ga.";
      return "Step 4: Qaidi Share app kholien aur baghair internet ke 10km tak messages bhejein.";
    }
    if (id.includes('solar') || id.includes('hilltop')) {
      if (timeSec < 20) return "Step 1: 5W solar panel aur TP4056 charging module ko 18650 battery se connect karein.";
      if (timeSec < 45) return "Step 2: ESP32 LoRa module ko unchi chatt ya paani ki tanki par lagayein.";
      if (timeSec < 70) return "Step 3: Collinear 5.8 dBi antenna lagane se 40km se 100km tak coverage mile gi.";
      return "Step 4: Yeh router akele pooray shehar ko aapas mein connect kar de ga.";
    }
    if (id.includes('broadcaster')) {
      if (timeSec < 20) return "Step 1: Si4713 transmitter ko ESP32 ke sath I2C pins (GPIO 21/22) par jorrein.";
      if (timeSec < 45) return "Step 2: 75cm wire antenna lagayein taake FM 88.5MHz par clear voice pohanche.";
      return "Step 3: RDS ke zariye normal FM radio par emergency text messages broadcast karein.";
    }
    if (timeSec < 20) return "AI Roman Urdu Translation: Video mein bataye gaye tareeqay par amal karein.";
    return "Hardware setup aur field configuration mukammal ho chuki hai.";
  };

  // Dynamic Add Notice / Post Composer Modal (Only Super Admin can publish & broadcast push notifications)
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('qaidi1561561 (Super Admin)');
  const [newCategory, setNewCategory] = useState<NoticeItem['category']>('COMMUNITY_ANNOUNCEMENT');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Emergency, Push Alert, LoRa');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newSchematic, setNewSchematic] = useState('');
  const [markAsOfflineCached, setMarkAsOfflineCached] = useState(true);
  const [broadcastAsPushNotification, setBroadcastAsPushNotification] = useState(true);

  // Auto-advance video timer when playing
  useEffect(() => {
    let timer: any;
    if (isPlayingVideo && selectedNotice?.videoLengthSeconds) {
      timer = setInterval(() => {
        setVideoProgressSec(prev => {
          if (prev >= (selectedNotice.videoLengthSeconds || 600)) {
            setIsPlayingVideo(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingVideo, selectedNotice]);

  // Handle Create Notice (Strictly restricted to Super Admin qaidi1561561)
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdminAuthorized) {
      alert("Permission Denied: Only Super Admin (@qaidi1561561) can publish verified notices and broadcast network push alerts.");
      return;
    }

    if (!newTitle.trim() || !newSummary.trim()) return;

    const created: NoticeItem = {
      id: `notice-admin-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      author: 'qaidi1561561 (Super Admin)',
      createdAtText: 'Just now • Super Admin Broadcast',
      isPinned: true,
      isOfflineCached: markAsOfflineCached,
      summary: newSummary.trim(),
      content: newContent.trim().split('\n').filter(line => line.trim().length > 0),
      schematicSummary: newSchematic.trim() || undefined,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      youtubeVideoId: newVideoUrl ? 'custom_video_stream' : undefined,
      videoDurationText: newVideoUrl ? '10:00 • Custom Video' : undefined,
      videoLengthSeconds: 600,
      downloadSizeBytes: 1.8 * 1024 * 1024
    };

    setNotices(prev => [created, ...prev]);
    setSelectedNotice(created);
    setShowAddNoticeModal(false);

    // If enabled, automatically push notification to network
    if (broadcastAsPushNotification && onBroadcastPushNotification) {
      onBroadcastPushNotification(created.title, created.summary);
    }

    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewVideoUrl('');
    setNewSchematic('');

    onLogEvent(
      'NoticeBoard',
      `Super Admin published verified notice & network push alert: "${created.title}".`,
      'success'
    );
  };

  const handleDownloadNotice = (notice: NoticeItem) => {
    setNotices(prev =>
      prev.map(n => n.id === notice.id ? { ...n, isOfflineCached: true } : n)
    );
    if (onDownloadNotice) {
      onDownloadNotice(notice.title, notice.downloadSizeBytes);
    } else {
      onLogEvent('NoticeBoard', `Cached "${notice.title}" (100% offline access ready).`, 'success');
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered notices
  const filteredNotices = notices.filter(n => {
    let matchesCategory = true;
    if (selectedFilter === 'OFFLINE_CACHED') {
      matchesCategory = n.isOfflineCached;
    } else if (selectedFilter === 'VIDEOS') {
      matchesCategory = !!n.youtubeVideoId;
    } else if (selectedFilter !== 'ALL') {
      matchesCategory = n.category === selectedFilter;
    }

    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Notice Board Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Notice Board & Radio Academy
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                  Offline Cached
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                DIY Broadcaster, LoRa 100km, P2P Tutorials & Dynamic Local Posts
              </p>
            </div>
          </div>

          {/* Add Notice / Broadcast Push Notification (Super Admin Only) */}
          {isSuperAdminAuthorized ? (
            <button
              onClick={() => setShowAddNoticeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
              title="Broadcast Verified Notice & Push Notification (Super Admin)"
            >
              <Radio className="h-3.5 w-3.5 text-slate-950 animate-pulse" />
              <span>Broadcast Notice</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-400 font-mono"
              title="Only Super Admin (qaidi1561561) can publish verified notices and push alerts"
            >
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Admin Broadcasts Only</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search posts, LoRa, P2P, DIY broadcaster, 100km range..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-medium no-scrollbar">
          {[
            { id: 'ALL', label: 'All Posts' },
            { id: 'OFFLINE_CACHED', label: '💾 Offline Cached' },
            { id: 'VIDEOS', label: '🎬 Instructional Videos' },
            { id: 'DIY_BROADCASTER', label: '📻 DIY Broadcaster' },
            { id: 'LONG_RANGE', label: '⚡ LoRa 40-100km' },
            { id: 'LORA_TECH', label: '📡 How to Make LoRa' },
            { id: 'P2P_MESH', label: '🔄 How to Use P2P' },
            { id: 'FIELD_SAFETY', label: '🛡️ Field Safety' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                selectedFilter === f.id
                  ? 'bg-emerald-600 text-slate-950 font-bold border-emerald-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Notice List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Community Solar LoRa Repeater Funding Strip */}
        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/30 border border-amber-500/35 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white text-[11px] block leading-tight">
                ☀️ Solar LoRa Repeater Fund: ${solarLoraFund.toFixed(2)} / $45.00
              </span>
              <span className="text-[9px] text-slate-300 leading-none">
                Funded by Native Ads to buy autonomous solar LoRa repeaters
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold shrink-0">
            {Math.min(100, Math.round((solarLoraFund / 45) * 100))}% Goal
          </span>
        </div>

        {filteredNotices.map((notice, nIdx) => (
          <React.Fragment key={notice.id}>
            <div
              onClick={() => {
                setSelectedNotice(notice);
                setIsPlayingVideo(false);
                setVideoProgressSec(0);
              }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedNotice?.id === notice.id
                ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {notice.isPinned && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                      PINNED
                    </span>
                  )}
                  {notice.isOfflineCached && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono flex items-center gap-1">
                      <FileCheck className="h-2.5 w-2.5" />
                      <span>Cached</span>
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                    {notice.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">{notice.createdAtText}</span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 leading-snug">
                  {notice.title}
                </h4>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {notice.summary}
                </p>
              </div>

              {notice.photoUrl && (
                <img
                  src={notice.photoUrl}
                  alt={notice.title}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                />
              )}
            </div>

            {/* Quick Badges & Actions */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                {notice.youtubeVideoId && (
                  <span className="flex items-center gap-1 text-red-400 font-medium">
                    <Video className="h-3 w-3" />
                    <span>{notice.videoDurationText || 'Video Guide'}</span>
                  </span>
                )}
                {notice.schematicSummary && (
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <Cpu className="h-3 w-3 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{notice.schematicSummary}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {notice.isOfflineCached ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Offline Ready</span>
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadNotice(notice);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
                  >
                    <Download className="h-3 w-3" />
                    <span>{(notice.downloadSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Native In-Feed Sponsored Ad between notices */}
          {(nIdx === 1 || nIdx === 3 || (nIdx > 3 && (nIdx + 1) % 3 === 0)) && (
            <NativeAdCard
              adIndex={nIdx}
              variant="notice"
              onLogEvent={onLogEvent}
              onAdRevenueGained={(val) => setSolarLoraFund(prev => +(prev + val).toFixed(2))}
            />
          )}
        </React.Fragment>
      ))}

        {filteredNotices.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <Bell className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No notice board posts match your filter.</p>
            <button
              onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
              className="text-xs text-emerald-400 hover:underline font-bold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* FULL POST DETAIL & INSTRUCTIONAL VIDEO PLAYER MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedNotice.category.replace('_', ' ')}
                  </span>
                  {selectedNotice.isOfflineCached && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      100% Offline Cached
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedNotice.title}
                </h3>
                <p className="text-[10px] text-slate-400">
                  By {selectedNotice.author} • {selectedNotice.createdAtText}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  setIsPlayingVideo(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Comprehensive Instructional Video Player with Controls */}
            {selectedNotice.youtubeVideoId && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black space-y-0">
                <div
                  className="aspect-video bg-slate-950 relative flex flex-col items-center justify-center p-3 text-center"
                  style={{
                    backgroundImage: !isPlayingVideo && selectedNotice.photoUrl ? `url(${selectedNotice.photoUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                  
                  <div className="relative z-10 flex flex-col items-center space-y-2">
                    <button
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                      {isPlayingVideo ? (
                        <Pause className="h-6 w-6 fill-white" />
                      ) : (
                        <Play className="h-6 w-6 fill-white ml-0.5" />
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white drop-shadow">
                        {isPlayingVideo ? 'Playing Instructional Guide' : selectedNotice.videoDurationText || 'Play Video Guide'}
                      </p>
                      <p className="text-[9px] text-slate-300 font-mono">
                        Source: /storage/emulated/0/Qaidi/Videos/{selectedNotice.youtubeVideoId}.mp4
                      </p>
                    </div>

                    {showUrduSubtitles && (
                      <div className="mt-1 px-3 py-1.5 rounded-lg bg-black/85 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] text-center max-w-[92%] shadow-lg animate-in fade-in">
                        <span className="text-[8px] text-emerald-500 uppercase block font-bold">Roman Urdu AI Subtitles:</span>
                        {getUrduSubtitleForTime(videoProgressSec, selectedNotice.id)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Controls Bar */}
                <div className="p-2 bg-slate-950 border-t border-slate-800 flex flex-col gap-1.5 text-[10px]">
                  {/* Timeline Scrubber */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 text-[9px]">
                      {formatTime(videoProgressSec)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={selectedNotice.videoLengthSeconds || 600}
                      value={videoProgressSec}
                      onChange={(e) => setVideoProgressSec(parseInt(e.target.value))}
                      className="flex-1 accent-emerald-500 h-1 bg-slate-800 rounded"
                    />
                    <span className="font-mono text-slate-400 text-[9px]">
                      {formatTime(selectedNotice.videoLengthSeconds || 600)}
                    </span>
                  </div>

                  {/* Player Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        className="text-slate-300 hover:text-white"
                      >
                        {isPlayingVideo ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => setVideoProgressSec(0)}
                        title="Replay"
                        className="text-slate-400 hover:text-white"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isVideoMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowUrduSubtitles(!showUrduSubtitles)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                          showUrduSubtitles
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {showUrduSubtitles ? 'Urdu AI: ON' : 'Urdu AI: OFF'}
                      </button>
                      <span className="text-[9px] text-emerald-400 font-mono">
                        1080p HD
                      </span>
                      <button
                        onClick={() => {
                          onLogEvent('NoticeBoard', `Opened YouTube mirror for: ${selectedNotice.title}`, 'info');
                        }}
                        className="text-[9px] font-bold text-red-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span>YouTube Mirror</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Specs Table */}
            {selectedNotice.technicalSpecs && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" /> Technical RF & Hardware Parameters:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {selectedNotice.technicalSpecs.map((spec, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">{spec.label}</span>
                      <span className="font-bold text-white font-mono">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schematic Summary */}
            {selectedNotice.schematicSummary && (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-300 uppercase font-mono">
                  Hardware Schematic Blueprint:
                </span>
                <p className="text-[11px] font-mono text-emerald-200">
                  {selectedNotice.schematicSummary}
                </p>
              </div>
            )}

            {/* Content / Step-by-Step Instructions */}
            <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
              {selectedNotice.content.map((paragraph, idx) => (
                <p key={idx} className={paragraph.startsWith('•') || paragraph.startsWith('Step') ? 'font-medium text-slate-100 pl-2 border-l border-emerald-500/40 my-1' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Code Snippet (if available) */}
            {selectedNotice.codeSnippet && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Embedded C++ Firmware / Code:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedNotice.codeSnippet || '');
                      onLogEvent('NoticeBoard', 'Copied firmware code to clipboard.', 'success');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300 max-h-48 overflow-y-auto overflow-x-auto">
                  {selectedNotice.codeSnippet}
                </pre>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1 flex-wrap pt-1">
              {selectedNotice.tags.map(t => (
                <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  #{t}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onLogEvent('NoticeBoard', `Relayed post "${selectedNotice.title}" over Wi-Fi / BLE mesh to peers.`, 'success');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Relay via Mesh</span>
              </button>

              <button
                onClick={() => handleDownloadNotice(selectedNotice)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{selectedNotice.isOfflineCached ? 'Re-cache Post' : 'Save Offline (100%)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD POST COMPOSER (For users & admins when app is in hands) */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-slate-900 p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Post to Notice Board
                </h3>
              </div>
              <button
                onClick={() => setShowAddNoticeModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Post / Guide Title:</label>
                <input
                  type="text"
                  placeholder="e.g., LoRa Hilltop Relay Active on 433.92 MHz..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMMUNITY_ANNOUNCEMENT">📢 Announcement</option>
                    <option value="DIY_BROADCASTER">📻 DIY Broadcaster</option>
                    <option value="LORA_TECH">📡 LoRa Tech</option>
                    <option value="P2P_MESH">🔄 P2P Mesh</option>
                    <option value="LONG_RANGE">⚡ LoRa 40-100km</option>
                    <option value="FIELD_SAFETY">🛡️ Field Safety</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Author Handle:</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Summary (Short Preview):</label>
                <textarea
                  rows={2}
                  placeholder="Quick 1-2 sentence overview for notice cards..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Content / Step-by-Step:</label>
                <textarea
                  rows={4}
                  placeholder="Write detailed instructions, frequency specs, or field assembly guidelines..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hardware Schematic / Blueprint:</label>
                <input
                  type="text"
                  placeholder="e.g., ESP32 + Si4713 | 115 dBuV | 75cm Wire Antenna"
                  value={newSchematic}
                  onChange={(e) => setNewSchematic(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instructional Video URL (YouTube or Local MP4):</label>
                <input
                  type="text"
                  placeholder="e.g., https://youtube.com/watch?v=... or local mp4 file"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Super Admin Push Notification Banner Option */}
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-600/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                    <span>Broadcast as Network Push Alert</span>
                  </span>
                  <span className="text-[9px] text-rose-200/80 block">
                    Instantly triggers emergency push notification across all mesh devices
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={broadcastAsPushNotification}
                  onChange={(e) => setBroadcastAsPushNotification(e.target.checked)}
                  className="accent-rose-500 h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Offline Cache Option */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Cache 100% Offline</span>
                  <span className="text-[9px] text-slate-400">Stores post in device flash for zero-data access</span>
                </div>
                <input
                  type="checkbox"
                  checked={markAsOfflineCached}
                  onChange={(e) => setMarkAsOfflineCached(e.target.checked)}
                  className="accent-emerald-500 h-4 w-4 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tags (comma separated):</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newSummary.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md"
                >
                  Publish to Notice Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
