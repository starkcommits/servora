import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { useQueryClient } from '@tanstack/react-query';
import { useFrappePostCall } from 'frappe-react-sdk';
import { BillSummary } from '../components/cart/BillSummary';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { ArrowLeft, MapPin, Layers, ArrowRight, AlertCircle, CalendarDays } from 'lucide-react';
import { useState } from 'react';

export const CheckoutReviewPage: React.FC = () => {
  const { cart } = useCart();
  const { profile } = useCustomerProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { call: confirmCodCall } = useFrappePostCall('servora.api.confirm_cod_order');
  const { call: makePaymentCall } = useFrappePostCall('servora.api.make_payment');

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Your Cart is Empty</h2>
        <p className="text-[14px] text-[#737373]">Add services before reviewing checkout.</p>
        <Link to="/services">
          <button className="mt-2 bg-[#1C1C1C] text-white px-6 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-[#404040] transition-colors">
            Browse Services
          </button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!cart.scheduled_at) {
      navigate('/checkout/slot');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      if (paymentMethod === 'COD') {
        const confirmedOrderId = cart.name;
        const res = await confirmCodCall({ order_id: confirmedOrderId });
        if (res?.message?.status === 'success') {
          navigate(`/orders/${encodeURIComponent(confirmedOrderId)}/success`, { state: { order: res.message } });
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        } else {
          setErrorMsg('Failed to confirm order. Please try again.');
        }
      } else {
        const res = await makePaymentCall({ order_id: cart.name });
        if (res?.message?.payment_url) {
          window.location.href = res.message.payment_url;
        } else {
          setErrorMsg('Failed to initiate payment. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerName = profile?.customer?.full_name || profile?.user?.first_name || 'Customer';
  const customerPhone = profile?.customer?.mobile_number || profile?.user?.mobile_no || '';
  const currentAddress = profile?.customer?.address?.find((a: any) => a.is_current) || profile?.customer?.address?.[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-10">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/checkout/slot" className="flex items-center gap-1 text-[13px] text-[#737373] hover:text-[#1C1C1C] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <span className="text-[#D1D1D1]">/</span>
          <span className="text-[13px] text-[#1C1C1C] font-medium">Review Order</span>
        </div>

        <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-6">Review & Pay</h1>

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#DC2626] mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">

          {/* Left: Review info */}
          <div className="space-y-4">

            {/* Address card */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Service Address
                </span>
                <Link to="/profile" className="text-[12px] font-semibold text-[#1C1C1C] underline underline-offset-2">
                  Change
                </Link>
              </div>
              <p className="text-[14px] font-semibold text-[#1C1C1C]">{customerName}</p>
              <p className="text-[13px] text-[#737373] mt-0.5">
                {customerPhone && <span>{customerPhone} · </span>}
                {currentAddress ? currentAddress.houseflat_no : 'Doorstep service at registered address'}
              </p>
            </div>

            {/* Schedule card */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Appointment
                </span>
                <Link to="/checkout/slot" className="text-[12px] font-semibold text-[#1C1C1C] underline underline-offset-2">
                  Change
                </Link>
              </div>
              <p className="text-[15px] font-bold text-[#1C1C1C]">
                {cart.scheduled_at || (
                  <span className="text-[#D97706] font-semibold">No slot selected — please go back</span>
                )}
              </p>
            </div>

            {/* Services summary */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Services ({cart.items.length})
                </span>
                <Link to="/cart" className="text-[12px] font-semibold text-[#1C1C1C] underline underline-offset-2">
                  Edit
                </Link>
              </div>
              <div className="divide-y divide-[#F5F5F5]">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="text-[13px] text-[#1C1C1C]">{item.service_package}</span>
                    <span className="text-[14px] font-semibold text-[#1C1C1C]">
                      ₹{Number(item.discounted_price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <PaymentMethodSelector selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />
          </div>

          {/* Right: Bill + CTA */}
          <div className="space-y-4">
            <BillSummary order={cart} />

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay with Razorpay'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[12px] text-[#A0A0A0]">
              Secure booking · Background-verified professionals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
