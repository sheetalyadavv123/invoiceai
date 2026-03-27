import { useEffect, useState } from 'react';
import { getPaymentHistory } from '../../api/payments';

interface Payment {
  _id: string;
  invoice: { _id: string; totalAmount: number; invoiceNumber: string } | string;
  client: { _id: string; name: string } | string;
  amount: number;
  date: string;
  method: string;
}

const METHOD_COLORS: Record<string, React.CSSProperties> = {
  cash:          { background: 'rgba(16,185,129,0.12)',  color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
  bank_transfer: { background: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' },
  card:          { background: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' },
  upi:           { background: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
  other:         { background: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.25)' },
};
const methodStyle = (m: string) => METHOD_COLORS[m] || METHOD_COLORS['other'];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    getPaymentHistory()
      .then(setPayments)
      .catch(() => setError('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p => {
    const matchMethod = filterMethod === 'all' || p.method === filterMethod;
    const clientName = typeof p.client === 'object' ? p.client.name.toLowerCase() : '';
    const matchSearch = search === '' || clientName.includes(search.toLowerCase()) || p.method.includes(search.toLowerCase());
    return matchMethod && matchSearch;
  });

  const methods = ['all', ...Array.from(new Set(payments.map(p => p.method)))];

  const getInvoiceNumber = (invoice: Payment['invoice']) => {
    if (typeof invoice === 'object') return invoice.invoiceNumber || invoice._id.slice(-6).toUpperCase();
    return String(invoice).slice(-6).toUpperCase();
  };

  const getClientName = (client: Payment['client']) => {
    if (typeof client === 'object') return client.name;
    return 'Unknown';
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .pay-row:hover{background:rgba(139,92,246,0.06)!important}
        .filter-btn:hover{background:rgba(139,92,246,0.15)!important}
      `}</style>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>Payments</h1>
          <p style={s.sub}>{payments.length} total records</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Collected', val: `₹${totalRevenue.toLocaleString()}`, color: '#7c3aed' },
          {
            label: 'This Month',
            val: `₹${payments
              .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString()}`,
            color: '#10b981',
          },
          { label: 'Transactions', val: payments.length.toString(), color: '#f59e0b' },
          {
            label: 'Avg Payment',
            val: payments.length ? `₹${Math.round(totalRevenue / payments.length).toLocaleString()}` : '₹0',
            color: '#8b5cf6',
          },
        ].map(card => (
          <div key={card.label} style={s.statCard}>
            <div style={s.statValue}>{card.val}</div>
            <div style={s.statLabel}>{card.label}</div>
            <div style={{ ...s.statBar, background: card.color }} />
          </div>
        ))}
      </div>

      {error && <div style={s.errBanner}>{error}</div>}

      {/* FILTERS */}
      <div style={s.filterBar}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by client or method..."
          style={s.searchInput}
        />
        <div style={s.filterGroup}>
          {methods.map(m => (
            <button
              key={m}
              className="filter-btn"
              onClick={() => setFilterMethod(m)}
              style={{
                ...s.filterBtn,
                background: filterMethod === m ? 'rgba(124,58,237,0.25)' : 'transparent',
                color: filterMethod === m ? '#c4b5fd' : '#6b7280',
                border: filterMethod === m ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              }}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loading}>Loading payments...</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Client', 'Invoice', 'Amount', 'Method', 'Date'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#4b5563', padding: '40px' }}>
                    No payments found
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="pay-row" style={{ transition: 'background 0.15s' }}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600,
                        background: `hsl(${getClientName(p.client).charCodeAt(0) * 5},60%,25%)`,
                        color: `hsl(${getClientName(p.client).charCodeAt(0) * 5},80%,70%)`,
                        flexShrink: 0,
                      }}>
                        {getClientName(p.client)[0]}
                      </div>
                      <span style={{ fontSize: '13px', color: '#c4b5fd' }}>{getClientName(p.client)}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: '#6b7280', fontSize: '12px' }}>
                    #{getInvoiceNumber(p.invoice)}
                  </td>
                  <td style={{ ...s.td, color: '#34d399', fontWeight: 600 }}>
                    +₹{p.amount.toLocaleString()}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...methodStyle(p.method) }}>
                      {p.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: '#6b7280' }}>
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontFamily: "'Syne',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  sub: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden' },
  statValue: { fontFamily: "'Syne',sans-serif", fontSize: '22px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
  statBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', opacity: 0.6 },
  errBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', marginBottom: '16px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const },
  searchInput: { flex: 1, minWidth: '200px', padding: '9px 14px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif" },
  filterGroup: { display: 'flex', gap: '4px', flexWrap: 'wrap' as const },
  filterBtn: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' as const, transition: 'all 0.15s' },
  tableWrap: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', overflow: 'hidden' },
  loading: { padding: '48px', textAlign: 'center', color: '#6b7280', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  td: { padding: '14px 20px', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
};