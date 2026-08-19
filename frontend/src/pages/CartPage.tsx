import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { BillSummary } from '../components/cart/BillSummary';
import { SlotSelector } from '../components/checkout/SlotSelector';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { EmptyState } from '../components/common/EmptyState';
import { AddressCard } from '../components/checkout/AddressCard';
import {
  ShoppingBag,
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  Percent,
  CheckSquare,
  Square,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, addToCart, setSchedule, isActionLoading, itemsCount, clearCart, refreshCart } = useCart();
  const { currentUser } = useFrappeAuth();
  const { profile, refetch: refetchProfile } = useCustomerProfile();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [avoidCalling, setAvoidCalling] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addressError, setAddressError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { call: confirmCodCall } = useFrappePostCall('servora.api.confirm_cod_order');
  const { call: makePaymentCall } = useFrappePostCall('servora.api.make_payment');

  const isLoggedIn = currentUser && currentUser !== 'Guest';
  const items = cart?.items || [];
  const addresses = profile?.customer?.address || [];
  const currentAddress = addresses.find((a) => a.is_current === 1) || addresses[0];
  const isAddressSelected = Boolean(currentAddress);
  const isSlotSelected = Boolean(cart?.scheduled_at);
  const canPlaceOrder = isLoggedIn && isAddressSelected && isSlotSelected && isOnline;

  // Calculate total savings
  let totalSavings = 0;
  items.forEach((it) => {
    const dPrice = typeof it.discounted_price === 'string' ? parseFloat(it.discounted_price) : Number(it.discounted_price || 0);
    const bPrice = typeof it.base_price === 'string' ? parseFloat(it.base_price) : Number(it.base_price || dPrice);
    if (bPrice > dPrice) {
      totalSavings += bPrice - dPrice;
    }
  });

  // Empty cart view
  if (itemsCount === 0 || items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-[#A0A0A0]" />}
          title="Your Cart is Empty"
          description="You haven't added any service packages to your cart yet. Explore our trusted home services to get started."
          actionText="Explore Services"
          onAction={() => navigate('/services')}
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    const currentAddress = addresses.find((a) => a.is_current === 1) || addresses[0];
    if (!currentAddress) {
      setAddressError(true);
      setErrorMsg('Please add your doorstep service address before placing order.');
      return;
    }
    setAddressError(false);

    if (!cart?.scheduled_at) {
      setErrorMsg('Please select a date and time slot before proceeding.');
      return;
    }

    const scheduledDateStr = cart.scheduled_at.replace(' ', 'T'); // Convert to ISO 8601 compatible
    const scheduledDate = new Date(scheduledDateStr);
    if (scheduledDate < new Date()) {
      setErrorMsg('The selected time slot has already passed. Please select a future date and time slot.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (paymentMethod === 'COD') {
        const confirmedOrderId = cart.name;
        const res = await confirmCodCall({ order_id: confirmedOrderId });
        if (res?.message?.status === 'success') {
          clearCart();
          await refreshCart();
          navigate(`/orders/${encodeURIComponent(confirmedOrderId)}/success`, {
            state: { order: res.message },
          });
        } else {
          setErrorMsg('Failed to confirm order. Please try again.');
        }
      } else {
        const confirmedOrderId = cart.name;
        const res = await makePaymentCall({ order_id: confirmedOrderId });
        if (res?.message?.payment_url) {
          clearCart();
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-16">
      {/* ── Minimal UC Checkout Top Header ── */}
      <div className="bg-white border-b border-[#E8E8E8] sticky top-[60px] z-30 shadow-[0_1px_4px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="w-8 h-8 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#525252] hover:text-[#1C1C1C] hover:bg-[#F5F5F5] transition-colors shrink-0"
              title="Back to services"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-[17px] font-bold text-[#1C1C1C]">Checkout</h1>
          </div>

          <div className="text-[12px] text-[#737373] font-medium hidden sm:block">
            Order ID: <span className="font-mono text-[#1C1C1C] font-bold">{cart?.name}</span>
          </div>
        </div>
      </div>

      {/* ── 2-Column Checkout Layout (Urban Company Architecture) ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#DC2626] mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ═════════════════════════════════════════════
              LEFT COLUMN: Savings, Account, Slot, Payment
             ═════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4">
            {/* Savings Banner — UC Style */}
            {totalSavings > 0 && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 flex items-center gap-2.5 text-[#059669] text-[13px] font-bold">
                <Tag className="w-4 h-4 shrink-0 fill-[#059669]" />
                <span>Saving ₹{totalSavings.toLocaleString('en-IN')} on this order</span>
              </div>
            )}

            {/* Account / Login Card */}
            {!isLoggedIn ? (
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1C1C1C]">Account</h3>
                  <p className="text-[13px] text-[#737373] mt-0.5">
                    To book the service, please login or sign up
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
                  className="w-full h-11 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[14px] font-bold rounded-xl flex items-center justify-center transition-colors shadow-sm"
                >
                  Login
                </button>
              </div>
            ) : (
              /* Urban Company Address Card with Add / Change flows */
              <AddressCard
                addresses={addresses}
                onAddressUpdated={refetchProfile}
                customerName={customerName}
                customerPhone={customerPhone}
                hasError={addressError}
              />
            )}

            {/* Slot Selector Card */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#1C1C1C]">
                  Select Date & Time Slot
                </h3>
                {cart?.scheduled_at && (
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                    Slot Selected
                  </span>
                )}
              </div>

              <SlotSelector
                selectedScheduledAt={cart?.scheduled_at || null}
                onSelectSlot={async (datetimeStr) => {
                  setErrorMsg(null);
                  await setSchedule(datetimeStr);
                }}
              />
            </div>

            {/* Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />

            {/* Service Preference Checkbox */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setAvoidCalling((v) => !v)}
                className="flex items-center gap-3 text-left w-full text-[13px] font-medium text-[#1C1C1C]"
              >
                {avoidCalling ? (
                  <CheckSquare className="w-5 h-5 text-[#1C1C1C] shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-[#D1D1D1] shrink-0" />
                )}
                <span>Avoid calling before reaching the location</span>
              </button>
            </div>
          </div>

          {/* ═════════════════════════════════════════════
              RIGHT COLUMN: Items Breakdown, Offers, Summary
             ═════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-[134px]">
            {/* Card 1: Selected Items Breakdown (UC Style) */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  Service Items ({items.length})
                </span>
                <Link
                  to="/services"
                  className="text-[12px] font-bold text-[#5B21B6] hover:underline"
                >
                  + Add more
                </Link>
              </div>

              <div className="divide-y divide-[#F5F5F5] space-y-3">
                {items.map((item, idx) => {
                  const dPrice =
                    typeof item.discounted_price === 'string'
                      ? parseFloat(item.discounted_price)
                      : Number(item.discounted_price || 0);
                  const bPrice =
                    typeof item.base_price === 'string'
                      ? parseFloat(item.base_price)
                      : Number(item.base_price || dPrice);
                  const hasDiscount = bPrice > dPrice;

                  return (
                    <div key={item.name || idx} className="pt-3 first:pt-0">
                      <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wide mb-1">
                        {item.service_name || 'SERVICE PACK'}
                      </div>
                      <h4 className="text-[14px] font-bold text-[#1C1C1C] mb-2 leading-snug">
                        {item.service_package}
                      </h4>

                      <div className="flex items-center justify-between">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-2 py-1">
                          <button
                            onClick={() => removeFromCart(item.service_package)}
                            disabled={isActionLoading}
                            className="p-0.5 text-[#525252] hover:text-[#EF4444] transition-colors disabled:opacity-50"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[12px] font-bold text-[#1C1C1C] px-1">1</span>
                          <button
                            onClick={() => addToCart(item.service_package)}
                            disabled={true}
                            className="p-0.5 text-[#A0A0A0] cursor-not-allowed"
                            title="1 package added"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-[15px] font-bold text-[#1C1C1C]">
                            ₹{dPrice.toLocaleString('en-IN')}
                          </div>
                          {hasDiscount && (
                            <div className="text-[11px] text-[#A0A0A0] line-through">
                              ₹{bPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Coupons & Offers */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1C1C1C]">Coupons and offers</h4>
                  <p className="text-[11px] text-[#737373]">Best available discount auto-applied</p>
                </div>
              </div>
              <span className="text-[12px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            {/* Card 3: Payment Summary (BillSummary) */}
            {cart && <BillSummary order={cart} />}

            {/* Validation Notice when incomplete */}
            {!canPlaceOrder && (
              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[12px] text-[#92400E] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>
                  {!isOnline 
                    ? 'You are offline. Reconnect to place your order.'
                    : !isLoggedIn
                    ? 'Please login to proceed with your booking.'
                    : !isAddressSelected
                      ? 'Please add or select a service address above.'
                      : !isSlotSelected
                        ? 'Please select a date & time slot above.'
                        : ''}
                </span>
              </div>
            )}

            {/* Main Primary CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder || isSubmitting || isActionLoading}
              className={`w-full h-12 text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${canPlaceOrder
                  ? 'bg-[#1C1C1C] hover:bg-[#404040] text-white active:scale-98 cursor-pointer'
                  : 'bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed shadow-none'
                }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {!isOnline
                      ? 'Offline'
                      : !isLoggedIn
                      ? 'Login to Place Order'
                      : !isAddressSelected
                        ? 'Select Address to Proceed'
                        : !isSlotSelected
                          ? 'Select Time Slot to Proceed'
                          : paymentMethod === 'COD'
                            ? 'Place Order (Cash on Delivery)'
                            : 'Proceed to Pay Online'}
                  </span>
                  {canPlaceOrder && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>

            {/* Trust Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#A0A0A0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Safe & Secure Doorstep Service Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
