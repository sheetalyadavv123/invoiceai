import { useEffect, useState } from 'react';
import { getFinancialInsights, generatePaymentReminder } from '../../api/ai';
import { getInvoices } from '../../api/invoices';

interface Invoice { _id: string; client: { _id: string; name: string } | string; amount: number; status: string; dueDate: string; }

export default function AIInsights() {
  const [insights, setInsights] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getFinancialInsights(), getInvoices()])
      .then(([ins, inv]) => { setInsights(ins.insight || ins.text || JSON.stringify(ins)); setInvoices(inv); })
      .catch(() => setError('Failed to load AI insights'))
      .finally(() => setLoading(false));
  }, []);

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const handleReminder = async (invoiceId: string) => {
    setReminderLoading(invoiceId);
    try {
      const res = await generatePaymentReminder(invoiceId);
      setReminders(prev => ({ ...prev, [invoiceId]: res.reminder || res.text || res }));
    } catch { setError('Failed to generate reminder'); }
    finally { setReminderLoading(null); }
  };

  const parseInsights = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^[-•*]\s*/, '').trim());
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>AI Insights</h1>
          <p style={s.sub}>Powered by Groq — real-time financial intelligence</p>
        </div>
        <div style={s.badge}>
          <span style={s.dot} />
          Live AI
        </div>
      </div>

      {error && <div style={s.errBanner}>{error}</div>}

      <div style={s.grid}>
        {/* FINANCIAL INSIGHTS */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardIcon}>📊</div>
            <div>
              <div style={s.cardTitle}>Financial Summary</div>
              <div style={s.cardSub}>AI-generated analysis of your invoices</div>
            </div>
          </div>
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <span style={s.loadingText}>Analyzing your data with AI...</span>
            </div>
          ) : (
            <div style={s.insightsList}>
              {parseInsights(insights).map((line, i) => (
                <div key={i} style={s.insightItem}>
                  <div style={s.insightDot} />
                  <span style={s.insightText}>{line}</span>
                </div>
              ))}
              {parseInsights(insights).length === 0 && (
                <div style={s.rawText}>{insights}</div>
              )}
            </div>
          )}
        </div>

        {/* OVERDUE REMINDERS */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardIcon}>⚡</div>
            <div>
              <div style={s.cardTitle}>Smart Reminders</div>
              <div style={s.cardSub}>AI-crafted tone-adjusted emails</div>
            </div>
          </div>
          {overdueInvoices.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={s.emptyText}>No overdue invoices — great work!</div>
            </div>
          ) : overdueInvoices.map(inv => (
            <div key={inv._id} style={s.reminderCard}>
              <div style={s.reminderTop}>
                <div>
                  <div style={s.reminderClient}>{typeof inv.client === 'object' ? inv.client.name : 'Client'}</div>
                  <div style={s.reminderAmount}>${inv.amount.toLocaleString()} overdue since {new Date(inv.dueDate).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleReminder(inv._id)}
                  disabled={reminderLoading === inv._id}
                  style={{ ...s.genBtn, opacity: reminderLoading === inv._id ? 0.7 : 1 }}
                >
                  {reminderLoading === inv._id ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {reminders[inv._id] && (
                <div style={s.reminderText}>{reminders[inv._id]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STATS ROW */}
      <div style={s.statsRow}>
        {[
          { icon: '💰', label: 'Total Revenue', val: `$${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}` },
          { icon: '⏳', label: 'Pending', val: `$${invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0).toLocaleString()}` },
          { icon: '🔴', label: 'Overdue', val: `$${invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0).toLocaleString()}` },
          { icon: '📄', label: 'Total Invoices', val: invoices.length.toString() },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statIcon}>{st.icon}</div>
            <div style={s.statVal}>{st.val}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' },
  title: { fontFamily: "'Syne',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  sub: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  badge: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#c4b5fd', fontWeight: 500 },
  dot: { width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', animation: 'pulse 2s infinite' } as React.CSSProperties,
  errBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  card: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '22px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  cardIcon: { fontSize: '22px', lineHeight: 1 },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#e9d5ff' },
  cardSub: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  loadingWrap: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 0' },
  spinner: { width: '18px', height: '18px', border: '2px solid rgba(124,58,237,0.3)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 },
  loadingText: { fontSize: '13px', color: '#6b7280' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  insightItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: 'rgba(124,58,237,0.07)', borderRadius: '10px' },
  insightDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: '5px' },
  insightText: { fontSize: '13px', color: '#c4b5fd', lineHeight: 1.6 },
  rawText: { fontSize: '13px', color: '#c4b5fd', lineHeight: 1.7, whiteSpace: 'pre-wrap' as const },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0' },
  emptyText: { fontSize: '13px', color: '#6b7280' },
  reminderCard: { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' },
  reminderTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' },
  reminderClient: { fontSize: '13.5px', fontWeight: 500, color: '#e9d5ff' },
  reminderAmount: { fontSize: '12px', color: '#f87171', marginTop: '2px' },
  genBtn: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#a78bfa', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', flexShrink: 0, fontFamily: "'DM Sans',sans-serif", transition: 'opacity 0.2s' },
  reminderText: { marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '12px', color: '#c4b5fd', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' },
  statCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: '18px 20px', textAlign: 'center' as const },
  statIcon: { fontSize: '24px', marginBottom: '8px' },
  statVal: { fontFamily: "'Syne',sans-serif", fontSize: '22px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
};