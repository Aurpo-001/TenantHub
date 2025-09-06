import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI, bookingsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import BkashPaymentModal from '../../components/payments/BkashPaymentModal';

const BookingPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [formData, setFormData] = useState({
    bookingType: 'visit',
    visitDate: '',
    visitTimeSlot: 'morning',
    rentalPeriod: {
      startDate: '',
      endDate: '',
      duration: 6
    },
    userMessage: '',
    preferredContactTime: 'weekdays'
  });

  // ---- FIX: memoize loadProperty so it can be safely used in useEffect deps
  const loadProperty = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      try {
        // Try to fetch from backend first
        const response = await propertiesAPI.getById(propertyId);

        if (response.data && response.data.success) {
          console.log('Loaded property for booking:', response.data.data.title);
          setProperty(response.data.data);
        } else {
          throw new Error('Property not found');
        }
      } catch (error) {
        console.log('Backend not available, using mock data');

        // Fallback to mock property data
        const mockProperty = {
          _id: propertyId,
          title: 'Modern 2BR Apartment Near University',
          description: 'Beautiful modern apartment perfect for students.',
          type: 'apartment',
          price: 1200,
          location: {
            address: '123 University Ave, Campus Town'
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
          }
        };
        setProperty(mockProperty);
      }
    } catch (error) {
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  }, [propertyId, navigate]);
  // -------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProperty();
    // deps include navigate & loadProperty to satisfy eslint exhaustive-deps
  }, [isAuthenticated, navigate, loadProperty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('rentalPeriod.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        rentalPeriod: {
          ...prev.rentalPeriod,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';
    const start = new Date(startDate);
    const end = new Date(start.setMonth(start.getMonth() + parseInt(duration)));
    return end.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.rentalPeriod.startDate && formData.rentalPeriod.duration) {
      const endDate = calculateEndDate(
        formData.rentalPeriod.startDate,
        formData.rentalPeriod.duration
      );
      setFormData((prev) => ({
        ...prev,
        rentalPeriod: {
          ...prev.rentalPeriod,
          endDate
        }
      }));
    }
  }, [formData.rentalPeriod.startDate, formData.rentalPeriod.duration]);

  const validateForm = () => {
    if (formData.bookingType === 'visit') {
      if (!formData.visitDate) {
        toast.error('Please select a visit date');
        return false;
      }
      const visitDate = new Date(formData.visitDate);
      const today = new Date();
      if (visitDate <= today) {
        toast.error('Visit date must be in the future');
        return false;
      }
    } else if (formData.bookingType === 'rent') {
      if (!formData.rentalPeriod.startDate) {
        toast.error('Please select rental start date');
        return false;
      }
      if (
        !formData.rentalPeriod.duration ||
        formData.rentalPeriod.duration < property.availability.minimumStay
      ) {
        toast.error(
          `Minimum rental duration is ${property.availability.minimumStay} months`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const bookingData = {
        propertyId: property._id,
        bookingType: formData.bookingType,
        userMessage: formData.userMessage,
        preferredContactTime: formData.preferredContactTime
      };

      if (formData.bookingType === 'visit') {
        bookingData.visitDate = formData.visitDate;
        bookingData.visitTimeSlot = formData.visitTimeSlot;
      } else {
        bookingData.rentalPeriod = formData.rentalPeriod;
      }

      console.log('Submitting booking data:', bookingData);

      try {
        // Try to submit to real backend
        const response = await bookingsAPI.create(bookingData);

        console.log('Booking API response:', response.data);

        if (response.data.success) {
          toast.success('Booking created! Proceed to payment.');
          console.log('Booking created with ID:', response.data.data._id);
          setCurrentBooking(response.data.data);
          setShowBkashModal(true);
        } else {
          throw new Error(response.data.message || 'Failed to create booking');
        }
      } catch (apiError) {
        // If backend is not available, show mock success for demo
        console.log(
          'Backend not available, using mock booking submission:',
          apiError.message
        );
        toast.success(
          'Booking submitted successfully! (Demo mode - Admin will contact you soon)'
        );

        // Store booking data in localStorage for demo purposes
        const mockBooking = {
          id: Date.now().toString(),
          ...bookingData,
          status: 'pending',
          createdAt: new Date(),
          property: {
            title: property.title,
            price: property.price,
            location: property.location
          },
          user: {
            name: user.name,
            email: user.email
          }
        };

        const existingBookings = JSON.parse(
          localStorage.getItem('mockBookings') || '[]'
        );
        existingBookings.push(mockBooking);
        localStorage.setItem('mockBookings', JSON.stringify(existingBookings));

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid #404040',
              borderTop: '3px solid #f98080',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}
          ></div>
          <p>Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1
            style={{
              color: '#f3f4f6',
              fontSize: '2rem',
              marginBottom: '1rem'
            }}
          >
            Property Not Found
          </h1>
          <button onClick={() => navigate('/properties')} className="btn-primary">
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333',
          padding: '2rem 0'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1
            style={{
              color: '#f3f4f6',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}
          >
            Book Property
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Complete your booking for {property.title}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Property Summary */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <h2
            style={{
              color: '#f3f4f6',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}
          >
            Property Details
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Property
              </div>
              <div style={{ color: '#d1d5db', fontWeight: '500' }}>
                {property.title}
              </div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Type</div>
              <div
                style={{
                  color: '#d1d5db',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}
              >
                {property.type}
              </div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Price</div>
              <div
                style={{
                  color: '#f98080',
                  fontWeight: '600',
                  fontSize: '1.125rem'
                }}
              >
                ${property.price}/month
              </div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Location
              </div>
              <div style={{ color: '#d1d5db', fontWeight: '500' }}>
                {property.location.address}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Booking Type */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  color: '#d1d5db',
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}
              >
                Booking Type
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    backgroundColor:
                      formData.bookingType === 'visit' ? '#2d2d2d' : '#1a1a1a',
                    border:
                      formData.bookingType === 'visit'
                        ? '2px solid #f98080'
                        : '2px solid #404040',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: 1,
                    minWidth: '200px'
                  }}
                >
                  <input
                    type="radio"
                    name="bookingType"
                    value="visit"
                    checked={formData.bookingType === 'visit'}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <div>
                    <div style={{ color: '#f3f4f6', fontWeight: '500' }}>
                      📅 Schedule Visit
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      Visit the property before deciding
                    </div>
                  </div>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    backgroundColor:
                      formData.bookingType === 'rent' ? '#2d2d2d' : '#1a1a1a',
                    border:
                      formData.bookingType === 'rent'
                        ? '2px solid #f98080'
                        : '2px solid #404040',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: 1,
                    minWidth: '200px'
                  }}
                >
                  <input
                    type="radio"
                    name="bookingType"
                    value="rent"
                    checked={formData.bookingType === 'rent'}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <div>
                    <div style={{ color: '#f3f4f6', fontWeight: '500' }}>
                      🏠 Book for Rent
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      Ready to rent this property
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Visit Details */}
            {formData.bookingType === 'visit' && (
              <div
                style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}
              >
                <h3
                  style={{
                    color: '#f3f4f6',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}
                >
                  Visit Details
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#d1d5db',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Preferred Visit Date
                    </label>
                    <input
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleInputChange}
                      min={new Date(Date.now() + 86400000)
                        .toISOString()
                        .split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#d1d5db',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Time Slot
                    </label>
                    <select
                      name="visitTimeSlot"
                      value={formData.visitTimeSlot}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                      <option value="evening">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Rental Details */}
            {formData.bookingType === 'rent' && (
              <div
                style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}
              >
                <h3
                  style={{
                    color: '#f3f4f6',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}
                >
                  Rental Details
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#d1d5db',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      name="rentalPeriod.startDate"
                      value={formData.rentalPeriod.startDate}
                      onChange={handleInputChange}
                      min={property.availability.availableFrom}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#d1d5db',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Duration (Months)
                    </label>
                    <select
                      name="rentalPeriod.duration"
                      value={formData.rentalPeriod.duration}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    >
                      {[...Array(24)].map((_, i) => {
                        const months = i + 1;
                        const isValid =
                          months >= property.availability.minimumStay;
                        return (
                          <option
                            key={months}
                            value={months}
                            disabled={!isValid}
                          >
                            {months} month{months > 1 ? 's' : ''}{' '}
                            {!isValid
                              ? `(Min: ${property.availability.minimumStay})`
                              : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#d1d5db',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Move-out Date
                    </label>
                    <input
                      type="date"
                      value={formData.rentalPeriod.endDate}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#9ca3af',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
                {formData.rentalPeriod.startDate &&
                  formData.rentalPeriod.duration && (
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#0a1a1a',
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        marginTop: '1rem'
                      }}
                    >
                      <div
                        style={{
                          color: '#10b981',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Rental Summary
                      </div>
                      <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                        Monthly Rent:{' '}
                        <span
                          style={{ fontWeight: '600', color: '#f98080' }}
                        >
                          ${property.price}
                        </span>
                        <br />
                        Total Duration:{' '}
                        <span style={{ fontWeight: '600' }}>
                          {formData.rentalPeriod.duration} months
                        </span>
                        <br />
                        Total Cost:{' '}
                        <span
                          style={{ fontWeight: '600', color: '#f98080' }}
                        >
                          ${property.price * formData.rentalPeriod.duration}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Contact Preferences */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  color: '#d1d5db',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                Preferred Contact Time
              </label>
              <select
                name="preferredContactTime"
                value={formData.preferredContactTime}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
              >
                <option value="anytime">Anytime</option>
                <option value="weekdays">Weekdays (9 AM - 5 PM)</option>
                <option value="evenings">Evenings (5 PM - 9 PM)</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  color: '#d1d5db',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                Message to Owner (Optional)
              </label>
              <textarea
                name="userMessage"
                value={formData.userMessage}
                onChange={handleInputChange}
                placeholder="Tell the owner about yourself, your requirements, or any questions you have..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Terms and Conditions */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#0f0f0f',
                borderRadius: '6px',
                border: '1px solid #404040',
                marginBottom: '2rem'
              }}
            >
              <h4
                style={{
                  color: '#f3f4f6',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}
              >
                Important Information
              </h4>
              <ul
                style={{
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  margin: 0,
                  paddingLeft: '1rem'
                }}
              >
                <li>
                  This booking request will be sent to the property owner for
                  approval
                </li>
                <li>You will be contacted within 24-48 hours regarding your request</li>
                <li>Payment will only be required after the booking is confirmed</li>
                <li>Cancellation policies apply as per the rental agreement</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/properties')}
                style={{
                  backgroundColor: '#2d2d2d',
                  color: '#d1d5db',
                  border: '1px solid #404040',
                  padding: '0.75rem 2rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2d2d2d';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting
                  ? 'Submitting...'
                  : `Submit ${
                      formData.bookingType === 'visit' ? 'Visit' : 'Rental'
                    } Request`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* bKash Payment Modal */}
      {showBkashModal && currentBooking && (
        <BkashPaymentModal
          booking={currentBooking}
          onClose={() => {
            setShowBkashModal(false);
            navigate('/dashboard');
          }}
          onSuccess={(paymentData) => {
            console.log('Payment successful:', paymentData);
            setShowBkashModal(false);
            navigate('/dashboard');
          }}
        />
      )}

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

export default BookingPage;
