import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  X,
  Repeat,
  Sparkles,
  Lock,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { PlaylistItem } from "../types";
import { playCuteChime } from "../utils/sound";

export const PLAYLIST_STORAGE_KEY = "siasiailuPlaylistV2";

export const DEFAULT_PLAYLIST: PlaylistItem[] = [
  {
    id: "default-1",
    title: "Siasiailu Lofi Dreams",
    url: "https://youtu.be/pC3Wmmh3N98?si=czthn2C-WjV47uCi",
    addedBy: "default",
  },
  {
    id: "default-2",
    title: "Cozy Bedroom Study Beats",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    addedBy: "default",
  },
  {
    id: "default-3",
    title: "Gentle Rain & Soft Piano",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    addedBy: "default",
  },
];

export function extractYouTubeId(input: string | undefined): string {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (
      [
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "youtube-nocookie.com",
      ].includes(host)
    ) {
      if (url.searchParams.get("v")) {
        return url.searchParams.get("v") || "";
      }
      const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/);
      if (match) return match[1];
    }
  } catch {}
  return "";
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface MusicPlayerProps {
  isAdmin: boolean;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showToast?: (message: string) => void;
  isDrawerOpen?: boolean;
  setIsDrawerOpen?: (open: boolean) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isAdmin,
  isPlaying,
  setIsPlaying,
  showToast,
  isDrawerOpen: externalDrawerOpen,
  setIsDrawerOpen: setExternalDrawerOpen,
}) => {
  // Playlist State loaded from LocalStorage
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load playlist:", e);
    }
    return DEFAULT_PLAYLIST;
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const isDrawerOpen =
    externalDrawerOpen !== undefined ? externalDrawerOpen : internalDrawerOpen;
  const setIsDrawerOpen =
    setExternalDrawerOpen !== undefined
      ? setExternalDrawerOpen
      : setInternalDrawerOpen;

  // Form states for Admin adding a song
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState("");

  // Audio / volume states
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<string>("Ready");

  // YouTube Player Ref
  const ytPlayerRef = useRef<any>(null);
  const playerContainerId = "siasiailu-yt-iframe";
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Persist playlist changes
  const savePlaylist = (updated: PlaylistItem[]) => {
    setPlaylist(updated);
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Storage error for playlist:", e);
    }
  };

  const activeTrack = playlist[currentTrackIndex] || playlist[0];
  const activeVideoId = extractYouTubeId(activeTrack?.url || "");

  // Play next track in sequence: 1 -> 2 -> ... -> N -> 1 (Continuous loop)
  const playNextTrack = useCallback(
    (autoPlay: boolean = true) => {
      const list = playlistRef.current;
      if (list.length === 0) return;
      const nextIdx = (currentTrackIndexRef.current + 1) % list.length;
      setCurrentTrackIndex(nextIdx);
      currentTrackIndexRef.current = nextIdx;

      const nextTrack = list[nextIdx];
      const vidId = extractYouTubeId(nextTrack?.url);

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
        if (vidId) {
          if (autoPlay) {
            ytPlayerRef.current.loadVideoById(vidId);
            setIsPlaying(true);
          } else {
            ytPlayerRef.current.cueVideoById(vidId);
          }
        }
      }
    },
    [setIsPlaying]
  );

  // Play previous track
  const playPrevTrack = useCallback(() => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    const prevIdx = (currentTrackIndexRef.current - 1 + list.length) % list.length;
    setCurrentTrackIndex(prevIdx);
    currentTrackIndexRef.current = prevIdx;

    const prevTrack = list[prevIdx];
    const vidId = extractYouTubeId(prevTrack?.url);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      if (vidId) {
        if (isPlayingRef.current) {
          ytPlayerRef.current.loadVideoById(vidId);
        } else {
          ytPlayerRef.current.cueVideoById(vidId);
        }
      }
    }
  }, []);

  // Jump to specific track
  const selectTrack = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
    currentTrackIndexRef.current = index;
    const track = playlist[index];
    const vidId = extractYouTubeId(track?.url);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      if (vidId) {
        ytPlayerRef.current.loadVideoById(vidId);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(true);
    }
    playCuteChime("pop");
  };

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Check if script tag exists
    let scriptTag = document.getElementById("youtube-iframe-api") as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "youtube-iframe-api";
      scriptTag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(scriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (ytPlayerRef.current) return;

      const targetDiv = document.getElementById(playerContainerId);
      if (!targetDiv) return;

      const currentVid = extractYouTubeId(playlistRef.current[currentTrackIndexRef.current]?.url);

      ytPlayerRef.current = new window.YT.Player(playerContainerId, {
        height: "200",
        width: "200",
        videoId: currentVid || "pC3Wmmh3N98",
        playerVars: {
          autoplay: isPlayingRef.current ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            if (isPlayingRef.current) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              setPlayerStatus("Advancing to next track...");
              // Alternate from first to last song, then return to first!
              playNextTrack(true);
            } else if (event.data === 1) {
              // PLAYING
              setIsPlaying(true);
              setPlayerStatus("Playing");
            } else if (event.data === 2) {
              // PAUSED
              setIsPlaying(false);
              setPlayerStatus("Paused");
            } else if (event.data === 3) {
              // BUFFERING
              setPlayerStatus("Buffering...");
            }
          },
          onError: (err: any) => {
            console.warn("YouTube player encountered error:", err);
            setPlayerStatus("Video unavailable, skipping...");
            if (showToast) {
              showToast("Song unavailable, advancing to next song ♡");
            }
            // If restricted or deleted, gracefully advance to next track in playlist
            setTimeout(() => {
              playNextTrack(true);
            }, 1200);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    // Secondary postMessage listener for YouTube state change redundancy
    const handleWindowMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && data.event === "onStateChange" && data.info === 0) {
          playNextTrack(true);
        }
      } catch {}
    };

    window.addEventListener("message", handleWindowMessage);

    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [playNextTrack, setIsPlaying, showToast, volume]);

  // Sync isPlaying state with YouTube Player
  useEffect(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        if (typeof ytPlayerRef.current.playVideo === "function") {
          ytPlayerRef.current.playVideo();
        }
      } else {
        if (typeof ytPlayerRef.current.pauseVideo === "function") {
          ytPlayerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.warn("Playback toggle error:", e);
    }
  }, [isPlaying]);

  // Handle Play/Pause button
  const togglePlay = () => {
    playCuteChime("pop");
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (!ytPlayerRef.current) return;
    try {
      if (nextState) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn("Toggle play error:", e);
    }
  };

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
      ytPlayerRef.current.setVolume(newVol);
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      ytPlayerRef.current?.unMute();
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      ytPlayerRef.current.unMute();
    } else {
      setIsMuted(true);
      ytPlayerRef.current.mute();
    }
  };

  // ADMIN: Add YouTube music link
  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setAddError("Only admin can add songs to the playlist.");
      return;
    }

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setAddError("Please paste a YouTube URL.");
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    if (!videoId) {
      setAddError("Invalid YouTube URL. Please provide a valid watch, share, or short link.");
      return;
    }

    // Format cute title
    const finalTitle =
      newTitle.trim() || `YouTube Song ${playlist.length + 1} (${videoId.slice(0, 6)})`;

    const newTrack: PlaylistItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: finalTitle,
      url: trimmedUrl,
      addedBy: "admin",
    };

    const updated = [...playlist, newTrack];
    savePlaylist(updated);
    setNewUrl("");
    setNewTitle("");
    setAddError("");
    playCuteChime("sparkle");

    if (showToast) {
      showToast(`Added "${finalTitle}" to playlist ♡`);
    }
  };

  // ADMIN: Delete a track
  const handleDeleteTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    if (playlist.length <= 1) {
      if (showToast) {
        showToast("Playlist must keep at least 1 track ♡");
      }
      return;
    }

    const trackName = playlist[index].title;
    const updated = playlist.filter((_, i) => i !== index);
    savePlaylist(updated);

    // If deleting current track, adjust index
    if (index === currentTrackIndex) {
      const newIndex = index >= updated.length ? 0 : index;
      setCurrentTrackIndex(newIndex);
      currentTrackIndexRef.current = newIndex;
      const nextVid = extractYouTubeId(updated[newIndex]?.url);
      if (ytPlayerRef.current && nextVid) {
        ytPlayerRef.current.loadVideoById(nextVid);
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex((prev) => prev - 1);
      currentTrackIndexRef.current -= 1;
    }

    playCuteChime("pop");
    if (showToast) {
      showToast(`Removed "${trackName}"`);
    }
  };

  // ADMIN: Reorder tracks (Move Up)
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || index <= 0) return;
    const updated = [...playlist];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    savePlaylist(updated);

    if (currentTrackIndex === index) {
      setCurrentTrackIndex(index - 1);
    } else if (currentTrackIndex === index - 1) {
      setCurrentTrackIndex(index);
    }
  };

  // ADMIN: Reorder tracks (Move Down)
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || index >= playlist.length - 1) return;
    const updated = [...playlist];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    savePlaylist(updated);

    if (currentTrackIndex === index) {
      setCurrentTrackIndex(index + 1);
    } else if (currentTrackIndex === index + 1) {
      setCurrentTrackIndex(index);
    }
  };

  // ADMIN: Reset to default playlist
  const handleResetDefaults = () => {
    if (!isAdmin) return;
    savePlaylist(DEFAULT_PLAYLIST);
    setCurrentTrackIndex(0);
    currentTrackIndexRef.current = 0;
    const vid = extractYouTubeId(DEFAULT_PLAYLIST[0].url);
    if (ytPlayerRef.current && vid) {
      ytPlayerRef.current.loadVideoById(vid);
    }
    playCuteChime("sparkle");
    if (showToast) {
      showToast("Reset playlist to defaults ♡");
    }
  };

  return (
    <>
      {/* Hidden YouTube IFrame Container */}
      <div
        className="fixed bottom-0 left-0 w-[200px] h-[200px] opacity-[0.001] pointer-events-none -z-50 overflow-hidden"
        aria-hidden="true"
      >
        <div id={playerContainerId} />
      </div>

      {/* Floating Mini Music Bar (bottom-right) */}
      <div className="fixed right-3.5 bottom-3.5 z-40 flex items-center gap-1.5 sm:gap-2">
        {/* Main Play / Info Pill */}
        <div className="flex items-center bg-[#fff8f0f0] border border-[#f0c4cf] rounded-full shadow-[0_6px_22px_rgba(189,135,144,0.22)] backdrop-blur-md px-1.5 py-1 text-[#b66d85] text-xs transition-all hover:border-[#e49cae]">
          {/* Animated Music Indicator / Disc */}
          <button
            type="button"
            onClick={togglePlay}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
              isPlaying
                ? "bg-gradient-to-tr from-[#d48d95] to-[#f4b6c3] text-white animate-[spin_8s_linear_infinite]"
                : "bg-[#fce5eb] text-[#c97894] hover:bg-[#fad4df]"
            } cursor-pointer`}
            title={isPlaying ? "Pause music" : "Play music"}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Song info & quick skip */}
          <div
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="px-2.5 py-1 cursor-pointer flex flex-col justify-center max-w-[130px] sm:max-w-[200px] text-left select-none"
            title="Click to view playlist & controls"
          >
            <div className="text-[10px] sm:text-[11px] font-bold text-[#97586a] truncate leading-tight">
              {activeTrack?.title || "Siasiailu Music"}
            </div>
            <div className="text-[9px] text-[#b78794] flex items-center gap-1">
              <span>
                Track {currentTrackIndex + 1}/{playlist.length}
              </span>
              <span className="opacity-60">•</span>
              <span className="text-[#829d8b] font-medium flex items-center gap-0.5">
                <Repeat className="w-2.5 h-2.5 inline" />
                <span>Loop 1→{playlist.length}</span>
              </span>
            </div>
          </div>

          {/* Quick Next Track (Test Alternating) */}
          <button
            type="button"
            onClick={() => {
              playNextTrack(true);
              playCuteChime("pop");
            }}
            className="p-1.5 hover:bg-[#fcedf2] rounded-full text-[#b66d85] transition-colors cursor-pointer"
            title="Next song in rotation (1 → N → 1)"
            aria-label="Next song"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Playlist Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setIsDrawerOpen(!isDrawerOpen);
            playCuteChime("pop");
          }}
          className={`p-2.5 sm:p-3 border rounded-full shadow-[0_6px_22px_rgba(189,135,144,0.22)] backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-center relative ${
            isDrawerOpen
              ? "bg-[#e8a3b5] border-[#d48d95] text-white"
              : "bg-[#fff8f0f0] border-[#f0c4cf] text-[#b66d85] hover:bg-[#fce5eb]"
          }`}
          title="Music Player & Playlist Settings"
          aria-label="Open playlist manager"
        >
          <Music className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#829d8b] text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {playlist.length}
          </span>
        </button>
      </div>

      {/* Expanded Playlist & Music Studio Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/25 backdrop-blur-[2px] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDrawerOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full sm:w-[410px] max-h-[88vh] bg-[#fffaf5] border border-[#ecc1cb] rounded-t-3xl sm:rounded-3xl shadow-[0_16px_45px_rgba(164,111,123,0.3)] overflow-hidden flex flex-col text-[#715b5c]">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#ffeef2] via-[#fff5eb] to-[#f4f7ee] border-b border-[#f0cacf] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#fce5eb] border border-[#f0c4cf] flex items-center justify-center text-[#c97894]">
                  ♫
                </span>
                <div>
                  <h3 className="font-serif italic font-bold text-base text-[#9f576e] m-0 flex items-center gap-1.5">
                    <span>Music Player</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#c97894]" />
                  </h3>
                  <p className="text-[10px] text-[#a48a88] m-0 flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-[#829d8b]" />
                    <span>Alternates 1 to {playlist.length}, loops back to 1</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/80 border border-[#f0c4cf] text-[#a48a88] hover:text-[#c97894] hover:bg-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Now Playing Banner */}
            <div className="p-4 bg-[#fff1f5]/70 border-b border-[#f2d8df] flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate flex-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#b87488] flex items-center gap-1.5">
                    {isPlaying ? (
                      <span className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 h-full bg-[#c97894] animate-[bounce_0.8s_infinite]" />
                        <span className="w-0.5 h-2/3 bg-[#829d8b] animate-[bounce_0.6s_infinite]" />
                        <span className="w-0.5 h-4/5 bg-[#c97894] animate-[bounce_1s_infinite]" />
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#a48a88]" />
                    )}
                    <span>Now Playing ({currentTrackIndex + 1}/{playlist.length})</span>
                  </div>
                  <div className="font-serif italic text-sm font-semibold text-[#864c5e] truncate mt-0.5">
                    {activeTrack?.title}
                  </div>
                </div>

                {activeTrack?.url && (
                  <a
                    href={activeTrack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#b87488] hover:text-[#864c5e] rounded-lg hover:bg-white/60 transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Playback Controls & Volume */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Prev / Play / Next */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={playPrevTrack}
                    className="p-2 rounded-full hover:bg-white text-[#9f576e] transition-colors cursor-pointer"
                    title="Previous track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-4 py-2 rounded-full bg-[#c97894] hover:bg-[#b86982] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_12px_rgba(201,120,148,0.3)] transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => playNextTrack(true)}
                    className="p-2 rounded-full hover:bg-white text-[#9f576e] transition-colors cursor-pointer"
                    title="Next track in rotation (1 → N → 1)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-1.5 text-xs text-[#a48a88]">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="hover:text-[#c97894] cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-[#d48d95]" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 accent-[#c97894] cursor-pointer h-1 bg-[#ebd0d6] rounded-lg"
                    title={`Volume: ${isMuted ? "Muted" : `${volume}%`}`}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Playlist Area */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[300px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#9f576e] mb-1">
                <span className="flex items-center gap-1">
                  <span>Tracklist</span>
                  <span className="text-[#a48a88] font-normal">
                    ({playlist.length} song{playlist.length > 1 ? "s" : ""})
                  </span>
                </span>
                <span className="text-[10px] text-[#829d8b] font-medium flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>Sequential loop</span>
                </span>
              </div>

              {playlist.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id || idx}
                    onClick={() => selectTrack(idx)}
                    className={`group p-2.5 rounded-2xl flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#ffeef3] to-[#fff6f8] border-[#e9a9bb] shadow-xs"
                        : "bg-white/70 hover:bg-white border-[#f0dcdb] hover:border-[#e9a9bb]/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-[#c97894] text-white"
                            : "bg-[#f5e6e8] text-[#9f576e]"
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <span className="animate-pulse">♫</span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="truncate">
                        <div
                          className={`text-xs truncate ${
                            isCurrent
                              ? "font-bold text-[#864c5e]"
                              : "text-[#715b5c] group-hover:text-[#864c5e]"
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="text-[10px] text-[#a48a88] truncate flex items-center gap-1">
                          {track.addedBy === "admin" ? (
                            <span className="text-[#829d8b] font-semibold">
                              ✦ Admin added
                            </span>
                          ) : (
                            <span>Official lofi</span>
                          )}
                          <span>•</span>
                          <span className="opacity-75">
                            {extractYouTubeId(track.url)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions for individual tracks */}
                    {isAdmin && (
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleMoveUp(idx, e)}
                          disabled={idx === 0}
                          className="p-1 rounded text-[#a48a88] hover:text-[#864c5e] disabled:opacity-20 transition-colors"
                          title="Move earlier in queue"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveDown(idx, e)}
                          disabled={idx === playlist.length - 1}
                          className="p-1 rounded text-[#a48a88] hover:text-[#864c5e] disabled:opacity-20 transition-colors"
                          title="Move later in queue"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTrack(idx, e)}
                          className="p-1 rounded text-[#a48a88] hover:text-[#c44f64] transition-colors"
                          title="Delete track from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ADMIN ONLY: Place to Add YouTube Music Links */}
            {isAdmin ? (
              <div className="p-4 bg-[#fff3ec]/90 border-t border-[#eed3c9] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#b56753]">
                    <Sparkles className="w-3.5 h-3.5 text-[#d97c65]" />
                    <span>Admin Mode: Add YouTube Music Link</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[10px] text-[#a48a88] hover:text-[#b56753] flex items-center gap-0.5 cursor-pointer underline underline-offset-2"
                    title="Restore default playlist"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Restore Defaults</span>
                  </button>
                </div>

                <form onSubmit={handleAddTrack} className="space-y-2">
                  <div>
                    <input
                      type="url"
                      placeholder="Paste YouTube Link (e.g. https://youtu.be/...)"
                      value={newUrl}
                      onChange={(e) => {
                        setNewUrl(e.target.value);
                        if (addError) setAddError("");
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#e8c8bd] rounded-xl text-xs text-[#715b5c] placeholder-[#c3a49f] outline-none focus:border-[#d97c65] transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Track Title (optional)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-[#e8c8bd] rounded-xl text-xs text-[#715b5c] placeholder-[#c3a49f] outline-none focus:border-[#d97c65] transition-colors"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#d97c65] hover:bg-[#c26852] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Song</span>
                    </button>
                  </div>

                  {addError && (
                    <div className="text-[11px] text-[#c44f64] font-medium animate-fadeIn">
                      ⚠️ {addError}
                    </div>
                  )}

                  <p className="text-[10px] text-[#a48a88] leading-tight m-0">
                    💡 Added songs will play automatically in sequence from the 1st to the {playlist.length + 1}th track, then repeat continuously.
                  </p>
                </form>
              </div>
            ) : (
              /* Visitor Notice (When NOT in Admin Mode) */
              <div className="p-3.5 bg-[#fbf5f0] border-t border-[#ebd8d0] text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8d606f]">
                  <Lock className="w-3 h-3 text-[#a48a88]" />
                  <span>
                    Adding YouTube tracks is restricted to <strong>Admin Mode</strong>.
                  </span>
                </div>
                <p className="text-[10px] text-[#a48a88] mt-1 mb-0">
                  Log in via top bar ("ADMIN LOGIN") to add YouTube links or rearrange the playlist.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
