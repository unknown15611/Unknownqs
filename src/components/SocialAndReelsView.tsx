import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Download,
  Play,
  Pause,
  Film,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Plus,
  Volume2,
  VolumeX,
  Youtube,
  Clock,
  Eye,
  Upload,
  Video,
  Image as ImageIcon,
  AlertTriangle,
  FileCheck,
  X,
  Search,
  Copy,
  Check,
  Radio,
  Tv,
  Globe,
  Bell,
  MessageSquare,
  Maximize2,
  Minimize2,
  Music,
  Disc3,
  Lock,
  Unlock,
  Folder,
  Users,
  UserCheck,
  Trash2
} from 'lucide-react';
import { shouldInsertReelAd, filterContentUnderIslamicLaw, ISLAMIC_LAW_BLOCK_MESSAGE } from '../core/adminAndAds';
import { MeshGroupSim } from '../data/simulatedMeshState';

export function getRegionalTimeString(date: Date = new Date(), region: string = 'Pakistan'): string {
  try {
    const timeZone = region.includes('Pakistan') ? 'Asia/Karachi' : Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi';
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    });
    return formatter.format(date).replace(',', '') + ' (' + region + ' Time)';
  } catch (_e) {
    const local = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    return local.toISOString().replace('T', ' ').substring(0, 19) + ' PKT (Pakistan Time)';
  }
}

export interface PostComment {
  id: string;
  authorHandle: string;
  createdAtText: string;
  text: string;
}

export interface SocialPost {
  id: string;
  authorHandle: string;
  authorDisplayName: string;
  createdAtText: string;
  content: string;
  mediaType?: 'VIDEO' | 'IMAGE';
  mediaUrl?: string;
  mediaTitle?: string;
  mediaSizeBytes?: number;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments?: PostComment[];
  isSponsoredAd?: boolean;
  adUnitId?: string;
  allowSharing?: boolean; // Only author has right to enable or disable sharing!
  sharedFromGroup?: string; // If post was shared from a mesh group
  watermarkBadge?: {
    platform: string;
    timestamp: string;
    hash: string;
  };
}

export interface YouTubeFeedItem {
  id: string;
  title: string;
  channelName: string;
  viewsText: string;
  durationText: string;
  category: 'SURVIVAL' | 'DIY_RADIO' | 'FIRST_AID' | 'HYGIENE' | 'CIVIC_RIGHTS';
  videoUrl: string;
  thumbnailColor: string;
  sizeMb: number;
}

const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorHandle: 'qaidi156156',
    authorDisplayName: 'Qaidi Node 156156',
    createdAtText: '10m ago',
    content: '⚡ Autonomous multi-hop packet routing deployed. Frequency hopping protocol active across all district nodes. Keep radios active!',
    likesCount: 142,
    isLiked: false,
    commentsCount: 3,
    allowSharing: true,
    sharedFromGroup: 'Tactical Mesh Ops',
    comments: [
      { id: 'c-1', authorHandle: 'qaidi7711', createdAtText: '8m ago', text: 'Confirmed in Sector F-7. Packets routing with 0% loss.' },
      { id: 'c-2', authorHandle: 'qaidi3390', createdAtText: '5m ago', text: 'First-aid post active near campus quad.' },
      { id: 'c-3', authorHandle: 'qaidi4829', createdAtText: '2m ago', text: 'Cantenna relay online on 2.44GHz.' }
    ]
  },
  {
    id: 'post-ad-1',
    authorHandle: 'Google AdMob Native',
    authorDisplayName: 'Sponsored (ca-app-pub-3283420350176268/4797966805)',
    createdAtText: 'Sponsored',
    content: 'Protect your family with emergency solar rechargeable lanterns. Designed for off-grid blackouts and long-lasting mesh hub operation.',
    isSponsoredAd: true,
    adUnitId: 'ca-app-pub-3283420350176268/4797966805',
    likesCount: 5,
    commentsCount: 0,
    allowSharing: true
  },
  {
    id: 'post-2',
    authorHandle: 'qaidi4829',
    authorDisplayName: 'Qaidi Node 4829',
    createdAtText: '35m ago',
    content: 'Here is the DIY Cantenna range booster tutorial video captured on ground. Shared directly via Qaidi Share mesh. Download the full MP4 locally to replay offline anytime!',
    mediaType: 'VIDEO',
    mediaTitle: 'DIY_Cantenna_Booster_Guide.mp4',
    mediaSizeBytes: 14.2 * 1024 * 1024,
    likesCount: 89,
    isLiked: false,
    commentsCount: 2,
    allowSharing: true,
    comments: [
      { id: 'c-201', authorHandle: 'qaidi3390', createdAtText: '20m ago', text: 'Built this yesterday with a Nido can, gained +14dBi immediately!' },
      { id: 'c-202', authorHandle: 'qaidi156156', createdAtText: '12m ago', text: 'Make sure probe length is strictly 31mm.' }
    ],
    watermarkBadge: {
      platform: 'Hardware Radio Verified',
      timestamp: '2026-10-29 10:15 UTC',
      hash: 'B84A29F1'
    }
  },
  {
    id: 'post-3',
    authorHandle: 'qaidi7711',
    authorDisplayName: 'Lahore Relief Volunteer',
    createdAtText: '1h ago',
    content: 'Urgent medical aid & clean saline solution distribution point setup near Sector G Campus. Location coordinates pinned in offline satellite map.',
    mediaType: 'IMAGE',
    mediaTitle: 'Relief_Center_Map.jpg',
    mediaSizeBytes: 1.8 * 1024 * 1024,
    likesCount: 230,
    isLiked: false,
    commentsCount: 1,
    allowSharing: false, // Author qaidi7711 has locked sharing - only author has right to enable
    comments: [
      { id: 'c-301', authorHandle: 'qaidi4829', createdAtText: '45m ago', text: 'Marked on the offline satellite map as Real Aid Point.' }
    ],
    watermarkBadge: {
      platform: 'Device Camera Hardware Verified',
      timestamp: '2026-10-29 09:40 UTC',
      hash: '77E120A4'
    }
  }
];

