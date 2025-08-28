// frontend/src/pages/properties/PropertyDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = (process.env.REACT_APP_APIBASE_URL || 'http://localhost:5001')
  .replace(/\/$/, '');

const FALLBACKS = {
  apartment:
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1600&q=80&auto=format&fit=crop',
  garage:
    'https://images.unsplash.com/photo-1520089265514-2f0a0908f1d8?w=1600&q=80&auto=format&fit=crop',
  default:
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80&auto=format&fit=crop',
};

const isPlaceholder = (u = '') =>
  !u ||
  /placeholder|placehold\.co/i.test(u) ||
  /\/(400x250|800x450|1200x600)(\D|$)/i.test(u);

const getPrimaryImageUrl = (property) => {
  const type = property?.type || 'default';
  const images = property?.images || [];
  const candidate =
    images.find((i) => i?.isPrimary && i?.url)?.url ||
    images?.[0]?.url ||
    '';
  return isPlaceholder(candidate) ? (FALLBACKS[type] || FALLBACKS.default) : candidate;
};

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProperty() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`${API_BASE}/api/properties/${id}`);
        const json = await res.json();

        if (!json?.success) {
          throw new Error(json?.message || 'Failed to load property');
        }

        const data = json.data || {};
        const normalized = {
          ...data,
          owner: data.owner ?? {},
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          images: Array.isArray(data.images) ? data.images : [],
          location: data.location || {},
          specifications: data.specifications || {},
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
        };

        if (isMounted) setProperty(normalized);
      } catch (e) {
        if (isMounted) setErr(e.message || 'Error loading property');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProperty();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">Loading property…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-400 mb-4">Error: {err}</p>
          <Link to="/properties" className="btn-outline">Back to properties</Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4">Property not found.</p>
          <Link to="/properties" className="btn-outline">Back to properties</Link>
        </div>
      </div>
    );
  }

  const primaryImage = getPrimaryImageUrl(property);

  const {
    title,
    description,
    type,
    price,
    location = {},
    specifications = {},
    amenities = [],
    ratings = {},
  } = property;

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/properties" className="btn-outline">← Back</Link>
          <Link to={`/booking/${property._id}`} className="btn-primary">
            Book / Schedule Visit
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          <div className="text-gray-300 flex flex-wrap gap-3">
            <span className="px-2 py-1 rounded bg-dark-800 border border-dark-700">
              {type?.toUpperCase() || 'PROPERTY'}
            </span>
            {ratings?.average ? (
              <span>⭐ {ratings.average} ({ratings.count || 0})</span>
            ) : (
              <span>⭐ No ratings yet</span>
            )}
            {price != null && <span>• ${price} / month</span>}
            {location?.address && <span>• {location.address}</span>}
          </div>
        </div>

        {/* Main image */}
        <div className="rounded-xl overflow-hidden border border-dark-800">
          <img
            src={primaryImage}
            alt={property.images?.[0]?.alt || title || 'Property'}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left: details */}
          <div className="md:col-span-2 space-y-6">
            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-300 leading-7">{description || '—'}</p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Specifications</h2>
              <ul className="grid grid-cols-2 gap-3 text-gray-300">
                <li>Bedrooms: {specifications.bedrooms ?? 0}</li>
                <li>Bathrooms: {specifications.bathrooms ?? 0}</li>
                <li>Area: {specifications.area ? `${specifications.area} sq ft` : '—'}</li>
                <li>Floor: {specifications.floor ?? '—'}</li>
                <li>Furnished: {specifications.furnished || 'unfurnished'}</li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              {amenities.length ? (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-dark-800 border border-dark-700 text-sm"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No amenities listed.</p>
              )}
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Reviews</h2>
              {property.reviews?.length ? (
                <div className="space-y-4">
                  {property.reviews.map((r, i) => (
                    <div key={r._id || i} className="border-t border-dark-800 pt-3">
                      <div className="text-sm text-gray-400">
                        by {r.user?.name || 'Anonymous'} •{' '}
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </div>
                      <div>⭐ {r.rating}</div>
                      <p className="text-gray-200">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Right: owner/contact */}
          <aside className="space-y-6">
            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Owner</h2>
              <div className="space-y-2 text-gray-200">
                <div><strong>Name:</strong> {property?.owner?.name || 'Unknown owner'}</div>
                <div><strong>Email:</strong> {property?.owner?.email || 'Not available'}</div>
                <div><strong>Phone:</strong> {property?.owner?.phone || 'Not available'}</div>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="text-gray-300">
                <div>{location?.address || 'Address not provided'}</div>
                {location?.nearbyPlaces?.campus?.distance != null && (
                  <div className="mt-2">
                    Campus: {location.nearbyPlaces.campus.distance} km •{' '}
                    {location.nearbyPlaces.campus.duration}
                  </div>
                )}
              </div>
            </section>

            <Link to={`/booking/${property._id}`} className="btn-primary block text-center">
              Book / Schedule Visit
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
