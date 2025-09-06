import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_APIBASE_URL || 'http://localhost:5001';

const BkashPaymentModal = ({ booking, onClose, onSuccess }) => {
  const [bkashNumber, setBkashNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, processing, confirmation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting bKash payment:', { bkashNumber, bookingId: booking._id });

      setTimeout(() => {
        setStep('confirmation');
        setLoading(false);
        if (onSuccess) onSuccess();
    }, 3000);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">bKash Payment</h2>

        {step === 'input' && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                bKash Number
              </label>
              <input
                type="tel"
                pattern="01[0-9]{9}"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full p-2 rounded bg-dark-800 border border-gray-700"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter your bKash account number
              </p>
            </div>

            <div className="text-lg font-semibold mb-4">
              Amount: ৳{booking.totalAmount}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay with bKash'}
              </button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-lg">Processing your payment...</p>
            <p className="text-sm text-gray-400 mt-2">
              Please do not close this window
            </p>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-400 mb-4">
              Your payment has been processed successfully
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 rounded"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BkashPaymentModal;
