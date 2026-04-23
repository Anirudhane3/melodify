import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import { useState } from 'react';

const NAV = [
  {
    to: '/', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    )
  },
  {
    to: '/playlists', label: 'Playlists', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18A2.995 2.995 0 0 0 16 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
      </svg>
    )
  },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PRIMARY_ADMIN';
  const isPrimary = currentUser?.role === 'PRIMARY_ADMIN';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-56 flex-shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">CrystalBeats</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
            }
          >
            {icon}{label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            Admin
          </NavLink>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`}
            alt={currentUser?.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-600/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser?.username}</p>
            <p className="text-xs text-zinc-500">
              {isPrimary ? 'Primary Admin' : currentUser?.role === 'ADMIN' ? 'Admin' : 'Listener'}
            </p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
