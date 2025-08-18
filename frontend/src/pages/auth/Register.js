import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
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
      <div style={{ maxWidth: '500px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Create Account
          </h2>
          <p style={{ color: '#9ca3af' }}>
            Join TenantHub to find your perfect rental
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
            {/* Name */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: errors.name ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>
              )}
            </div>

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

            {/* Phone */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Phone Number (Optional)
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: errors.phone ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
              >
                <option value="user">Tenant/Student</option>
                <option value="owner">Property Owner</option>
              </select>
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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    backgroundColor: '#2d2d2d',
                    border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '1rem'
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#f98080', textDecoration: 'none' }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;