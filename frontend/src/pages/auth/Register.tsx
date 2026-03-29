import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true); setServerError('');
    try { await registerUser(data.name, data.email, data.password); navigate('/dashboard'); }
    catch { setServerError('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ ...s.root, flexDirection: isMobile ? 'column' : 'row' }}>
      {/* LEFT PANEL — desktop only */}
      {!isMobile && (
        <div style={s.leftPanel}>
          <div style={s.orb1} /><div style={s.orb2} /><div style={s.orb3} />
          <div style={s.grid} />
          <div style={s.leftContent}>
            <div style={s.logoMark}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="rgba(139,92,246,0.3)"/><path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa"/><circle cx="20" cy="20" r="3" fill="#7c3aed"/></svg>
              <span style={s.logoText}>Invoi</span>
            </div>
            <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
              <circle cx="140" cy="90" r="30" fill="rgba(109,40,217,0.2)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5"/>
              <circle cx="140" cy="90" r="18" fill="rgba(139,92,246,0.25)" stroke="rgba(167,139,250,0.6)" strokeWidth="1"/>
              <circle cx="140" cy="90" r="7" fill="rgba(167,139,250,0.8)"/>
              {[[60,40],[220,40],[40,120],[240,120],[100,160],[180,160]].map(([x,y],i) => (
                <g key={i}>
                  <line x1={140} y1={90} x2={x} y2={y} stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeDasharray="4 4"/>
                  <circle cx={x} cy={y} r="8" fill="rgba(109,40,217,0.3)" stroke="rgba(139,92,246,0.5)" strokeWidth="1"/>
                  <circle cx={x} cy={y} r="3" fill="rgba(167,139,250,0.7)"/>
                </g>
              ))}
            </svg>
            <div>
              <h2 style={s.taglineHeading}>Start automating<br />your invoices today.</h2>
              <p style={s.taglineSub}>Join thousands of freelancers and<br />businesses using Invoi.</p>
            </div>
            <div style={{ display: 'flex', gap: '28px' }}>
              {[['10k+','Users'],['$2M+','Invoiced'],['99.9%','Uptime']].map(([val,label]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '20px', fontWeight: 700, color: '#c4b5fd' }}>{val}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(196,181,253,0.5)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{ ...s.rightPanel, padding: isMobile ? '32px 20px' : '40px' }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="rgba(139,92,246,0.3)"/><path d="M12 28L20 12L28 28H22L20 23L18 28H12Z" fill="#a78bfa"/><circle cx="20" cy="20" r="3" fill="#7c3aed"/></svg>
            <span style={s.logoText}>Invoi</span>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={s.formTitle}>Create account</h1>
            <p style={s.formSubtitle}>Already have an account?{' '}<Link to="/login" style={s.link}>Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Full name</label>
              <input {...register('name')} type="text" placeholder="John Doe" style={s.input}
                onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
              {errors.name && <span style={s.error}>{errors.name.message}</span>}
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" style={s.input}
                onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
              {errors.email && <span style={s.error}>{errors.email.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    style={{ ...s.input, paddingRight: '44px' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {errors.password && <span style={s.error}>{errors.password.message}</span>}
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Confirm</label>
                <input {...register('confirmPassword')} type="password" placeholder="••••••••" style={s.input}
                  onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'} />
                {errors.confirmPassword && <span style={s.error}>{errors.confirmPassword.message}</span>}
              </div>
            </div>

            {serverError && <div style={s.serverError}>{serverError}</div>}

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
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
  leftContent:    { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '48px', gap: '28px', maxWidth: '420px' },
  logoMark:       { display: 'flex', alignItems: 'center', gap: '10px' },
  logoText:       { fontFamily: "'Syne',sans-serif", fontSize: '22px', fontWeight: 700, color: '#e9d5ff', letterSpacing: '-0.5px' },
  taglineHeading: { fontFamily: "'Syne',sans-serif", fontSize: '30px', fontWeight: 800, color: '#f3e8ff', lineHeight: 1.2, margin: 0 },
  taglineSub:     { fontSize: '14px', color: 'rgba(196,181,253,0.7)', lineHeight: 1.6, margin: '8px 0 0', fontWeight: 300 },
  rightPanel:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#0f0b1f 0%,#0d0a1a 100%)' },
  formTitle:      { fontFamily: "'Syne',sans-serif", fontSize: '32px', fontWeight: 800, color: '#f3e8ff', margin: 0, letterSpacing: '-0.5px' },
  formSubtitle:   { fontSize: '14px', color: 'rgba(196,181,253,0.6)', margin: '8px 0 0' },
  link:           { color: '#a78bfa', textDecoration: 'none', fontWeight: 500 },
  fieldGroup:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:          { fontSize: '13px', fontWeight: 500, color: 'rgba(196,181,253,0.8)', letterSpacing: '0.3px' },
  input:          { width: '100%', padding: '12px 16px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '10px', color: '#f3e8ff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" },
  error:          { fontSize: '12px', color: '#f87171', marginTop: '2px' },
  serverError:    { padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '13px', color: '#fca5a5' },
  submitBtn:      { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 24px rgba(109,40,217,0.4)' },
};