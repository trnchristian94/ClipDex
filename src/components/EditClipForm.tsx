"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

interface EditClipFormProps {
  clip: {
    id: string;
    displayTitle: string;
    description: string | null;
    game: string;
    tags: string[];
    thumbnailUrl: string;
    isFeatured: boolean;
    visibility: string;
    youtubeVisibility: string;
  };
}

export function EditClipForm({ clip }: EditClipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: clip.displayTitle,
    description: clip.description || "",
    game: clip.game,
    tags: clip.tags.join(", "),
    isFeatured: clip.isFeatured,
    clipdexVisibility: clip.visibility.toLowerCase(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayTitle: formData.title,
          description: formData.description,
          game: formData.game,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          isFeatured: formData.isFeatured,
          visibility: formData.clipdexVisibility.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update clip");
      }

      router.push("/dashboard?updated=true");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this clip? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete clip");
      }

      router.push("/dashboard?deleted=true");
      router.refresh();
    } catch (err: any) {
      alert("Failed to delete clip: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <p className="text-sm text-gray-400 mb-3">Preview</p>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={clip.thumbnailUrl}
            alt={clip.displayTitle}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={isSubmitting}
          maxLength={100}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Game */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Game *
        </label>
        <select
          value={formData.game}
          onChange={(e) => setFormData({ ...formData, game: e.target.value })}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {GAMES.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={isSubmitting}
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Featured Toggle */}
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) =>
              setFormData({ ...formData, isFeatured: e.target.checked })
            }
            disabled={isSubmitting}
            className="w-5 h-5 rounded"
          />
          <div>
            <p className="font-semibold">⭐ Featured Clip</p>
            <p className="text-sm text-gray-400">
              Show this clip at the top of your profile
            </p>
          </div>
        </label>
      </div>

      {/* ClipDex Visibility */}
      <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ClipDex Visibility
        </label>
        <select
          value={formData.clipdexVisibility}
          onChange={(e) =>
            setFormData({ ...formData, clipdexVisibility: e.target.value })
          }
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
        <p className="text-xs text-gray-400 mt-2">
          This only affects visibility on ClipDex, not YouTube
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="px-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </form>
  );
}