const INITIAL_YOUTUBE_FEEDS: YouTubeFeedItem[] = [
  {
    id: 'yt-1',
    title: 'How to Build an Emergency Cantenna Wi-Fi Booster for Under $5',
    channelName: 'OffGrid Tech Lab',
    viewsText: '48K views',
    durationText: '8:42',
    category: 'DIY_RADIO',
    videoUrl: 'https://youtube.com/watch?v=cantenna_guide',
    thumbnailColor: 'from-emerald-800 to-teal-950',
    sizeMb: 24.5
  },
  {
    id: 'yt-2',
    title: 'Chemical Irritant & Smoke Saline First-Aid: Field Medic Protocol',
    channelName: 'Civic Safety Foundation',
    viewsText: '112K views',
    durationText: '5:15',
    category: 'FIRST_AID',
    videoUrl: 'https://youtube.com/watch?v=field_medic_first_aid',
    thumbnailColor: 'from-rose-800 to-red-950',
    sizeMb: 18.2
  },
  {
    id: 'yt-3',
    title: 'ESP32 LoRa Mesh Packet Radio: Firmware Flashing & Relay Setup',
    channelName: 'Mesh Pakistan Network',
    viewsText: '31K views',
    durationText: '12:08',
    category: 'DIY_RADIO',
    videoUrl: 'https://youtube.com/watch?v=esp32_lora_mesh',
    thumbnailColor: 'from-teal-800 to-emerald-950',
    sizeMb: 38.0
  },
  {
    id: 'yt-4',
    title: 'DIY Water Purification & Field Hygiene During Grid Blackouts',
    channelName: 'Survival Skills Urdu',
    viewsText: '67K views',
    durationText: '7:30',
    category: 'HYGIENE',
    videoUrl: 'https://youtube.com/watch?v=clean_water_urdu',
    thumbnailColor: 'from-cyan-800 to-emerald-950',
    sizeMb: 21.0
  }
];

interface SocialAndReelsViewProps {
  currentHandle: string;
  isOnline: boolean;
  isSuperAdmin?: boolean;
  groups?: MeshGroupSim[];
  externalSharedPost?: { content: string; mediaType?: 'VIDEO' | 'IMAGE'; mediaTitle?: string } | null;
  onLogEvent: (module: string, message: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  onDownloadFile: (fileName: string, sizeBytes: number) => void;
  onShareToChat?: (text: string, mediaType?: 'VIDEO' | 'IMAGE', mediaTitle?: string) => void;
  onShareToNotice?: (title: string, content: string, category: string) => void;
  onShareToGroup?: (groupId: string, text: string, mediaType?: 'VIDEO' | 'IMAGE', mediaTitle?: string) => void;
}

export const SocialAndReelsView: React.FC<SocialAndReelsViewProps> = ({
  currentHandle,
  isOnline,
  isSuperAdmin = false,
  groups = [],
  externalSharedPost,
  onLogEvent,
  onDownloadFile,
  onShareToChat,
  onShareToNotice,
  onShareToGroup
}) => {
  const [subTab, setSubTab] = useState<'wall' | 'reels' | 'youtube'>('wall');

  // Social Wall State with My Posts Filter (Space saving)
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [postFilter, setPostFilter] = useState<'ALL' | 'MY_POSTS'>('ALL');
  const [newPostText, setNewPostText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postAttachmentType, setPostAttachmentType] = useState<'NONE' | 'IMAGE' | 'VIDEO'>('NONE');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync external post shared to social
  useEffect(() => {
    if (externalSharedPost) {
      const newPost: SocialPost = {
        id: `post-ext-${Date.now()}`,
        authorHandle: currentHandle,
        authorDisplayName: `Qaidi Node ${currentHandle.replace('qaidi', '')}`,
        createdAtText: 'Just now • Shared',
        content: externalSharedPost.content,
        mediaType: externalSharedPost.mediaType,
        mediaTitle: externalSharedPost.mediaTitle,
        mediaSizeBytes: externalSharedPost.mediaType ? 4.5 * 1024 * 1024 : 0,
        likesCount: 0,
        commentsCount: 0,
        allowSharing: true,
        watermarkBadge: {
          platform: 'Mesh Shared Verified',
          timestamp: getRegionalTimeString(new Date(), 'Pakistan'),
          hash: Math.random().toString(16).slice(2, 10).toUpperCase()
        }
      };
      setPosts(prev => [newPost, ...prev]);
      setSubTab('wall');
    }
  }, [externalSharedPost, currentHandle]);

  // Share YouTube/Guide directly to Social Wall
  const handleShareVideoToSocial = (title: string, videoUrl: string, channelName: string, category: string, sizeMb: number) => {
    const newPost: SocialPost = {
      id: `post-yt-${Date.now()}`,
      authorHandle: currentHandle,
      authorDisplayName: `Qaidi Node ${currentHandle.replace('qaidi', '')}`,
      createdAtText: 'Just now • Video Guide',
      content: `🎥 Shared Video Guide: "${title}"\nBy: ${channelName} • Category: ${category}\nLink: ${videoUrl}`,
      mediaType: 'VIDEO',
      mediaTitle: `${title}.mp4`,
      mediaSizeBytes: sizeMb * 1024 * 1024,
      likesCount: 0,
      commentsCount: 0,
      allowSharing: true,
      watermarkBadge: {
        platform: 'YouTube Mesh Verified',
        timestamp: getRegionalTimeString(new Date(), 'Pakistan'),
        hash: Math.random().toString(16).slice(2, 10).toUpperCase()
      }
    };
    setPosts(prev => [newPost, ...prev]);
    setSubTab('wall');
    onLogEvent('SocialWall', `Shared video "${title}" to Social Feed!`, 'success');
  };

  // Storage File Picker ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Author Share Permissions & Group Origin State
  const [allowSharingOnNewPost, setAllowSharingOnNewPost] = useState<boolean>(true);
  const [shareFromGroupSelected, setShareFromGroupSelected] = useState<string>('');
  const [activeShareModalPost, setActiveShareModalPost] = useState<SocialPost | null>(null);
  const [selectedTargetGroupId, setSelectedTargetGroupId] = useState<string>('');
  const [authorLockNotice, setAuthorLockNotice] = useState<string | null>(null);

  // Moderation Block Notification Banner
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);

  // Reels State
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [reelsViewedCount, setReelsViewedCount] = useState(29);
  const [showReelAdModal, setShowReelAdModal] = useState(false);
  const [isReelPlaying, setIsReelPlaying] = useState(true);
  const [isFullScreenReel, setIsFullScreenReel] = useState(false);
  const [reelProgressSec, setReelProgressSec] = useState(12);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Playback timer for reels
  useEffect(() => {
    if (!isReelPlaying) return;
    const interval = setInterval(() => {
      setReelProgressSec(prev => (prev >= 45 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isReelPlaying, activeReelIdx]);

  const handleDoubleTapReel = () => {
    handleToggleReelLike(activeReelIdx);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  // YouTube Feed & Search & In-App Watch State (Zero API Key Needed!)
  const [ytVideos, setYtVideos] = useState<YouTubeFeedItem[]>(INITIAL_YOUTUBE_FEEDS);
  const [ytSearchQuery, setYtSearchQuery] = useState('');
  const [ytCategoryFilter, setYtCategoryFilter] = useState<string>('ALL');
  const [activeWatchingVideo, setActiveWatchingVideo] = useState<YouTubeFeedItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pasteUrlInput, setPasteUrlInput] = useState('');

  // Handle User File Upload Selection from Storage
  const handleFileFromStorage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i);
    const type: 'VIDEO' | 'IMAGE' = isVideo ? 'VIDEO' : 'IMAGE';
    setPostAttachmentType(type);
    setUploadedFileName(file.name);
    setIsUploadingMedia(true);
    setUploadProgress(25);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    onLogEvent('DeviceStorage', `Picked file "${file.name}" (${sizeMb} MB) from device storage.`, 'info');

    let p = 25;
    const interval = setInterval(() => {
      p += 35;
      setUploadProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setIsUploadingMedia(false);
        onLogEvent('DeviceStorage', `File "${file.name}" indexed for zero-duplication mesh distribution.`, 'success');
      }
    }, 180);
  };

  // Mock preset selector for demo convenience
  const handleSelectUpload = (type: 'VIDEO' | 'IMAGE') => {
    setPostAttachmentType(type);
    setIsUploadingMedia(true);
    setUploadProgress(10);
    const mockName = type === 'VIDEO' ? 'Field_Rescue_Recording.mp4' : 'Campus_Grid_Photo.jpg';
    setUploadedFileName(mockName);

    onLogEvent('MediaUpload', `Encoding ${type.toLowerCase()} for single-instance content addressed storage...`, 'info');

    let p = 10;
    const interval = setInterval(() => {
      p += 30;
      setUploadProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setIsUploadingMedia(false);
        onLogEvent('MediaUpload', `File "${mockName}" ready for mesh distribution.`, 'success');
      }
    }, 200);
  };

