import React, { useEffect, useState } from 'react';

/**
 * Props:
 *  - initial (optional): { search, type, minPrice, maxPrice, availableOnly, sort }
 *  - onApply: (filters) => void
 *  - onReset: () => void
 */
export default function PropertySearch({ initial, onApply, onReset }) {
  const [search, setSearch] = useState(initial?.search || '');
  const [type, setType] = useState(initial?.type || 'all'); // 'all' | 'apartment' | 'garage'
  const [minPrice, setMinPrice] = useState(initial?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ?? '');
  const [availableOnly, setAvailableOnly] = useState(initial?.availableOnly ?? false);
  const [sort, setSort] = useState(initial?.sort || '-createdAt'); // maps to backend "sort"

  // Keep local state in sync if parent changes initial
  useEffect(() => {
    if (!initial) return;
    setSearch(initial.search || '');
    setType(initial.type || 'all');
    setMinPrice(initial.minPrice ?? '');
    setMaxPrice(initial.maxPrice ?? '');
    setAvailableOnly(initial.availableOnly ?? false);
    setSort(initial.sort || '-createdAt');
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // sanitize numbers
    const min = minPrice !== '' ? Number(minPrice) : undefined;
    const max = maxPrice !== '' ? Number(maxPrice) : undefined;

    const payload = {
      search: search.trim(),
      type: type === 'all' ? '' : type,
      minPrice: Number.isFinite(min) ? min : '',
      maxPrice: Number.isFinite(max) ? max : '',
      availableOnly: !!availableOnly,
      sort, // already in backend format
    };

    onApply?.(payload);
  };

  const handleReset = () => {
    setSearch('');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSort('-createdAt');
    onReset?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#111',
        border: '1px solid #2b2b2b',
        borderRadius: 12,
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
          gap: '0.75rem',
          alignItems: 'end',
        }}
      >
        {/* Search */}
        <div>
          <label style={{ color: '#ccc', fontSize: 12 }}>Search</label>
          <input
            type="text"
            placeholder="Search by title, description, or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              background: '#1d1d1d',
              border: '1px solid #2b2b2b',
              color: '#eee',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Type */}
        <div>
          <label style={{ color: '#ccc', fontSize: 12 }}>Property Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              background: '#1d1d1d',
              border: '1px solid #2b2b2b',
              color: '#eee',
              borderRadius: 8,
            }}
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="garage">Garage</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label style={{ color: '#ccc', fontSize: 12 }}>Min Price</label>
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="$0"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              background: '#1d1d1d',
              border: '1px solid #2b2b2b',
              color: '#eee',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Max Price */}
        <div>
          <label style={{ color: '#ccc', fontSize: 12 }}>Max Price</label>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="$10000"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              background: '#1d1d1d',
              border: '1px solid #2b2b2b',
              color: '#eee',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Sort */}
        <div>
          <label style={{ color: '#ccc', fontSize: 12 }}>Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              background: '#1d1d1d',
              border: '1px solid #2b2b2b',
              color: '#eee',
              borderRadius: 8,
            }}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-views">Most Viewed</option>
            <option value="-ratings.average">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Bottom row: available + actions */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginTop: '0.9rem',
        }}
      >
        <label style={{ color: '#ddd', display: 'inline-flex', gap: 8 }}>
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available Only
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.6rem 0.9rem',
              background: '#252525',
              color: '#ddd',
              border: '1px solid #2b2b2b',
              borderRadius: 8,
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            style={{
              padding: '0.6rem 0.9rem',
              background: 'linear-gradient( to right, #ef4444, #b91c1c )',
              color: 'white',
              border: 0,
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            🔍 Search
          </button>
        </div>
      </div>
    </form>
  );
}
