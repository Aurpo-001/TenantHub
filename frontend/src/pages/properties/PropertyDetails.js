import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Mock property data for demonstration
  const mockProperty = {
    _id: id,
    title: 'Modern 2BR Apartment Near University',
    description: 'Beautiful modern apartment perfect for students. This spacious 2-bedroom, 1-bathroom unit features contemporary finishes, in-unit laundry, and a private balcony. Located just minutes from campus with easy access to public transportation. The apartment includes all modern amenities and is in a secure building with 24/7 security. Perfect for students or young professionals looking for a comfortable and convenient living space.',
    type: 'apartment',
    price: 1200,
    location: {
      address: '123 University Ave, Campus Town',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      },
      nearbyPlaces: {
        campus: {
          distance: 500,
          duration: '5 minutes walk'
        },
        mosque: {
          name: 'Campus Mosque',
          distance: 300,
          duration: '3 minutes walk'
        }
      }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        alt: 'Living room',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        alt: 'Bedroom',
        isPrimary: false
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        alt: 'Kitchen',
        isPrimary: false
      }
    ],
    amenities: ['wifi', 'parking', 'laundry', 'security', 'balcony', 'air_conditioning', 'heating', 'kitchen'],
    specifications: {
      bedrooms: 2,
      bathrooms: 1,
      area: 800,
      floor: 2,
      totalFloors: 4,
      furnished: 'semi'
    },
    availability: {
      isAvailable: true,
      availableFrom: '2024-09-01',
      minimumStay: 6
    },
    owner: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890'
    },
    ratings: {
      average: 4.5,
      count: 12
    },
    reviews: [
      {
        user: { name: 'Alice Johnson' },
        rating: { overall: 5 },
        review: {
          title: 'Excellent apartment!',
          comment: 'Great location and very clean. The owner is responsive and helpful. Would definitely recommend to other students.'
        },
        createdAt: '2024-01-15'
      },
      {
        user: { name: 'Bob Wilson' },
        rating: { overall: 4 },
        review: {
          title: 'Good value for money',
          comment: 'Nice apartment, could use some minor updates but overall satisfied. Close to campus and all amenities.'
        },
        createdAt: '2024-01-10'
      },
      {
        user: { name: 'Carol Davis' },
        rating: { overall: 5 },
        review: {
          title: 'Perfect for students',
          comment: 'Love the location and the apartment is exactly as described. Very clean and well-maintained.'
        },
        createdAt: '2024-01-05'
      }
    ],
    views: 89,
    createdAt: '2024-01-01'
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from backend, fall back to mock data
      try {
        const response = await propertiesAPI.getById(id);
        setProperty(response.data.data);
      } catch (backendError) {
        // Backend not available, use mock data
        console.log('Backend not available, using mock data');
        setProperty(mockProperty);
      }
    } catch (error) {
      setError('Failed to load property details. Please try again later.');
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }
    // Future: Open contact modal or messaging system
    alert('Contact feature will be implemented in the next phase');
  };

  const amenityIcons = {
    wifi: '📶',
    parking: '🚗',
    laundry: '🧺',
    security: '🔒',
    elevator: '🛗',
    balcony: '🏡',
    furnished: '🛋️',
    air_conditioning: '❄️',
    heating: '🔥',
    kitchen: '🍳',
    garden: '🌿',
    gym: '🏋️',
    pool: '🏊'
  };

  if (loading) {
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
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#f3f4f6', fontSize: '2rem', marginBottom: '1rem' }}>Error</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
              Back to Properties
            </Link>
            <Link to="/" className="btn-outline" style={{ textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#9ca3af', fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h1 style={{ color: '#f3f4f6', fontSize: '2rem', marginBottom: '1rem' }}>Property Not Found</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>The property you're looking for doesn't exist.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
              Browse Properties
            </Link>
            <Link to="/" className="btn-outline" style={{ textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link 
              to="/properties" 
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #404040',
                backgroundColor: '#2d2d2d',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#404040';
                e.currentTarget.style.borderColor = '#525252';
                e.currentTarget.style.color = '#f98080';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
                e.currentTarget.style.borderColor = '#404040';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ← Back to Properties
            </Link>
            <Link 
              to="/" 
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #404040',
                backgroundColor: '#2d2d2d',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#404040';
                e.currentTarget.style.borderColor = '#525252';
                e.currentTarget.style.color = '#f98080';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
                e.currentTarget.style.borderColor = '#404040';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Property Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', margin: 0, lineHeight: '1.2' }}>
                  {property.title}
                </h1>
                <span style={{
                  backgroundColor: property.type === 'apartment' ? '#10b981' : '#f59e0b',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {property.type}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#9ca3af' }}>📍</span>
                <span style={{ color: '#d1d5db' }}>{property.location.address}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#f59e0b' }}>⭐</span>
                  <span style={{ color: '#d1d5db' }}>
                    {property.ratings.average.toFixed(1)} ({property.ratings.count} reviews)
                  </span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  👁️ {property.views} views
                </div>
                <div style={{
                  color: property.availability.isAvailable ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {property.availability.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#f98080',
                marginBottom: '0.5rem'
              }}>
                {formatPrice(property.price)}<span style={{ fontSize: '1rem', color: '#9ca3af' }}>/month</span>
              </div>
              {property.availability.isAvailable && (
                <button onClick={handleBookNow} className="btn-primary">
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Images Gallery */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: property.images.length > 1 ? '2fr 1fr' : '1fr',
          gap: '1rem',
          marginBottom: '2rem',
          height: '400px'
        }}>
          {property.images.length > 0 ? (
            <>
              <div style={{
                backgroundImage: `url(${property.images[0].url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '12px',
                overflow: 'hidden'
              }} />
              {property.images.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {property.images.slice(1, 3).map((image, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '12px',
                        flex: 1
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{
              backgroundColor: '#333',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}>
              No images available
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Property Details */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Description
              </h2>
              <p style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '2rem' }}>
                {property.description}
              </p>

              {/* Specifications */}
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Specifications
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {property.specifications.bedrooms > 0 && (
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Bedrooms</div>
                    <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.specifications.bedrooms}</div>
                  </div>
                )}
                {property.specifications.bathrooms > 0 && (
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Bathrooms</div>
                    <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.specifications.bathrooms}</div>
                  </div>
                )}
                {property.specifications.area && (
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Area</div>
                    <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.specifications.area} sq ft</div>
                  </div>
                )}
                {property.specifications.floor && (
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Floor</div>
                    <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.specifications.floor}/{property.specifications.totalFloors}</div>
                  </div>
                )}
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Furnished</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500', textTransform: 'capitalize' }}>{property.specifications.furnished}</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Minimum Stay</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.availability.minimumStay} months</div>
                </div>
              </div>

              {/* Amenities */}
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Amenities
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {property.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#d1d5db',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span>{amenityIcons[amenity] || '✓'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{amenity.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Availability */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Availability
              </h3>
              <div style={{ space: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Available from</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>
                    {formatDate(property.availability.availableFrom)}
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Minimum stay</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>
                    {property.availability.minimumStay} months
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Places */}
            {property.location.nearbyPlaces && (
              <div style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Nearby Places
                </h3>
                <div style={{ space: '1rem' }}>
                  {property.location.nearbyPlaces.campus && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ color: '#d1d5db', fontWeight: '500' }}>🏫 Campus</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {property.location.nearbyPlaces.campus.distance}m • {property.location.nearbyPlaces.campus.duration}
                      </div>
                    </div>
                  )}
                  {property.location.nearbyPlaces.mosque && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ color: '#d1d5db', fontWeight: '500' }}>🕌 {property.location.nearbyPlaces.mosque.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {property.location.nearbyPlaces.mosque.distance}m • {property.location.nearbyPlaces.mosque.duration}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Owner Contact */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Owner Contact
              </h3>
              <div style={{ space: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>{property.owner.name}</div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>📧 {property.owner.email}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>📞 {property.owner.phone}</div>
                </div>
                {isAuthenticated ? (
                  <button 
                    onClick={handleContactOwner}
                    className="btn-outline" 
                    style={{ width: '100%' }}
                  >
                    Contact Owner
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="btn-outline" 
                    style={{ width: '100%', textDecoration: 'none', textAlign: 'center', display: 'block' }}
                  >
                    Login to Contact
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {property.reviews && property.reviews.length > 0 && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem',
            marginTop: '2rem'
          }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Reviews ({property.reviews.length})
            </h2>
            <div style={{ space: '1.5rem' }}>
              {property.reviews.map((review, index) => (
                <div key={index} style={{
                  paddingBottom: '1.5rem',
                  borderBottom: index < property.reviews.length - 1 ? '1px solid #333' : 'none',
                  marginBottom: index < property.reviews.length - 1 ? '1.5rem' : 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ color: '#d1d5db', fontWeight: '500' }}>{review.user.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < review.rating.overall ? '#f59e0b' : '#404040',
                            fontSize: '1rem'
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    {review.review.title}
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: '1.5' }}>
                    {review.review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Book Property
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              Booking functionality will be implemented in the next phase. For now, please contact the owner directly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  backgroundColor: '#2d2d2d',
                  color: '#d1d5db',
                  border: '1px solid #404040',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  // Future: Navigate to booking page
                }}
                className="btn-primary"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      )}

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

export default PropertyDetails;