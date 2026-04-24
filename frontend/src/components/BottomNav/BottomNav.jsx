import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PRIMARY_ADMIN';

  const links = [
    {
      to: '/', label: 'Home', end: true,
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
    },
    {
      to: '/playlists', label: 'Playlists', end: false,
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18A2.995 2.995 0 0 0 16 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>,
    },
    ...(isAdmin ? [{
      to: '/admin', label: 'Admin', end: false,
      icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>,
    }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center h-14 px-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {links.map(({ to, label, icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all text-xs font-medium
            ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-white'}`
          }>
          {icon}
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
