import { Shield, LogOut, FileText, BarChart3, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Navbar({ user, onLogout, currentTab, setCurrentTab }: NavbarProps) {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-600 to-pink-500 p-2 rounded-xl shadow-lg shadow-violet-500/20 animate-pulse-slow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              CivicSense <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent font-black text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 ml-1">AI</span>
            </span>
            <p className="text-[10px] text-zinc-500 font-medium">Decision Intelligence Platform</p>
          </div>
        </div>

        {/* Navigation Tabs (Conditional) */}
        {user && (
          <div className="hidden md:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-xl">
            {user.role === 'citizen' ? (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                    currentTab === 'dashboard'
                      ? 'bg-zinc-800 text-white shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Complaints
                </button>
                <button
                  onClick={() => setCurrentTab('create-complaint')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                    currentTab === 'create-complaint'
                      ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-600/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  File Complaint
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('admin-dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                    currentTab === 'admin-dashboard'
                      ? 'bg-zinc-800 text-white shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => setCurrentTab('admin-management')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                    currentTab === 'admin-management'
                      ? 'bg-zinc-800 text-white shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Manage Complaints
                </button>
              </>
            )}
          </div>
        )}

        {/* User profile / Login widgets */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/50 p-2 pr-4 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-zinc-200 leading-tight">{user.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded border ${
                  user.role === 'admin' 
                    ? 'text-pink-400 border-pink-500/20 bg-pink-500/5' 
                    : 'text-violet-400 border-violet-500/20 bg-violet-500/5'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            Demo Sandbox Active
          </div>
        )}
      </div>
    </nav>
  );
}
