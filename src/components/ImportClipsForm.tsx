"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
}

const GAMES = [
  "Valorant",
  "League of Legends",
  "CS2",
  "Fortnite",
  "Apex Legends",
  "Overwatch 2",
  "Call of Duty",
  "Minecraft",
  "Other",
];

interface ImportClipsFormProps {
  userId: string;
  platformConnectionId: string;
}

export function ImportClipsForm({
  userId,
  platformConnectionId,
}: ImportClipsFormProps) {
  const router = useRouter();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [videoMetadata, setVideoMetadata] = useState<Record<string,{ game: string, tags: string }>>({});

  useEffect(() => {
    fetchYouTubeVideos();
  }, []);

  const fetchYouTubeVideos = async () => {
    try {
      const response = await fetch(
        `/api/platforms/youtube/videos?platformConnectionId=${platformConnectionId}`
      );
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos || []);
      } else {
        alert("Failed to fetch videos: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Failed to fetch videos from YouTube");
    } finally {
      setLoading(false);
    }
  };

  const toggleVideo = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const updateMetadata = (videoId: string, field: string, value: string) => {
    setVideoMetadata({
      ...videoMetadata,
      [videoId]: {
        ...videoMetadata[videoId],
        [field]: value,
      },
    });
  };

  const handleImport = async () => {
    if (selectedVideos.size === 0) {
      alert("Please select at least one video");
      return;
    }

    // Verificar que todos los videos seleccionados tienen game asignado
    const missingGame = Array.from(selectedVideos).some(
      (id) => !videoMetadata[id]?.game
    );

    if (missingGame) {
      alert("Please select a game for all selected videos");
      return;
    }

    setImporting(true);

    try {
      const videosToImport = Array.from(selectedVideos).map((videoId) => {
        const video = videos.find((v) => v.id === videoId)!;
        const metadata = videoMetadata[videoId] || {};

        return {
          externalVideoId: video.id,
          displayTitle: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          game: metadata.game,
          tags: metadata.tags
            ? metadata.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          publishedAt: video.publishedAt,
        };
      });

      const response = await fetch("/api/clips/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformConnectionId,
          videos: videosToImport,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import clips");
      }

      router.push(
        `/dashboard?imported=${result.imported || selectedVideos.size}`
      );
      router.refresh();
    } catch (error: any) {
      alert("Failed to import: " + error.message);
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading your YouTube videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-xl font-bold mb-2">No videos found</h3>
        <p className="text-gray-400">
          Your YouTube channel doesn't have any videos yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Found {videos.length} videos • {selectedVideos.size} selected
        </p>
        <button
          onClick={handleImport}
          disabled={importing || selectedVideos.size === 0}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing
            ? "Importing..."
            : `Import ${selectedVideos.size} video${
                selectedVideos.size !== 1 ? "s" : ""
              }`}
        </button>
      </div>

      {/* Videos Grid */}
      <div className="space-y-4">
        {videos.map((video) => {
          const isSelected = selectedVideos.has(video.id);

          return (
            <div
              key={video.id}
              className={`bg-slate-800/50 rounded-lg border ${
                isSelected ? "border-purple-500" : "border-slate-700"
              } p-4 transition`}
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="flex items-start pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleVideo(video.id)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </div>

                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {video.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>

                  {/* Metadata (solo si está seleccionado) */}
                  {isSelected && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-slate-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Game *
                        </label>
                        <select
                          value={videoMetadata[video.id]?.game || ""}
                          onChange={(e) =>
                            updateMetadata(video.id, "game", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                        >
                          <option value="">Select a game</option>
                          {GAMES.map((game) => (
                            <option key={game} value={game}>
                              {game}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Tags (optional)
                        </label>
                        <input
                          type="text"
                          value={videoMetadata[video.id]?.tags || ""}
                          onChange={(e) =>
                            updateMetadata(video.id, "tags", e.target.value)
                          }
                          placeholder="clutch, ace, ranked"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}