import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">
            🎮 <span className="text-purple-400">ClipDex</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your gaming highlights, beautifully organized
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <a 
              href="#features"
              className="border border-purple-400 hover:bg-purple-900/30 px-8 py-3 rounded-lg font-semibold transition"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8" id="features">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Personal Portfolio</h3>
            <p className="text-gray-400">
              Every user gets their own public URL to showcase clips
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-bold mb-2">Unlimited Storage</h3>
            <p className="text-gray-400">
              Powered by YouTube's infrastructure
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Easy Discovery</h3>
            <p className="text-gray-400">
              Search and filter clips by game and tags
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}