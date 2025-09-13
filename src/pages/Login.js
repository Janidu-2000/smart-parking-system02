import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const ParkingLogo = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="20" fill="url(#gradient)"/>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea"/>
        <stop offset="100%" stopColor="#764ba2"/>
      </linearGradient>
    </defs>
    <text x="40" y="45" textAnchor="middle" fontWeight="bold" fontSize="36" fill="#fff">P</text>
    <rect x="24" y="52" width="32" height="10" rx="5" fill="#fff"/>
    <rect x="32" y="56" width="16" height="6" rx="3" fill="url(#gradient)"/>
    <rect x="36" y="58" width="8" height="2" rx="1" fill="#fff"/>
  </svg>
);

const ParkingIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M7 7H17V17H7V7Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>
);

const SmartIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={color}/>
    <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" fill={color}/>
  </svg>
);

const SecurityIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '1100px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        minHeight: isMobile ? 'auto' : '500px'
      }}>
        {/* Left Side - Hero Section */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: isMobile ? '30px 20px' : '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ParkingLogo />
            <h1 style={{ 
              fontSize: isMobile ? '24px' : '30px', 
              fontWeight: '700', 
              margin: '16px 0 12px 0',
              lineHeight: '1.2'
            }}>
              Smart Parking System
            </h1>
            <p style={{ 
              fontSize: isMobile ? '14px' : '16px', 
              opacity: 0.9, 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Welcome back! Access your parking dashboard and manage your reservations with ease.
            </p>
            
            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ParkingIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Real-time parking availability</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SmartIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Smart reservation system</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SecurityIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: 1,
          padding: isMobile ? '30px 20px' : '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: isMobile ? '22px' : '26px', 
                fontWeight: '700', 
                color: '#1a202c',
                marginBottom: '6px'
              }}>
                Welcome Back!
              </h2>
              <p style={{ color: '#718096', fontSize: '15px' }}>
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div style={{ 
                backgroundColor: '#fed7d7', 
                color: '#c53030', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #feb2b2',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#2d3748', 
                    marginBottom: '6px', 
                    display: 'block',
                    fontSize: '14px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '10px', 
                      fontSize: '15px', 
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#f7fafc'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#2d3748', 
                    marginBottom: '6px', 
                    display: 'block',
                    fontSize: '14px'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '10px', 
                      fontSize: '15px', 
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#f7fafc'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginTop: '8px'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '14px', 
                    color: '#4a5568',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={remember} 
                      onChange={e => setRemember(e.target.checked)} 
                      style={{ 
                        marginRight: '8px',
                        width: '16px',
                        height: '16px',
                        accentColor: '#667eea'
                      }} 
                    />
                    Remember me
                  </label>
                  <Link 
                    to="/forgot" 
                    style={{ 
                      color: '#667eea', 
                      fontWeight: '500', 
                      fontSize: '14px', 
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    marginTop: '20px', 
                    width: '100%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: '#fff', 
                    fontWeight: '600', 
                    fontSize: '15px', 
                    border: 'none', 
                    borderRadius: '10px', 
                    padding: '14px 0', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                    opacity: loading ? 0.7 : 1, 
                    transition: 'all 0.2s',
                    transform: loading ? 'none' : 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 14px 0 rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div style={{ 
              marginTop: '24px', 
              fontSize: '14px', 
              color: '#718096', 
              textAlign: 'center' 
            }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


