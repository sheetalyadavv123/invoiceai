import { useEffect, useState } from 'react';
import { getClients, createClient, deleteClient } from '../../api/clients';
import { getInvoices } from '../../api/invoices';

interface Client { _id: string; name: string; email: string; phone: string; payScore?: number; }
interface Invoice { _id: string; client: { _id: string; name: string } | string; amount: number; status: string; dueDate: string; }

const statusStyle = (s: string): React.CSSProperties => ({
  paid:    { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
  pending: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
  overdue: { background: 'rgba(239,68,68,0.12)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
}[s] as React.CSSProperties);

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getClients(), getInvoices()])
      .then(([c, i]) => { setClients(c); setInvoices(i); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const clientInvoices = (clientId: string) =>
    invoices.filter(inv => typeof inv.client === 'object' ? inv.client._id === clientId : inv.client === clientId);

  const clientTotal = (clientId: string) =>
    clientInvoices(clientId).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.name || !form.email) { setError('Name and email required'); return; }
    setSaving(true); setError('');
    try {
      const c = await createClient(form);
      setClients(prev => [c, ...prev]);
      setShowModal(false); setForm({ name: '', email: '', phone: '' });
    } catch { setError('Failed to create client'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { setError('Failed to delete client'); }
  };

  return (
    <div style={s.page}>
      <style>{`.cli-card:hover{background:rgba(139,92,246,0.1)!important;border-color:rgba(139,92,246,0.3)!important}`}</style>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>Clients</h1>
          <p style={s.sub}>{clients.length} total clients</p>
        </div>
        <button onClick={() => setShowModal(true)} style={s.createBtn}>+ New Client</button>
      </div>

      {error && <div style={s.errBanner}>{error}</div>}

      <div style={s.layout}>
        {/* LEFT: CLIENT LIST */}
        <div style={s.listPanel}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={s.searchInput} />
          {loading ? <div style={s.loading}>Loading...</div> : (
            <div style={s.cardList}>
              {filtered.length === 0 ? <div style={s.empty}>No clients found</div> : filtered.map(c => (
                <div key={c._id} className="cli-card" onClick={() => setSelected(c)} style={{ ...s.clientCard, borderColor: selected?._id === c._id ? 'rgba(124,58,237,0.5)' : 'rgba(139,92,246,0.12)', background: selected?._id === c._id ? 'rgba(124,58,237,0.12)' : 'rgba(139,92,246,0.06)' }}>
                  <div style={s.clientCardLeft}>
                    <div style={{ ...s.avatar, background: `hsl(${c.name.charCodeAt(0) * 5},60%,25%)`, color: `hsl(${c.name.charCodeAt(0) * 5},80%,70%)` }}>{c.name[0]}</div>
                    <div>
                      <div style={s.clientName}>{c.name}</div>
                      <div style={s.clientEmail}>{c.email}</div>
                    </div>
                  </div>
                  <div style={s.clientCardRight}>
                    <div style={s.clientTotal}>${clientTotal(c._id).toLocaleString()}</div>
                    <div style={s.clientTotalLabel}>paid</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAIL PANEL */}
        <div style={s.detailPanel}>
          {!selected ? (
            <div style={s.emptyDetail}>
              <div style={s.emptyDetailIcon}>👤</div>
              <p style={s.emptyDetailText}>Select a client to view details</p>
            </div>
          ) : (
            <div>
              <div style={s.detailHeader}>
                <div style={{ ...s.avatarLg, background: `hsl(${selected.name.charCodeAt(0) * 5},60%,25%)`, color: `hsl(${selected.name.charCodeAt(0) * 5},80%,70%)` }}>{selected.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.detailName}>{selected.name}</div>
                  <div style={s.detailEmail}>{selected.email}</div>
                  {selected.phone && <div style={s.detailPhone}>{selected.phone}</div>}
                </div>
                <button onClick={() => handleDelete(selected._id)} style={s.deleteBtn}>Delete</button>
              </div>

              {/* STATS */}
              <div style={s.statsRow}>
                {[
                  { label: 'Total Invoices', val: clientInvoices(selected._id).length },
                  { label: 'Paid', val: clientInvoices(selected._id).filter(i => i.status === 'paid').length },
                  { label: 'Pending', val: clientInvoices(selected._id).filter(i => i.status === 'pending').length },
                  { label: 'Overdue', val: clientInvoices(selected._id).filter(i => i.status === 'overdue').length },
                ].map(st => (
                  <div key={st.label} style={s.statBox}>
                    <div style={s.statVal}>{st.val}</div>
                    <div style={s.statLabel}>{st.label}</div>
                  </div>
                ))}
              </div>

              {/* INVOICE HISTORY */}
              <div style={s.sectionTitle}>Invoice History</div>
              {clientInvoices(selected._id).length === 0 ? (
                <div style={s.empty}>No invoices for this client</div>
              ) : clientInvoices(selected._id).map(inv => (
                <div key={inv._id} style={s.invItem}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e9d5ff', fontWeight: 500 }}>${inv.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Due {new Date(inv.dueDate).toLocaleDateString()}</div>
                  </div>
                  <span style={{ ...s.badge, ...statusStyle(inv.status) }}>{inv.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>New Client</h2>
              <button onClick={() => setShowModal(false)} style={s.closeBtn}>×</button>
            </div>
            <div style={s.modalBody}>
              {[{ label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Doe' }, { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@example.com' }, { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1 234 567 8900' }].map(f => (
                <div key={f.key} style={s.field}>
                  <label style={s.label}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={s.input} />
                </div>
              ))}
              {error && <div style={s.errBanner}>{error}</div>}
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating...' : 'Create Client'}</button>
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
  errBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px', marginBottom: '16px' },
  layout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' },
  listPanel: { display: 'flex', flexDirection: 'column', gap: '12px' },
  searchInput: { width: '100%', padding: '9px 14px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' as const },
  cardList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  clientCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s' },
  clientCardLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  clientCardRight: { textAlign: 'right' as const },
  avatar: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 },
  clientName: { fontSize: '13.5px', fontWeight: 500, color: '#e9d5ff' },
  clientEmail: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  clientTotal: { fontSize: '13px', fontWeight: 600, color: '#a78bfa' },
  clientTotalLabel: { fontSize: '10px', color: '#6b7280' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  empty: { padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '13px' },
  detailPanel: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '24px', minHeight: '400px' },
  emptyDetail: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' },
  emptyDetailIcon: { fontSize: '40px', opacity: 0.3 },
  emptyDetailText: { color: '#4b5563', fontSize: '14px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(139,92,246,0.12)' },
  avatarLg: { width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, flexShrink: 0 },
  detailName: { fontFamily: "'Syne',sans-serif", fontSize: '18px', fontWeight: 700, color: '#f3e8ff' },
  detailEmail: { fontSize: '13px', color: '#a78bfa', marginTop: '2px' },
  detailPhone: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginLeft: 'auto' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' },
  statBox: { background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' as const },
  statVal: { fontFamily: "'Syne',sans-serif", fontSize: '20px', fontWeight: 700, color: '#c4b5fd' },
  statLabel: { fontSize: '11px', color: '#6b7280', marginTop: '2px' },
  sectionTitle: { fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: '12px' },
  invItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(139,92,246,0.04)', borderRadius: '10px', marginBottom: '8px', border: '1px solid rgba(139,92,246,0.08)' },
  badge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' as const },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#100c22', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', width: '100%', maxWidth: '440px' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(139,92,246,0.12)' },
  modalTitle: { fontFamily: "'Syne',sans-serif", fontSize: '18px', fontWeight: 700, color: '#f3e8ff' },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '22px', cursor: 'pointer', lineHeight: 1 },
  modalBody: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid rgba(139,92,246,0.12)', display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 500, color: 'rgba(196,181,253,0.7)' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' as const },
  cancelBtn: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#c4b5fd', fontSize: '13px', fontWeight: 500, padding: '9px 20px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  submitBtn: { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '9px 20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.4)', fontFamily: "'DM Sans',sans-serif" },
};