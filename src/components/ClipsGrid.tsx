"use client";

import { useState } from "react";
import { ClipCard } from "./ClipCard";
import { ClipViewer } from "./ClipViewer";
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
  isFeatured: boolean;
  user: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface ClipsGridProps {
  clips: Clip[];
  title?: string;
}

export function ClipsGrid({ clips, title }: ClipsGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  const openViewer = (clipId: string) => {
    setSelectedClipId(clipId);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedClipId(null);
  };

  if (clips.length === 0) {
    return null;
  }

  return (
    <>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onClick={() => openViewer(clip.id)}
          />
        ))}
      </div>

      {/* Clip Viewer Modal */}
      {viewerOpen && selectedClipId && (
        <ClipViewer
          clips={clips}
          initialClipId={selectedClipId}
          onClose={closeViewer}
        />
      )}
    </>
  );
}