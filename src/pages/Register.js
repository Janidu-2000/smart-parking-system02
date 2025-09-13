import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

const UserIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmailIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22,6 12,13 2,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="16" r="1" fill={color}/>
    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      // After registration, redirect to login page
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register.');
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
              Join Smart Parking
            </h1>
            <p style={{ 
              fontSize: isMobile ? '14px' : '16px', 
              opacity: 0.9, 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Create your account and start enjoying seamless parking management with our smart system.
            </p>
            
            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Personalized parking experience</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <EmailIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Instant booking confirmations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LockIcon size={18} color="#fff" />
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Secure account protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
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
                Create Account
              </h2>
              <p style={{ color: '#718096', fontSize: '15px' }}>
                Get started with your smart parking journey
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
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
                    placeholder="Create a strong password"
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
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#718096', 
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    Must be at least 8 characters long
                  </p>
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div style={{ 
              marginTop: '24px', 
              fontSize: '14px', 
              color: '#718096', 
              textAlign: 'center' 
            }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


