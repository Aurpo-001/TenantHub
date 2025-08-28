import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Properties from './pages/properties/Properties';
import PropertyDetails from './pages/properties/PropertyDetails';
import Dashboard from './pages/dashboard/Dashboard';
import BookingPage from './pages/bookings/BookingPage';
import PaymentPage from './pages/payments/PaymentPage';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CommutePage from './pages/commute/CommutePage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f1f1f',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Header />
          
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/booking/:propertyId" element={<BookingPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/commute" element={<CommutePage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Home Page Component (without header since it's now global)
const HomePage = () => {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', // Account for header height
      backgroundColor: '#0a0a0a', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          TenantHub
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.25rem', lineHeight: '1.6' }}>
          Your professional tenant management platform. Find and manage rental properties with ease.
          Connect students and professionals with quality accommodations.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
            Get Started
          </Link>
          <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>
            Browse Properties
          </Link>
        </div>
        
        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem', 
          marginBottom: '3rem' 
        }}>
          <Link 
            to="/properties"
            style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #333',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f98080';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏠</div>
            <h3 style={{ color: '#f3f4f6', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Quality Properties
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Verified apartments and garages near universities and business districts.
            </p>
          </Link>
          
          <Link 
            to="/commute"
            style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #333',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f98080';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚗</div>
            <h3 style={{ color: '#f3f4f6', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Smart Commute
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Find properties with optimal commute times to campus and workplace.
            </p>
          </Link>
          
          <Link 
            to="/dashboard"
            style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #333',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f98080';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
            <h3 style={{ color: '#f3f4f6', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Easy Management
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Manage your bookings, payments, and communication in one place.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Account Switching Component
const AccountSwitcher = () => {
  const { login } = useAuth();

  const handleDemoLogin = async (email, password) => {
    await login({ email, password });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '2rem', 
      right: '2rem', 
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1rem',
      zIndex: 100
    }}>
      <h4 style={{ color: '#f3f4f6', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '600' }}>
        Demo Accounts
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => handleDemoLogin('admin@tenantmanager.com', 'admin123')}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          👑 Admin Login
        </button>
        <button
          onClick={() => handleDemoLogin('owner@example.com', 'owner123')}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          🏠 Owner Login
        </button>
        <button
          onClick={() => handleDemoLogin('john.student@university.edu', 'password123')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          👤 User Login
        </button>
      </div>
    </div>
  );
};

// Bookings Page
const BookingsPage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#0a0a0a', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              My Bookings
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
              Manage your property bookings and reservations
            </p>
          </div>
          <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
            Book New Property
          </Link>
        </div>
        
        <div style={{ backgroundColor: '#1a1a1a', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', marginBottom: '1rem' }}>Bookings Management</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
            This page will show all your bookings, their status, payment information, and allow you to manage them.
            Features will include booking history, status tracking, and communication with property owners.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reviews Page
const ReviewsPage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#0a0a0a', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Reviews & Ratings
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
              View and manage your property reviews
            </p>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#1a1a1a', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', marginBottom: '1rem' }}>Reviews System</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
            This page will show all reviews you've written and received. You'll be able to rate property owners,
            view ratings for properties, and manage your review history.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
              Find Properties to Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#0a0a0a', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Profile Settings
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Manage your account information and preferences
          </p>
        </div>
        
        <div style={{ backgroundColor: '#1a1a1a', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', marginBottom: '1rem' }}>Profile Management</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
            This page will allow you to update your personal information, change password, 
            set preferences for property recommendations, and manage notification settings.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Page
const NotificationsPage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#0a0a0a', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Notifications
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Stay updated with your bookings and messages
          </p>
        </div>
        
        <div style={{ backgroundColor: '#1a1a1a', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔔</div>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', marginBottom: '1rem' }}>Notification Center</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
            This page will show all your notifications including booking updates, payment confirmations,
            messages from property owners, and system announcements.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary">Mark All as Read</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 404 Page
const NotFoundPage = () => {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      backgroundColor: '#0a0a0a', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#f98080', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.6' }}>
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            Go Home
          </Link>
          <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;