import { useState } from 'react';
import { Shield, User, Landmark, Sparkles } from 'lucide-react';
import type { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleDemoLogin = (demoUid: string) => {
    let demoUser: UserType;
    if (demoUid === 'admin') {
      demoUser = {
        uid: 'u1',
        name: 'Civic Admin',
        email: 'admin@civicsense.gov',
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
      };
    } else if (demoUid === 'rohan') {
      demoUser = {
        uid: 'u2',
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
        role: 'citizen',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
      };
    } else {
      demoUser = {
        uid: 'u3',
        name: 'Priya Patel',
        email: 'priya@example.com',
        role: 'citizen',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
      };
    }
    onLoginSuccess(demoUser);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const formattedName = name || email.split('@')[0];
    const user: UserType = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      name: formattedName,
      email: email,
      role: role,
      photoURL: ''
    };
    onLoginSuccess(user);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="w-full max-w-xl glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-4 shadow-inner">
            <Shield className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0 mb-2">
            Welcome to CivicSense AI
          </h1>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            AI-powered decision intelligence to report, analyze, and resolve citizen issues faster.
          </p>
        </div>

        {/* Quick Demo Logins */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Quick Demo Sandbox Logins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoLogin('rohan')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800/40 text-center transition-all cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-zinc-800 group-hover:ring-violet-500/50 transition-all"
                alt="Rohan"
              />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Rohan Sharma</span>
                <span className="text-[10px] text-zinc-500 font-medium">Citizen (Mumbai)</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('priya')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800/40 text-center transition-all cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-zinc-800 group-hover:ring-violet-500/50 transition-all"
                alt="Priya"
              />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Priya Patel</span>
                <span className="text-[10px] text-zinc-500 font-medium">Citizen (Bengaluru)</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-pink-500/50 hover:bg-zinc-800/40 text-center transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-500/20 transition-all">
                <Landmark className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Civic Admin</span>
                <span className="text-[10px] text-pink-400/80 font-bold uppercase tracking-wide">Operator</span>
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850" />
          </div>
          <span className="relative px-3 bg-zinc-950 text-xs font-bold text-zinc-500 uppercase tracking-wider">Or custom login</span>
        </div>

        {/* Custom Auth Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">System Access Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  role === 'citizen'
                    ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-bold'
                    : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50'
                }`}
              >
                <User className="w-4 h-4" />
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'border-pink-500 bg-pink-500/10 text-pink-400 font-bold'
                    : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-900/50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                Admin Console
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all duration-300 transform active:scale-[0.99] cursor-pointer text-sm"
          >
            Launch Demo Environment
          </button>
        </form>
      </div>
    </div>
  );
}
