import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header/Navbar */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">
            🎮 <span className="text-purple-400">ClipDex</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your gaming highlights, unified and organized
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Get Started
            </Link>
            <Link href="/#features" className="border border-purple-400 hover:bg-purple-900/30 px-8 py-3 rounded-lg font-semibold transition cursor-pointer">
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8" id="features">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Personal Portfolio</h3>
            <p className="text-gray-400">
              Every user gets their own public URL to showcase clips
            </p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2">Multi-Platform</h3>
            <p className="text-gray-400">
              Connect YouTube, Twitch, Vimeo - all in one place
            </p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Easy Discovery</h3>
            <p className="text-gray-400">
              Search and filter clips by game and tags
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Sign Up</h4>
              <p className="text-sm text-gray-400">
                Create your account with Discord, Google, or Email
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Connect Platforms</h4>
              <p className="text-sm text-gray-400">
                Link your YouTube, Twitch, or Vimeo account
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Upload Clips</h4>
              <p className="text-sm text-gray-400">
                Upload directly to your connected platforms
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Share Profile</h4>
              <p className="text-sm text-gray-400">
                Get your unique URL and share with everyone
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 ClipDex. Built by gamers, for gamers.
            </div>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}