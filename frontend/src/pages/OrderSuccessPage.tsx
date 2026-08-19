import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetails } from '../hooks/useOrderDetails';
import { useCart } from '../context/CartContext';
import { Button } from '../components/common/Button';
import { CheckCircle2, ArrowRight, Home, ShieldCheck } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const decodedOrderId = orderId ? decodeURIComponent(orderId) : '';
  const { order } = useOrderDetails(decodedOrderId);
  const { clearCart, refreshCart } = useCart();

  useEffect(() => {
    clearCart();
    refreshCart();
  }, [clearCart, refreshCart]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card text-center space-y-4 relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              Booking Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank you for choosing Servora!
            </h1>
            <p className="text-sm text-slate-500">
              Your service appointment has been scheduled and sent to our verified operations team.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 pt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Order ID:</span>
              <span className="font-mono font-bold text-slate-900">{decodedOrderId}</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Scheduled At:</span>
              <span className="font-bold text-slate-900">{order?.scheduled_at || 'Confirmed'}</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Total Amount:</span>
              <span className="font-extrabold text-teal-800 text-base">
                ₹{Number(order?.grand_total || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium">Payment Mode:</span>
              <span className="font-bold text-slate-900">
                {order?.payment_mode === 'COD' ? 'Cash on Delivery' : 'Online Payment (UPI)'}
              </span>
            </div>
          </div>

          {/* Services List Preview */}
          {order?.items && order.items.length > 0 && (
            <div className="text-left space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Booked Services ({order.items.length})
              </span>
              <div className="space-y-1.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-50">
                    <span className="text-slate-700 font-medium">{it.service_package}</span>
                    <span className="font-bold text-slate-900">₹{Number(it.discounted_price || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link to={`/orders/${encodeURIComponent(decodedOrderId)}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Track Booking
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Reassurance Callout */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Our operations manager will assign a verified expert shortly.</span>
        </div>
      </div>
    </div>
  );
};
