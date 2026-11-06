import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Radio,
  Wifi,
  Bluetooth,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Signal,
  Battery,
  Send,
  X
} from 'lucide-react';
import { PeerNodeSim } from '../data/simulatedMeshState';
import { RadioStatus } from '../core/githubOfflineBridge';

export interface MeshNodeMapProps {
  currentHandle: string;
  peers: PeerNodeSim[];
  radioStatus: RadioStatus;
  onToggleRadio?: (radioKey: keyof RadioStatus) => void;
  onLogEvent: (module: string, message: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  onSelectPeerForChat?: (peerHandle: string) => void;
}

export interface MapPeerNode {
  id: string;
  handle: string;
  displayName: string;
  role: 'USER' | 'RELAY' | 'ROUTER' | 'SOLAR' | 'DRONE';
  baseX: number; // meters from origin (center 0,0)
  baseY: number;
  supportedRadios: ('BLE' | 'WIFI_DIRECT' | 'WIFI_AWARE' | 'LORA' | 'ROUTER')[];
  batteryPct: number;
  isSelf?: boolean;
}

// Initial set of decentralized mobile peers (Zero fixed repeaters/relays for OPSEC)
const PROXIMITY_PEER_TEMPLATES: MapPeerNode[] = [
  {
    id: 'peer-bob',
    handle: '@bob_mesh',
    displayName: 'Bob (Mobile Volunteer)',
    role: 'USER',
    baseX: 12,
    baseY: -16,
    supportedRadios: ['WIFI_AWARE', 'BLE'],
    batteryPct: 88,
  },
  {
    id: 'peer-charlie',
    handle: '@charlie_rescue',
    displayName: 'Charlie (Mobile Team)',
    role: 'USER',
    baseX: -26,
    baseY: 28,
    supportedRadios: ['BLE', 'WIFI_DIRECT'],
    batteryPct: 94,
  },
  {
    id: 'peer-router-ap',
    handle: 'Camp_Alpha_P2P_Router',
    displayName: 'Camp Alpha Mobile Hotspot',
    role: 'ROUTER',
    baseX: -8,
    baseY: -14,
    supportedRadios: ['ROUTER', 'WIFI_DIRECT'],
    batteryPct: 100,
  },
  {
    id: 'peer-fatima',
    handle: '@fatima_medic',
    displayName: 'Fatima (Mobile Medic)',
    role: 'USER',
    baseX: 20,
    baseY: 22,
    supportedRadios: ['BLE', 'WIFI_AWARE'],
    batteryPct: 76,
  },
  {
    id: 'peer-zain',
    handle: '@zain_relief',
    displayName: 'Zain (Moving Swarm Node)',
    role: 'USER',
    baseX: 58,
    baseY: -44,
    supportedRadios: ['WIFI_DIRECT', 'BLE'],
    batteryPct: 92,
  },
  {
    id: 'peer-hamza',
    handle: '@hamza_comm',
    displayName: 'Hamza (Decentralized Peer)',
    role: 'USER',
    baseX: -55,
    baseY: -58,
    supportedRadios: ['WIFI_DIRECT', 'BLE'],
    batteryPct: 68,
  },
  {
    id: 'peer-usman',
    handle: '@usman_offgrid',
    displayName: 'Usman (Student Swarm)',
    role: 'USER',
    baseX: 34,
    baseY: -38,
    supportedRadios: ['WIFI_DIRECT', 'BLE'],
    batteryPct: 81,
  },
  {
    id: 'peer-tariq',
    handle: '@tariq_logistics',
    displayName: 'Tariq (Mobile Node)',
    role: 'USER',
    baseX: 75,
    baseY: 60,
    supportedRadios: ['BLE', 'WIFI_DIRECT'],
    batteryPct: 73,
  }
];

export const MeshNodeMap: React.FC<MeshNodeMapProps> = ({
  currentHandle,
  peers: _peers,
  radioStatus,
  onToggleRadio,
  onLogEvent,
  onSelectPeerForChat,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Simulated node position in meters (relative to reference coordinate center)
  const [userPos, setUserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isWandering, setIsWandering] = useState<boolean>(false);
  const [wanderSpeed, setWanderSpeed] = useState<'WALK' | 'JOG' | 'BIKE'>('WALK');
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [zoomRangeMeters, setZoomRangeMeters] = useState<number>(100); // Max radius in meters shown on canvas
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BLE' | 'WIFI' | 'LORA'>('ALL');
  const [pingPulseActive, setPingPulseActive] = useState<boolean>(false);
  const [simulatedPackets, setSimulatedPackets] = useState<Array<{
    id: string;
    sourceId: string;
    targetId: string;
    progress: number;
    type: 'BEACON' | 'CHAT' | 'VOICE';
  }>>([]);

  // Auto-wander trajectory generator
  const wanderAngleRef = useRef<number>(0.2);
  const wanderTimerRef = useRef<any>(null);

  // Determine which radios are currently active
  const isBleActive = Boolean(radioStatus.bluetoothEnabled);
  const isWifiAwareActive = Boolean(radioStatus.locationServicesEnabled);
  const isWifiDirectActive = Boolean(radioStatus.wifiMeshEnabled);
  const isLoraActive = Boolean(radioStatus.wifiMeshEnabled || radioStatus.bluetoothEnabled);

  // Evaluate dynamic peer distances, RSSI, and real-time connectivity status
  const peersCalculated = useMemo(() => {
    return PROXIMITY_PEER_TEMPLATES.map(p => {
      const dx = p.baseX - userPos.x;
      const dy = p.baseY - userPos.y;
      const distanceMeters = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10);
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = Math.round(((angleRad * 180) / Math.PI + 360) % 360);

      // Determine reachable radio transports
      const activeTransports: string[] = [];
      let canConnect = false;
      let primaryTransport = 'NONE';
      let maxRange = 0;

      if (isBleActive && p.supportedRadios.includes('BLE')) {
        maxRange = Math.max(maxRange, 32);
        if (distanceMeters <= 32) activeTransports.push('BLE');
      }
      if ((isWifiAwareActive || isWifiDirectActive) && (p.supportedRadios.includes('WIFI_AWARE') || p.supportedRadios.includes('WIFI_DIRECT') || p.supportedRadios.includes('ROUTER'))) {
        maxRange = Math.max(maxRange, 75);
        if (distanceMeters <= 75) activeTransports.push('WIFI');
      }
      if (isLoraActive && p.supportedRadios.includes('LORA')) {
        maxRange = Math.max(maxRange, 250);
        if (distanceMeters <= 250) activeTransports.push('LORA');
      }

      // Filter check
      let matchesFilter = true;
      if (activeFilter === 'BLE') matchesFilter = p.supportedRadios.includes('BLE');
      else if (activeFilter === 'WIFI') matchesFilter = p.supportedRadios.includes('WIFI_DIRECT') || p.supportedRadios.includes('WIFI_AWARE') || p.supportedRadios.includes('ROUTER');
      else if (activeFilter === 'LORA') matchesFilter = p.supportedRadios.includes('LORA');

      canConnect = activeTransports.length > 0 && matchesFilter;
      if (activeTransports.includes('WIFI')) primaryTransport = 'Wi-Fi Direct / Aware';
      else if (activeTransports.includes('BLE')) primaryTransport = 'Bluetooth LE 5.3';
      else if (activeTransports.includes('LORA')) primaryTransport = 'LoRa 433MHz Mesh';

      // Realistic RSSI formula (dBm) with path loss
      const rssiDbm = Math.round(-35 - 28 * Math.log10(distanceMeters) + (Math.sin(distanceMeters) * 2));
      const latencyMs = primaryTransport === 'Wi-Fi Direct / Aware' ? Math.round(12 + distanceMeters * 0.15)
        : primaryTransport === 'Bluetooth LE 5.3' ? Math.round(35 + distanceMeters * 0.4)
        : Math.round(140 + distanceMeters * 0.2);

      return {
        ...p,
        dx,
        dy,
        distanceMeters,
        angleDeg,
        isConnected: canConnect,
        primaryTransport,
        activeTransports,
        rssiDbm,
        latencyMs,
        maxRange,
        matchesFilter
      };
    });
  }, [userPos, isBleActive, isWifiAwareActive, isWifiDirectActive, isLoraActive, activeFilter]);

  const connectedPeers = useMemo(() => {
    return peersCalculated.filter(p => p.isConnected);
  }, [peersCalculated]);

  const selectedPeerData = useMemo(() => {
    if (!selectedPeerId) return null;
    return peersCalculated.find(p => p.id === selectedPeerId) || null;
  }, [selectedPeerId, peersCalculated]);

  useEffect(() => {
    if (!isWandering) {
      if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);
      return;
    }

    const speedMetersPerSec = wanderSpeed === 'WALK' ? 1.4 : wanderSpeed === 'JOG' ? 3.5 : 8.0;
    const intervalMs = 100;
    const stepDist = (speedMetersPerSec * (intervalMs / 1000));

    wanderTimerRef.current = setInterval(() => {
      // Gentle curvilinear wander with random drift
      wanderAngleRef.current += (Math.random() - 0.49) * 0.25;
      setUserPos(prev => {
        const nx = prev.x + Math.cos(wanderAngleRef.current) * stepDist;
        const ny = prev.y + Math.sin(wanderAngleRef.current) * stepDist;

        // Bounce back if moving too far out of boundary
        const distFromCenter = Math.sqrt(nx * nx + ny * ny);
        if (distFromCenter > 110) {
          wanderAngleRef.current = Math.atan2(-ny, -nx) + (Math.random() - 0.5) * 0.5;
        }

        return { x: nx, y: ny };
      });
    }, intervalMs);

    return () => {
      if (wanderTimerRef.current) clearInterval(wanderTimerRef.current);
    };
  }, [isWandering, wanderSpeed]);

