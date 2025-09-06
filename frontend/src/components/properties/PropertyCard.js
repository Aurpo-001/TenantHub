import React from 'react';
import { Link } from 'react-router-dom';

// Realistic fallback photos (Unsplash)
const FALLBACKS = {
  apartment:
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&q=80&auto=format&fit=crop',
  garage:
    'https://images.unsplash.com/photo-1520089265514-2f0a0908f1d8?w=1200&q=80&auto=format&fit=crop',
  default:
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
};

// Anything that looks like a placeholder gets rejected
const isPlaceholder = (u = '') =>
  !u ||
  /placeholder|placehold\.co/i.test(u) ||
  /\/(400x250|800x450|1200x600)(\D|$)/i.test(u);

const getCardImage = (images = [], type = 'default') => {
  const candidate =
    images.find((i) => i?.isPrimary && i?.url)?.url ||
    images?.[0]?.url ||
    '';
  return isPlaceholder(candidate) ? (FALLBACKS[type] || FALLBACKS.default) : candidate;
};

const PropertyCard = ({ property, isAdmin, onDelete, currentUserId }) => {

  
  const isOwner = currentUserId && (
    (property.owner?._id && property.owner._id === currentUserId) || 
    (typeof property.owner === 'string' && property.owner === currentUserId)
  );
  const formatPrice = (price) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type) => (type === 'apartment' ? '#10b981' : '#f59e0b');
  const getStatusColor = (isAvailable) => (isAvailable ? '#10b981' : '#ef4444');

  const cardImage = getCardImage(property.images, property.type);

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      className="property-card-hover"
    >
      <Link
        to={`/properties/${property._id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Image */}
        <div
          style={{
            height: '200px',
            backgroundColor: '#333',
            backgroundImage: `url(${cardImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        />

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Title */}
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#f3f4f6',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
            }}
          >
            {property.title}
          </h3>

          {/* Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>📍</span>
            {property.location?.address}
          </div>

          {/* Specifications */}
          {property.specifications && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#d1d5db',
              }}
            >
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#333',
                    color: '#d1d5db',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {amenity.replace('_', ' ')}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span
                  style={{
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #333',
            }}
          >
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

            {/* Availability & Price badges */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: getTypeColor(property.type),
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                }}
              >
                {property.type}
              </span>
              <span
                style={{
                  backgroundColor: getStatusColor(property.availability?.isAvailable),
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              >
                {property.availability?.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {formatPrice(property.price)}/mo
              </span>
            </div>
          </div>
        </div>
      </Link>
      {(isAdmin || isOwner) && (
        <div className="flex gap-2 p-4 bg-gray-800">
          <Link
            to={`/properties/edit/${property._id}`}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this property?')) {
                onDelete(property._id);
              }
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
