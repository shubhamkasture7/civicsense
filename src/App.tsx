import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import CreateComplaint from './pages/CreateComplaint';
import AdminDashboard from './pages/AdminDashboard';
import type { User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Check if user session exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('civic_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        setCurrentTab(u.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      } catch (err) {
        console.error('Error parsing saved user session:', err);
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('civic_user', JSON.stringify(loggedInUser));
    
    // Auto route to correct dashboard
    setCurrentTab(loggedInUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('civic_user');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-violet-650 selection:text-white">
      {/* Navigation header */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Main page views */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {user.role === 'citizen' && (
              <>
                {currentTab === 'dashboard' && (
                  <CitizenDashboard 
                    user={user} 
                    API_URL={API_URL} 
                    onCreateNewClick={() => setCurrentTab('create-complaint')} 
                  />
                )}
                {currentTab === 'create-complaint' && (
                  <CreateComplaint 
                    user={user} 
                    API_URL={API_URL} 
                    onSuccess={() => setCurrentTab('dashboard')} 
                    onCancel={() => setCurrentTab('dashboard')} 
                  />
                )}
              </>
            )}

            {user.role === 'admin' && (
              <AdminDashboard 
                API_URL={API_URL} 
                currentTab={currentTab} 
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} CivicSense AI. Powered by Vertex AI Decision Intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
