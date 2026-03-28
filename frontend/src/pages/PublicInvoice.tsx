import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface InvoiceItem { description: string; quantity: number; price: number; }
interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: { name: string; email: string; phone?: string };
  items: InvoiceItem[];
  totalAmount: number;
  amount: number;
  status: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export default function PublicInvoice() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/invoices/public/${id}`)
      .then(res => setInvoice(res.data))
      .catch(() => setError('Invoice not found or link has expired.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading invoice...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !invoice) return (
    <div style={s.loadingPage}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
    </div>
  );

  const total = invoice.totalAmount || invoice.amount || 0;
  const invoiceNum = invoice.invoiceNumber || `INV-${invoice._id.slice(-6).toUpperCase()}`;
  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    paid:    { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    overdue: { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  };
  const sc = statusColors[invoice.status] || statusColors.pending;

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header}>
          <div>
            <div style={s.brand}>Invoi</div>
            <div style={s.brandSub}>AI-Powered Invoice Platform</div>
          </div>
          <div style={s.headerRight}>
            <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color, border: sc.border }}>
              {invoice.status.toUpperCase()}
            </span>
            <div style={s.invoiceNum}>{invoiceNum}</div>
          </div>
        </div>

        {/* FROM / TO */}
        <div style={s.parties}>
          <div style={s.party}>
            <div style={s.partyLabel}>FROM</div>
            <div style={s.partyName}>Your Business</div>
            <div style={s.partyDetail}>support@invoi.app</div>
          </div>
          <div style={s.party}>
            <div style={s.partyLabel}>BILL TO</div>
            <div style={s.partyName}>{invoice.client.name}</div>
            <div style={s.partyDetail}>{invoice.client.email}</div>
            {invoice.client.phone && <div style={s.partyDetail}>{invoice.client.phone}</div>}
          </div>
          <div style={s.party}>
            <div style={s.partyLabel}>INVOICE DATE</div>
            <div style={s.partyName}>{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style={s.partyLabel}>DUE DATE</div>
            <div style={{ ...s.partyName, color: invoice.status === 'overdue' ? '#ef4444' : '#111827' }}>
              {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div style={s.divider} />

        {/* ITEMS TABLE */}
        <table style={s.table}>
          <thead>
            <tr style={s.tableHead}>
              <th style={{ ...s.th, textAlign: 'left' }}>Description</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Qty</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Unit Price</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ ...s.td, textAlign: 'left' }}>{item.description}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ ...s.td, textAlign: 'right' }}>₹{item.price.toLocaleString()}</td>
                <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>₹{(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL */}
        <div style={s.totalSection}>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Subtotal</span>
            <span style={s.totalValue}>₹{total.toLocaleString()}</span>
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Tax (0%)</span>
            <span style={s.totalValue}>₹0</span>
          </div>
          <div style={s.divider} />
          <div style={s.grandTotal}>
            <span>Total Due</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* NOTES */}
        {invoice.notes && (
          <div style={s.notes}>
            <div style={s.notesLabel}>Notes</div>
            <div style={s.notesText}>{invoice.notes}</div>
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ ...s.actions }} className="no-print">
          <button onClick={() => window.print()} style={s.printBtn}>🖨️ Print Invoice</button>
        </div>

        {/* FOOTER */}
        <div style={s.footer}>
          <div style={s.footerBrand}>Invoi</div>
          <div style={s.footerText}>Generated by Invoi — AI-Powered Invoice Platform</div>
          <div style={s.footerText}>Questions? Contact support@invoi.app</div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f4f6', padding: '32px 16px', fontFamily: "'DM Sans', sans-serif" },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  spinner: { width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  container: { maxWidth: '720px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' },
  header: { background: 'linear-gradient(135deg, #1a1035, #2d1b69)', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' },
  brandSub: { fontSize: '12px', color: '#a78bfa', marginTop: '4px' },
  headerRight: { textAlign: 'right' as const },
  statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' },
  invoiceNum: { fontSize: '13px', color: '#c4b5fd', fontWeight: 500 },
  parties: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', padding: '32px 40px' },
  party: { display: 'flex', flexDirection: 'column', gap: '4px' },
  partyLabel: { fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: '4px', marginTop: '8px' },
  partyName: { fontSize: '15px', fontWeight: 600, color: '#111827' },
  partyDetail: { fontSize: '13px', color: '#6b7280' },
  divider: { height: '1px', background: '#f0f0f0', margin: '0 40px' },
  table: { width: '100%', borderCollapse: 'collapse', margin: '24px 0 0' },
  tableHead: { background: '#7c3aed' },
  th: { padding: '12px 40px', fontSize: '11px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  td: { padding: '14px 40px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f0f0f0' },
  totalSection: { padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: '10px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: '14px', color: '#6b7280' },
  totalValue: { fontSize: '14px', color: '#374151', fontWeight: 500 },
  grandTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#7c3aed', margin: '8px -40px -24px', padding: '18px 40px', fontSize: '18px', fontWeight: 800, color: '#ffffff' },
  notes: { background: '#f9fafb', margin: '40px 40px 0', borderRadius: '10px', padding: '16px 20px', borderLeft: '3px solid #7c3aed' },
  notesLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' },
  notesText: { fontSize: '14px', color: '#374151', lineHeight: 1.6 },
  actions: { display: 'flex', justifyContent: 'center', padding: '32px 40px 0' },
  printBtn: { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.3)' },
  footer: { background: '#1a1035', padding: '24px 40px', textAlign: 'center' as const, marginTop: '32px' },
  footerBrand: { fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' },
  footerText: { fontSize: '12px', color: '#6b7280', lineHeight: 1.8 },
};