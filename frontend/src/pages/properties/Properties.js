import React, { useEffect, useMemo, useState } from 'react';
import PropertyCard from '../../components/properties/PropertyCard';
import PropertySearch from '../../components/properties/PropertySearch';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE = (process.env.REACT_APP_APIBASE_URL || 'http://localhost:5001')
  .replace(/\/$/, '');

export default function Properties() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Debug auth state
  useEffect(() => {
    console.log('Auth State:', {
      user: user,
      userId: user?._id,
      isLoading: authLoading,
      token: localStorage.getItem('token')
    });
  }, [user, authLoading]);
  
  const isAdmin = user && user.role === 'admin';
  const isOwner = user && user.role === 'owner';
  const canCreateProperty = isAdmin || isOwner;

  // paging
  const [page, setPage] = useState(1);
  const limit = 9;

  // filters used to build the backend query
  const [filters, setFilters] = useState({
    search: '',
    type: '',            // '' means all; otherwise 'apartment' | 'garage'
    minPrice: '',
    maxPrice: '',
    availableOnly: false,
    sort: '-createdAt',
  });

  // Build the query string exactly how the backend expects it
  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.search) qs.set('search', filters.search);
    if (filters.type) qs.set('type', filters.type);
    if (filters.minPrice !== '' && Number.isFinite(Number(filters.minPrice))) {
      qs.set('minPrice', String(Number(filters.minPrice)));
    }
    if (filters.maxPrice !== '' && Number.isFinite(Number(filters.maxPrice))) {
      qs.set('maxPrice', String(Number(filters.maxPrice)));
    }
    if (filters.availableOnly) qs.set('available', 'true');
    if (filters.sort) qs.set('sort', filters.sort);

    qs.set('page', String(page));
    qs.set('limit', String(limit));

    return qs.toString();
  }, [filters, page]);

  // Delete property function for admin
  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      // Remove the deleted property from the list
      setItems(items.filter(item => item._id !== propertyId));
      toast.success('Property deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch properties when filters or page change
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr('');
      try {
        const url = `${API_BASE}/api/properties?${queryString}`;
        console.log('▶ Fetching:', url);

        const res = await fetch(url);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || 'Failed to load');

        if (!isMounted) return;

        // Ensure we have the owner field in the property data
        const propertyData = Array.isArray(json.data) ? json.data : [];
        
        // Debug log for property data
        console.log('Properties loaded:', propertyData.map(p => ({
          id: p._id,
          owner: p.owner?._id,
          title: p.title
        })));
        
        setItems(propertyData);
        setCount(json.count || 0);
        setTotal(json.total || 0);
      } catch (e) {
        if (isMounted) setErr(e.message || 'Error fetching properties');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [queryString]);

  const handleApply = (payload) => {
    // reset to page 1 whenever filters change
    setPage(1);
    setFilters((prev) => ({ ...prev, ...payload }));
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      availableOnly: false,
      sort: '-createdAt',
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <div className="flex gap-4">
            {(isAdmin || isOwner) && (
              <Link 
                to="/properties/create" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
              >
                Create New Property
              </Link>
            )}
            <Link to="/" className="btn-outline">← Back to Home</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="text-gray-400 mb-4">
          {loading ? 'Loading…' : (
            <>
              <strong>{total}</strong> properties found •{' '}
              <strong>{count}</strong> on this page
            </>
          )}
        </div>

        {/* Search/filters */}
        <PropertySearch
          initial={filters}
          onApply={handleApply}
          onReset={handleReset}
        />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {authLoading && (
            <div className="col-span-full">Loading user data...</div>
          )}
          {!authLoading && loading && (
            <div className="col-span-full">Loading properties…</div>
          )}
          {!authLoading && err && (
            <div className="text-red-400 col-span-full">
              Error loading properties: {err}
            </div>
          )}
          {!authLoading && !loading && !err && items.length === 0 && (
            <div className="col-span-full text-gray-400">
              No properties match your filters.
            </div>
          )}
          {!authLoading && !loading && !err && items.length > 0 && 
            items.map((item) => {
              const currentUserId = user?._id || null;
              
              
              
              return (
                <PropertyCard 
                  key={item._id} 
                  property={item} 
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                  onDelete={handleDelete}
                />
              );
            })
          }
        </div>

        {/* Pagination (very simple) */}
        <div className="flex items-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((n) => Math.max(1, n - 1))}
            className="btn-outline disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-gray-300">Page {page}</span>
          <button
            // naive “has next” check using how many we got back
            disabled={count < limit}
            onClick={() => setPage((n) => n + 1)}
            className="btn-outline disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
