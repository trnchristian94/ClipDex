"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Clip {
  id: string;
  displayTitle: string;
  description: string | null;
  game: string;
  tags: string[];
  thumbnailUrl: string;
  externalUrl: string;
  externalVideoId: string;
  platform: string;
  duration: number;
  viewCount: number;
  uploadedAt: Date;
  user: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface ClipViewerProps {
  clips: Clip[];
  initialClipId: string;
  onClose: () => void;
}

export function ClipViewer({ clips, initialClipId, onClose }: ClipViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(
    clips.findIndex((c) => c.id === initialClipId)
  );
  const [isLiked, setIsLiked] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<"vertical" | "horizontal" | "square">("horizontal");
  const wheelTimeoutRef = useRef<NodeJS.Timeout>();

  const currentClip = clips[currentIndex];
  const hasNext = currentIndex < clips.length - 1;
  const hasPrev = currentIndex > 0;

  // Detectar orientación del video basado en thumbnail
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio < 0.7) {
        setVideoAspectRatio("vertical");
      } else if (ratio > 1.3) {
        setVideoAspectRatio("horizontal");
      } else {
        setVideoAspectRatio("square");
      }
    };
    img.src = currentClip.thumbnailUrl;
  }, [currentClip.thumbnailUrl]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" && hasNext) setCurrentIndex((i) => i + 1);
      if (e.key === "ArrowUp" && hasPrev) setCurrentIndex((i) => i - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onClose]);

  // Mouse wheel scroll navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Debounce wheel events (evitar scroll demasiado rápido)
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      wheelTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0 && hasNext) {
          // Scroll down
          setCurrentIndex((i) => i + 1);
        } else if (e.deltaY < 0 && hasPrev) {
          // Scroll up
          setCurrentIndex((i) => i - 1);
        }
      }, 100); // Debounce de 100ms
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [hasNext, hasPrev]);

  // Touch swipe navigation (móvil)
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        // Mínimo 50px de swipe
        if (diff > 0 && hasNext) {
          // Swipe up
          setCurrentIndex((i) => i + 1);
        } else if (diff < 0 && hasPrev) {
          // Swipe down
          setCurrentIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [hasNext, hasPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleNext = () => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  };

  const handleLike = async () => {
    // TODO: Implementar API de likes
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${currentClip.user.username}/clip/${currentClip.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentClip.displayTitle,
          text: `Check out this ${currentClip.game} clip!`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  // Tamaños según orientación
  const videoContainerClass =
    videoAspectRatio === "vertical"
      ? "w-full max-w-md aspect-[9/16]" // Móvil vertical
      : videoAspectRatio === "horizontal"
      ? "w-full max-w-7xl aspect-video" // Horizontal amplio
      : "w-full max-w-4xl aspect-square"; // Cuadrado

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition cursor-pointer flex items-center gap-2"
          >
            ← Back
          </button>
          <Link href="/" className="text-xl font-bold text-white">
            🎮 <span className="text-purple-400">ClipDex</span>
          </Link>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition cursor-pointer text-2xl"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Video Container */}
        <div className={`relative ${videoContainerClass}`}>
          {/* YouTube Embed */}
          <iframe
            key={currentClip.id} // Force re-render on clip change
            src={`https://www.youtube.com/embed/${currentClip.externalVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={currentClip.displayTitle}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Info Sidebar (Desktop) */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 max-h-[80vh] overflow-y-auto bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          {/* User Info */}
          <Link
            href={`/${currentClip.user.username}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition"
          >
            {currentClip.user.avatarUrl ? (
              <Image
                src={currentClip.user.avatarUrl}
                alt={currentClip.user.displayName}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">
                {currentClip.user.displayName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-white">
                {currentClip.user.displayName}
              </p>
              <p className="text-sm text-gray-400">
                @{currentClip.user.username}
              </p>
            </div>
          </Link>

          {/* Title & Game */}
          <h2 className="text-xl font-bold text-white mb-2">
            {currentClip.displayTitle}
          </h2>
          <p className="text-purple-400 mb-4">{currentClip.game}</p>

          {/* Description */}
          {currentClip.description && (
            <p className="text-gray-300 text-sm mb-4">
              {currentClip.description}
            </p>
          )}

          {/* Tags */}
          {currentClip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentClip.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLike}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition cursor-pointer ${
                isLiked
                  ? "bg-red-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              <span className="text-xl">{isLiked ? "❤️" : "🤍"}</span>
              <span>Like</span>
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition cursor-pointer">
              <span className="text-xl">💬</span>
              <span>Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              <span className="text-xl">🔗</span>
              <span>Share</span>
            </button>

            <a
              href={currentClip.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition cursor-pointer text-white"
            >
              <span className="text-xl">🎥</span>
              <span>Open on YouTube</span>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-slate-700 text-sm text-gray-400">
            <p>👁️ {currentClip.viewCount.toLocaleString()} views</p>
            <p>
              📅 {new Date(currentClip.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-2xl transition cursor-pointer z-10"
          >
            ↑
          </button>
        )}

        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 lg:right-[22rem] top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-2xl transition cursor-pointer z-10"
          >
            ↓
          </button>
        )}
      </div>

      {/* Mobile Info Overlay */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pointer-events-none">
        <div className="pointer-events-auto">
          <Link
            href={`/${currentClip.user.username}`}
            className="flex items-center gap-3 mb-3"
          >
            {currentClip.user.avatarUrl ? (
              <Image
                src={currentClip.user.avatarUrl}
                alt={currentClip.user.displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                {currentClip.user.displayName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-white">
                {currentClip.user.displayName}
              </p>
              <p className="text-xs text-gray-400">
                @{currentClip.user.username}
              </p>
            </div>
          </Link>

          <h3 className="text-lg font-bold text-white mb-1">
            {currentClip.displayTitle}
          </h3>
          <p className="text-purple-400 text-sm mb-2">{currentClip.game}</p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 cursor-pointer"
            >
              <span className="text-2xl">{isLiked ? "❤️" : "🤍"}</span>
            </button>
            <button className="flex items-center gap-1 cursor-pointer">
              <span className="text-2xl">💬</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 cursor-pointer"
            >
              <span className="text-2xl">🔗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clip Counter & Navigation Hint */}
      <div className="absolute top-20 right-4 space-y-2">
        <div className="bg-black/50 px-3 py-1 rounded-full text-sm text-white">
          {currentIndex + 1} / {clips.length}
        </div>
        <div className="bg-black/50 px-3 py-1 rounded-full text-xs text-gray-300">
          Scroll or ↑↓
        </div>
      </div>
    </div>
  );
}
