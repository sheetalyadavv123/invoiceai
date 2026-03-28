import { useState, useEffect, useRef } from 'react';
import { getInvoices } from '../../api/invoices';
import { getFinancialInsights } from '../../api/ai';
import type { Invoice } from '../../types/Invoice';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceData, insightData] = await Promise.all([
          getInvoices(),
          getFinancialInsights(),
        ]);
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

  const paid    = invoices.filter(i => i.status === 'paid').length;
  const pending = invoices.filter(i => i.status === 'pending').length;
  const overdue = invoices.filter(i => i.status === 'overdue').length;
  const total   = invoices.length;

  const totalRevenue  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.totalAmount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0);

  const STAT_CARDS = [
    { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString()}`,  trend: 'from paid invoices',  up: true,  icon: <DollarIcon />, color: '#7c3aed' },
    { label: 'Pending Amount',  value: `₹${pendingAmount.toLocaleString()}`,  trend: 'awaiting payment',    up: true,  icon: <ClockIcon />,  color: '#f59e0b' },
    { label: 'Overdue Amount',  value: `₹${overdueAmount.toLocaleString()}`,  trend: 'needs attention',     up: false, icon: <AlertIcon />,  color: '#ef4444' },
    { label: 'Total Invoices',  value: `${total}`,                            trend: 'all time',            up: true,  icon: <DocIcon />,    color: '#8b5cf6' },
  ];

  const insightLines = insights
    ? insights.split('\n').filter(l => l.trim().length > 0).slice(0, 4)
    : [];
  const insightEmojis = ['📈', '⚠️', '💡', '🔮'];

  // ── Donut chart ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const load = () => renderDonut();
    if ((window as any).Chart) { load(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = load;
    document.head.appendChild(script);
  }, [loading, paid, pending, overdue]);

  const renderDonut = () => {
    const Chart = (window as any).Chart;
    if (!Chart || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const isEmpty = paid === 0 && pending === 0 && overdue === 0;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Pending', 'Overdue'],
        datasets: [{
          data: isEmpty ? [1, 1, 1] : [paid, pending, overdue],
          backgroundColor: isEmpty
            ? ['rgba(139,92,246,0.08)', 'rgba(139,92,246,0.08)', 'rgba(139,92,246,0.08)']
            : ['#10b981', '#f59e0b', '#ef4444'],
          borderColor: '#080612',
          borderWidth: 3,
          hoverOffset: isEmpty ? 0 : 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: isEmpty ? { enabled: false } : {
            backgroundColor: '#1a1035',
            borderColor: 'rgba(124,58,237,0.4)',
            borderWidth: 1,
            titleColor: '#c4b5fd',
            bodyColor: '#e9d5ff',
            padding: 10,
            callbacks: {
              label: (c: any) => {
                const pct = total > 0 ? Math.round((c.raw / total) * 100) : 0;
                return ` ${c.raw} invoices (${pct}%)`;
              },
            },
          },
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
        .invoice-row:hover { background: rgba(139,92,246,0.06) !important; }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={s.pageTitle}>Dashboard</h1>
        <p style={s.pageSubtitle}>Welcome back — here's what's happening.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '14px' }}>
          Loading dashboard data...
        </div>
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

            {/* DONUT CHART CARD */}
            <div style={s.donutCard}>
              <div style={s.cardTitle}>Invoice Status</div>
              <div style={s.cardSub}>Breakdown by payment status</div>

              <div style={s.donutWrap}>
                {/* Chart */}
                <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
                  <canvas ref={canvasRef} />
                  {/* Center label */}
                  <div style={s.donutCenter}>
                    <div style={s.donutCenterNum}>{total}</div>
                    <div style={s.donutCenterLabel}>Total</div>
                  </div>
                </div>

                {/* Legend */}
                <div style={s.donutLegend}>
                  {[
                    { label: 'Paid',    count: paid,    color: '#10b981', amount: totalRevenue },
                    { label: 'Pending', count: pending,  color: '#f59e0b', amount: pendingAmount },
                    { label: 'Overdue', count: overdue,  color: '#ef4444', amount: overdueAmount },
                  ].map(item => (
                    <div key={item.label} style={s.legendItem}>
                      <div style={s.legendLeft}>
                        <div style={{ ...s.legendDot, background: item.color }} />
                        <div>
                          <div style={s.legendLabel}>{item.label}</div>
                          <div style={s.legendAmount}>₹{item.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ ...s.legendCount, color: item.color }}>
                        {item.count}
                        <span style={s.legendPct}>
                          {total > 0 ? ` (${Math.round((item.count / total) * 100)}%)` : ' (0%)'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {total === 0 && (
                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px', textAlign: 'center' as const }}>
                      Create your first invoice to see breakdown
                    </div>
                  )}
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ height: '1px', background: 'rgba(139,92,246,0.1)', margin: '20px 0' }} />

              {/* COLLECTION RATE BAR */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Collection Rate</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                    {total > 0 ? Math.round((paid / total) * 100) : 0}% collected
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(139,92,246,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? (paid / total) * 100 : 0}%`, background: 'linear-gradient(90deg, #7c3aed, #10b981)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>
                  &#8377;{totalRevenue.toLocaleString()} collected of &#8377;{(totalRevenue + pendingAmount + overdueAmount).toLocaleString()} total
                </div>
              </div>

              {/* QUICK STATS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Avg Invoice', value: total > 0 ? `₹${Math.round((totalRevenue + pendingAmount + overdueAmount) / total).toLocaleString()}` : '₹0' },
                  { label: 'At Risk', value: `₹${overdueAmount.toLocaleString()}`, highlight: overdueAmount > 0 },
                  { label: 'Success Rate', value: `${total > 0 ? Math.round((paid / total) * 100) : 0}%` },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{stat.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'Syne', sans-serif", color: stat.highlight ? '#f87171' : '#e9d5ff' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI INSIGHTS */}
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
                  <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' as const, padding: '20px 0' }}>
                    Add invoices to get AI insights
                  </div>
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
                <div style={s.cardSub}>Last {Math.min(invoices.length, 6)} transactions</div>
              </div>
            </div>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>
                No invoices yet. Create your first invoice.
              </div>
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
  pageTitle:     { fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  pageSubtitle:  { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:      { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '20px' },
  statTop:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  statIcon:      { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statTrend:     { fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px' },
  statValue:     { fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' },
  statLabel:     { fontSize: '12px', color: '#6b7280' },
  midRow:        { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '24px' },

  // Donut card
  donutCard:     { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  donutWrap:     { display: 'flex', alignItems: 'center', gap: '32px', marginTop: '20px' },
  donutCenter:   { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  donutCenterNum:{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f3e8ff', lineHeight: 1 },
  donutCenterLabel: { fontSize: '11px', color: '#6b7280', marginTop: '4px' },
  donutLegend:   { display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 },
  legendItem:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  legendLeft:    { display: 'flex', alignItems: 'center', gap: '10px' },
  legendDot:     { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel:   { fontSize: '13px', fontWeight: 500, color: '#e9d5ff' },
  legendAmount:  { fontSize: '11px', color: '#6b7280', marginTop: '2px' },
  legendCount:   { fontSize: '16px', fontWeight: 700, fontFamily: "'Syne', sans-serif" },
  legendPct:     { fontSize: '11px', fontWeight: 400, color: '#6b7280' },

  // Insights card
  insightsCard:  { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' },
  insightsHeader:{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' },
  insightsList:  { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  insightItem:   { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)' },
  insightEmoji:  { fontSize: '14px', flexShrink: 0 },
  insightText:   { fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 },
  insightsCta:   { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '9px', cursor: 'pointer', width: '100%' },

  // Table
  tableCard:     { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  tableHeader:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle:     { fontSize: '14px', fontWeight: 600, color: '#e9d5ff' },
  cardSub:       { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  td:            { padding: '14px 0', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' },
  clientCell:    { display: 'flex', alignItems: 'center', gap: '10px' },
  clientAvatar:  { width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 },
  badge:         { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
};

function DollarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function ClockIcon()  { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function AlertIcon()  { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function DocIcon()    { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function SparkleIcon(){ return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }