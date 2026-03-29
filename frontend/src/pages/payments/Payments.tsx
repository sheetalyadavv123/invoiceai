import { useEffect, useState } from 'react';
import { getPaymentHistory } from '../../api/payments';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Payment { _id: string; invoiceId: any; amount: number; date: string; method: string; }

const methodStyle = (m: string): React.CSSProperties => ({
  cash:          { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
  bank_transfer: { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' },
  card:          { background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' },
  cheque:        { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
}[m] || { background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' });

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getPaymentHistory()
      .then(setPayments)
      .catch(() => setError('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const thisMonth = payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: isMobile ? '16px' : '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' }}>Payments</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{payments.length} total records</p>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? '10px' : '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total Collected', val: `₹${total.toLocaleString()}`, color: '#7c3aed' },
          { label: 'This Month', val: `₹${thisMonth.toLocaleString()}`, color: '#10b981' },
          { label: 'Transactions', val: String(payments.length), color: '#f59e0b' },
          { label: 'Avg Payment', val: payments.length ? `₹${Math.round(total / payments.length).toLocaleString()}` : '₹0', color: '#8b5cf6' },
        ].map(card => (
          <div key={card.label} style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: isMobile ? '14px' : '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' }}>{card.val}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{card.label}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: card.color, opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', marginBottom: '16px' }}>{error}</div>}

      {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      : payments.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>No payments recorded yet.</div>
      : isMobile ? (
        // MOBILE CARD LIST
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {payments.map(p => (
            <div key={p._id} style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#c4b5fd', fontWeight: 500 }}>
                    {typeof p.invoiceId === 'object' && p.invoiceId?.client ? (p.invoiceId.client as any).name : 'Invoice'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                    #{typeof p.invoiceId === 'object' ? p.invoiceId._id?.slice(-6).toUpperCase() : String(p.invoiceId).slice(-6).toUpperCase()}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const, ...methodStyle(p.method) }}>
                  {p.method.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>+₹{p.amount.toLocaleString()}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(p.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // DESKTOP TABLE
        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Invoice', 'Amount', 'Method', 'Date'].map(h => <th key={h} style={{ textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td style={{ padding: '14px 20px', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' }}>
                    <div style={{ fontSize: '13px', color: '#c4b5fd' }}>{typeof p.invoiceId === 'object' && p.invoiceId?.client ? (p.invoiceId.client as any).name : 'Invoice'}</div>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>#{typeof p.invoiceId === 'object' ? p.invoiceId._id?.slice(-6).toUpperCase() : String(p.invoiceId).slice(-6).toUpperCase()}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13.5px', color: '#34d399', fontWeight: 600, borderBottom: '1px solid rgba(139,92,246,0.07)' }}>+₹{p.amount.toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.07)' }}><span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const, ...methodStyle(p.method) }}>{p.method.replace('_', ' ')}</span></td>
                  <td style={{ padding: '14px 20px', fontSize: '13.5px', color: '#6b7280', borderBottom: '1px solid rgba(139,92,246,0.07)' }}>{new Date(p.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}