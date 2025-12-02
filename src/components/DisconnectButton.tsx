"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  platformConnectionId: string;
  platformName: string;
}

export function DisconnectButton({
  platformConnectionId,
  platformName,
}: Props) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/platforms/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformConnectionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      router.refresh();
    } catch (error) {
      console.error("Disconnect error:", error);
      alert("Failed to disconnect. Please try again.");
      setIsDisconnecting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
        >
          {isDisconnecting ? "Disconnecting..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDisconnecting}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition cursor-pointer"
    >
      Disconnect
    </button>
  );
}