import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'owner':
        return '/owner-dashboard';
      default:
        return '/dashboard';
    }
  };

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'admin':
        return '👑 Admin';
      case 'owner':
        return '🏠 Owner';
      default:
        return '👤 User';
    }
  };

  return (
    <header style={{
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #333',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              TenantHub
            </h1>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              to="/properties" 
              className="nav-link"
              style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
            >
              Properties
            </Link>
            <Link 
              to="/commute" 
              className="nav-link"
              style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
            >
              Smart Commute
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="nav-link"
                  style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/bookings" 
                  className="nav-link"
                  style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Bookings
                </Link>
                
                {/* User Menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    border: '1px solid #404040'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {getRoleDisplay()}
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                      {user.name}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link 
                  to="/login" 
                  className="nav-link"
                  style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                  style={{ 
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;