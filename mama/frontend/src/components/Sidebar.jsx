import { NavLink } from 'react-router-dom';
import { Home, Activity, ScanFace, Utensils, Baby, FileText, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { userProfile } = useAuth();

  const baseLinks = [
    { to: '/dashboard', icon: Home,        label: 'Dashboard' },
    { to: '/symptoms',  icon: Activity,    label: 'Symptom Chat' },
    { to: '/eyelid',    icon: ScanFace,    label: 'Eyelid Scan' },
    { to: '/meal',      icon: Utensils,    label: 'Meal Scan' },
    { to: '/kicks',     icon: Baby,        label: 'Kick Counter' },
    { to: '/reports',   icon: FileText,    label: 'Reports' },
  ];

  const ashaLinks = [{ to: '/asha', icon: Users, label: 'ASHA Panel' }];
  const links = userProfile?.role === 'asha' ? [...baseLinks, ...ashaLinks] : baseLinks;

  return (
    <aside className="w-60 hidden md:flex flex-col z-10 h-full"
      style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border-soft)' }}>

      {/* Brand */}
      <div className="px-6 py-5">
        <span className="text-2xl font-extrabold gradient-text tracking-tight">MamaAI</span>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Maternal Health Platform</p>
      </div>

      {/* Divider */}
      <div className="mx-4 divider mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Emergency — pinned bottom */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <NavLink to="/emergency"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive ? 'bg-dangerRed/10 text-dangerRed' : 'text-dangerRed/70 hover:bg-dangerRed/8 hover:text-dangerRed'
            }`
          }>
          <AlertCircle className="w-4 h-4" />
          <span>Emergency</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
