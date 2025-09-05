import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const ParkingLogo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="16" fill="#7B7BFF"/>
    <text x="36" y="40" textAnchor="middle" fontWeight="bold" fontSize="32" fill="#fff">P</text>
    <rect x="22" y="48" width="28" height="8" rx="4" fill="#fff"/>
    <rect x="30" y="52" width="12" height="4" rx="2" fill="#7B7BFF"/>
    <rect x="32" y="54" width="8" height="2" rx="1" fill="#fff"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      navigate('/app', { replace: true });
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { user } = credential;
      const authUser = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
      };
      localStorage.setItem('authUser', JSON.stringify(authUser));
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#f9f9fb' }}>
      {/* Left: Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', minWidth: 0, padding: isMobile ? 16 : 32 }}>
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: isMobile ? 20 : 32 }}>
            <ParkingLogo />
            <h1 style={{ fontWeight: 700, fontSize: isMobile ? 24 : 32, margin: isMobile ? '24px 0 8px 0' : '32px 0 8px 0', color: '#111' }}>Welcome Back!</h1>
          </div>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 18 }}>
              <div>
                <label style={{ fontWeight: 500, color: '#222', marginBottom: 6, display: 'block' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@gmail.com"
                  style={{ width: '100%', padding: isMobile ? '10px 12px' : '12px 16px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: isMobile ? 15 : 16, outline: 'none', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#222', marginBottom: 6, display: 'block' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="must be 8 characters atleast"
                  style={{ width: '100%', padding: isMobile ? '10px 12px' : '12px 16px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: isMobile ? 15 : 16, outline: 'none', marginTop: 4 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? 14 : 15, color: '#222' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ marginRight: 8 }} />
                  Remember me
                </label>
                <Link to="/forgot" style={{ color: '#7B7BFF', fontWeight: 500, fontSize: isMobile ? 14 : 15, textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <button type="submit" disabled={loading} style={{ marginTop: 12, width: '100%', background: '#7B7BFF', color: '#fff', fontWeight: 600, fontSize: isMobile ? 16 : 18, border: 'none', borderRadius: 8, padding: isMobile ? '12px 0' : '14px 0', cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(123,123,255,0.08)', opacity: loading ? 0.8 : 1, transition: 'background 0.2s' }}>
                {loading ? 'Signing in…' : 'Signin'}
              </button>
            </div>
          </form>
          <div style={{ marginTop: 24, fontSize: isMobile ? 14 : 15, color: '#6b7280', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#7B7BFF', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
          </div>
        </div>
      </div>
      {/* Right: Illustration/Preview */}
      {/* <div style={{ flex: 1, background: 'linear-gradient(135deg, #7B7BFF 0%, #A6BFFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 220 : '100vh', minWidth: 0 }}>
        <div style={{ width: isMobile ? '90%' : '80%', maxWidth: 480, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(123,123,255,0.10)', padding: isMobile ? 16 : 32, minHeight: isMobile ? 120 : 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#7B7BFF', fontWeight: 700, fontSize: isMobile ? 18 : 28, opacity: 0.3 }}>Dashboard Preview</span>
        </div>
      </div> */}
    </div>
  );
};

export default Login;


