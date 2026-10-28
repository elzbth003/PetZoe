import React, { useState } from 'react';
import {
  ShieldCheck, CreditCard, Smartphone, Building2,
  CheckCircle2, Loader2, X, Lock, AlertCircle,
  Truck, ArrowRight, QrCode
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';

function price(p) {
  return `₹${Number(p).toLocaleString('en-IN')}`;
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentData, // { orderId, razorpayOrderId, amount, amountInPaise, customerName, customerEmail }
  onPaymentSuccess
}) {
  const { showToast } = useToast();
  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8821 9012 3456');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('882');
  const [cardName, setCardName] = useState(paymentData?.customerName || 'Alex Carter');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !paymentData) return null;

  const handlePay = async (e) => {
    e?.preventDefault();
    setIsProcessing(true);

    try {
      // Step: Call backend to verify payment and record the transaction
      const isMock = paymentData.razorpayOrderId?.startsWith('order_mock_');
      const simulatedPaymentId = `pay_${method}_${Date.now()}`;
      
      const res = await marketplaceService.verifyPayment({
        orderId: paymentData.orderId,
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: isMock ? 'simulated_valid_test_signature' : 'simulated_valid_test_signature'
      });

      showToast(`Payment of ${price(paymentData.amount)} successful! Order #ORD-${String(paymentData.orderId).padStart(6, '0')} confirmed.`, 'success');
      window.dispatchEvent(new Event('cart-updated'));
      
      if (onPaymentSuccess) {
        onPaymentSuccess(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Payment verification failed', err);
      showToast(err.response?.data?.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (paymentData?.orderId) {
        await marketplaceService.cancelPayment(paymentData.orderId, 'User cancelled payment checkout');
      }
    } catch (err) {
      /* ignore cleanup error */
    }
    showToast('Payment cancelled. Order was not placed.', 'warning');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B1A2F] to-[#1E3A5F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#F6BD60]">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">PetZoe Secure Checkout</h3>
              <p className="text-[10px] text-slate-300 font-medium">Order #ORD-{String(paymentData.orderId).padStart(6, '0')}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Order Amount Banner */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Amount to Pay</span>
            <span className="text-2xl font-black text-slate-900">{price(paymentData.amount)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck size={14} /> 256-Bit SSL Protected
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                { id: 'cod', label: 'Pay on Delivery', icon: Truck },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    method === id
                      ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F] shadow-sm font-bold ring-2 ring-[#1E3A5F]/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon size={18} className={method === id ? 'text-[#1E3A5F]' : 'text-slate-400'} />
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form details based on selected method */}
          {method === 'upi' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">UPI Instant Transfer</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Zero Convenience Fee</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Enter UPI ID / VPA</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobileNumber@upi or name@okaxis"
                    className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#1E3A5F]"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#1E3A5F] bg-blue-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                <span className="flex items-center gap-1"><QrCode size={13} /> GPay, PhonePe, Paytm, BHIM accepted</span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Debit or Credit Card</span>
                <div className="flex gap-1">
                  <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">VISA</span>
                  <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">MasterCard</span>
                  <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">RuPay</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 •••• •••• ••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#1E3A5F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#1E3A5F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full name as on card"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Select Your Bank</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['HDFC', 'SBI', 'ICICI', 'Axis Bank', 'Kotak', 'Other Banks'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedBank === b
                        ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === 'cod' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Truck size={16} className="text-amber-600" /> Pay upon Delivery
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You can pay using Cash, UPI QR code, or Cards when our courier arrives with your pet essentials.
              </p>
            </div>
          )}

          {/* Secure Guarantee Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
            <Lock size={12} className="text-emerald-500" />
            <span>Guaranteed 100% Safe & Secure Payment Processing</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-200/60 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1 py-3.5 px-6 rounded-xl bg-[#1E3A5F] hover:bg-[#162e4d] text-white font-bold text-xs transition-all shadow-md shadow-[#1E3A5F]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Authorizing Payment…
              </>
            ) : (
              <>
                <Lock size={14} />
                Pay {price(paymentData.amount)} Securely
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
