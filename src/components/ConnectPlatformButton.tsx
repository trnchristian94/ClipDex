"use client";

import { useState } from "react";

interface Props {
  platform: "YOUTUBE" | "TWITCH" | "VIMEO";
  userId: string;
}

export function ConnectPlatformButton({ platform, userId }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Redirigir al endpoint de OAuth
      window.location.href = `/api/platforms/connect?platform=${platform}`;
    } catch (error) {
      console.error("Error connecting platform:", error);
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? "Connecting..." : "Connect"}
    </button>
  );
}