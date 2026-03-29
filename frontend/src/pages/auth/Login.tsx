import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true); setServerError('');
    try { await login(data.email, data.password); navigate('/dashboard'); }
    catch { setServerError('Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ ...s.root, flexDirection: isMobile ? 'column' : 'row' }}>
      {/* LEFT PANEL — hidden on mobile */}
      {!isMobile && (
        <div style={s.leftPanel}>
          <div style={s.orb1} /><div style={s.orb2} /><div style={s.orb3} />
          <div style={s.grid} />
          <div style={s.leftContent}>
            <div style={s.logoMark}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="rgba(139,92,246,0.3)"/><path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa"/><circle cx="20" cy="20" r="3" fill="#7c3aed"/></svg>
              <span style={s.logoText}>Invoi</span>
            </div>
            <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
              <rect x="20" y="40" width="140" height="90" rx="12" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
              <rect x="30" y="55" width="60" height="6" rx="3" fill="rgba(167,139,250,0.6)"/>
              <rect x="30" y="68" width="40" height="4" rx="2" fill="rgba(167,139,250,0.3)"/>
              <rect x="30" y="80" width="100" height="1" rx="1" fill="rgba(139,92,246,0.3)"/>
              <rect x="30" y="90" width="80" height="3" rx="1.5" fill="rgba(167,139,250,0.2)"/>
              <rect x="100" y="108" width="50" height="14" rx="7" fill="rgba(139,92,246,0.5)"/>
              <text x="125" y="119" textAnchor="middle" fontSize="7" fill="#e9d5ff" fontFamily="sans-serif">PAID</text>
              <rect x="110" y="70" width="140" height="90" rx="12" fill="rgba(109,40,217,0.2)" stroke="rgba(139,92,246,0.35)" strokeWidth="1"/>
              <rect x="122" y="85" width="50" height="6" rx="3" fill="rgba(196,181,253,0.5)"/>
              <rect x="122" y="98" width="100" height="1" rx="1" fill="rgba(139,92,246,0.25)"/>
              <rect x="122" y="108" width="80" height="3" rx="1.5" fill="rgba(167,139,250,0.2)"/>
              <rect x="190" y="138" width="50" height="14" rx="7" fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.5)" strokeWidth="1"/>
              <text x="215" y="149" textAnchor="middle" fontSize="7" fill="#fde68a" fontFamily="sans-serif">PENDING</text>
              <rect x="20" y="155" width="240" height="55" rx="10" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
              <rect x="35" y="175" width="18" height="25" rx="4" fill="rgba(139,92,246,0.4)"/>
              <rect x="62" y="165" width="18" height="35" rx="4" fill="rgba(139,92,246,0.6)"/>
              <rect x="89" y="170" width="18" height="30" rx="4" fill="rgba(139,92,246,0.4)"/>
              <rect x="116" y="160" width="18" height="40" rx="4" fill="rgba(167,139,250,0.7)"/>
              <rect x="143" y="168" width="18" height="32" rx="4" fill="rgba(139,92,246,0.5)"/>
              <rect x="170" y="158" width="18" height="42" rx="4" fill="rgba(196,181,253,0.8)"/>
              <rect x="197" y="163" width="18" height="37" rx="4" fill="rgba(139,92,246,0.6)"/>
            </svg>
            <div>
              <h2 style={s.taglineHeading}>Invoicing,<br />reimagined with AI.</h2>
              <p style={s.taglineSub}>Smart reminders. Instant insights.<br />Zero manual work.</p>
            </div>
            <div style={s.pills}>
              {['⚡ AI-powered reminders', '📊 Live analytics', '🔒 Bank-grade security'].map(f => (
                <span key={f} style={s.pill}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{ ...s.rightPanel, padding: isMobile ? '32px 20px' : '40px' }}>
        {/* Mobile logo */}
        {isMobile && (
          <div style={{ ...s.logoMark, marginBottom: '32px', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="rgba(139,92,246,0.3)"/><path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa"/><circle cx="20" cy="20" r="3" fill="#7c3aed"/></svg>
            <span style={s.logoText}>Invoi</span>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={s.formTitle}>Welcome back</h1>
            <p style={s.formSubtitle}>Don't have an account?{' '}<Link to="/register" style={s.link}>Sign up</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" style={s.input}
                onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
              {errors.email && <span style={s.error}>{errors.email.message}</span>}
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  style={{ ...s.input, paddingRight: '44px' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              {errors.password && <span style={s.error}>{errors.password.message}</span>}
            </div>

            {serverError && <div style={s.serverError}>{serverError}</div>}

            <button type="submit" disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,15px)} }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root:           { display: 'flex', minHeight: '100vh', backgroundColor: '#0d0a1a', fontFamily: "'DM Sans',sans-serif" },
  leftPanel:      { flex: '0 0 45%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0d0a1a 0%,#1a0f2e 50%,#120826 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orb1:           { position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(109,40,217,0.35) 0%,transparent 70%)', top: '-100px', left: '-100px', filter: 'blur(80px)', borderRadius: '50%', animation: 'float1 8s ease-in-out infinite' },
  orb2:           { position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(139,92,246,0.25) 0%,transparent 70%)', bottom: '-50px', right: '50px', filter: 'blur(80px)', borderRadius: '50%', animation: 'float2 10s ease-in-out infinite' },
  orb3:           { position: 'absolute', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(167,139,250,0.2) 0%,transparent 70%)', top: '50%', left: '60%', filter: 'blur(80px)', borderRadius: '50%', animation: 'float3 6s ease-in-out infinite' },
  grid:           { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px' },
  leftContent:    { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '48px', gap: '32px', maxWidth: '420px' },
  logoMark:       { display: 'flex', alignItems: 'center', gap: '10px' },
  logoText:       { fontFamily: "'Syne',sans-serif", fontSize: '22px', fontWeight: 700, color: '#e9d5ff', letterSpacing: '-0.5px' },
  taglineHeading: { fontFamily: "'Syne',sans-serif", fontSize: '32px', fontWeight: 800, color: '#f3e8ff', lineHeight: 1.2, margin: 0 },
  taglineSub:     { fontSize: '14px', color: 'rgba(196,181,253,0.7)', lineHeight: 1.6, margin: '10px 0 0', fontWeight: 300 },
  pills:          { display: 'flex', flexDirection: 'column', gap: '8px' },
  pill:           { display: 'inline-block', padding: '6px 14px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px', fontSize: '12px', color: '#c4b5fd', backdropFilter: 'blur(8px)', width: 'fit-content' },
  rightPanel:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#0f0b1f 0%,#0d0a1a 100%)' },
  formTitle:      { fontFamily: "'Syne',sans-serif", fontSize: '32px', fontWeight: 800, color: '#f3e8ff', margin: 0, letterSpacing: '-0.5px' },
  formSubtitle:   { fontSize: '14px', color: 'rgba(196,181,253,0.6)', margin: '8px 0 0' },
  link:           { color: '#a78bfa', textDecoration: 'none', fontWeight: 500 },
  form:           { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:          { fontSize: '13px', fontWeight: 500, color: 'rgba(196,181,253,0.8)', letterSpacing: '0.3px' },
  input:          { width: '100%', padding: '12px 16px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '10px', color: '#f3e8ff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" },
  error:          { fontSize: '12px', color: '#f87171', marginTop: '2px' },
  serverError:    { padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '13px', color: '#fca5a5' },
  submitBtn:      { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 24px rgba(109,40,217,0.4)' },
};