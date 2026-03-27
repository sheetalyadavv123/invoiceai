import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <GridIcon /> },
  { id: 'invoices', label: 'Invoices', icon: <FileIcon /> },
  { id: 'clients', label: 'Clients', icon: <UsersIcon /> },
  { id: 'payments', label: 'Payments', icon: <CreditCardIcon /> },
  { id: 'ai', label: 'AI Insights', icon: <SparkleIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

const STAT_CARDS = [
  { label: 'Total Revenue', value: '$48,295', trend: '+12.5%', up: true, icon: <DollarIcon />, color: '#7c3aed' },
  { label: 'Pending Amount', value: '$9,340', trend: '+3.2%', up: true, icon: <ClockIcon />, color: '#f59e0b' },
  { label: 'Overdue Amount', value: '$2,810', trend: '+18%', up: false, icon: <AlertIcon />, color: '#ef4444' },
  { label: 'Total Invoices', value: '142', trend: '+8 this month', up: true, icon: <DocIcon />, color: '#8b5cf6' },
];

const CHART_DATA: Record<string, number[]> = {
  '7d': [3200, 4100, 3800, 5200, 4700, 6100, 5800],
  '30d': [12000, 15000, 11000, 18000, 14000, 19000, 16000, 22000, 18000, 24000, 20000, 26000, 22000, 19000, 25000, 28000, 23000, 27000, 30000, 26000, 24000, 29000, 32000, 28000, 31000, 35000, 29000, 33000, 38000, 42000],
  '90d': [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 82000, 78000, 88000],
};

const CHART_LABELS: Record<string, string[]> = {
  '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '30d': Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  '90d': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const INVOICES = [
  { client: 'Acme Corp', amount: '$4,200', status: 'paid', due: 'Mar 15, 2026' },
  { client: 'Bright Labs', amount: '$1,850', status: 'pending', due: 'Apr 02, 2026' },
  { client: 'Nova Design', amount: '$920', status: 'overdue', due: 'Feb 28, 2026' },
  { client: 'Horizon Tech', amount: '$6,500', status: 'paid', due: 'Mar 20, 2026' },
  { client: 'Pixel Studio', amount: '$2,100', status: 'pending', due: 'Apr 10, 2026' },
  { client: 'Forge Systems', amount: '$3,400', status: 'overdue', due: 'Mar 01, 2026' },
];

const AI_INSIGHTS = [
  { emoji: '📈', text: 'Revenue is up 12.5% compared to last month.' },
  { emoji: '⚠️', text: 'Forge Systems is 27 days overdue — send a final notice.' },
  { emoji: '💡', text: 'Bright Labs always pays within 5 days of reminder.' },
  { emoji: '🔮', text: 'Projected revenue for April: $54,000 based on trends.' },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [chartFilter, setChartFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => renderChart(chartFilter);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if ((window as any).Chart) renderChart(chartFilter);
  }, [chartFilter]);

  const renderChart = (filter: string) => {
    const Chart = (window as any).Chart;
    if (!Chart || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); }
    const ctx = canvasRef.current.getContext('2d');
    const gradient = ctx!.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(124,58,237,0.35)');
    gradient.addColorStop(1, 'rgba(124,58,237,0)');
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: CHART_LABELS[filter],
        datasets: [{
          label: 'Revenue',
          data: CHART_DATA[filter],
          borderColor: '#7c3aed',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#a78bfa',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: '#1a1035',
          borderColor: 'rgba(124,58,237,0.4)',
          borderWidth: 1,
          titleColor: '#c4b5fd',
          bodyColor: '#e9d5ff',
          padding: 10,
          callbacks: { label: (c: any) => ` $${c.raw.toLocaleString()}` },
        }},
        scales: {
          x: { grid: { color: 'rgba(139,92,246,0.08)' }, ticks: { color: '#6b7280', font: { size: 11 }, maxTicksLimit: 8 } },
          y: { grid: { color: 'rgba(139,92,246,0.08)' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: (v: any) => `$${(v / 1000).toFixed(0)}k` } },
        },
      },
    });
  };

  const statusStyle = (status: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      paid: { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
      pending: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
      overdue: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
    };
    return map[status];
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        .nav-item:hover { background: rgba(139,92,246,0.1) !important; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
        .filter-btn:hover { background: rgba(139,92,246,0.15) !important; }
        .invoice-row:hover { background: rgba(139,92,246,0.06) !important; }
        .collapse-btn:hover { background: rgba(139,92,246,0.15) !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ ...s.sidebar, width: collapsed ? '64px' : '220px' }}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="10" fill="rgba(124,58,237,0.3)" />
              <path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa" />
              <circle cx="20" cy="20" r="3" fill="#7c3aed" />
            </svg>
            {!collapsed && <span style={s.logoLabel}>Invoi</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} style={s.collapseBtn}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav style={s.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className="nav-item"
              onClick={() => setActiveNav(item.id)}
              style={{
                ...s.navItem,
                background: activeNav === item.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: activeNav === item.id ? '#c4b5fd' : '#6b7280',
                boxShadow: activeNav === item.id ? 'inset 3px 0 0 #7c3aed' : 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={collapsed ? item.label : ''}
            >
              <span style={{ flexShrink: 0, opacity: activeNav === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {!collapsed && <span style={s.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <button className="nav-item" onClick={handleLogout} style={{ ...s.navItem, color: '#6b7280', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <LogoutIcon />
            {!collapsed && <span style={s.navLabel}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {/* TOPBAR */}
        <header style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Welcome back — here's what's happening.</p>
          </div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}>
              <SearchIcon />
              <span style={{ fontSize: '13px', color: '#4b5563' }}>Search...</span>
            </div>
            <div style={s.avatar}>SH</div>
          </div>
        </header>

        {/* STAT CARDS */}
        <div style={s.statsGrid}>
          {STAT_CARDS.map(card => (
            <div key={card.label} className="stat-card" style={{ ...s.statCard, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={s.statTop}>
                <div style={{ ...s.statIcon, background: `${card.color}22`, color: card.color }}>{card.icon}</div>
                <span style={{ ...s.statTrend, color: card.up ? '#34d399' : '#f87171', background: card.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {card.up ? '↑' : '↓'} {card.trend}
                </span>
              </div>
              <div style={s.statValue}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* MIDDLE ROW */}
        <div style={s.midRow}>
          {/* CHART */}
          <div style={s.chartCard}>
            <div style={s.chartHeader}>
              <div>
                <div style={s.cardTitle}>Revenue Overview</div>
                <div style={s.cardSub}>Tracked across all invoices</div>
              </div>
              <div style={s.filterGroup}>
                {(['7d', '30d', '90d'] as const).map(f => (
                  <button key={f} className="filter-btn" onClick={() => setChartFilter(f)} style={{
                    ...s.filterBtn,
                    background: chartFilter === f ? 'rgba(124,58,237,0.25)' : 'transparent',
                    color: chartFilter === f ? '#c4b5fd' : '#6b7280',
                    border: chartFilter === f ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', height: '220px', marginTop: '16px' }}>
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div style={s.insightsCard}>
            <div style={s.insightsHeader}>
              <SparkleIcon />
              <div style={s.cardTitle}>AI Insights</div>
            </div>
            <div style={s.insightsList}>
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} style={s.insightItem}>
                  <span style={s.insightEmoji}>{ins.emoji}</span>
                  <span style={s.insightText}>{ins.text}</span>
                </div>
              ))}
            </div>
            <button style={s.insightsCta}>View full report →</button>
          </div>
        </div>

        {/* INVOICES TABLE */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <div>
              <div style={s.cardTitle}>Recent Invoices</div>
              <div style={s.cardSub}>Last 6 transactions</div>
            </div>
            <button style={s.viewAllBtn}>View all</button>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                {['Client', 'Amount', 'Status', 'Due Date'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i} className="invoice-row" style={{ transition: 'background 0.15s' }}>
                  <td style={s.td}>
                    <div style={s.clientCell}>
                      <div style={{ ...s.clientAvatar, background: `hsl(${inv.client.charCodeAt(0) * 5}, 60%, 25%)`, color: `hsl(${inv.client.charCodeAt(0) * 5}, 80%, 70%)` }}>
                        {inv.client[0]}
                      </div>
                      {inv.client}
                    </div>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500, color: '#e9d5ff' }}>{inv.amount}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusStyle(inv.status) }}>{inv.status}</span>
                  </td>
                  <td style={{ ...s.td, color: '#6b7280' }}>{inv.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh', background: '#080612', fontFamily: "'DM Sans', sans-serif", color: '#e9d5ff' },
  sidebar: { display: 'flex', flexDirection: 'column', background: '#0d0a1e', borderRight: '1px solid rgba(139,92,246,0.12)', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  sidebarTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 12px 16px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' },
  logoLabel: { fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#e9d5ff', whiteSpace: 'nowrap' },
  collapseBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap', overflow: 'hidden' },
  navLabel: { fontSize: '13.5px', fontWeight: 500 },
  sidebarBottom: { padding: '12px 8px', borderTop: '1px solid rgba(139,92,246,0.1)' },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 },
  topbar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#e9d5ff', cursor: 'pointer', flexShrink: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '20px', cursor: 'default' },
  statTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  statIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statTrend: { fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px' },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280', fontWeight: 400 },
  midRow: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '24px' },
  chartCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  chartHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#e9d5ff' },
  cardSub: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  filterGroup: { display: 'flex', gap: '4px' },
  filterBtn: { padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  insightsCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' },
  insightsHeader: { display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  insightItem: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)' },
  insightEmoji: { fontSize: '14px', flexShrink: 0, marginTop: '1px' },
  insightText: { fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 },
  insightsCta: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '9px', cursor: 'pointer', textAlign: 'center' as const, width: '100%' },
  tableCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  tableHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' },
  viewAllBtn: { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '8px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '6px 14px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  td: { padding: '14px 0', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' },
  clientCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  clientAvatar: { width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
};

function GridIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function FileIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function UsersIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function CreditCardIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function SparkleIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }
function SettingsIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function LogoutIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function DollarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function ClockIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function AlertIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function DocIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>; }