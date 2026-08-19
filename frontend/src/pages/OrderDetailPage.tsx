import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetails } from '../hooks/useOrderDetails';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { BillSummary } from '../components/cart/BillSummary';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { Booking } from '../types';
import {
  Calendar,
  ShieldCheck,
  ArrowRight,
  Package2,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const decodedOrderId = orderId ? decodeURIComponent(orderId) : '';
  const { order, isLoading, error } = useOrderDetails(decodedOrderId);

  // Fetch bookings linked to this order
  const { data: bookingsData, isLoading: bookingsLoading } = useFrappeGetCall<{ message: Booking[] }>(
    'servora.api.get_customer_bookings',
    undefined,
    decodedOrderId ? `bookings_for_order_${decodedOrderId}` : null,
    { revalidateOnFocus: true }
  );
  const linkedBookings = (bookingsData?.message || []).filter(
    (b) => b.order_id === decodedOrderId
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">We could not locate this order in your account.</p>
        <Link to="/orders">
          <Button variant="primary">View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Link & Header */}
        <div>


          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Order Reference
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {order.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                {order.scheduled_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Scheduled: <strong>{order.scheduled_at}</strong></span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <OrderStatusBadge status={order.workflow_state} size="md" />
              <span className="text-xs text-slate-400">
                Created: {new Date(order.creation).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Linked Bookings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package2 className="w-4 h-4 text-[#7C3AED]" />
                Service Bookings ({linkedBookings.length})
              </h3>
              <p className="text-xs text-slate-500">
                Each service in this order has a separate booking. Click a booking to track its progress, view photos, and rate the service.
              </p>

              {bookingsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : linkedBookings.length > 0 ? (
                <div className="space-y-3">
                  {linkedBookings.map((booking) => (
                    <Link
                      key={booking.name}
                      to={`/bookings/${encodeURIComponent(booking.name)}`}
                      className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-[#E8E8E8] hover:border-[#7C3AED] hover:shadow-sm transition-all group"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={booking.workflow_state} size="sm" />
                        </div>
                        <div className="text-sm font-bold text-[#1C1C1C] group-hover:text-[#7C3AED] transition-colors">
                          {booking.pack_name || booking.service_package}
                        </div>
                        <div className="text-xs text-slate-500">
                          ₹{Number(booking.grand_total || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  {order.workflow_state === 'Draft'
                    ? 'Bookings will be created after you place the order.'
                    : 'No bookings found for this order.'}
                </div>
              )}
            </div>

            {/* Ordered Services Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Services in Order ({order.items.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{item.service_package}</div>
                      {item.service_name && <div className="text-xs text-slate-400">{item.service_name}</div>}
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{Number(item.discounted_price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bill + Payment */}
          <div className="lg:col-span-5 space-y-5">
            <BillSummary order={order} />

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Information
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900">
                  {order.payment_mode === 'COD' ? 'Cash On Delivery' : 'Online Payment (UPI)'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/70 border border-teal-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Need help with this order? Call our support desk at +91 1800-SERVORA.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
