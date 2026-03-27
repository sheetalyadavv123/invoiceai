import { useEffect, useState } from 'react';
import { getInvoices, createInvoice, deleteInvoice } from '../../api/invoices';
import { getClients } from '../../api/clients';

interface InvoiceItem { description: string; quantity: number; price: number; }
interface Invoice { _id: string; client: { _id: string; name: string } | string; amount: number; status: 'paid' | 'pending' | 'overdue'; dueDate: string; items: InvoiceItem[]; notes?: string; }
interface Client { _id: string; name: string; email: string; }

const statusStyle = (s: string): React.CSSProperties => ({
  paid:    { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
  pending: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
  overdue: { background: 'rgba(239,68,68,0.12)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
}[s] as React.CSSProperties);

const EMPTY_FORM = { clientId: '', amount: '', dueDate: '', notes: '', status: 'pending', items: [{ description: '', quantity: 1, price: 0 }] };

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    Promise.all([getInvoices(), getClients()])
      .then(([inv, cli]) => { setInvoices(inv); setClients(cli); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = invoices.filter(inv => {
    const clientName = typeof inv.client === 'object' ? inv.client.name : '';
    const matchSearch = clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAddItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, price: 0 }] }));
  const handleItemChange = (i: number, field: string, val: string | number) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: val };
    setForm(f => ({ ...f, items }));
  };
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const calcTotal = () => form.items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.price)), 0);

  const handleSubmit = async () => {
    if (!form.clientId || !form.dueDate) { setError('Client and due date are required'); return; }
    setSaving(true); setError('');
    try {
      const created = await createInvoice({ client: form.clientId, amount: calcTotal(), dueDate: form.dueDate, notes: form.notes, status: form.status as 'pending', items: form.items });
      setInvoices(prev => [created, ...prev]);
      setShowModal(false); setForm(EMPTY_FORM);
    } catch { setError('Failed to create invoice'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try { await deleteInvoice(id); setInvoices(prev => prev.filter(i => i._id !== id)); }
    catch { setError('Failed to delete'); }
  };

  return (
    <div style={s.page}>
      <style>{`.action-btn:hover{opacity:1!important} .row-del:hover{color:#f87171!important} .inv-row:hover{background:rgba(139,92,246,0.06)!important}`}</style>

      {/* HEADER */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Invoices</h1>
          <p style={s.sub}>{invoices.length} total invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} style={s.createBtn}>+ New Invoice</button>
      </div>

      {/* FILTERS */}
      <div style={s.filterBar}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client..." style={s.searchInput} />
        <div style={s.filterGroup}>
          {['all', 'paid', 'pending', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{ ...s.filterBtn, background: filterStatus === f ? 'rgba(124,58,237,0.25)' : 'transparent', color: filterStatus === f ? '#c4b5fd' : '#6b7280', border: filterStatus === f ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent' }}>{f}</button>
          ))}
        </div>
      </div>

      {error && <div style={s.errBanner}>{error}</div>}

      {/* TABLE */}
      <div style={s.tableWrap}>
        {loading ? <div style={s.loading}>Loading invoices...</div> : (
          <table style={s.table}>
            <thead>
              <tr>{['Client', 'Amount', 'Status', 'Due Date', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#4b5563', padding: '40px' }}>No invoices found</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv._id} className="inv-row" style={{ transition: 'background 0.15s' }}>
                  <td style={s.td}>
                    <div style={s.clientCell}>
                      <div style={{ ...s.avatar, background: `hsl(${(typeof inv.client === 'object' ? inv.client.name : '').charCodeAt(0) * 5},60%,25%)`, color: `hsl(${(typeof inv.client === 'object' ? inv.client.name : '').charCodeAt(0) * 5},80%,70%)` }}>
                        {typeof inv.client === 'object' ? inv.client.name[0] : '?'}
                      </div>
                      {typeof inv.client === 'object' ? inv.client.name : inv.client}
                    </div>
                  </td>
                  <td style={{ ...s.td, color: '#e9d5ff', fontWeight: 500 }}>${inv.amount.toLocaleString()}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...statusStyle(inv.status) }}>{inv.status}</span></td>
                  <td style={{ ...s.td, color: '#6b7280' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button className="row-del" onClick={() => handleDelete(inv._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '18px', transition: 'color 0.15s' }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>New Invoice</h2>
              <button onClick={() => setShowModal(false)} style={s.closeBtn}>×</button>
            </div>

            <div style={s.modalBody}>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Client *</label>
                  <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} style={s.select}>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={s.input} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Line Items</label>
                {form.items.map((item, i) => (
                  <div key={i} style={s.itemRow}>
                    <input placeholder="Description" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} style={{ ...s.input, flex: 2 }} />
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} style={{ ...s.input, flex: '0 0 64px' }} min={1} />
                    <input type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(i, 'price', e.target.value)} style={{ ...s.input, flex: 1 }} min={0} />
                    {form.items.length > 1 && <button onClick={() => removeItem(i)} style={s.removeBtn}>×</button>}
                  </div>
                ))}
                <button onClick={handleAddItem} style={s.addItemBtn}>+ Add item</button>
              </div>

              <div style={s.totalRow}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Total</span>
                <span style={{ color: '#e9d5ff', fontWeight: 600, fontSize: '18px' }}>${calcTotal().toLocaleString()}</span>
              </div>

              <div style={s.field}>
                <label style={s.label}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." style={{ ...s.input, height: '72px', resize: 'none' }} />
              </div>

              {error && <div style={s.errBanner}>{error}</div>}
            </div>

            <div style={s.modalFooter}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating...' : 'Create Invoice'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontFamily: "'Syne',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  sub: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  createBtn: { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '10px 18px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(109,40,217,0.4)' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const },
  searchInput: { flex: 1, minWidth: '200px', padding: '9px 14px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif" },
  filterGroup: { display: 'flex', gap: '4px' },
  filterBtn: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' as const, transition: 'all 0.15s' },
  errBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', marginBottom: '16px' },
  tableWrap: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', overflow: 'hidden' },
  loading: { padding: '48px', textAlign: 'center', color: '#6b7280', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left' as const, fontSize: '11px', fontWeight: 500, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.8px', padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.1)' },
  td: { padding: '14px 20px', fontSize: '13.5px', color: '#c4b5fd', borderBottom: '1px solid rgba(139,92,246,0.07)' },
  clientCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
  modal: { background: '#100c22', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(139,92,246,0.12)' },
  modalTitle: { fontFamily: "'Syne',sans-serif", fontSize: '18px', fontWeight: 700, color: '#f3e8ff' },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '22px', cursor: 'pointer', lineHeight: 1 },
  modalBody: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid rgba(139,92,246,0.12)', display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 500, color: 'rgba(196,181,253,0.7)' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '10px 12px', background: '#100c22', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif" },
  itemRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' },
  removeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '18px', cursor: 'pointer', flexShrink: 0, lineHeight: 1 },
  addItemBtn: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '8px', color: '#a78bfa', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', marginTop: '4px', fontFamily: "'DM Sans',sans-serif" },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.15)' },
  cancelBtn: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#c4b5fd', fontSize: '13px', fontWeight: 500, padding: '9px 20px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  submitBtn: { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '9px 20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.4)', fontFamily: "'DM Sans',sans-serif" },
};