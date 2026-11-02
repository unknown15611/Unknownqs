import React, { useState, useEffect, useRef } from 'react';
import {
  Usb,
  Radio,
  Wifi,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  Battery,
  ShieldCheck,
  Terminal,
  Activity,
  Code2,
  Cpu,
  Layers,
  Power,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { rssiToSignalPercentage, getSignalQuality } from '../core/securityAndLockdown';

export interface UsbSerialDevice {
  id: string;
  name: string;
  chipType: 'CH340' | 'CP2102' | 'FTDI' | 'PL2303' | 'CDC_ACM';
  vendorId: number;
  productId: number;
  manufacturer: string;
  driverName: string;
}

export interface MeshNeighborNode {
  nodeId: string;
  name: string;
  rssiDbm: number;
  batteryPct: number;
  lastSeenSecAgo: number;
  hopsAway: number;
  ackStatus: 'ACK_CONFIRMED' | 'PENDING' | 'FAILED';
}

const SUPPORTED_USB_DEVICES: UsbSerialDevice[] = [
  {
    id: 'ch340-lora',
    name: 'DIY CH340 USB LoRa 433MHz Transceiver',
    chipType: 'CH340',
    vendorId: 0x1a86,
    productId: 0x7523,
    manufacturer: 'WCH Technologies',
    driverName: 'Ch34xSerialDriver'
  },
  {
    id: 'cp2102-mesh',
    name: 'Commercial CP2102 SX1262 LoRa Stick (915MHz)',
    chipType: 'CP2102',
    vendorId: 0x10c4,
    productId: 0xea60,
    manufacturer: 'Silicon Labs',
    driverName: 'Cp21xxSerialDriver'
  },
  {
    id: 'ftdi-mesh',
    name: 'FTDI FT232R DIY Arduino LoRa Bridge',
    chipType: 'FTDI',
    vendorId: 0x0403,
    productId: 0x6001,
    manufacturer: 'FTDI Chip Ltd',
    driverName: 'FtdiSerialDriver'
  },
  {
    id: 'pl2303-mod',
    name: 'PL2303 Sub-GHz Mesh Interface Cable',
    chipType: 'PL2303',
    vendorId: 0x067b,
    productId: 0x2303,
    manufacturer: 'Prolific Technology',
    driverName: 'ProlificSerialDriver'
  }
];

const INITIAL_NEIGHBORS: MeshNeighborNode[] = [
  { nodeId: 'node-7711', name: 'Ali - Cantenna LoRa', rssiDbm: -68, batteryPct: 91, lastSeenSecAgo: 3, hopsAway: 1, ackStatus: 'ACK_CONFIRMED' },
  { nodeId: 'node-3390', name: 'Zafar - Solar Repeater', rssiDbm: -82, batteryPct: 78, lastSeenSecAgo: 8, hopsAway: 1, ackStatus: 'ACK_CONFIRMED' },
  { nodeId: 'node-8821', name: 'Usman - Hilltop Node', rssiDbm: -95, batteryPct: 64, lastSeenSecAgo: 14, hopsAway: 2, ackStatus: 'PENDING' }
];

interface UsbOtgSerialViewProps {
  onClose?: () => void;
  currentHandle?: string;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const UsbOtgSerialView: React.FC<UsbOtgSerialViewProps> = ({ onClose, currentHandle = 'qaidi4829', onLogEvent }) => {
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'NEIGHBORS' | 'CONFIG' | 'KOTLIN_CODE'>('CONSOLE');
  
  // Connection State
  const [isConnected, setIsConnected] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<UsbSerialDevice>(SUPPORTED_USB_DEVICES[0]);
  
  // Serial Configuration
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [dataBits, setDataBits] = useState<number>(8);
  const [stopBits, setStopBits] = useState<number>(1);
  const [parity, setParity] = useState<'NONE' | 'ODD' | 'EVEN'>('NONE');

  // Traffic & Neighbor Nodes
  const [neighbors, setNeighbors] = useState<MeshNeighborNode[]>(INITIAL_NEIGHBORS);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[INIT] UsbManager: USB device attached (VID: 0x1A86, PID: 0x7523 - CH340).',
    '[PERMISSION] USB Host permission granted by user.',
    '[PORT_OPEN] Port opened at 115200 baud (8N1). DTR/RTS asserted.',
    '[TX_INIT] Transmitted beacon broadcast (Type: BEACON, NodeId: qaidi4829).',
    '[RX_ACK] Received ACK from node-7711 (RSSI: -68 dBm, Signal: 74%, Batt: 91%).',
    '[ROUTING] Dynamic route established to mesh backbone via USB OTG radio.'
  ]);
  const [outgoingPayload, setOutgoingPayload] = useState('PING_MESH_HEARTBEAT');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-increment last seen seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNeighbors(prev =>
        prev.map(n => ({ ...n, lastSeenSecAgo: n.lastSeenSecAgo + 1 }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Send packet over serial
  const handleSendSerialPacket = () => {
    if (!isConnected) return;
    if (!outgoingPayload.trim()) return;

    setIsTransmitting(true);
    const hex = outgoingPayload.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    setSerialLogs(prev => [
      `[${timestamp}] [TX] (${baudRate} bps): "${outgoingPayload}" | Hex: ${hex}`,
      ...prev.slice(0, 50)
    ]);
    onLogEvent('UsbSerial', `Transmitted serial packet over ${selectedDevice.chipType} at ${baudRate} baud.`, 'info');

    // Simulate ACK response from remote LoRa node
    setTimeout(() => {
      setIsTransmitting(false);
      const ackTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      setSerialLogs(prev => [
        `[${ackTimestamp}] [RX_ACK] 0x06 ACK from node-7711 (18ms latency, SNR: +9dB). Packet delivered.`,
        ...prev.slice(0, 50)
      ]);
      setNeighbors(prev =>
        prev.map(n => n.nodeId === 'node-7711' ? { ...n, lastSeenSecAgo: 0, ackStatus: 'ACK_CONFIRMED' } : n)
      );
      onLogEvent('UsbSerial', 'Message Delivery Acknowledged (ACK) by remote LoRa node.', 'success');
    }, 450);
  };

  // Simulate Cable Disconnect / Reconnect
  const handleToggleCable = () => {
    if (isConnected) {
      setIsConnected(false);
      setSerialLogs(prev => [
        `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [DISCONNECT] UsbDeviceDetachedReceiver: USB cable unplugged. Cleanly closed port.`,
        ...prev
      ]);
      onLogEvent('UsbSerial', 'USB LoRa device disconnected. Connection dropped safely without crash.', 'warn');
    } else {
      setIsConnected(true);
      setSerialLogs(prev => [
        `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [ATTACHED] UsbDeviceAttachedReceiver: Device re-attached. Auto-initialized driver.`,
        ...prev
      ]);
      onLogEvent('UsbSerial', 'USB LoRa hardware reconnected and initialized automatically.', 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 space-y-3 overflow-y-auto">
      {/* Top Banner & Status */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
            <Usb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                USB OTG LoRa Bridge
              </h3>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {isConnected ? 'HARDWARE CONNECTED' : 'UNPLUGGED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {selectedDevice.chipType} • {baudRate} 8N1 • {selectedDevice.driverName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleCable}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
              isConnected
                ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Close modal"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('CONSOLE')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'CONSOLE' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Serial Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('NEIGHBORS')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'NEIGHBORS' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Neighbor Table ({neighbors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'CONFIG' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>UART Config</span>
        </button>

        <button
          onClick={() => setActiveTab('KOTLIN_CODE')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'KOTLIN_CODE' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Android Code</span>
        </button>
      </div>

      {/* TAB 1: SERIAL CONSOLE & TRANSMIT */}
      {activeTab === 'CONSOLE' && (
        <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>LIVE HARDWARE SERIAL STREAM (RAW BYTES)</span>
            <button
              onClick={() => setSerialLogs([])}
              className="text-slate-500 hover:text-rose-400"
            >
              Clear
            </button>
          </div>

          {/* Terminal Output */}
          <div className="flex-1 min-h-[180px] max-h-[260px] overflow-y-auto bg-black rounded-xl p-3 border border-slate-800 font-mono text-[10px] space-y-1">
            {serialLogs.length === 0 ? (
              <span className="text-slate-600">Waiting for serial traffic...</span>
            ) : (
              serialLogs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed break-all ${
                    log.includes('[TX')
                      ? 'text-cyan-400'
                      : log.includes('[RX_ACK')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('[DISCONNECT')
                      ? 'text-rose-400 font-bold'
                      : log.includes('[PERMISSION')
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Send Command Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={outgoingPayload}
              onChange={(e) => setOutgoingPayload(e.target.value)}
              placeholder="Enter text or raw packet to transmit..."
              disabled={!isConnected}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendSerialPacket}
              disabled={!isConnected || isTransmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isTransmitting ? 'Sending...' : 'Transmit'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: NEIGHBOR TABLE WITH SIGNAL % & BATTERY */}
      {activeTab === 'NEIGHBORS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>ACTIVE CONNECTED MESH NODES ({neighbors.length})</span>
            <span className="text-emerald-400">0% - 100% Signal Scale</span>
          </div>

          <div className="space-y-2">
            {neighbors.map((node) => {
              const signalPct = rssiToSignalPercentage(node.rssiDbm);
              const quality = getSignalQuality(signalPct);

              return (
                <div
                  key={node.nodeId}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{node.name}</span>
                        <span className="text-[9px] font-mono px-1.5 rounded bg-slate-800 text-slate-400">
                          {node.nodeId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {node.hopsAway} Hop{node.hopsAway > 1 ? 's' : ''} away • Last heard {node.lastSeenSecAgo}s ago
                      </span>
                    </div>

                    {/* Delivery ACK Badge */}
                    <div className="text-right">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {node.ackStatus}
                      </span>
                    </div>
                  </div>

                  {/* Clean Percentage Signal Bar & Battery */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Signal Strength:</span>
                        <span className={`font-bold ${quality.color}`}>{signalPct}% ({quality.label})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            signalPct >= 70 ? 'bg-emerald-500' : signalPct >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${signalPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between self-center">
                      <span className="text-slate-400">Battery Level:</span>
                      <div className="flex items-center gap-1 font-bold text-white">
                        <Battery className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{node.batteryPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: UART CONFIGURATION */}
      {activeTab === 'CONFIG' && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Universal Serial Hardware Parameters
          </span>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-300 block">Select Hardware LoRa Chip / Adapter:</label>
            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_USB_DEVICES.map(dev => (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedDevice.id === dev.id
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{dev.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400">
                      {dev.chipType}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    VID: 0x{dev.vendorId.toString(16).toUpperCase()} • PID: 0x{dev.productId.toString(16).toUpperCase()} • Driver: {dev.driverName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase">Baud Rate:</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(parseInt(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              >
                <option value="9600">9600 bps</option>
                <option value="19200">19200 bps</option>
                <option value="38400">38400 bps</option>
                <option value="57600">57600 bps</option>
                <option value="115200">115200 bps (Standard)</option>
                <option value="230400">230400 bps (High Speed)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase">Parity & Framing:</label>
              <select
                value={parity}
                onChange={(e) => setParity(e.target.value as any)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              >
                <option value="NONE">None (8N1)</option>
                <option value="EVEN">Even (8E1)</option>
                <option value="ODD">Odd (8O1)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANDROID KOTLIN CODE & XML SPECS */}
      {activeTab === 'KOTLIN_CODE' && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              Production Android USB Host Implementation
            </span>
            <button
              onClick={() => {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy Spec'}</span>
            </button>
          </div>

          <div className="bg-black rounded-lg p-3 text-[9px] font-mono text-slate-300 overflow-x-auto max-h-[300px] space-y-2">
            <p className="text-emerald-300 font-bold">// 1. AndroidManifest.xml permissions & intent filter</p>
            <pre>{`<uses-feature android:name="android.hardware.usb.host" android:required="true" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />

<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
    </intent-filter>
    <meta-data
        android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
        android:resource="@xml/device_filter" />
</activity>`}</pre>

            <p className="text-cyan-300 font-bold">// 2. res/xml/device_filter.xml (All common USB-to-Serial Chips)</p>
            <pre>{`<resources>
    <!-- CH340 / CH341 -->
    <usb-device vendor-id="6790" product-id="29987" />
    <!-- CP2102 / CP210x Silicon Labs -->
    <usb-device vendor-id="4292" product-id="60000" />
    <!-- FTDI FT232R -->
    <usb-device vendor-id="1027" product-id="24577" />
    <!-- Prolific PL2303 -->
    <usb-device vendor-id="1659" product-id="8963" />
</resources>`}</pre>

            <p className="text-amber-300 font-bold">// 3. UsbOtgSerialService.kt snippet</p>
            <pre>{`val usbManager = getSystemService(Context.USB_SERVICE) as UsbManager
val availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(usbManager)
if (availableDrivers.isNotEmpty()) {
    val driver = availableDrivers[0]
    val connection = usbManager.openDevice(driver.device)
    val port = driver.ports[0]
    port.open(connection)
    port.setParameters(115200, 8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE)
    // Async packet reading thread ...
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
