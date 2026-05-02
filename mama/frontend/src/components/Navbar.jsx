import { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, X, Baby, Heart, TrendingUp, Sun, Moon } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { userProfile, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [showNotificationTray, setShowNotificationTray] = useState(false);
  const trayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) setShowNotificationTray(false);
    };
    if (showNotificationTray) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationTray]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const notifStyle = {
    success: 'border-l-4 border-successGreen bg-successGreen/5',
    warning: 'border-l-4 border-warningOrange bg-warningOrange/5',
    danger:  'border-l-4 border-dangerRed bg-dangerRed/5',
    info:    'border-l-4 border-cyanAccent bg-cyanAccent/5',
  };

  return (
    <header className="h-16 glass border-b sticky top-0 z-40 grid grid-cols-3 items-center px-6"
      style={{ borderColor: 'var(--border-soft)' }}>

      {/* Left — mobile brand / empty on desktop */}
      <div>
        <span className="text-lg font-bold gradient-text md:hidden">MamaAI</span>
      </div>

      {/* Centre — quick nav, always centred */}
      <nav className="hidden md:flex items-center justify-center gap-1 rounded-2xl px-2 py-1.5 mx-auto"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--border-soft)' }}>
        {[
          { to: '/baby-growth', icon: Baby,       label: 'Baby Growth' },
          { to: '/nutrition',   icon: TrendingUp, label: 'Nutrition'   },
          { to: '/mood',        icon: Heart,      label: 'Mood'        },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-accentPink font-semibold'
                  : 'hover:text-accentPink'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(244,63,127,0.10)' : 'transparent',
              color: isActive ? 'var(--pink)' : 'var(--text-2)',
            })}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right — actions */}
      <div className="flex items-center gap-2 justify-end">

        {/* Dark mode toggle */}
        <button onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-soft)', color: 'var(--text-2)' }}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <Sun className="w-4 h-4 text-warningOrange" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={trayRef}>
          <button onClick={() => setShowNotificationTray(v => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 relative"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border-soft)', color: 'var(--text-2)' }}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accentPink rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationTray && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 rounded-2xl shadow-xl flex flex-col overflow-hidden z-50"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Notifications</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-accentPink hover:underline">Mark all read</button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center" style={{ color: 'var(--text-3)' }}>
                    <Bell className="w-7 h-7 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} onClick={() => markAsRead(n.id)}
                    className={`p-3 cursor-pointer transition-colors ${notifStyle[n.type] || notifStyle.info} ${n.read ? 'opacity-50' : ''}`}
                    style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{n.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{n.message}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="p-1 rounded-lg hover:bg-black/5 transition-colors">
                        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-2" style={{ borderLeft: '1px solid var(--border-soft)' }}>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-1)' }}>{userProfile?.name || 'User'}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{userProfile?.language ?? userProfile?.role ?? 'mother'}</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #F43F7F, #C084FC)' }}>
            {userProfile?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-soft)', color: 'var(--text-2)' }}
          title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
