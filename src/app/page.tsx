import { redirect } from 'next/navigation';
import { getCurrentSession, getSignInUrl } from '@/lib/auth/session';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect('/profile');
  }

  const signInUrl = await getSignInUrl();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-indigo-500/25">
          TP
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Think<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Post</span> AI
        </h1>

        <p className="mb-8 text-lg text-gray-400 leading-relaxed">
          Your AI writing context provider. Store your professional profile, writing style, and memories — 
          let AI clients generate personalized content through the Model Context Protocol.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signInUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105"
          >
            Get Started
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: '👤', title: 'Profile & Style', desc: 'Store your professional identity and writing preferences' },
            { icon: '🧠', title: 'Smart Memories', desc: 'Categorized memories for targeted AI personalization' },
            { icon: '🔗', title: 'MCP Ready', desc: 'Connect any MCP-compatible AI client instantly' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
