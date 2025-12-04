"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  platformConnectionId: string;
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

export function UploadForm({ userId, platformConnectionId }: Props) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game: "",
    tags: "",
    youtubeVisibility: "unlisted", // ← YouTube visibility
    clipdexVisibility: "public",   // ← ClipDex visibility
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError("File too large. Maximum size is 500MB");
        return;
      }

      const validFormats = ["video/mp4", "video/webm", "video/quicktime"];
      if (!validFormats.includes(selectedFile.type)) {
        setError("Invalid format. Only MP4, WebM, and MOV are allowed");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a video file");
      return;
    }

    if (!formData.title || !formData.game) {
      setError("Title and game are required");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("game", formData.game);
      data.append("tags", formData.tags);
      data.append("youtubeVisibility", formData.youtubeVisibility);
      data.append("clipdexVisibility", formData.clipdexVisibility);
      data.append("platformConnectionId", platformConnectionId);

      const response = await fetch("/api/clips/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      router.push("/dashboard?uploaded=true");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600 p-8">
        <input
          type="file"
          id="video-file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <label
          htmlFor="video-file"
          className="flex flex-col items-center cursor-pointer"
        >
          {file ? (
            <>
              <div className="text-4xl mb-4">✅</div>
              <p className="text-lg font-semibold mb-2">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
                className="mt-4 text-sm text-purple-400 hover:underline"
              >
                Choose different file
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-semibold mb-2">
                Click to select video
              </p>
              <p className="text-sm text-gray-400">
                MP4, WebM, or MOV (max 500MB)
              </p>
            </>
          )}
        </label>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            disabled={isUploading}
            maxLength={100}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="My Epic Pentakill"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game *
          </label>
          <select
            value={formData.game}
            onChange={(e) => setFormData({ ...formData, game: e.target.value })}
            required
            disabled={isUploading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={isUploading}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe your clip..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            disabled={isUploading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="clutch, ace, ranked"
          />
        </div>

        {/* ✅ YouTube Visibility */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Visibility
          </label>
          <select
            value={formData.youtubeVisibility}
            onChange={(e) =>
              setFormData({ ...formData, youtubeVisibility: e.target.value })
            }
            disabled={isUploading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="unlisted">Unlisted (Recommended)</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <p className="text-xs text-gray-400 mt-2">
            📺 <strong>Unlisted:</strong> Won't appear in your YouTube feed or search results
          </p>
        </div>

        {/* ✅ ClipDex Visibility */}
        <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ClipDex Visibility
          </label>
          <select
            value={formData.clipdexVisibility}
            onChange={(e) =>
              setFormData({ ...formData, clipdexVisibility: e.target.value })
            }
            disabled={isUploading}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
          <p className="text-xs text-gray-400 mt-2">
            🎮 <strong>Public:</strong> Visible on your ClipDex profile
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin text-2xl">⏳</div>
            <span className="font-semibold">Uploading to YouTube...</span>
          </div>
          <p className="text-sm text-gray-400">
            This may take a few minutes depending on file size
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || !file}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : "Upload Clip"}
      </button>
    </form>
  );
}