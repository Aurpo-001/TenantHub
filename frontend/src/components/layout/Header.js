import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return null; // Don't show header if not logged in
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return { icon: '👑', text: 'Admin' };
      case 'owner':
        return { icon: '🏠', text: 'Owner' };
      default:
        return { icon: '👤', text: 'Tenant' };
    }
  };

  const roleDisplay = getRoleDisplay(user?.role);

  return (
    <header style={{
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #333',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '4rem'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div className="gradient-text" style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold' 
            }}>
              TenantHub
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link
              to="/dashboard"
              style={{
                color: isActive('/dashboard') ? '#f98080' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: isActive('/dashboard') ? 'rgba(249, 128, 128, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard')) {
                  e.target.style.color = '#f98080';
                  e.target.style.backgroundColor = 'rgba(249, 128, 128, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard')) {
                  e.target.style.color = '#d1d5db';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/properties"
              style={{
                color: isActive('/properties') ? '#f98080' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: isActive('/properties') ? 'rgba(249, 128, 128, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/properties')) {
                  e.target.style.color = '#f98080';
                  e.target.style.backgroundColor = 'rgba(249, 128, 128, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/properties')) {
                  e.target.style.color = '#d1d5db';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              Properties
            </Link>

            <Link
              to="/bookings"
              style={{
                color: isActive('/bookings') ? '#f98080' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: isActive('/bookings') ? 'rgba(249, 128, 128, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/bookings')) {
                  e.target.style.color = '#f98080';
                  e.target.style.backgroundColor = 'rgba(249, 128, 128, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/bookings')) {
                  e.target.style.color = '#d1d5db';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              My Bookings
            </Link>
          </nav>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: '#f3f4f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#404040';
                e.currentTarget.style.borderColor = '#525252';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
                e.currentTarget.style.borderColor = '#404040';
              }}
            >
              <div style={{
                width: '2rem',
                height: '2rem',
                backgroundColor: '#f98080',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '500' }}>{user?.name}</div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>{roleDisplay.icon}</span>
                  <span>{roleDisplay.text}</span>
                </div>
              </div>
              <div style={{ 
                color: '#9ca3af',
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.5)',
                minWidth: '200px',
                zIndex: 50
              }}>
                <div style={{ padding: '0.5rem' }}>
                  {/* User Info */}
                  <div style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #333',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ color: '#f3f4f6', fontWeight: '500', fontSize: '0.875rem' }}>
                      {user?.name}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      {user?.email}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.25rem'
                    }}>
                      <span>{roleDisplay.icon}</span>
                      <span>{roleDisplay.text}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      color: '#d1d5db',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setShowUserMenu(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d2d2d';
                      e.currentTarget.style.color = '#f98080';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }}
                  >
                    <span>⚙️</span>
                    Profile Settings
                  </Link>

                  <Link
                    to="/notifications"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      color: '#d1d5db',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setShowUserMenu(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d2d2d';
                      e.currentTarget.style.color = '#f98080';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }}
                  >
                    <span>🔔</span>
                    Notifications
                  </Link>

                  <div style={{
                    borderTop: '1px solid #333',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem'
                  }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        textAlign: 'left',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 30
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;