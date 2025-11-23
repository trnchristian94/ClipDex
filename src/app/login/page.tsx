"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please sign in.");
      setShowEmailForm(true);
    }
    
    // Manejar errores de NextAuth
    const authError = searchParams.get("error");
    if (authError) {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const providers = [
    {
      id: "discord",
      name: "Discord",
      icon: "🎮",
      bgColor: "bg-[#5865F2]",
      hoverColor: "hover:bg-[#4752C4]",
      textColor: "text-white",
      border: "",
    },
    {
      id: "google",
      name: "Google",
      icon: "📧",
      bgColor: "bg-white",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-900",
      border: "border-2 border-gray-300",
    },
    {
      id: "twitch",
      name: "Twitch",
      icon: "🟣",
      bgColor: "bg-[#9146FF]",
      hoverColor: "hover:bg-[#772CE8]",
      textColor: "text-white",
      border: "",
    },
  ];

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Login result:", result);

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        // Redirigir manualmente
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 <span className="text-purple-400">ClipDex</span>
          </h1>
          <p className="text-gray-400">Your gaming portfolio, unified</p>

          <p className="text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:underline cursor-pointer font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>

        {!showEmailForm ? (
          <>
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() =>
                    signIn(provider.id, { callbackUrl: "/dashboard" })
                  }
                  className={`w-full ${provider.bgColor} ${provider.hoverColor} ${provider.textColor} ${provider.border} font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition shadow-sm cursor-pointer`}
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span>Continue with {provider.name}</span>
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition shadow-sm cursor-pointer border border-slate-600"
            >
              <span className="text-2xl">✉️</span>
              <span>Continue with Email</span>
            </button>
          </>
        ) : (
          <>
            {successMessage && (
              <div className="mb-4 bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => {
                setShowEmailForm(false);
                setError("");
                setSuccessMessage("");
              }}
              className="w-full mt-4 text-gray-400 hover:text-white text-sm transition cursor-pointer"
            >
              ← Back to other options
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-purple-400 hover:underline cursor-pointer"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-purple-400 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}