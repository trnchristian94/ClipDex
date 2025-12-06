"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ClipCardProps {
  clip: {
    id: string;
    displayTitle: string;
    game: string;
    tags: string[];
    thumbnailUrl: string;
    platform: string;
    duration: number;
    viewCount: number;
    uploadedAt: Date;
    isFeatured: boolean;
  };
  onClick?: () => void;
}

export function ClipCard({ clip, onClick }: ClipCardProps) {
  const platformColors = {
    YOUTUBE: "bg-red-600",
    TWITCH: "bg-purple-600",
    VIMEO: "bg-blue-600",
  };

  const platformIcons = {
    YOUTUBE: "🎥",
    TWITCH: "🟣",
    VIMEO: "🎬",
  };

  return (
    <div
      className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition group cursor-pointer"
    >
      <div className="relative aspect-video bg-slate-900" 
          onClick={onClick}>
        {/* Thumbnail */}
        <Image
          src={clip.thumbnailUrl}
          alt={clip.displayTitle}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
          {Math.floor(clip.duration / 60)}:
          {(clip.duration % 60).toString().padStart(2, "0")}
        </div>

        {/* Platform badge */}
        <div
          className={`absolute top-2 left-2 ${
            platformColors[clip.platform as keyof typeof platformColors]
          } px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold`}
        >
          {platformIcons[clip.platform as keyof typeof platformIcons]}
          {clip.platform}
        </div>

        {/* Featured badge */}
        {clip.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold text-black">
            ⭐ Featured
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-black border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold mb-1 truncate group-hover:text-purple-400 transition">
          {clip.displayTitle}
        </h3>
        <p className="text-sm text-gray-400 mb-2">{clip.game}</p>

        {/* Tags */}
        {clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {clip.tags.slice(0, 3).map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {clip.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{clip.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            👁️ {clip.viewCount.toLocaleString()} views
          </span>
          <span>{new Date(clip.uploadedAt).toLocaleDateString()}</span>
        </div>
        
        {/* Action buttons */}
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <Link
            href={`/dashboard/clips/${clip.id}/edit`}
            className="flex-1 text-center bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            ✏️ Edit
          </Link>
        </div>
      </div>
    </div>
  );
}