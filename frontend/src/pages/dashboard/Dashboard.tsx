import { useState, useEffect, useRef } from 'react';
import { getInvoices } from '../../api/invoices';
import { getFinancialInsights } from '../../api/ai';
import type { Invoice } from '../../types/Invoice';

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

export default function Dashboard() {
  const [chartFilter, setChartFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceData, insightData] = await Promise.all([getInvoices(), getFinancialInsights()]);
        setInvoices(invoiceData);
        setInsights(insightData.insights || '');
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.totalAmount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0);

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, trend: 'from paid invoices', up: true, icon: <DollarIcon />, color: '#7c3aed' },
    { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString()}`, trend: 'awaiting payment', up: true, icon: <ClockIcon />, color: '#f59e0b' },
    { label: 'Overdue Amount', value: `₹${overdueAmount.toLocaleString()}`, trend: 'needs attention', up: false, icon: <AlertIcon />, color: '#ef4444' },
    { label: 'Total Invoices', value: `${invoices.length}`, trend: 'all time', up: true, icon: <DocIcon />, color: '#8b5cf6' },
  ];

  const insightLines = insights ? insights.split('\n').filter(l => l.trim().length > 0).slice(0, 4) : [];
  const insightEmojis = ['📈', '⚠️', '💡', '🔮'];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => renderChart(chartFilter);
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  useEffect(() => { if ((window as any).Chart) renderChart(chartFilter); }, [chartFilter]);

  const renderChart = (filter: string) => {
    const Chart = (window as any).Chart;
    if (!Chart || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    const gradient = ctx!.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(124,58,237,0.35)');
    gradient.addColorStop(1, 'rgba(124,58,237,0)');
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels: CHART_LABELS[filter], datasets: [{ label: 'Revenue', data: CHART_DATA[filter], borderColor: '#7c3aed', backgroundColor: gradient, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: '#a78bfa' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1035', borderColor: 'rgba(124,58,237,0.4)', borderWidth: 1, titleColor: '#c4b5fd', bodyColor: '#e9d5ff', padding: 10, callbacks: { label: (c: any) => ` ₹${c.raw.toLocaleString()}` } } },
        scales: {
          x: { grid: { color: 'rgba(139,92,246,0.08)' }, ticks: { color: '#6b7280', font: { size: 11 }, maxTicksLimit: 8 } },
          y: { grid: { color: 'rgba(139,92,246,0.08)' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: (v: any) => `₹${(v / 1000).toFixed(0)}k` } },
        },
      },
    });
  };

  const statusStyle = (status: string): React.CSSProperties => ({
    paid:    { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
    pending: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
    overdue: { background: 'rgba(239,68,68,0.12)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
  }[status] as React.CSSProperties);

  return (
    <div style={{ padding: '28px 32px' }}>
      <style>{`
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
        .filter-btn:hover { background: rgba(139,92,246,0.15) !important; }
        .invoice-row:hover { background: rgba(139,92,246,0.06) !important; }
      `}</style>

      {/* PAGE HEADING */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={s.pageTitle}>Dashboard</h1>
        <p style={s.pageSubtitle}>Welcome back — here's what's happening.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '14px' }}>Loading dashboard data...</div>
      ) : (
        <>
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
            <div style={s.chartCard}>
              <div style={s.chartHeader}>
                <div>
                  <div style={s.cardTitle}>Revenue Overview</div>
                  <div style={s.cardSub}>Tracked across all invoices</div>
                </div>
                <div style={s.filterGroup}>
                  {(['7d', '30d', '90d'] as const).map(f => (
                    <button key={f} className="filter-btn" onClick={() => setChartFilter(f)} style={{ ...s.filterBtn, background: chartFilter === f ? 'rgba(124,58,237,0.25)' : 'transparent', color: chartFilter === f ? '#c4b5fd' : '#6b7280', border: chartFilter === f ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent' }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative', height: '220px', marginTop: '16px' }}>
                <canvas ref={canvasRef} />
              </div>
            </div>

            <div style={s.insightsCard}>
              <div style={s.insightsHeader}>
                <SparkleIcon />
                <div style={s.cardTitle}>AI Insights</div>
              </div>
              <div style={s.insightsList}>
                {insightLines.length > 0 ? insightLines.map((line, i) => (
                  <div key={i} style={s.insightItem}>
                    <span style={s.insightEmoji}>{insightEmojis[i] || '💡'}</span>
                    <span style={s.insightText}>{line.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' as const, padding: '20px 0' }}>Add invoices to get AI insights</div>
                )}
              </div>
              <button style={s.insightsCta}>View full report →</button>
            </div>
          </div>

          {/* INVOICES TABLE */}
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div>
                <div style={s.cardTitle}>Recent Invoices</div>
                <div style={s.cardSub}>Last {invoices.slice(0, 6).length} transactions</div>
              </div>
              <button style={s.viewAllBtn}>View all</button>
            </div>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>No invoices yet. Create your first invoice.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{['Client', 'Amount', 'Status', 'Due Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 6).map((inv, i) => (
                    <tr key={i} className="invoice-row" style={{ transition: 'background 0.15s' }}>
                      <td style={s.td}>
                        <div style={s.clientCell}>
                          <div style={{ ...s.clientAvatar, background: `hsl(${(inv.client as any).name?.charCodeAt(0) * 5 || 0},60%,25%)`, color: `hsl(${(inv.client as any).name?.charCodeAt(0) * 5 || 0},80%,70%)` }}>
                            {(inv.client as any).name?.[0] || '?'}
                          </div>
                          {(inv.client as any).name || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ ...s.td, fontWeight: 500, color: '#e9d5ff' }}>₹{inv.totalAmount.toLocaleString()}</td>
                      <td style={s.td}><span style={{ ...s.badge, ...statusStyle(inv.status) }}>{inv.status}</span></td>
                      <td style={{ ...s.td, color: '#6b7280' }}>{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '20px' },
  statTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  statIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statTrend: { fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px' },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
  midRow: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '24px' },
  chartCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  chartHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#e9d5ff' },
  cardSub: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  filterGroup: { display: 'flex', gap: '4px' },
  filterBtn: { padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid transparent' },
  insightsCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' },
  insightsHeader: { display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  insightItem: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)' },
  insightEmoji: { fontSize: '14px', flexShrink: 0 },
  insightText: { fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 },
  insightsCta: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '9px', cursor: 'pointer', width: '100%' },
  tableCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  tableHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' },
  viewAllBtn: { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '8px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '6px 14px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  td: { padding: '14px 0', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' },
  clientCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  clientAvatar: { width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
};

function DollarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function ClockIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function AlertIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function DocIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function SparkleIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }