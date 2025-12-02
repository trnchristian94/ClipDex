"use client";

import { useState } from "react";

interface Props {
  platform: "YOUTUBE" | "TWITCH" | "VIMEO";
}

export function ReconnectButton({ platform }: Props) {
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = () => {
    setIsReconnecting(true);
    // Redirigir al flujo de OAuth (igual que conectar)
    window.location.href = `/api/platforms/connect?platform=${platform}`;
  };

  return (
    <button
      onClick={handleReconnect}
      disabled={isReconnecting}
      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
    >
      {isReconnecting ? "Reconnecting..." : "Reconnect"}
    </button>
  );
}