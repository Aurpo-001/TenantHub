import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
import PropertyCard from '../../components/properties/PropertyCard';
import PropertySearch from '../../components/properties/PropertySearch';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  // Mock data for demonstration (since backend might not be connected)
  const mockProperties = [
    {
      _id: '1',
      title: 'Modern 2BR Apartment Near University',
      description: 'Beautiful modern apartment perfect for students',
      type: 'apartment',
      price: 1200,
      location: {
        address: '123 University Ave, Campus Town'
      },
      images: [],
      specifications: {
        bedrooms: 2,
        bathrooms: 1,
        area: 800
      },
      amenities: ['wifi', 'parking', 'laundry', 'security'],
      availability: {
        isAvailable: true
      },
      ratings: {
        average: 4.5,
        count: 12
      },
      views: 89
    },
    {
      _id: '2',
      title: 'Secure Parking Garage Downtown',
      description: 'Safe and secure parking space in downtown area',
      type: 'garage',
      price: 150,
      location: {
        address: '456 Downtown St, City Center'
      },
      images: [],
      specifications: {
        area: 200
      },
      amenities: ['security', 'covered'],
      availability: {
        isAvailable: true
      },
      ratings: {
        average: 4.2,
        count: 8
      },
      views: 45
    },
    {
      _id: '3',
      title: 'Luxury 3BR Apartment with Gym',
      description: 'Premium apartment with full amenities',
      type: 'apartment',
      price: 2500,
      location: {
        address: '789 Luxury Blvd, Uptown'
      },
      images: [],
      specifications: {
        bedrooms: 3,
        bathrooms: 2,
        area: 1200
      },
      amenities: ['wifi', 'parking', 'gym', 'pool', 'security', 'air_conditioning'],
      availability: {
        isAvailable: false
      },
      ratings: {
        average: 4.8,
        count: 25
      },
      views: 156
    }
  ];

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, [currentPage]);

  const loadProperties = async (searchFilters = {}) => {
    try {
      setSearchLoading(true);
      setError(null);

      // Try to fetch from backend, fall back to mock data
      try {
        const params = {
          page: currentPage,
          limit: 9,
          ...searchFilters
        };
        
        const response = await propertiesAPI.getAll(params);
        setProperties(response.data.data);
        setPagination(response.data.pagination);
        setTotalProperties(response.data.total);
      } catch (backendError) {
        // Backend not available, use mock data
        console.log('Backend not available, using mock data');
        
        // Filter mock data based on search filters
        let filteredProperties = [...mockProperties];
        
        if (searchFilters.search) {
          filteredProperties = filteredProperties.filter(property =>
            property.title.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
            property.description.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
            property.location.address.toLowerCase().includes(searchFilters.search.toLowerCase())
          );
        }
        
        if (searchFilters.type) {
          filteredProperties = filteredProperties.filter(property => property.type === searchFilters.type);
        }
        
        if (searchFilters.minPrice) {
          filteredProperties = filteredProperties.filter(property => property.price >= parseInt(searchFilters.minPrice));
        }
        
        if (searchFilters.maxPrice) {
          filteredProperties = filteredProperties.filter(property => property.price <= parseInt(searchFilters.maxPrice));
        }
        
        if (searchFilters.available) {
          filteredProperties = filteredProperties.filter(property => property.availability.isAvailable);
        }
        
        // Sort properties
        if (searchFilters.sort) {
          filteredProperties.sort((a, b) => {
            const sortField = searchFilters.sort.replace('-', '');
            const isDescending = searchFilters.sort.startsWith('-');
            
            let aValue, bValue;
            
            if (sortField === 'price') {
              aValue = a.price;
              bValue = b.price;
            } else if (sortField === 'views') {
              aValue = a.views;
              bValue = b.views;
            } else if (sortField === 'ratings.average') {
              aValue = a.ratings.average;
              bValue = b.ratings.average;
            } else {
              aValue = a._id;
              bValue = b._id;
            }
            
            if (isDescending) {
              return bValue - aValue;
            } else {
              return aValue - bValue;
            }
          });
        }
        
        setProperties(filteredProperties);
        setTotalProperties(filteredProperties.length);
      }
    } catch (error) {
      setError('Failed to load properties. Please try again later.');
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setCurrentPage(1);
    loadProperties(filters);
  };

  if (loading && properties.length === 0) {
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
          <p>Loading properties...</p>
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
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Properties
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                Find your perfect rental property
              </p>
            </div>
            <Link to="/" style={{
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
            }}>
              🏠 Back to Home
            </Link>
          </div>
          
          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '600' }}>{totalProperties}</span> properties found
            </div>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '600' }}>{properties.filter(p => p.availability.isAvailable).length}</span> available
            </div>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '600' }}>{properties.filter(p => p.type === 'apartment').length}</span> apartments
            </div>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '600' }}>{properties.filter(p => p.type === 'garage').length}</span> garages
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Search/Filter Section */}
        <PropertySearch onSearch={handleSearch} loading={searchLoading} />

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          !loading && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#d1d5db' }}>
                No properties found
              </h3>
              <p style={{ marginBottom: '2rem' }}>
                Try adjusting your search criteria or check back later for new listings.
              </p>
              <button
                onClick={() => handleSearch({})}
                className="btn-outline"
              >
                Reset Search
              </button>
            </div>
          )
        )}

        {/* Pagination */}
        {pagination && (properties.length > 0) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            {pagination.prev && (
              <button
                onClick={() => setCurrentPage(pagination.prev.page)}
                style={{
                  backgroundColor: '#2d2d2d',
                  color: '#d1d5db',
                  border: '1px solid #404040',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Previous
              </button>
            )}
            
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Page {currentPage}
            </span>
            
            {pagination.next && (
              <button
                onClick={() => setCurrentPage(pagination.next.page)}
                style={{
                  backgroundColor: '#2d2d2d',
                  color: '#d1d5db',
                  border: '1px solid #404040',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .property-card-hover:hover {
            transform: translateY(-4px);
            border-color: #404040;
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default Properties;