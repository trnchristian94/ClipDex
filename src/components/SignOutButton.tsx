"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 mr-2 rounded-lg font-semibold transition cursor-pointer"
    >
      Sign Out
    </button>
  );
}