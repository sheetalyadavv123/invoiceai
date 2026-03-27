import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../lib/axiosInstance';

export default function Settings() {
  const { user, setUser, token } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState({ overdueAlerts: true, paymentReceived: true, weeklyReport: false, aiInsights: true });

  const handleProfileSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await axiosInstance.put('/auth/profile', form);
      setUser(res.data.user, token!);
      setSuccess('Profile updated successfully');
    } catch { setError('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await axiosInstance.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { setError('Failed to change password. Check current password.'); }
    finally { setSaving(false); }
  };

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Settings</h1>
        <p style={s.sub}>Manage your account preferences</p>
      </div>

      <div style={s.layout}>
        {/* TABS */}
        <div style={s.tabList}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as any); setError(''); setSuccess(''); }}
              style={{ ...s.tabBtn, background: tab === t.id ? 'rgba(124,58,237,0.15)' : 'transparent', color: tab === t.id ? '#c4b5fd' : '#6b7280', boxShadow: tab === t.id ? 'inset 3px 0 0 #7c3aed' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={s.content}>
          {success && <div style={s.successBanner}>{success}</div>}
          {error && <div style={s.errBanner}>{error}</div>}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div style={s.card}>
              <div style={s.cardTitle}>Profile Information</div>
              <div style={s.cardSub}>Update your name and email address</div>

              <div style={s.avatarSection}>
                <div style={s.avatarLg}>{user?.name?.[0] || 'U'}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#e9d5ff' }}>{user?.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{user?.email}</div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px', textTransform: 'capitalize' as const }}>{user?.role}</div>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input}
                    onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={s.input} type="email"
                    onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Member Since</label>
                <input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} disabled style={{ ...s.input, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>

              <button onClick={handleProfileSave} disabled={saving} style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          )}

          {/* SECURITY TAB */}
          {tab === 'security' && (
            <div style={s.card}>
              <div style={s.cardTitle}>Change Password</div>
              <div style={s.cardSub}>Keep your account secure with a strong password</div>
              <div style={s.divider} />
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirmPassword' },
              ].map(f => (
                <div key={f.key} style={{ ...s.field, marginBottom: '14px' }}>
                  <label style={s.label}>{f.label}</label>
                  <input type="password" value={pwForm[f.key as keyof typeof pwForm]}
                    onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={s.input}
                    onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'} />
                </div>
              ))}
              <button onClick={handlePasswordSave} disabled={saving} style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Updating...' : 'Update Password'}</button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {tab === 'notifications' && (
            <div style={s.card}>
              <div style={s.cardTitle}>Notification Preferences</div>
              <div style={s.cardSub}>Control what alerts you receive</div>
              <div style={s.divider} />
              {[
                { key: 'overdueAlerts', label: 'Overdue Invoice Alerts', desc: 'Get notified when an invoice becomes overdue' },
                { key: 'paymentReceived', label: 'Payment Received', desc: 'Notification when a client marks a payment' },
                { key: 'weeklyReport', label: 'Weekly Financial Report', desc: 'AI-generated weekly summary of your finances' },
                { key: 'aiInsights', label: 'AI Insights', desc: 'Proactive suggestions from the AI engine' },
              ].map(n => (
                <div key={n.key} style={s.notifRow}>
                  <div>
                    <div style={s.notifLabel}>{n.label}</div>
                    <div style={s.notifDesc}>{n.desc}</div>
                  </div>
                  <div onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifications] }))}
                    style={{ ...s.toggle, background: notifications[n.key as keyof typeof notifications] ? '#7c3aed' : 'rgba(139,92,246,0.15)' }}>
                    <div style={{ ...s.toggleThumb, transform: notifications[n.key as keyof typeof notifications] ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </div>
                </div>
              ))}
              <button onClick={() => setSuccess('Notification preferences saved')} style={s.saveBtn}>Save Preferences</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', minHeight: '100vh' },
  header: { marginBottom: '28px' },
  title: { fontFamily: "'Syne',sans-serif", fontSize: '24px', fontWeight: 800, color: '#f3e8ff', letterSpacing: '-0.5px' },
  sub: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  layout: { display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', alignItems: 'start' },
  tabList: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' },
  tabBtn: { padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, fontSize: '13.5px', fontWeight: 500, transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif" },
  content: { display: 'flex', flexDirection: 'column', gap: '16px' },
  successBanner: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#34d399', fontSize: '13px', padding: '10px 14px' },
  errBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', padding: '10px 14px' },
  card: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: '#e9d5ff' },
  cardSub: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  divider: { height: '1px', background: 'rgba(139,92,246,0.12)', margin: '20px 0' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(124,58,237,0.08)', borderRadius: '12px', marginTop: '16px' },
  avatarLg: { width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#e9d5ff', flexShrink: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 500, color: 'rgba(196,181,253,0.7)' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: '#e9d5ff', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  saveBtn: { marginTop: '20px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '11px 24px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.4)', fontFamily: "'DM Sans',sans-serif", width: 'fit-content' },
  notifRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(139,92,246,0.08)' },
  notifLabel: { fontSize: '13.5px', color: '#e9d5ff', fontWeight: 500 },
  notifDesc: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleThumb: { position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
};