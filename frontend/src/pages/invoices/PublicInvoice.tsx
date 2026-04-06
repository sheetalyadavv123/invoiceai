import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPublicInvoice, markAsPaid } from '../../api/invoices';

interface InvoiceItem { description: string; quantity: number; price: number; }
interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: { name: string; email: string; phone?: string; address?: string };
  user: { name: string; email: string };
  items: InvoiceItem[];
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export default function PublicInvoice() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getPublicInvoice(id)
      .then(data => {
        setInvoice(data);
        setPaid(data.status === 'paid');
      })
      .catch(() => setError('Invoice not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkPaid = async () => {
    if (!id) return;
    setPaying(true);
    try {
      await markAsPaid(id);
      setPaid(true);
      if (invoice) setInvoice({ ...invoice, status: 'paid' });
    } catch {
      setError('Failed to update payment status');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div style={s.root}>
      <div style={s.centerWrap}>
        <div style={s.spinner} />
        <span style={{ color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>Loading invoice...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !invoice) return (
    <div style={s.root}>
      <div style={s.centerWrap}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h2 style={{ color: '#f3e8ff', fontFamily: "'Syne',sans-serif", margin: '0 0 8px' }}>Invoice not found</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>This invoice may have been deleted or the link is invalid.</p>
      </div>
    </div>
  );

  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const createdAt = new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const isOverdue = invoice.status === 'overdue' && !paid;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={s.card}>

        {/* PREVIEW BANNER */}
        {isPreview && (
          <div style={s.previewBanner}>
            <span style={{ fontSize: '14px' }}>👁</span>
            Preview mode — this is exactly how your client will see this invoice
          </div>
        )}

        {/* HEADER */}
        <div style={s.cardHeader}>
          <div>
            <div style={s.logo}>Invoi</div>
            <div style={s.logoSub}>AI-Powered Invoice Platform</div>
          </div>
          <div style={{
            ...s.statusBadge,
            background: paid ? 'rgba(16,185,129,0.15)' : isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
            color: paid ? '#34d399' : isOverdue ? '#f87171' : '#fbbf24',
            border: `1px solid ${paid ? 'rgba(16,185,129,0.3)' : isOverdue ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            {paid ? '✓ Paid' : isOverdue ? '⚠ Overdue' : '○ Pending'}
          </div>
        </div>

        {/* META ROW */}
        <div style={s.metaRow}>
          {[
            { label: 'Invoice no.', value: invoice.invoiceNumber },
            { label: 'Issue date', value: createdAt },
            { label: 'Due date', value: dueDate, red: isOverdue },
            { label: 'Amount due', value: `₹${invoice.totalAmount.toLocaleString()}`, purple: true },
          ].map(m => (
            <div key={m.label} style={s.metaCard}>
              <div style={s.metaLabel}>{m.label}</div>
              <div style={{
                ...s.metaValue,
                color: m.purple ? '#a78bfa' : m.red ? '#f87171' : '#f3e8ff',
                fontSize: m.purple ? '20px' : '15px',
              }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* FROM / TO */}
        <div style={s.partiesRow}>
          <div style={s.partyBox}>
            <div style={s.partyLabel}>From</div>
            <div style={s.partyName}>{invoice.user.name}</div>
            <div style={s.partyDetail}>{invoice.user.email}</div>
          </div>
          <div style={s.partyBox}>
            <div style={s.partyLabel}>Bill to</div>
            <div style={s.partyName}>{invoice.client.name}</div>
            <div style={s.partyDetail}>{invoice.client.email}</div>
            {invoice.client.phone && <div style={s.partyDetail}>{invoice.client.phone}</div>}
            {invoice.client.address && <div style={s.partyDetail}>{invoice.client.address}</div>}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={{ background: 'rgba(124,58,237,0.15)' }}>
                {['Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                  <td style={s.td}>{item.description}</td>
                  <td style={{ ...s.td, textAlign: 'center' as const }}>{item.quantity}</td>
                  <td style={{ ...s.td, textAlign: 'right' as const }}>₹{item.price.toLocaleString()}</td>
                  <td style={{ ...s.td, textAlign: 'right' as const, color: '#e9d5ff', fontWeight: 500 }}>
                    ₹{(item.quantity * item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div style={s.totalRow}>
          <span style={{ color: '#c4b5fd', fontSize: '14px' }}>Total Amount</span>
          <span style={{ color: '#f3e8ff', fontSize: '24px', fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>
            ₹{invoice.totalAmount.toLocaleString()}
          </span>
        </div>

        {/* NOTES */}
        {invoice.notes && (
          <div style={s.notesBox}>
            <div style={s.notesLabel}>Notes</div>
            <div style={s.notesText}>{invoice.notes}</div>
          </div>
        )}

        {error && (
          <div style={s.errBox}>{error}</div>
        )}

        {/* PREVIEW MODE — no action button */}
        {isPreview && (
          <div style={s.previewFooterNote}>
            <span style={{ fontSize: '16px' }}>🔒</span>
            The "Mark as Paid" button will appear here for your client
          </div>
        )}

        {/* CLIENT MODE — show mark as paid */}
        {!isPreview && !paid && (
          <button
            onClick={handleMarkPaid}
            disabled={paying}
            style={{ ...s.payBtn, opacity: paying ? 0.7 : 1 }}
          >
            {paying ? 'Processing...' : '✓ Mark as Paid'}
          </button>
        )}

        {!isPreview && paid && (
          <div style={s.paidBanner}>
            ✓ This invoice has been marked as paid. Thank you!
          </div>
        )}

        {/* FOOTER */}
        <div style={s.footer}>
          Generated by Invoi — AI-Powered Invoice Platform
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#0d0a1a', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', fontFamily: "'DM Sans',sans-serif" },
  centerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(124,58,237,0.3)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  card: { width: '100%', maxWidth: '720px', background: '#110d24', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', overflow: 'hidden' },
  previewBanner: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(124,58,237,0.12)', borderBottom: '1px solid rgba(124,58,237,0.2)', padding: '12px 40px', fontSize: '13px', color: '#c4b5fd', fontWeight: 500 },
  cardHeader: { background: 'linear-gradient(135deg,#1a1035,#2d1b69)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontFamily: "'Syne',sans-serif", fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  logoSub: { fontSize: '12px', color: '#a78bfa', marginTop: '4px' },
  statusBadge: { fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '20px' },
  metaRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  metaCard: { background: '#110d24', padding: '20px 24px' },
  metaLabel: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' },
  metaValue: { fontSize: '15px', fontWeight: 600 },
  partiesRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  partyBox: { background: '#110d24', padding: '24px 40px' },
  partyLabel: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' },
  partyName: { fontSize: '16px', fontWeight: 600, color: '#f3e8ff', marginBottom: '4px' },
  partyDetail: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  tableWrap: { padding: '0 40px', marginTop: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '12px', overflow: 'hidden' },
  th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#c4b5fd', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  td: { padding: '14px 16px', fontSize: '13.5px', color: '#c4b5fd' },
  totalRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', marginTop: '8px', borderTop: '1px solid rgba(139,92,246,0.12)' },
  notesBox: { margin: '0 40px 8px', padding: '16px 20px', background: 'rgba(124,58,237,0.07)', borderRadius: '10px', borderLeft: '3px solid rgba(124,58,237,0.4)' },
  notesLabel: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' },
  notesText: { fontSize: '13px', color: '#c4b5fd', lineHeight: 1.6 },
  errBox: { margin: '0 40px 8px', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px' },
  previewFooterNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '24px 40px', padding: '16px 20px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', color: '#a78bfa', fontSize: '13px', fontWeight: 500 },
  payBtn: { display: 'block', width: 'calc(100% - 80px)', margin: '24px 40px', padding: '16px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 24px rgba(109,40,217,0.4)', transition: 'opacity 0.2s' },
  paidBanner: { margin: '24px 40px', padding: '16px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', color: '#34d399', fontSize: '14px', fontWeight: 500, textAlign: 'center' as const },
  footer: { padding: '20px 40px', textAlign: 'center' as const, color: '#4b5563', fontSize: '12px', borderTop: '1px solid rgba(139,92,246,0.08)', marginTop: '8px' },
};