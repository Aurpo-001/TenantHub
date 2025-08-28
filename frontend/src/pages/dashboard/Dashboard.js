import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI, bookingsAPI, dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    recommendations: [],
    recentBookings: [],
    favoriteProperties: [],
    stats: {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      totalSpent: 0
    }
  });
  const [loadingData, setLoadingData] = useState(true);

  // Mock dashboard data
// In your Dashboard.js file, replace the mockDashboardData object with this:

const mockDashboardData = {
  recommendations: [
    {
      _id: '1',
      title: 'Cozy Studio Near Medical School',
      price: 850,
      type: 'apartment',
      location: { address: '456 Medical District, Health Campus' },
      images: [],
      ratings: { average: 4.2, count: 8 },
      views: 67
    },
    {
      _id: '9',
      title: 'Secure Parking Garage Downtown',
      price: 150,
      type: 'garage',
      location: { address: '456 Downtown St, City Center' },
      images: [],
      ratings: { average: 4.2, count: 8 },
      views: 45
    },
    {
      _id: '4',
      title: 'Affordable 1BR Near Business School',
      price: 950,
      type: 'apartment',
      location: { address: '321 Business Ave, Commerce District' },
      images: [],
      ratings: { average: 4.0, count: 15 },
      views: 78
    },
    {
      _id: '11',
      title: 'Budget Parking Near Metro',
      price: 80,
      type: 'garage',
      location: { address: '567 Metro Plaza, Transit Hub' },
      images: [],
      ratings: { average: 3.8, count: 15 },
      views: 89
    }
  ],
  recentBookings: [
    {
      _id: 'b1',
      property: {
        title: 'Modern 2BR Apartment Near University',
        location: { address: '123 University Ave, Campus Town' }
      },
      status: 'confirmed',
      bookingType: 'rent',
      createdAt: '2024-01-15',
      payment: { advanceAmount: 1200 }
    },
    {
      _id: 'b2',
      property: {
        title: 'Secure Parking Garage Downtown',
        location: { address: '456 Downtown St, City Center' }
      },
      status: 'pending',
      bookingType: 'rent',
      createdAt: '2024-01-12',
      payment: { advanceAmount: 150 }
    },
    {
      _id: 'b3',
      property: {
        title: 'Graduate Student Studio',
        location: { address: '987 Graduate Quarters, Research Campus' }
      },
      status: 'completed',
      bookingType: 'visit',
      createdAt: '2024-01-08',
      payment: { advanceAmount: 0 }
    }
  ],
  stats: {
    totalBookings: 8,
    activeBookings: 3,
    completedBookings: 5,
    totalSpent: 6750
  }
};
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loading, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);

      // Try to fetch real data, fall back to mock data
      try {
        const [recommendationsRes, bookingsRes] = await Promise.all([
          propertiesAPI.getRecommendations(),
          bookingsAPI.getMyBookings({ limit: 5 })
        ]);

        setDashboardData({
          recommendations: recommendationsRes.data.data || [],
          recentBookings: bookingsRes.data.data || [],
          favoriteProperties: [],
          stats: {
            totalBookings: bookingsRes.data.total || 0,
            activeBookings: bookingsRes.data.data?.filter(b => ['pending', 'confirmed'].includes(b.status)).length || 0,
            completedBookings: bookingsRes.data.data?.filter(b => b.status === 'completed').length || 0,
            totalSpent: bookingsRes.data.data?.reduce((sum, b) => sum + (b.payment?.advanceAmount || 0), 0) || 0
          }
        });
      } catch (error) {
        // Use mock data if backend is not available
        console.log('Using mock dashboard data');
        setDashboardData(mockDashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(mockDashboardData);
    } finally {
      setLoadingData(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      completed: '#6b7280',
      rejected: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading || loadingData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #404040',
            borderTop: '3px solid #f98080',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Welcome back, {user?.name}!
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                Here's what's happening with your properties and bookings
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {user?.role === 'admin' ? '👑 Admin' : user?.role === 'owner' ? '🏠 Property Owner' : '👤 Tenant'}
              </div>
              <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <div style={{ color: '#f98080', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.totalBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Bookings</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.activeBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Active Bookings</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.completedBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Completed</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold' }}>
              {formatPrice(dashboardData.stats.totalSpent)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Spent</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Recent Bookings */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600' }}>
                Recent Bookings
              </h2>
              <Link 
                to="/bookings" 
                style={{ color: '#f98080', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                View All →
              </Link>
            </div>

            {dashboardData.recentBookings.length > 0 ? (
              <div style={{ space: '1rem' }}>
                {dashboardData.recentBookings.map((booking, index) => (
                  <div 
                    key={booking._id}
                    style={{
                      paddingBottom: '1rem',
                      borderBottom: index < dashboardData.recentBookings.length - 1 ? '1px solid #333' : 'none',
                      marginBottom: index < dashboardData.recentBookings.length - 1 ? '1rem' : 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          {booking.property.title}
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          📍 {booking.property.location.address}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          backgroundColor: getStatusColor(booking.status),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        {formatDate(booking.createdAt)}
                      </span>
                      <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                        {formatPrice(booking.payment?.advanceAmount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <p>No bookings yet</p>
                <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
                  Browse Properties
                </Link>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600' }}>
                Recommended for You
              </h2>
              <Link 
                to="/properties" 
                style={{ color: '#f98080', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                View All →
              </Link>
            </div>

            {dashboardData.recommendations.length > 0 ? (
              <div style={{ space: '1rem' }}>
                {dashboardData.recommendations.map((property, index) => (
                  <Link
                    key={property._id}
                    to={`/properties/${property._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div 
                      style={{
                        paddingBottom: '1rem',
                        borderBottom: index < dashboardData.recommendations.length - 1 ? '1px solid #333' : 'none',
                        marginBottom: index < dashboardData.recommendations.length - 1 ? '1rem' : 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2d2d2d';
                        e.currentTarget.style.borderRadius = '6px';
                        e.currentTarget.style.padding = '0.75rem';
                        e.currentTarget.style.margin = '-0.25rem';
                      }} 
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderRadius = '0';
                        e.currentTarget.style.padding = '0 0 1rem 0';
                        e.currentTarget.style.margin = '0 0 1rem 0';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                            {property.title}
                          </h3>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            📍 {property.location.address}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#f98080', fontSize: '0.875rem', fontWeight: '600' }}>
                            {formatPrice(property.price)}/mo
                          </div>
                          <span style={{
                            backgroundColor: property.type === 'apartment' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            textTransform: 'capitalize'
                          }}>
                            {property.type}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#f59e0b' }}>⭐</span>
                          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            {property.ratings.average.toFixed(1)} ({property.ratings.count})
                          </span>
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          👁️ {property.views} views
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              🏠 Browse Properties
            </Link>
            <Link to="/bookings" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📅 My Bookings
            </Link>
            <Link to="/reviews" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              ⭐ My Reviews
            </Link>
            <Link to="/profile" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              👤 Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;