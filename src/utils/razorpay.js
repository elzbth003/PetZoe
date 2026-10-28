import marketplaceService from '../services/marketplaceService';

/**
 * Ensures the Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js)
 * is dynamically loaded and ready in the browser.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Opens the native Razorpay Gateway Checkout modal directly.
 * 
 * @param {Object} paymentData Backend payment initialization payload
 * @param {Function} onPaymentSuccess Callback invoked on signature verification success
 * @param {Function} onDismiss Callback invoked when Razorpay checkout is closed by user
 * @param {Function} onError Callback invoked on error
 */
export const launchRazorpayGateway = async ({
  paymentData,
  onPaymentSuccess,
  onDismiss,
  onError,
}) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK could not be loaded in browser. Please check your network or adblocker.');
    }

    const key = paymentData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TqUZwd3ZbGwoYQ';
    const isMockOrder = paymentData.razorpayOrderId?.startsWith('order_mock_');

    const options = {
      key: key,
      amount: paymentData.amountInPaise,
      currency: paymentData.currency || 'INR',
      name: 'PetZoe Marketplace',
      description: `Order #ORD-${String(paymentData.orderId).padStart(6, '0')} Checkout`,
      image: '/favicon.svg',
      prefill: {
        name: paymentData.customerName || '',
        email: paymentData.customerEmail || '',
        contact: paymentData.customerPhone || ''
      },
      theme: {
        color: '#1E3A5F'
      },
      handler: async function (response) {
        try {
          const verifyPayload = {
            orderId: paymentData.orderId,
            razorpayOrderId: response.razorpay_order_id || paymentData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature || 'simulated_valid_test_signature'
          };
          const verifyRes = await marketplaceService.verifyPayment(verifyPayload);
          if (onPaymentSuccess) {
            onPaymentSuccess(verifyRes.data);
          }
        } catch (err) {
          console.error('Payment verification failed on backend:', err);
          if (onError) onError(err);
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) {
            onDismiss();
          }
        }
      }
    };

    // If order was created by Razorpay server (not fallback mock), attach order_id
    if (paymentData.razorpayOrderId && !isMockOrder) {
      options.order_id = paymentData.razorpayOrderId;
    }

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      if (onError) onError(response.error);
    });

    razorpayInstance.open();
  } catch (err) {
    console.error('Failed to launch Razorpay gateway:', err);
    if (onError) onError(err);
  }
};
