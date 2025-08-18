import React, { useState } from 'react';

const PropertySearch = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    available: true,
    sort: '-createdAt'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      available: true,
      sort: '-createdAt'
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <h2 style={{
        color: '#f3f4f6',
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem'
      }}>
        Search Properties
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Search Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Search by title, description, or location..."
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Property Type */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Property Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="garage">Garage</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              placeholder="$0"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Max Price */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              placeholder="$10000"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Sort */}
          <div>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Sort By
            </label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '0.875rem'
              }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-views">Most Viewed</option>
              <option value="-ratings.average">Highest Rated</option>
            </select>
          </div>

          {/* Available Only Checkbox */}
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              color: '#d1d5db',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="available"
                checked={filters.available}
                onChange={handleInputChange}
                style={{
                  marginRight: '0.5rem',
                  width: '1rem',
                  height: '1rem'
                }}
              />
              Available Only
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              backgroundColor: '#2d2d2d',
              color: '#d1d5db',
              border: '1px solid #404040',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Searching...
              </>
            ) : (
              <>
                <span>🔍</span>
                Search
              </>
            )}
          </button>
        </div>
      </form>

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

export default PropertySearch;