import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await login(formData);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    const result = await login({ email, password });
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#9ca3af' }}>
            Sign in to your TenantHub account
          </p>
        </div>

        {/* Form */}
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: errors.email ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    backgroundColor: '#2d2d2d',
                    border: errors.password ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #404040' }}>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Demo Accounts
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => handleDemoLogin('admin@tenantmanager.com', 'admin123')}
                style={{
                  backgroundColor: '#2d2d2d',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #404040',
                  color: '#f98080',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '500' }}>Admin Account</div>
                <div style={{ color: '#9ca3af' }}>admin@tenantmanager.com / admin123</div>
              </button>
              <button
                onClick={() => handleDemoLogin('john.student@university.edu', 'password123')}
                style={{
                  backgroundColor: '#2d2d2d',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #404040',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '500' }}>User Account</div>
                <div style={{ color: '#9ca3af' }}>john.student@university.edu / password123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#f98080', textDecoration: 'none' }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;