  // Author-only Share Permission Toggle Handler
  const handleToggleAuthorSharePermission = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        if (p.authorHandle !== currentHandle) {
          setAuthorLockNotice(`Access Restricted: Only the original author (@${p.authorHandle}) has the right to enable or disable sharing.`);
          setTimeout(() => setAuthorLockNotice(null), 3500);
          return p;
        }
        const nextState = p.allowSharing === false ? true : false;
        onLogEvent('AuthorOPSEC', `Author @${currentHandle} ${nextState ? 'ENABLED' : 'DISABLED'} sharing permissions on post ${postId}.`, nextState ? 'success' : 'warn');
        return { ...p, allowSharing: nextState };
      })
    );
  };

  // Create Post with Islamic Law Auto-Filter
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // ISLAMIC LAW AUTOMATED FILTER CHECK
    const combinedContent = `${newPostText} ${uploadedFileName || ''}`;
    const filter = filterContentUnderIslamicLaw(combinedContent);
    if (!filter.allowed) {
      setModerationNotice(ISLAMIC_LAW_BLOCK_MESSAGE);
      setNewPostText('');
      setPostAttachmentType('NONE');
      setShowCreateModal(false);
      onLogEvent(
        'IslamicLawFilter',
        'PROHIBITED CONTENT AUTO-DELETED: Blocked under Islamic Law standards.',
        'error'
      );
      return;
    }

    let mediaTitle = undefined;
    let mediaType: 'VIDEO' | 'IMAGE' | undefined = undefined;
    let size = 0;

    if (postAttachmentType === 'VIDEO') {
      mediaType = 'VIDEO';
      mediaTitle = uploadedFileName || 'Field_Video_Clip.mp4';
      size = 8.5 * 1024 * 1024;
    } else if (postAttachmentType === 'IMAGE') {
      mediaType = 'IMAGE';
      mediaTitle = uploadedFileName || 'Field_Photo.jpg';
      size = 1.2 * 1024 * 1024;
    }

    const badge = postAttachmentType !== 'NONE' ? {
      platform: 'Qaidi Share Verified',
      timestamp: getRegionalTimeString(new Date(), 'Pakistan'),
      hash: Math.random().toString(16).slice(2, 10).toUpperCase()
    } : undefined;

    // Notice: Super Admin uses a neutral authorDisplayName without crowns or badges so it appears free!
    const authorDisplayName = `Qaidi Node ${currentHandle.replace('qaidi', '')}`;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorHandle: currentHandle,
      authorDisplayName,
      createdAtText: 'Just now',
      content: newPostText,
      mediaType,
      mediaTitle,
      mediaSizeBytes: size,
      likesCount: 0,
      commentsCount: 0,
      allowSharing: allowSharingOnNewPost,
      sharedFromGroup: shareFromGroupSelected || undefined,
      watermarkBadge: badge
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setPostAttachmentType('NONE');
    setUploadedFileName('');
    setShareFromGroupSelected('');
    setAllowSharingOnNewPost(true);
    setShowCreateModal(false);
    onLogEvent('SocialWall', `New post published by ${currentHandle} to mesh social feed.`, 'success');
  };

  // Swipe Next Reel
  const handleNextReel = () => {
    const nextCount = reelsViewedCount + 1;
    setReelsViewedCount(nextCount);

    if (shouldInsertReelAd(nextCount) && isOnline) {
      setShowReelAdModal(true);
      onLogEvent('AdMob', `Reel ad triggered: 30 reels viewed milestone reached (${nextCount}).`, 'info');
    }

    setActiveReelIdx((prev) => (prev + 1) % 4);
    setIsReelPlaying(true);
  };

  const handlePrevReel = () => {
    setActiveReelIdx((prev) => (prev > 0 ? prev - 1 : 3));
    setIsReelPlaying(true);
  };

  // Interactive Post Likes Toggle
  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      })
    );
    const post = posts.find(p => p.id === postId);
    onLogEvent('SocialInteraction', `${!post?.isLiked ? 'Liked' : 'Unliked'} post ${postId}`, 'info');
  };

  // Interactive Comments
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentInput, setNewCommentInput] = useState('');

  const handleAddComment = (postId: string) => {
    if (!newCommentInput.trim()) return;
    const filter = filterContentUnderIslamicLaw(newCommentInput);
    if (!filter.allowed) {
      setModerationNotice(ISLAMIC_LAW_BLOCK_MESSAGE);
      onLogEvent('IslamicLawModeration', `Blocked comment containing prohibited content.`, 'error');
      return;
    }
    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      authorHandle: currentHandle,
      createdAtText: 'Just now',
      text: newCommentInput.trim()
    };
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const updated = [...(p.comments || []), newComment];
        return {
          ...p,
          comments: updated,
          commentsCount: updated.length
        };
      })
    );
    setNewCommentInput('');
    onLogEvent('SocialComment', `New comment posted on ${postId} by ${currentHandle}.`, 'success');
  };

  // Interactive Reels Likes
  const [reelsLikes, setReelsLikes] = useState<Record<number, { isLiked: boolean; count: number }>>({
    0: { isLiked: false, count: 324 },
    1: { isLiked: false, count: 580 },
    2: { isLiked: false, count: 198 },
    3: { isLiked: false, count: 412 }
  });

  const handleToggleReelLike = (idx: number) => {
    setReelsLikes(prev => {
      const cur = prev[idx] || { isLiked: false, count: 100 };
      const nextLiked = !cur.isLiked;
      return {
        ...prev,
        [idx]: {
          isLiked: nextLiked,
          count: nextLiked ? cur.count + 1 : Math.max(0, cur.count - 1)
        }
      };
    });
    onLogEvent('Reels', `Toggled like on Reel #${idx + 1}`, 'info');
  };

  return (
    <div className="flex flex-col h-full bg-[#021812] text-emerald-100 font-sans">
      {/* Sub Tab Navigation - Eye Strain Free Dark Green Theme */}
      <div className="flex border-b border-emerald-800/60 bg-[#032219] px-2 py-1.5 gap-1 shrink-0">
        <button
          onClick={() => setSubTab('wall')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            subTab === 'wall'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-emerald-400 hover:text-white'
          }`}
        >
          <span>Social Feed</span>
        </button>
        <button
          onClick={() => setSubTab('reels')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            subTab === 'reels'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-emerald-400 hover:text-white'
          }`}
        >
          <Film className="h-3.5 w-3.5" />
          <span>Reels ({reelsViewedCount}/30)</span>
        </button>
        <button
          onClick={() => setSubTab('youtube')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            subTab === 'youtube'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-emerald-400 hover:text-white'
          }`}
        >
          <Youtube className="h-3.5 w-3.5" />
          <span>YouTube Feed</span>
        </button>
      </div>

      {/* Moderation Block Notice Banner */}
      {moderationNotice && (
        <div className="p-3 bg-rose-950/80 border-b border-rose-500/60 text-xs text-rose-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{moderationNotice}</span>
          </div>
          <button onClick={() => setModerationNotice(null)} className="text-rose-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Author Sharing Security Notice Banner */}
      {authorLockNotice && (
        <div className="p-3 bg-amber-950/90 border-b border-amber-500/70 text-xs text-amber-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{authorLockNotice}</span>
          </div>
          <button onClick={() => setAuthorLockNotice(null)} className="text-amber-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: SOCIAL FEED */}
      {subTab === 'wall' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Compact Space-Saving Composer Bar: Write Post + My Posts Filter */}
          <div className="p-2 rounded-lg bg-[#032219] border border-emerald-800/60 flex items-center justify-between gap-2 text-xs shadow-sm">
            {/* Write a Post Button */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="h-6 w-6 rounded-full bg-emerald-700/40 border border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0 font-mono">
                {currentHandle.slice(0, 2).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#04281e] hover:bg-[#063f2f] text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">Write a Post...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(true);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="py-1.5 px-2 rounded-lg bg-[#04281e] hover:bg-[#063f2f] text-emerald-300 border border-emerald-500/40 text-[10.5px] font-semibold flex items-center gap-1 transition-all shadow-sm shrink-0"
                title="Pick and share media file directly from phone storage"
              >
                <Folder className="h-3 w-3 text-emerald-400" />
                <span>Pick File</span>
              </button>
            </div>

            {/* My Posts & All Feed Toggle: Space-Saving Zero-Waste Navigation */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setPostFilter('ALL')}
                className={`px-2 py-1 rounded text-[10.5px] font-semibold transition-all ${
                  postFilter === 'ALL'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#042d21] text-emerald-300 hover:text-white border border-emerald-800/80'
                }`}
              >
                All Feed
              </button>
              <button
                type="button"
                onClick={() => setPostFilter('MY_POSTS')}
                className={`px-2 py-1 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all ${
                  postFilter === 'MY_POSTS'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#042d21] text-emerald-300 hover:text-white border border-emerald-800/80'
                }`}
                title="View only posts created by you"
              >
                <UserCheck className="h-3 w-3" />
                <span>My Posts</span>
                {posts.filter(p => p.authorHandle === currentHandle).length > 0 && (
                  <span className="ml-0.5 px-1 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[8.5px] font-mono">
                    {posts.filter(p => p.authorHandle === currentHandle).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Empty My Posts Notice */}
          {postFilter === 'MY_POSTS' && posts.filter(p => p.authorHandle === currentHandle).length === 0 && (
            <div className="p-6 rounded-lg bg-[#032219] border border-emerald-800/40 text-center space-y-2">
              <p className="text-xs text-emerald-300">You haven't published any posts yet.</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow"
              >
                Write Your First Post
              </button>
            </div>
          )}

          {/* Posts List */}
          {posts
            .filter(p => postFilter === 'ALL' || p.authorHandle === currentHandle)
            .map((post) => (
            <div
              key={post.id}
              className={`p-3 rounded-lg border transition-all ${
                post.isSponsoredAd
                  ? 'bg-[#031d16] border-amber-500/30'
                  : 'bg-[#032219] border-emerald-800/60 hover:border-emerald-700'
              }`}
            >
              {/* Post Header: ZERO special badges/crowns; displays group tag & author share permission */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    post.isSponsoredAd
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-700/30 text-emerald-300 border border-emerald-600/40'
                  }`}>
                    {post.isSponsoredAd ? 'AD' : post.authorHandle.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{post.authorDisplayName}</span>
                    <span className="text-[10px] text-emerald-400/80">{post.createdAtText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* Origin Group Badge */}
                  {post.sharedFromGroup && (
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-400" />
                      <span>#{post.sharedFromGroup}</span>
                    </span>
                  )}

                  {/* Author-only Share Permission Controls */}
                  {post.authorHandle === currentHandle ? (
                    <button
                      type="button"
                      onClick={() => handleToggleAuthorSharePermission(post.id)}
                      className={`text-[9.5px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                        post.allowSharing !== false
                          ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-800/80'
                          : 'bg-rose-950/70 border-rose-500/60 text-rose-300 hover:bg-rose-900/80'
                      }`}
                      title="Only the author has the right to toggle sharing for this post"
                    >
                      {post.allowSharing !== false ? (
                        <>
                          <Unlock className="h-2.5 w-2.5" />
                          <span>Author: Sharing ON</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-2.5 w-2.5" />
                          <span>Author: Sharing OFF</span>
                        </>
                      )}
                    </button>
                  ) : post.allowSharing === false ? (
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/80 text-slate-400 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5 text-rose-400/80" />
                      <span>Author Locked</span>
                    </span>
                  ) : null}

                  {post.isSponsoredAd && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Sponsored Ad
                    </span>
                  )}

                  {isSuperAdmin && !post.isSponsoredAd && (
                    <button
                      type="button"
                      onClick={() => {
                        setPosts(prev => prev.filter(p => p.id !== post.id));
                        onLogEvent('SuperAdmin', `Super Admin (@qaidi156156) purged post "${post.id}" network-wide.`, 'warn');
                      }}
                      className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold text-[9px] flex items-center gap-1 shadow-sm transition-all"
                      title="Super Admin Force Delete Everywhere"
                    >
                      <Trash2 className="h-2.5 w-2.5 text-rose-400" />
                      <span>Delete (Admin)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Post Body Content */}
              <p className="text-xs text-emerald-100 leading-relaxed mb-2.5">{post.content}</p>

              {/* Attached Media with Download Button */}
              {post.mediaType && (
                <div className="relative rounded-lg overflow-hidden border border-emerald-800/60 bg-[#021812] mb-2.5">
                  <div className="h-36 bg-gradient-to-tr from-[#021812] via-[#04281e] to-[#021812] flex flex-col items-center justify-center p-3 text-center">
                    {post.mediaType === 'VIDEO' ? (
                      <div className="h-10 w-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-2">
                        <Play className="h-5 w-5 fill-emerald-300/30" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 mb-2">
                        <Film className="h-5 w-5" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-emerald-100">{post.mediaTitle}</span>
                    <span className="text-[10px] text-emerald-400 mt-0.5">
                      {Math.round((post.mediaSizeBytes || 0) / (1024 * 1024))} MB • Single-Instance Content Addressed
                    </span>
                  </div>

                  {/* Watermark Overlay */}
                  {post.watermarkBadge && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>{post.watermarkBadge.platform} • {post.watermarkBadge.timestamp}</span>
                    </div>
                  )}

                  {/* Accessible Download Button to Save Media Locally */}
                  <div className="p-2 bg-[#031d16] border-t border-emerald-900/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400/80">P2P Hash: {post.watermarkBadge?.hash || 'A9C1'}</span>
                    <button
                      onClick={() => onDownloadFile(post.mediaTitle || 'file.mp4', post.mediaSizeBytes || 1024 * 1024)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download File Locally</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Engagement Bar with Interactive Like & Comment Drawer */}
              <div className="flex items-center justify-between text-emerald-400/80 text-xs pt-1.5 border-t border-emerald-900/60">
                {/* Like Button with Active Color & Count */}
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1.5 transition-all active:scale-110 ${
                    post.isLiked ? 'text-rose-400 font-bold' : 'hover:text-emerald-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 transition-colors ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setActiveCommentPostId(post.id)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>{post.commentsCount} comments</span>
                </button>

                {/* Author Share Permission Aware Button */}
                {post.allowSharing === false && post.authorHandle !== currentHandle ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorLockNotice(`Sharing Disabled: Original author @${post.authorHandle} has locked sharing permissions for this post.`);
                      setTimeout(() => setAuthorLockNotice(null), 3500);
                    }}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-400 transition-colors"
                    title="Original author has disabled sharing"
                  >
                    <Lock className="h-3.5 w-3.5 text-rose-400/80" />
                    <span className="text-[11px]">Share Locked</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveShareModalPost(post);
                      setSelectedTargetGroupId(groups[0]?.id || '');
                    }}
                    className="flex items-center gap-1.5 hover:text-emerald-200 text-emerald-400 transition-colors"
                    title="Share post to a mesh group or chat"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share / Group</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: REELS FEED (WITH INLINE & TRUE FULL SCREEN IMMERSIVE MODES) */}
      {subTab === 'reels' && (
        <div className={`relative flex flex-col bg-black overflow-hidden select-none ${
          isFullScreenReel ? 'fixed inset-0 z-50 w-screen h-screen' : 'flex-1 w-full h-full'
        }`}>
          {/* Simulated Video Canvas Background */}
          <div
            onDoubleClick={handleDoubleTapReel}
            className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {/* Background Gradient & Animated Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${
              activeReelIdx === 0 ? 'from-[#021f17] via-[#01140e] to-black' :
              activeReelIdx === 1 ? 'from-[#1f1704] via-[#140e02] to-black' :
              activeReelIdx === 2 ? 'from-[#041926] via-[#020e17] to-black' :
              'from-[#032219] via-[#01140e] to-black'
            }`} />

            {/* Simulated Animated Video Graphics */}
            <div className="relative w-full h-full flex flex-col items-center justify-center opacity-85">
              {activeReelIdx === 0 && (
                /* Cantenna Wi-Fi Booster Graphic Simulation */
                <div className="relative flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="h-28 w-28 rounded-full border border-emerald-500/30 animate-ping absolute" />
                    <div className="h-20 w-20 rounded-full border border-emerald-400/50 animate-pulse absolute" />
                    <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                      <Radio className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="text-center font-mono text-emerald-400/80 text-[11px] space-y-0.5">
                    <span className="block font-bold">2.44GHz Cantenna Probe</span>
                    <span className="text-[9px] text-emerald-300/60">+14.2 dBi Gain • 1.8km Mesh Line-of-Sight</span>
                  </div>
                </div>
              )}

              {activeReelIdx === 1 && (
                /* Emergency Eye Wash Graphic Simulation */
                <div className="relative flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-300 animate-pulse">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="text-center font-mono text-amber-400/90 text-[11px] space-y-0.5">
                    <span className="block font-bold">Saline Eyewash Protocol</span>
                    <span className="text-[9px] text-amber-300/70">9g NaCl / 1000ml Pure Boiled Water</span>
                  </div>
                </div>
              )}

              {activeReelIdx === 2 && (
                /* SDR Radio Spectrum Waterfall Simulation */
                <div className="w-4/5 max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                    <span>144.390 MHz</span>
                    <span className="animate-pulse">APRS VOICE LIVE</span>
                  </div>
                  <div className="h-24 rounded-lg bg-slate-950/80 border border-cyan-500/40 p-2 flex items-end gap-1.5 overflow-hidden">
                    {[40, 65, 85, 30, 95, 70, 50, 90, 60, 45, 80, 55, 35, 75, 90, 65, 40].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t transition-all duration-300"
                        style={{ height: isReelPlaying ? `${Math.min(100, h + (i % 3) * 8)}%` : `${h * 0.4}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeReelIdx === 3 && (
                /* Qibla & Orientation Compass Simulation */
                <div className="relative flex flex-col items-center gap-3">
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center animate-spin" style={{ animationDuration: '24s' }}>
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-center font-mono text-emerald-300 text-[11px]">
                    <span className="block font-bold">Kaaba Azimuth: 262° WSW</span>
                    <span className="text-[9px] text-emerald-400/70">Magnetic Sensor Fusion Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Double Tap Heart Burst Animation */}
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
                <Heart className="h-24 w-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
              </div>
            )}
          </div>

          {/* Top Floating Header: Progress, Ad Counter & Controls */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-30">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
                Reel #{activeReelIdx + 1} of 4 • Viewed {reelsViewedCount}
              </span>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md hidden sm:inline">
                Ad in {30 - (reelsViewedCount % 30)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Mute/Unmute */}
              <button
                onClick={() => setIsReelMuted(!isReelMuted)}
                className="p-1.5 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-300 hover:text-white backdrop-blur-md"
                title={isReelMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isReelMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              {/* Toggle True Full Screen Reel Mode */}
              <button
                onClick={() => setIsFullScreenReel(!isFullScreenReel)}
                className={`p-1.5 rounded-full border backdrop-blur-md transition-colors flex items-center gap-1 text-[10px] font-bold ${
                  isFullScreenReel
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                    : 'bg-black/60 border-emerald-500/40 text-emerald-300 hover:text-white'
                }`}
                title={isFullScreenReel ? 'Exit Full Screen Reel' : 'Enter Full Screen Reel'}
              >
                {isFullScreenReel ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span className="text-[9px]">Exit</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="text-[9px] hidden sm:inline">Full Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Center Play/Pause Touch Indicator */}
          <button
            onClick={() => setIsReelPlaying(!isReelPlaying)}
            className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm hover:scale-110 transition-all z-20 opacity-80 hover:opacity-100"
          >
            {isReelPlaying ? (
              <Pause className="h-6 w-6 text-white/80" />
            ) : (
              <Play className="h-6 w-6 fill-white text-white translate-x-0.5" />
            )}
          </button>

          {/* Right Floating Actions: Like, Comment, Share, Download, Up/Down */}
          <div className="absolute right-2.5 bottom-14 flex flex-col items-center gap-3 z-30">
            {/* Heart Like */}
            <button
              onClick={() => handleToggleReelLike(activeReelIdx)}
              className="flex flex-col items-center gap-0.5 active:scale-125 transition-transform"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-md border ${
                reelsLikes[activeReelIdx]?.isLiked
                  ? 'border-rose-500 text-rose-500 bg-rose-950/70'
                  : 'border-white/20 text-white bg-black/60 hover:text-rose-400'
              }`}>
                <Heart className={`h-4 w-4 ${reelsLikes[activeReelIdx]?.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </div>
              <span className="text-[9px] font-bold font-mono text-white drop-shadow">
                {reelsLikes[activeReelIdx]?.count || 100}
              </span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setActiveCommentPostId('post-1')}
              className="flex flex-col items-center gap-0.5 active:scale-125 transition-transform"
            >
              <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-emerald-400">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-bold font-mono text-white drop-shadow">18</span>
            </button>

            {/* Share to Mesh */}
            <button
              onClick={() => {
                onShareToChat?.(
                  `🎥 Reel #${activeReelIdx + 1}: ${
                    activeReelIdx === 0 ? 'Cantenna DIY Signal Extender' :
                    activeReelIdx === 1 ? 'Emergency Eye Wash Routine' :
                    activeReelIdx === 2 ? 'SDR Speaker Radio Tuning' : 'Qibla Sensor Orientation'
                  }`,
                  'VIDEO',
                  `reel_${activeReelIdx + 1}.mp4`
                );
                onLogEvent('Reels', `Shared Reel #${activeReelIdx + 1} to Mesh Chat`, 'success');
              }}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-emerald-300"
              title="Share Reel to Mesh Chat"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Download MP4 */}
            <button
              onClick={() => onDownloadFile(`reel_${activeReelIdx + 1}.mp4`, 15 * 1024 * 1024)}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-emerald-300"
              title="Save Reel Locally"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Up/Down Reel Navigation */}
            <div className="flex flex-col gap-1 pt-1 border-t border-white/20">
              <button
                onClick={handlePrevReel}
                className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/90 transition-colors"
                title="Previous Reel"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextReel}
                className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/90 transition-colors"
                title="Next Reel"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Details: Creator, Title, Hashtags & Music */}
          <div className="absolute left-3 right-16 bottom-3 z-30 space-y-1.5 text-left pointer-events-auto">
            {/* Creator Row */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center font-bold text-[9px] text-emerald-300 font-mono">
                Q{activeReelIdx + 1}
              </div>
              <span className="font-bold text-xs text-white font-mono drop-shadow">
                @qaidi{1000 + activeReelIdx * 821}
              </span>
              <button className="px-1.5 py-0.2 rounded bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 font-bold text-[9px]">
                Follow
              </button>
            </div>

            {/* Title & Description */}
            <p className="text-xs font-semibold text-white leading-tight drop-shadow">
              {activeReelIdx === 0 && '⚡ Cantenna DIY Signal Extender in Action'}
              {activeReelIdx === 1 && '🛡️ Emergency Eye Wash: Saline & Particulate Routine'}
              {activeReelIdx === 2 && '📻 SDR Speaker Radio Tuning: 144.390 APRS Voice'}
              {activeReelIdx === 3 && '🧭 Qibla Sensor Orientation During Gathering'}
            </p>

            {/* Hashtags */}
            <p className="text-[10px] text-emerald-300/90 font-mono">
              {activeReelIdx === 0 && '#LoRa #OffGrid #Cantenna #WifiBooster'}
              {activeReelIdx === 1 && '#FirstAid #FieldSafety #EyeWash #HealthGuide'}
              {activeReelIdx === 2 && '#SDR #HamRadio #APRS #AcousticMesh'}
              {activeReelIdx === 3 && '#Qibla #Compass #SensorFusion #Offline'}
            </p>

            {/* Audio Track with Rotating Disc */}
            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
              <Music className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">
                {activeReelIdx === 0 ? 'Cantenna Lab Beats • 16kbps Mesh Audio' :
                 activeReelIdx === 1 ? 'Field Medic Voice Note • Saline Guide' :
                 activeReelIdx === 2 ? 'APRS 144.390 Frequency Stream' :
                 'Harmonic Field Acoustic Drone'}
              </span>
              <Disc3 className={`h-4 w-4 text-emerald-400 shrink-0 ${isReelPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>

            {/* Timeline Scrubber Bar */}
            <div className="w-full flex items-center gap-2 pt-0.5">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${(reelProgressSec / 45) * 100}%` }}
                />
              </div>
              <span className="text-[8.5px] font-mono text-slate-400">
                0:{reelProgressSec < 10 ? `0${reelProgressSec}` : reelProgressSec} / 0:45
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: IN-APP YOUTUBE SEARCH, WATCH, & MESH SHARING */}
      {subTab === 'youtube' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* Zero API Key Clarification Banner */}
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2 text-xs">
            <Globe className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-emerald-200 block text-[11px]">
                Zero YouTube API Key Required
              </span>
              <p className="text-[10px] text-emerald-300/80 leading-snug">
                Search, paste any YouTube URL, watch inside the app, and share to mesh peers for offline swarming without any Google Cloud account or API quota.
              </p>
            </div>
          </div>

          {/* YouTube Search & Direct Link Paste Bar */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={ytSearchQuery}
                onChange={(e) => setYtSearchQuery(e.target.value)}
                placeholder="Search tutorials or paste YouTube URL (e.g. youtu.be/...)..."
                className="w-full rounded-lg bg-[#021812] border border-emerald-900/80 pl-8 pr-3 py-2 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
              />
              <Search className="h-3.5 w-3.5 text-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {ytSearchQuery && (
                <button
                  onClick={() => setYtSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Categories */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {['ALL', 'DIY_RADIO', 'FIRST_AID', 'HYGIENE', 'SURVIVAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setYtCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-all ${
                    ytCategoryFilter === cat
                      ? 'bg-emerald-600 text-slate-950 font-bold'
                      : 'bg-[#032219] text-emerald-300 hover:text-white border border-emerald-900/80'
                  }`}
                >
                  {cat === 'ALL' ? '🌟 All Videos' : cat === 'DIY_RADIO' ? '📻 DIY Radio' : cat === 'FIRST_AID' ? '🩹 First Aid' : cat === 'HYGIENE' ? '💧 Water' : '⚡ Survival'}
                </button>
              ))}
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-3">
            {ytVideos
              .filter((v) => {
                if (ytCategoryFilter !== 'ALL' && v.category !== ytCategoryFilter) return false;
                if (!ytSearchQuery.trim()) return true;
                const query = ytSearchQuery.toLowerCase();
                return (
                  v.title.toLowerCase().includes(query) ||
                  v.channelName.toLowerCase().includes(query) ||
                  v.category.toLowerCase().includes(query) ||
                  v.videoUrl.toLowerCase().includes(query)
                );
              })
              .map((vid) => {
                const videoIdMatch = vid.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
                const embedId = videoIdMatch ? videoIdMatch[1] : vid.id;

                return (
                  <div
                    key={vid.id}
                    className="rounded-lg border border-emerald-800/60 bg-[#032219] overflow-hidden shadow-lg transition-all hover:border-emerald-500/50"
                  >
                    {/* Video Card Header / Thumbnail */}
                    <div
                      onClick={() => setActiveWatchingVideo(vid)}
                      className={`h-36 bg-gradient-to-br ${vid.thumbnailColor} relative p-3 flex flex-col justify-between cursor-pointer group`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/75 text-emerald-300 border border-emerald-500/40">
                          {vid.category}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/75 text-white font-bold">
                          {vid.durationText}
                        </span>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 fill-slate-950 translate-x-0.5" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-emerald-200">
                        <span className="font-bold flex items-center gap-1">
                          <Youtube className="h-3.5 w-3.5 text-red-400" />
                          <span>Tap to Watch In-App</span>
                        </span>
                        <span className="font-mono">{vid.sizeMb} MB</span>
                      </div>
                    </div>

                    {/* Video Card Details */}
                    <div className="p-3 space-y-2">
                      <div>
                        <h4
                          onClick={() => setActiveWatchingVideo(vid)}
                          className="text-xs font-bold text-white mb-1 line-clamp-2 cursor-pointer hover:text-emerald-300 transition-colors"
                        >
                          {vid.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-emerald-400">
                          <span>{vid.channelName}</span>
                          <span>{vid.viewsText}</span>
                        </div>
                      </div>

                      {/* Action Buttons: Watch, Share to Chat, Share to Notice, Copy */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-emerald-900/60 text-[10px]">
                        <button
                          onClick={() => setActiveWatchingVideo(vid)}
                          className="py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-slate-950" />
                          <span>Watch</span>
                        </button>

                        <button
                          onClick={() => {
                            onShareToChat?.(`🎥 [YouTube Guide]: "${vid.title}" - Watch: ${vid.videoUrl}`, 'VIDEO', vid.title);
                            onLogEvent('YouTubeShare', `Shared video "${vid.title}" to Mesh Chat!`, 'success');
                          }}
                          className="py-1.5 px-1.5 rounded bg-[#042d21] hover:bg-[#063f2f] text-emerald-200 border border-emerald-700/60 font-semibold flex items-center justify-center gap-1"
                          title="Share to active Mesh Chat"
                        >
                          <MessageCircle className="h-3 w-3 text-emerald-400" />
                          <span>To Chat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareVideoToSocial(vid.title, vid.videoUrl, vid.channelName, vid.category, vid.sizeMb)}
                          className="py-1.5 px-1.5 rounded bg-[#042d21] hover:bg-[#063f2f] text-emerald-200 border border-emerald-700/60 font-semibold flex items-center justify-center gap-1 transition-colors"
                          title="Share video to Social Feed"
                        >
                          <Share2 className="h-3 w-3 text-emerald-400" />
                          <span>To Social</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[9px] text-emerald-400/80">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(vid.videoUrl);
                            setCopiedId(vid.id);
                            setTimeout(() => setCopiedId(null), 2000);
                            onLogEvent('Clipboard', `Copied link: ${vid.videoUrl}`, 'info');
                          }}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {copiedId === vid.id ? <Check className="h-2.5 w-2.5 text-emerald-300" /> : <Copy className="h-2.5 w-2.5" />}
                          <span>{copiedId === vid.id ? 'Copied Link!' : 'Copy Link'}</span>
                        </button>

                        <span>•</span>

                        <button
                          onClick={() => onDownloadFile(`${vid.id}.mp4`, vid.sizeMb * 1024 * 1024)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          <Download className="h-2.5 w-2.5" />
                          <span>Cache for Offline Swarm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* IN-APP YOUTUBE PLAYER MODAL (Zero API Key Needed!) */}
      {activeWatchingVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-emerald-500/50 p-4 shadow-2xl space-y-3 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {activeWatchingVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveWatchingVideo(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Embedded Responsive YouTube Player */}
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-emerald-500/40 bg-black shrink-0 relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeWatchingVideo.id.replace('yt-', '')}?autoplay=1&rel=0&modestbranding=1`}
                title={activeWatchingVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Details & Meta */}
            <div className="space-y-1.5 shrink-0 text-xs">
              <h4 className="font-bold text-white text-[12px]">{activeWatchingVideo.title}</h4>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                <span>{activeWatchingVideo.channelName}</span>
                <span>{activeWatchingVideo.durationText} • {activeWatchingVideo.viewsText}</span>
              </div>
            </div>

            {/* Direct In-App Share Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 shrink-0 text-xs">
              <button
                onClick={() => {
                  onShareToChat?.(`🎥 [YouTube Guide]: "${activeWatchingVideo.title}" - ${activeWatchingVideo.videoUrl}`, 'VIDEO', activeWatchingVideo.title);
                  setActiveWatchingVideo(null);
                  onLogEvent('YouTubeShare', `Shared "${activeWatchingVideo.title}" to Mesh Chat!`, 'success');
                }}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Share to Chat</span>
              </button>

              <button
                onClick={() => {
                  handleShareVideoToSocial(
                    activeWatchingVideo.title,
                    activeWatchingVideo.videoUrl,
                    activeWatchingVideo.channelName,
                    activeWatchingVideo.category,
                    activeWatchingVideo.sizeMb
                  );
                  setActiveWatchingVideo(null);
                  onLogEvent('SocialShare', `Shared "${activeWatchingVideo.title}" to Social Feed!`, 'success');
                }}
                className="py-2 px-3 rounded-lg bg-[#042d21] hover:bg-[#063f2f] text-emerald-200 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Share to Social</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL WITH VIDEO / PHOTO UPLOAD SELECTION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#032219] border border-emerald-800/80 p-4 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white">Create Network Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share advice, emergency updates, or local news..."
                rows={3}
                className="w-full rounded-lg bg-[#021812] border border-emerald-900/80 p-2.5 text-xs text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-500 resize-none"
              />

              {/* Uploaded File Indicator */}
              {postAttachmentType !== 'NONE' && (
                <div className="p-2.5 rounded bg-[#021812] border border-emerald-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">{uploadedFileName}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">
                        {isUploadingMedia ? `Encoding: ${uploadProgress}%` : 'Single-instance ready'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPostAttachmentType('NONE');
                      setUploadedFileName('');
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Hidden Native File Input for Real Device Storage Access */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileFromStorage}
                accept="video/*,image/*,audio/*"
                className="hidden"
              />

              {/* Real Device Storage File Picker Button */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-emerald-400 block font-semibold">Media Attachment:</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2.5 rounded-lg border border-emerald-500/60 bg-[#043324] hover:bg-emerald-800/50 text-xs font-semibold text-emerald-100 flex items-center justify-center gap-2 shadow-inner transition-colors"
                >
                  <Folder className="h-4 w-4 text-emerald-300" />
                  <span>Pick File from Phone Storage (Video / Photo)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleSelectUpload('VIDEO')}
                    className="p-1.5 rounded border border-emerald-800/80 bg-[#032219] hover:bg-[#042d21] text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Video className="h-3 w-3 text-emerald-400" />
                    <span>Quick Video Clip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectUpload('IMAGE')}
                    className="p-1.5 rounded border border-emerald-800/80 bg-[#032219] hover:bg-[#042d21] text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ImageIcon className="h-3 w-3 text-teal-400" />
                    <span>Quick Photo</span>
                  </button>
                </div>
              </div>

              {/* Group Origin Tag Selector (Share From Group) */}
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-400 block font-semibold flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Share From Group Origin (Optional Tag):</span>
                </label>
                <select
                  value={shareFromGroupSelected}
                  onChange={(e) => setShareFromGroupSelected(e.target.value)}
                  className="w-full rounded-lg bg-[#021812] border border-emerald-900/80 p-2 text-xs text-emerald-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">No Group Tag (Public Swarm Feed)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.members?.length || 0} peers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Share Permission Control (Only Author Has Right) */}
              <div className="p-2.5 rounded-lg bg-[#021812] border border-emerald-800/60 flex items-center justify-between">
                <div className="space-y-0.5 max-w-[210px]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {allowSharingOnNewPost ? (
                      <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-rose-400" />
                    )}
                    <span>Author Sharing Rights</span>
                  </span>
                  <p className="text-[9.5px] text-emerald-400/80 leading-tight">
                    {allowSharingOnNewPost
                      ? 'Peers can share this post to their groups & chats'
                      : 'Locked: Only you (the author) have the right to share or enable sharing'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowSharingOnNewPost(!allowSharingOnNewPost)}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-colors ${
                    allowSharingOnNewPost
                      ? 'bg-emerald-600 text-slate-950 border-emerald-400 shadow'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                  }`}
                >
                  {allowSharingOnNewPost ? 'ALLOWED' : 'LOCKED'}
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-1.5 rounded border border-emerald-900 text-xs text-emerald-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPostText.trim() || isUploadingMedia}
                  className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 text-xs font-bold transition-colors"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN REEL AD MODAL */}
      {showReelAdModal && (
        <div className="fixed inset-0 z-50 bg-[#01120d] flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400 border-b border-emerald-900 pb-2">
            <span className="font-mono text-amber-300 font-bold">Google AdMob Interstitial Ad (30-Reel Cadence)</span>
            <button
              onClick={() => setShowReelAdModal(false)}
              className="px-2 py-1 rounded bg-[#04281e] text-white font-mono text-[10px]"
            >
              Skip Ad ✕
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-base font-bold text-white mb-2">Off-Grid Solar Emergency Power Kits</h2>
            <p className="text-xs text-emerald-200/90 max-w-xs mb-4">
              High-efficiency monocrystalline solar panels with built-in USB power delivery. Keep your Android mesh nodes powered 24/7 without municipal electricity.
            </p>
            <span className="text-[10px] font-mono text-emerald-600">Unit ID: ca-app-pub-3283420350176268/4797966805</span>
          </div>

          <button
            onClick={() => setShowReelAdModal(false)}
            className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Continue Watching Reels
          </button>
        </div>
      )}

      {/* INTERACTIVE COMMENTS MODAL / DRAWER */}
      {activeCommentPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900 p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Mesh Comments ({posts.find(p => p.id === activeCommentPostId)?.commentsCount || 0})
                </h3>
              </div>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(posts.find(p => p.id === activeCommentPostId)?.comments || []).map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-emerald-400">{c.authorHandle}</span>
                    <span className="text-slate-500">{c.createdAtText}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">{c.text}</p>
                </div>
              ))}
              {(!posts.find(p => p.id === activeCommentPostId)?.comments?.length) && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No comments yet. Be the first to share intel!
                </div>
              )}
            </div>

            {/* Comment Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (activeCommentPostId) handleAddComment(activeCommentPostId);
              }}
              className="pt-2 border-t border-slate-800 flex gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newCommentInput.trim()}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED SHARE POST MODAL (Groups, Chat, Radio Relay) */}
      {activeShareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-[#032219] p-4 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-900/80 pb-2">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Share Post Across Mesh</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveShareModalPost(null)}
                className="text-emerald-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Post Snippet Preview */}
            <div className="p-2.5 rounded-lg bg-[#021812] border border-emerald-900/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                <span>Author: @{activeShareModalPost.authorHandle}</span>
                {activeShareModalPost.sharedFromGroup && <span>From: #{activeShareModalPost.sharedFromGroup}</span>}
              </div>
              <p className="text-emerald-100 line-clamp-2 italic">"{activeShareModalPost.content}"</p>
              {activeShareModalPost.mediaTitle && (
                <span className="text-[10px] text-teal-300 font-mono block">📎 {activeShareModalPost.mediaTitle}</span>
              )}
            </div>

            {/* Option A: Share to Mesh Group */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-[#021812] border border-emerald-800/60">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>Share into Group:</span>
              </label>
              {groups.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedTargetGroupId || groups[0]?.id || ''}
                    onChange={(e) => setSelectedTargetGroupId(e.target.value)}
                    className="w-full rounded-lg bg-[#032219] border border-emerald-700/60 p-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.members?.length || 0} members)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const targetId = selectedTargetGroupId || groups[0]?.id;
                      if (!targetId) return;
                      const targetName = groups.find(g => g.id === targetId)?.name || 'Group';
                      onShareToGroup?.(
                        targetId,
                        `📢 Shared post by @${activeShareModalPost.authorHandle}: "${activeShareModalPost.content}"`,
                        activeShareModalPost.mediaType,
                        activeShareModalPost.mediaTitle
                      );
                      onLogEvent('GroupShare', `Shared post ${activeShareModalPost.id} into group "${targetName}".`, 'success');
                      setActiveShareModalPost(null);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Send to Selected Group</span>
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 py-1">
                  No mesh groups joined yet. Create or join a group first!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
