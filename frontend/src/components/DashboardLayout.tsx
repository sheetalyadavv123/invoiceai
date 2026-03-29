import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useIsMobile } from '../hooks/useIsMobile';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <GridIcon /> },
  { id: 'invoices',  label: 'Invoices',  path: '/invoices',  icon: <FileIcon /> },
  { id: 'clients',   label: 'Clients',   path: '/clients',   icon: <UsersIcon /> },
  { id: 'payments',  label: 'Payments',  path: '/payments',  icon: <CreditCardIcon /> },
  { id: 'ai',        label: 'AI',        path: '/ai',        icon: <SparkleIcon /> },
  { id: 'settings',  label: 'Settings',  path: '/settings',  icon: <SettingsIcon /> },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        .nav-item:hover { background: rgba(139,92,246,0.1) !important; }
        .collapse-btn:hover { background: rgba(139,92,246,0.15) !important; }
        .profile-item:hover { background: rgba(139,92,246,0.1) !important; }
        .bnav-btn:hover { background: rgba(139,92,246,0.08) !important; }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside style={{ ...s.sidebar, width: collapsed ? '64px' : '220px' }}>
          <div style={s.sidebarTop}>
            <div style={s.logo}>
              <LogoSVG />
              {!collapsed && <span style={s.logoLabel}>Invoi</span>}
            </div>
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} style={s.collapseBtn}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>
          <nav style={s.nav}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} className="nav-item" onClick={() => navigate(item.path)}
                style={{ ...s.navItem, background: isActive(item.path) ? 'rgba(124,58,237,0.15)' : 'transparent', color: isActive(item.path) ? '#c4b5fd' : '#6b7280', boxShadow: isActive(item.path) ? 'inset 3px 0 0 #7c3aed' : 'none', justifyContent: collapsed ? 'center' : 'flex-start' }}
                title={collapsed ? item.label : ''}>
                <span style={{ flexShrink: 0, opacity: isActive(item.path) ? 1 : 0.6 }}>{item.icon}</span>
                {!collapsed && <span style={s.navLabel}>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div style={s.sidebarBottom}>
            {!collapsed && (
              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>{user?.email}</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div style={{ ...s.mainWrap, paddingBottom: isMobile ? '68px' : '0' }}>
        {/* TOPBAR */}
        <header style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMobile && <LogoSVG />}
            <span style={s.pageName}>
              {isMobile ? 'Invoi' : (NAV_ITEMS.find(n => isActive(n.path))?.label || 'Dashboard')}
            </span>
          </div>

          {/* PROFILE */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(p => !p)} style={s.avatar}>{initials}</button>
            {profileOpen && (
              <div style={s.profileDropdown}>
                <div style={s.profileHeader}>
                  <div style={s.profileAvatar}>{initials}</div>
                  <div>
                    <div style={s.profileName}>{user?.name || 'User'}</div>
                    <div style={s.profileEmail}>{user?.email || ''}</div>
                  </div>
                </div>
                <div style={s.profileDivider} />
                {[
                  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
                  { label: 'Settings', icon: '⚙️', path: '/settings' },
                  { label: 'AI Insights', icon: '⚡', path: '/ai' },
                ].map(item => (
                  <button key={item.label} className="profile-item"
                    onClick={() => { navigate(item.path); setProfileOpen(false); }}
                    style={s.profileItem}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}
                <div style={s.profileDivider} />
                <button className="profile-item" onClick={handleLogout} style={{ ...s.profileItem, color: '#f87171' }}>
                  <span>🚪</span><span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={s.main}><Outlet /></main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav style={s.bottomNav}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className="bnav-btn" onClick={() => navigate(item.path)}
              style={{ ...s.bnavBtn, color: isActive(item.path) ? '#a78bfa' : '#4b5563' }}>
              <span style={{ opacity: isActive(item.path) ? 1 : 0.5, display: 'flex' }}>{item.icon}</span>
              <span style={{ fontSize: '9px', marginTop: '3px', fontWeight: isActive(item.path) ? 600 : 400, fontFamily: "'DM Sans',sans-serif" }}>{item.label}</span>
              {isActive(item.path) && <div style={s.bnavDot} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root:           { display: 'flex', minHeight: '100vh', background: '#080612', fontFamily: "'DM Sans',sans-serif", color: '#e9d5ff' },
  sidebar:        { display: 'flex', flexDirection: 'column', background: '#0d0a1e', borderRight: '1px solid rgba(139,92,246,0.12)', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  sidebarTop:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 12px 16px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  logo:           { display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' },
  logoLabel:      { fontFamily: "'Syne',sans-serif", fontSize: '18px', fontWeight: 700, color: '#e9d5ff', whiteSpace: 'nowrap' },
  collapseBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  nav:            { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem:        { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const, transition: 'background 0.15s', whiteSpace: 'nowrap', overflow: 'hidden' },
  navLabel:       { fontSize: '13.5px', fontWeight: 500 },
  sidebarBottom:  { padding: '12px 8px', borderTop: '1px solid rgba(139,92,246,0.1)', minHeight: '52px' },
  mainWrap:       { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(139,92,246,0.08)', background: 'rgba(13,10,30,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 },
  pageName:       { fontFamily: "'Syne',sans-serif", fontSize: '16px', fontWeight: 700, color: '#f3e8ff' },
  avatar:         { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', border: '2px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#e9d5ff', cursor: 'pointer', flexShrink: 0 },
  profileDropdown:{ position: 'absolute', top: '44px', right: 0, width: '220px', background: '#100c22', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '14px', padding: '8px', zIndex: 50, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
  profileHeader:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' },
  profileAvatar:  { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#e9d5ff', flexShrink: 0 },
  profileName:    { fontSize: '13px', fontWeight: 600, color: '#f3e8ff' },
  profileEmail:   { fontSize: '11px', color: '#6b7280', marginTop: '1px' },
  profileDivider: { height: '1px', background: 'rgba(139,92,246,0.12)', margin: '6px 0' },
  profileItem:    { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'none', border: 'none', borderRadius: '8px', color: '#c4b5fd', fontSize: '13px', cursor: 'pointer', textAlign: 'left' as const, transition: 'background 0.15s', fontFamily: "'DM Sans',sans-serif" },
  main:           { flex: 1, overflowY: 'auto' },
  bottomNav:      { position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px', background: '#0d0a1e', borderTop: '1px solid rgba(139,92,246,0.15)', display: 'flex', zIndex: 20 },
  bnavBtn:        { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', position: 'relative', borderRadius: 0 },
  bnavDot:        { position: 'absolute', bottom: '6px', width: '4px', height: '4px', borderRadius: '50%', background: '#7c3aed' },
};

function LogoSVG() { return <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}><rect width="40" height="40" rx="10" fill="rgba(124,58,237,0.3)"/><path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa"/><circle cx="20" cy="20" r="3" fill="#7c3aed"/></svg>; }
function GridIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function FileIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function UsersIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function CreditCardIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function SparkleIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }
function SettingsIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>; }