  // Periodic simulated packet pulse traversing active links
  useEffect(() => {
    const packetInterval = setInterval(() => {
      setSimulatedPackets(prev => {
        // Advance existing packets
        const advanced = prev
          .map(p => ({ ...p, progress: p.progress + 0.12 }))
          .filter(p => p.progress <= 1.0);

        // Periodically spawn a new packet if any active link exists
        if (Math.random() > 0.4 && connectedPeers.length > 0) {
          const randomPeer = connectedPeers[Math.floor(Math.random() * connectedPeers.length)];
          const isOutbound = Math.random() > 0.3;
          advanced.push({
            id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sourceId: isOutbound ? 'self' : randomPeer.id,
            targetId: isOutbound ? randomPeer.id : 'self',
            progress: 0,
            type: Math.random() > 0.6 ? 'CHAT' : Math.random() > 0.3 ? 'VOICE' : 'BEACON'
          });
        }
        return advanced;
      });
    }, 120);

    return () => clearInterval(packetInterval);
  }, [connectedPeers]);

  // Ping ripple trigger
  const handleTriggerPing = useCallback(() => {
    setPingPulseActive(true);
    onLogEvent('MeshMap', `Transmitted proximity ping from ${currentHandle}. ${connectedPeers.length} nodes acknowledged direct link.`, 'success');
    setTimeout(() => setPingPulseActive(false), 1400);
  }, [currentHandle, connectedPeers.length, onLogEvent]);

  // D3 Rendering & Interactive Dragging logic
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    const width = svgEl.clientWidth || 360;
    const height = svgEl.clientHeight || 360;
    const centerX = width / 2;
    const centerY = height / 2;

    // Scale: meters to pixels
    const maxRadiusPixels = Math.min(width, height) / 2 - 18;
    const scale = maxRadiusPixels / zoomRangeMeters;

    // Clear previous contents
    svg.selectAll('*').remove();

    // Defs for gradients & glowing filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radar gradient
    const radarGrad = defs.append('radialGradient')
      .attr('id', 'radar-grid-bg')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    radarGrad.append('stop').attr('offset', '0%').attr('stop-color', '#064e3b').attr('stop-opacity', '0.22');
    radarGrad.append('stop').attr('offset', '70%').attr('stop-color', '#022c22').attr('stop-opacity', '0.08');
    radarGrad.append('stop').attr('offset', '100%').attr('stop-color', '#020617').attr('stop-opacity', '0.0');

    const g = svg.append('g').attr('class', 'map-container');

    // Background circle
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', maxRadiusPixels)
      .attr('fill', 'url(#radar-grid-bg)')
      .attr('stroke', '#065f46')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.6);

    // Crosshairs
    g.append('line')
      .attr('x1', centerX - maxRadiusPixels)
      .attr('y1', centerY)
      .attr('x2', centerX + maxRadiusPixels)
      .attr('y2', centerY)
      .attr('stroke', '#065f46')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.35);

    g.append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - maxRadiusPixels)
      .attr('x2', centerX)
      .attr('y2', centerY + maxRadiusPixels)
      .attr('stroke', '#065f46')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.35);

    // Concentric Range Rings (Meters)
    const rings = [
      { meters: 15, label: '15m • BLE / NFC' },
      { meters: 35, label: '35m • Wi-Fi Aware' },
      { meters: 70, label: '70m • Wi-Fi Direct' },
      { meters: 100, label: '100m • LoRa Sub-GHz' },
    ];

    rings.forEach(ring => {
      const rPix = ring.meters * scale;
      if (rPix <= maxRadiusPixels) {
        g.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', rPix)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 0.75)
          .attr('stroke-opacity', 0.25)
          .attr('stroke-dasharray', '3 3');

        // Ring Label
        g.append('text')
          .attr('x', centerX + 4)
          .attr('y', centerY - rPix + 10)
          .attr('fill', '#34d399')
          .attr('font-size', '8px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
          .attr('opacity', 0.65)
          .text(ring.label);
      }
    });

    // Outer Cardinal Direction Marks
    const cardinalLabels = [
      { text: 'N', x: centerX, y: centerY - maxRadiusPixels + 12 },
      { text: 'S', x: centerX, y: centerY + maxRadiusPixels - 6 },
      { text: 'E', x: centerX + maxRadiusPixels - 12, y: centerY + 3 },
      { text: 'W', x: centerX - maxRadiusPixels + 12, y: centerY + 3 },
    ];
    cardinalLabels.forEach(c => {
      g.append('text')
        .attr('x', c.x)
        .attr('y', c.y)
        .attr('text-anchor', 'middle')
        .attr('fill', '#059669')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('opacity', 0.8)
        .text(c.text);
    });

    // Dynamic Connections / Links between User Node & Connected Peers
    const linksGroup = g.append('g').attr('class', 'links-group');

    peersCalculated.forEach(peer => {
      if (!peer.matchesFilter) return;

      const px = centerX + peer.dx * scale;
      const py = centerY + peer.dy * scale;

      if (peer.isConnected) {
        // Link color based on RSSI
        const strokeColor = peer.rssiDbm > -65 ? '#10b981' : peer.rssiDbm > -80 ? '#f59e0b' : '#a855f7';
        const strokeWidth = peer.rssiDbm > -65 ? 2.0 : peer.rssiDbm > -80 ? 1.5 : 1.0;

        // Animated Link Line
        linksGroup.append('line')
          .attr('x1', centerX)
          .attr('y1', centerY)
          .attr('x2', px)
          .attr('y2', py)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-dasharray', peer.primaryTransport.includes('LoRa') ? '4 3' : 'none');

        // Distance text on line midpoint
        const midX = (centerX + px) / 2;
        const midY = (centerY + py) / 2;
        linksGroup.append('rect')
          .attr('x', midX - 16)
          .attr('y', midY - 6)
          .attr('width', 32)
          .attr('height', 12)
          .attr('rx', 3)
          .attr('fill', '#020617')
          .attr('fill-opacity', 0.75)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 0.5);

        linksGroup.append('text')
          .attr('x', midX)
          .attr('y', midY + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', strokeColor)
          .attr('font-size', '7.5px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'ui-monospace, monospace')
          .text(`${peer.distanceMeters}m`);
      } else {
        // Faint disconnected line indicating out of range
        linksGroup.append('line')
          .attr('x1', centerX)
          .attr('y1', centerY)
          .attr('x2', px)
          .attr('y2', py)
          .attr('stroke', '#334155')
          .attr('stroke-width', 0.7)
          .attr('stroke-opacity', 0.25)
          .attr('stroke-dasharray', '2 4');
      }
    });

    // Simulated Packets Animation on Links
    const packetsGroup = g.append('g').attr('class', 'packets-group');
    simulatedPackets.forEach(pkt => {
      const targetPeer = peersCalculated.find(p => p.id === (pkt.sourceId === 'self' ? pkt.targetId : pkt.sourceId));
      if (!targetPeer || !targetPeer.isConnected) return;

      const px = centerX + targetPeer.dx * scale;
      const py = centerY + targetPeer.dy * scale;

      const isOutbound = pkt.sourceId === 'self';
      const curX = isOutbound ? centerX + (px - centerX) * pkt.progress : px + (centerX - px) * pkt.progress;
      const curY = isOutbound ? centerY + (py - centerY) * pkt.progress : py + (centerY - py) * pkt.progress;

      const pktColor = pkt.type === 'CHAT' ? '#38bdf8' : pkt.type === 'VOICE' ? '#a855f7' : '#10b981';

      packetsGroup.append('circle')
        .attr('cx', curX)
        .attr('cy', curY)
        .attr('r', 3.5)
        .attr('fill', pktColor)
        .attr('filter', 'url(#neon-glow)');
    });

    // Peer Nodes
    const peersGroup = g.append('g').attr('class', 'peers-group');

    peersCalculated.forEach(peer => {
      if (!peer.matchesFilter) return;

      const px = centerX + peer.dx * scale;
      const py = centerY + peer.dy * scale;
      const isSelected = peer.id === selectedPeerId;

      const peerG = peersGroup.append('g')
        .attr('class', `peer-node ${peer.id}`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setSelectedPeerId(peer.id);
        });

      // Role color
      const roleColor = peer.role === 'SOLAR' ? '#f59e0b'
        : peer.role === 'DRONE' ? '#38bdf8'
        : peer.role === 'ROUTER' ? '#a855f7'
        : peer.role === 'RELAY' ? '#10b981'
        : '#34d399';

      const nodeBg = peer.isConnected ? roleColor : '#475569';

      // Pulse ring for relay & connected nodes
      if (peer.isConnected) {
        peerG.append('circle')
          .attr('cx', px)
          .attr('cy', py)
          .attr('r', 12)
          .attr('fill', 'none')
          .attr('stroke', roleColor)
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-dasharray', '2 2');
      }

      // Selection Ring
      if (isSelected) {
        peerG.append('circle')
          .attr('cx', px)
          .attr('cy', py)
          .attr('r', 16)
          .attr('fill', 'none')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 2')
          .attr('filter', 'url(#neon-glow)');
      }

      // Main Node Circle
      peerG.append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 8)
        .attr('fill', nodeBg)
        .attr('stroke', '#020617')
        .attr('stroke-width', 2)
        .attr('filter', peer.isConnected ? 'url(#neon-glow)' : 'none');

      // Inner Icon mark / Role Letter
      peerG.append('text')
        .attr('x', px)
        .attr('y', py + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', '#020617')
        .attr('font-size', '8px')
        .attr('font-weight', '900')
        .attr('font-family', 'sans-serif')
        .text(peer.role === 'SOLAR' ? 'S' : peer.role === 'DRONE' ? 'D' : peer.role === 'ROUTER' ? 'R' : peer.role === 'RELAY' ? 'M' : 'P');

      // Peer Handle Label
      peerG.append('text')
        .attr('x', px)
        .attr('y', py + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', peer.isConnected ? '#f8fafc' : '#94a3b8')
        .attr('font-size', '8.5px')
        .attr('font-weight', isSelected ? 'bold' : '600')
        .attr('font-family', 'ui-monospace, monospace')
        .text(peer.handle);

      // RSSI / Status sub-label
      peerG.append('text')
        .attr('x', px)
        .attr('y', py + 26)
        .attr('text-anchor', 'middle')
        .attr('fill', peer.isConnected ? (peer.rssiDbm > -70 ? '#34d399' : '#fbbf24') : '#ef4444')
        .attr('font-size', '7px')
        .attr('font-weight', '500')
        .attr('font-family', 'ui-monospace, monospace')
        .text(peer.isConnected ? `${peer.rssiDbm} dBm` : 'OFFLINE');
    });

    // Central Simulated User Node (Draggable!)
    const selfGroup = g.append('g').attr('class', 'self-node-group').attr('cursor', 'grab');

    // Ping ripple animation
    if (pingPulseActive) {
      selfGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 18)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.9)
        .transition()
        .duration(1200)
        .attr('r', maxRadiusPixels)
        .attr('stroke-opacity', 0)
        .remove();
    }

    // Outer pulsating aura
    selfGroup.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 18)
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#neon-glow)');

    // Center Core
    selfGroup.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 10)
      .attr('fill', '#059669')
      .attr('stroke', '#ecfdf5')
      .attr('stroke-width', 2);

    // Inner dot
    selfGroup.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 4)
      .attr('fill', '#ecfdf5');

    // Handle Label
    selfGroup.append('text')
      .attr('x', centerX)
      .attr('y', centerY - 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#34d399')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'ui-monospace, monospace')
      .text(`YOU (${currentHandle})`);

    // D3 Drag Behavior to move the node interactively across the canvas
    const dragBehavior = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const deltaX = event.dx / scale;
        const deltaY = event.dy / scale;
        setUserPos(prev => ({
          x: Math.round((prev.x - deltaX) * 10) / 10,
          y: Math.round((prev.y - deltaY) * 10) / 10,
        }));
      });

    selfGroup.call(dragBehavior as any);

  }, [
    peersCalculated,
    zoomRangeMeters,
    selectedPeerId,
    pingPulseActive,
    simulatedPackets,
    currentHandle,
    userPos
  ]);

  // Movement Pad handler (+/- meters)
  const handleNudgePosition = (dx: number, dy: number) => {
    setUserPos(prev => ({
      x: Math.round((prev.x + dx) * 10) / 10,
      y: Math.round((prev.y + dy) * 10) / 10,
    }));
  };

  const handleResetPosition = () => {
    setUserPos({ x: 0, y: 0 });
    onLogEvent('MeshMap', 'Node position reset to central reference anchor (0m, 0m).', 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Tactical Status Bar */}
      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">D3 MESH NODE MAP</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                PROXIMITY RADAR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Pos: ({userPos.x > 0 ? `+${userPos.x}` : userPos.x}m, {userPos.y > 0 ? `+${userPos.y}` : userPos.y}m) • {connectedPeers.length} active peers
            </p>
          </div>
        </div>

        {/* Ping Ripple Broadcast Button */}
        <button
          onClick={handleTriggerPing}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          title="Broadcast a real-time mesh beacon ripple"
        >
          <Zap className="h-3 w-3 fill-slate-950" />
          <span>Ping Mesh</span>
        </button>
      </div>

      {/* Quick Radio Connectivity Toggles */}
      <div className="px-2 py-1 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[10px] overflow-x-auto gap-1 shrink-0">
        <span className="text-slate-400 font-mono flex items-center gap-1 mr-1">
          <Signal className="h-3 w-3 text-emerald-400" />
          Radios:
        </span>

        <button
          onClick={() => onToggleRadio && onToggleRadio('bluetoothEnabled')}
          className={`px-2 py-0.5 rounded font-mono flex items-center gap-1 transition-colors cursor-pointer ${
            isBleActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <Bluetooth className="h-2.5 w-2.5" />
          <span>BLE</span>
        </button>

        <button
          onClick={() => onToggleRadio && onToggleRadio('locationServicesEnabled')}
          className={`px-2 py-0.5 rounded font-mono flex items-center gap-1 transition-colors cursor-pointer ${
            isWifiAwareActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <Wifi className="h-2.5 w-2.5" />
          <span>Aware</span>
        </button>

        <button
          onClick={() => onToggleRadio && onToggleRadio('wifiMeshEnabled')}
          className={`px-2 py-0.5 rounded font-mono flex items-center gap-1 transition-colors cursor-pointer ${
            isWifiDirectActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <Wifi className="h-2.5 w-2.5" />
          <span>Direct</span>
        </button>

        <button
          onClick={() => onToggleRadio && onToggleRadio('wifiInternetActive')}
          className={`px-2 py-0.5 rounded font-mono flex items-center gap-1 transition-colors cursor-pointer ${
            radioStatus.wifiInternetActive ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <Radio className="h-2.5 w-2.5" />
          <span>Gateway</span>
        </button>
      </div>

      {/* Main Interactive D3 Visual Map Canvas */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* SVG Canvas rendered by D3 */}
        <svg
          ref={svgRef}
          className="w-full h-full touch-none select-none block"
          style={{ minHeight: '260px' }}
        />

        {/* Floating Range Scale Selector (Top-Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 flex items-center gap-1">
            <span className="text-[9px] font-mono text-slate-400 px-1">Scale:</span>
            {[50, 100, 150].map(range => (
              <button
                key={range}
                onClick={() => setZoomRangeMeters(range)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer ${
                  zoomRangeMeters === range
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {range}m
              </button>
            ))}
          </div>

          {/* Radio Protocol Filter */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 flex items-center gap-1">
            {(['ALL', 'BLE', 'WIFI', 'LORA'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-1.5 py-0.5 text-[8.5px] font-mono rounded cursor-pointer ${
                  activeFilter === f
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Drag Hint & Wander Controls (Top-Right) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 flex items-center gap-1.5 text-[10px]">
            <button
              onClick={() => setIsWandering(!isWandering)}
              className={`px-2 py-0.5 rounded font-mono flex items-center gap-1 font-bold transition-all cursor-pointer ${
                isWandering
                  ? 'bg-amber-600 text-slate-950 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
              }`}
              title="Automatically simulate walking through neighborhood"
            >
              {isWandering ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-emerald-400" />}
              <span>{isWandering ? 'Patrolling...' : 'Auto-Wander'}</span>
            </button>

            {isWandering && (
              <button
                onClick={() => setWanderSpeed(s => s === 'WALK' ? 'JOG' : s === 'JOG' ? 'BIKE' : 'WALK')}
                className="px-1.5 py-0.5 bg-slate-800 text-[9px] font-mono text-amber-300 rounded cursor-pointer"
              >
                {wanderSpeed}
              </button>
            )}
          </div>

          <span className="text-[8px] font-mono text-emerald-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-emerald-900/30">
            💡 Drag center node to move
          </span>
        </div>

        {/* Directional Navigation Pad (Bottom-Right) */}
        <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex flex-col items-center gap-1 z-10 shadow-xl">
          <button
            onClick={() => handleNudgePosition(0, -6)}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Move North (+6m)"
          >
            ▲
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNudgePosition(-6, 0)}
              className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
              title="Move West (-6m)"
            >
              ◀
            </button>
            <button
              onClick={handleResetPosition}
              className="w-7 h-7 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center cursor-pointer"
              title="Reset to Center Origin"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleNudgePosition(6, 0)}
              className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
              title="Move East (+6m)"
            >
              ▶
            </button>
          </div>
          <button
            onClick={() => handleNudgePosition(0, 6)}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Move South (-6m)"
          >
            ▼
          </button>
        </div>

        {/* Bottom-Left Live Telemetry Metrics Card */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-lg p-2 max-w-[190px] text-[10px] space-y-1 z-10 shadow-lg font-mono">
          <div className="flex items-center justify-between text-slate-400 pb-0.5 border-b border-slate-800">
            <span>LOCAL MESH TELEMETRY</span>
            <span className="text-emerald-400 font-bold">{connectedPeers.length} Online</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Avg Hop RTT:</span>
            <span className="text-emerald-300 font-bold">
              {connectedPeers.length > 0
                ? `${Math.round(connectedPeers.reduce((acc, p) => acc + p.latencyMs, 0) / connectedPeers.length)} ms`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Signal Spectrum:</span>
            <span className="text-amber-300 font-bold">2.4 / 5.8 GHz + 433M</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Mesh Topology:</span>
            <span className="text-sky-300 font-bold">Full-Mesh Ad-Hoc</span>
          </div>
        </div>
      </div>

      {/* Selected Peer Inspector Drawer / Panel */}
      {selectedPeerData && (
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0 animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg font-bold text-xs ${
                selectedPeerData.role === 'SOLAR' ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                : selectedPeerData.role === 'DRONE' ? 'bg-sky-950 text-sky-400 border border-sky-500/40'
                : selectedPeerData.role === 'ROUTER' ? 'bg-purple-950 text-purple-400 border border-purple-500/40'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}>
                {selectedPeerData.role}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">{selectedPeerData.displayName}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{selectedPeerData.handle}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>Dist: <strong className="text-white">{selectedPeerData.distanceMeters}m</strong></span>
                  <span>•</span>
                  <span>Bearing: <strong className="text-white">{selectedPeerData.angleDeg}°</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Battery className="h-3 w-3 text-emerald-400" />
                    {selectedPeerData.batteryPct}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPeerId(null)}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px]">LINK STATUS</span>
              <span className={`font-bold ${selectedPeerData.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPeerData.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px]">SIGNAL RSSI</span>
              <span className={`font-bold ${selectedPeerData.rssiDbm > -70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedPeerData.isConnected ? `${selectedPeerData.rssiDbm} dBm` : '0 dBm'}
              </span>
            </div>

            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px]">RADIO PROTOCOL</span>
              <span className="text-slate-200 font-bold truncate block">
                {selectedPeerData.isConnected ? selectedPeerData.primaryTransport : 'Out of Reach'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                onLogEvent('MeshMap', `Pinging peer ${selectedPeerData.handle} via ${selectedPeerData.primaryTransport}... RTT: ${selectedPeerData.latencyMs}ms.`, 'success');
              }}
              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Ping Node ({selectedPeerData.latencyMs}ms)</span>
            </button>

            {onSelectPeerForChat && (
              <button
                onClick={() => {
                  onSelectPeerForChat(selectedPeerData.handle);
                  onLogEvent('MeshMap', `Opened direct encrypted mesh chat with ${selectedPeerData.handle}`, 'info');
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Chat With Peer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
