import { useState, useEffect, useRef } from 'react';
import { getInvoices } from '../../api/invoices';
import { getFinancialInsights } from '../../api/ai';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useInvoiceStore } from '../../store/invoiceStore';

export default function Dashboard() {
  const {
  invoices, insights, lastFetched,
  setInvoices, setInsights, setLastFetched,
  } = useInvoiceStore();
  const [loading, setLoading] = useState(invoices.length === 0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = Date.now();
  const isFresh = lastFetched && (now - lastFetched) < FIVE_MINUTES;

  if (isFresh) {
    setLoading(false);
    return;
  }

  const fetchInvoices = async () => {
    try {
      const invoiceData = await getInvoices();
      setInvoices(invoiceData);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Invoice fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const insightData = await getFinancialInsights();
      setInsights(insightData.insights || '');
    } catch (err) {
      console.error('Insights fetch error:', err);
    }
  };

  fetchInvoices();
  if (!insights) fetchInsights();
}, []);

  const paid    = invoices.filter(i => i.status === 'paid').length;
  const pending = invoices.filter(i => i.status === 'pending').length;
  const overdue = invoices.filter(i => i.status === 'overdue').length;
  const total   = invoices.length;

  const totalRevenue  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.totalAmount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0);

  const STAT_CARDS = [
    { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString()}`,  trend: 'from paid invoices', up: true,  icon: <DollarIcon />, color: '#7c3aed' },
    { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString()}`,  trend: 'awaiting payment',   up: true,  icon: <ClockIcon />,  color: '#f59e0b' },
    { label: 'Overdue Amount', value: `₹${overdueAmount.toLocaleString()}`,  trend: 'needs attention',    up: false, icon: <AlertIcon />,  color: '#ef4444' },
    { label: 'Total Invoices', value: `${total}`,                            trend: 'all time',           up: true,  icon: <DocIcon />,    color: '#8b5cf6' },
  ];

  const insightLines = insights ? insights.split('\n').filter(l => l.trim().length > 0).slice(0, 4) : [];
  const insightEmojis = ['📈', '⚠️', '💡', '🔮'];

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

    // ✅ FIXED LOGIC
    const dataValues = [paid, pending, overdue];
    const totalData = dataValues.reduce((a, b) => a + b, 0);
    const isEmpty = totalData === 0;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Pending', 'Overdue'],
        datasets: [{
          data: isEmpty ? [1, 1, 1] : dataValues,
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
          tooltip: isEmpty
            ? { enabled: false }
            : {
                backgroundColor: '#1a1035',
                borderColor: 'rgba(124,58,237,0.4)',
                borderWidth: 1,
                titleColor: '#c4b5fd',
                bodyColor: '#e9d5ff',
                padding: 10,
                callbacks: {
                  label: (c: any) => {
                    const value = c.raw;
                    const percentage = totalData > 0
                      ? Math.round((value / totalData) * 100)
                      : 0;
                    return ` ${value} invoices (${percentage}%)`;
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

  const p = isMobile ? '16px' : '28px 32px';
  
  return (
    <div style={{ padding: p }}>
      <style>{`
        .stat-card:hover { transform: translateY(-2px); }
        .invoice-row:hover { background: rgba(139,92,246,0.06) !important; }
      `}</style>

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Welcome back — here's what's happening.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '14px' }}>Loading...</div>
      ) : (
        <>
          {/* STAT CARDS — 2 cols on mobile, 4 on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? '10px' : '16px', marginBottom: '20px' }}>
            {STAT_CARDS.map(card => (
              <div key={card.label} className="stat-card" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: isMobile ? '14px' : '20px', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${card.color}22`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                  {!isMobile && <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px', color: card.up ? '#34d399' : '#f87171', background: card.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>{card.up ? '↑' : '↓'} {card.trend}</span>}
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '18px' : '26px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* MIDDLE ROW — stacks on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', marginBottom: '20px' }}>
            {/* DONUT */}
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e9d5ff' }}>Invoice Status</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', marginBottom: '16px' }}>Breakdown by payment status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '32px', flexWrap: 'wrap' as const }}>
                <div style={{ position: 'relative', width: isMobile ? '140px' : '180px', height: isMobile ? '140px' : '180px', flexShrink: 0 }}>
                  <canvas ref={canvasRef} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#f3e8ff', lineHeight: 1 }}>{total}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Total</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  {[
                    { label: 'Paid',    count: paid,    color: '#10b981', amount: totalRevenue },
                    { label: 'Pending', count: pending,  color: '#f59e0b', amount: pendingAmount },
                    { label: 'Overdue', count: overdue,  color: '#ef4444', amount: overdueAmount },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#e9d5ff' }}>{item.label}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>₹{item.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'Syne',sans-serif", color: item.color }}>
                        {item.count}<span style={{ fontSize: '11px', fontWeight: 400, color: '#6b7280' }}>{total > 0 ? ` (${Math.round((item.count / total) * 100)}%)` : ' (0%)'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Collection rate */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Collection Rate</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>{total > 0 ? Math.round((paid / total) * 100) : 0}% collected</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(139,92,246,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? (paid / total) * 100 : 0}%`, background: 'linear-gradient(90deg,#7c3aed,#10b981)', borderRadius: '99px' }} />
                </div>
              </div>
              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '16px' }}>
                {[
                  { label: 'Avg Invoice', value: total > 0 ? `₹${Math.round((totalRevenue + pendingAmount + overdueAmount) / total).toLocaleString()}` : '₹0' },
                  { label: 'At Risk', value: `₹${overdueAmount.toLocaleString()}`, red: overdueAmount > 0 },
                  { label: 'Success Rate', value: `${total > 0 ? Math.round((paid / total) * 100) : 0}%` },
                ].map(st => (
                  <div key={st.label} style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{st.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'Syne',sans-serif", color: (st as any).red ? '#f87171' : '#e9d5ff' }}>{st.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' }}>
                <SparkleIcon />
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e9d5ff' }}>AI Insights</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {insightLines.length > 0 ? insightLines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{insightEmojis[i] || '💡'}</span>
                    <span style={{ fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 }}>{line.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' as const, padding: '20px 0' }}>Add invoices to get AI insights</div>
                )}
              </div>
              <button style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#a78bfa', fontSize: '12px', fontWeight: 500, padding: '9px', cursor: 'pointer', width: '100%' }}>
                View full report →
              </button>
            </div>
          </div>

          {/* RECENT INVOICES */}
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e9d5ff', marginBottom: '16px' }}>Recent Invoices</div>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>No invoices yet.</div>
            ) : isMobile ? (
              // MOBILE: card list
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {invoices.slice(0, 6).map((inv, i) => (
                  <div key={i} style={{ background: 'rgba(124,58,237,0.06)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(124,58,237,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#e9d5ff' }}>{(inv.client as any).name || 'Unknown'}</div>
                      <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const, ...statusStyle(inv.status) }}>{inv.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#c4b5fd' }}>₹{inv.totalAmount.toLocaleString()}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // DESKTOP: table
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Client', 'Amount', 'Status', 'Due Date'].map(h => <th key={h} style={{ textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 6).map((inv, i) => (
                    <tr key={i} className="invoice-row" style={{ transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 0', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `hsl(${(inv.client as any).name?.charCodeAt(0) * 5 || 0},60%,25%)`, color: `hsl(${(inv.client as any).name?.charCodeAt(0) * 5 || 0},80%,70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                            {(inv.client as any).name?.[0] || '?'}
                          </div>
                          {(inv.client as any).name || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 0', fontSize: '13.5px', fontWeight: 500, color: '#e9d5ff', borderBottom: '1px solid rgba(139,92,246,0.07)' }}>₹{inv.totalAmount.toLocaleString()}</td>
                      <td style={{ padding: '14px 0', borderBottom: '1px solid rgba(139,92,246,0.07)' }}><span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const, ...statusStyle(inv.status) }}>{inv.status}</span></td>
                      <td style={{ padding: '14px 0', fontSize: '13.5px', color: '#6b7280', borderBottom: '1px solid rgba(139,92,246,0.07)' }}>{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
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

function DollarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function ClockIcon()  { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function AlertIcon()  { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function DocIcon()    { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function SparkleIcon(){ return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }