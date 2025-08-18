import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type) => {
    return type === 'apartment' ? '#10b981' : '#f59e0b';
  };

  const getStatusColor = (isAvailable) => {
    return isAvailable ? '#10b981' : '#ef4444';
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    className="property-card-hover">
      <Link to={`/properties/${property._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image */}
        <div style={{
          height: '200px',
          backgroundColor: '#333',
          backgroundImage: property.images?.[0]?.url ? `url(${property.images[0].url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          {!property.images?.[0]?.url && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}>
              No Image Available
            </div>
          )}
          
          {/* Property Type Badge */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: getTypeColor(property.type),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {property.type}
          </div>

          {/* Status Badge */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: getStatusColor(property.availability?.isAvailable),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {property.availability?.isAvailable ? 'Available' : 'Unavailable'}
          </div>

          {/* Price Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            {formatPrice(property.price)}/mo
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Title */}
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#f3f4f6',
            marginBottom: '0.5rem',
            lineHeight: '1.4'
          }}>
            {property.title}
          </h3>

          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>📍</span>
            {property.location?.address}
          </div>

          {/* Specifications */}
          {property.specifications && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#d1d5db'
            }}>
              {property.specifications.bedrooms > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🛏️</span>
                  <span>{property.specifications.bedrooms} bed</span>
                </div>
              )}
              {property.specifications.bathrooms > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🚿</span>
                  <span>{property.specifications.bathrooms} bath</span>
                </div>
              )}
              {property.specifications.area && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>📐</span>
                  <span>{property.specifications.area} sq ft</span>
                </div>
              )}
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#333',
                    color: '#d1d5db',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {amenity.replace('_', ' ')}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span style={{
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Rating and Owner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #333'
          }}>
            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: '#f59e0b' }}>⭐</span>
                <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                  {property.ratings?.average ? property.ratings.average.toFixed(1) : 'No rating'}
                </span>
              </div>
              {property.ratings?.count > 0 && (
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  ({property.ratings.count} reviews)
                </span>
              )}
            </div>

            {/* Views */}
            <div style={{
              color: '#9ca3af',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span>👁️</span>
              <span>{property.views || 0} views</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;