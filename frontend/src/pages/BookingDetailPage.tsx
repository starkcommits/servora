import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingDetails } from '../hooks/useBookingDetails';
import { useFrappePostCall } from 'frappe-react-sdk';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Package,
  CreditCard,
  ClipboardList,
} from 'lucide-react';

// Star Rating component
const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}> = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              (hovered || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-[#D1D5DB] fill-[#D1D5DB]'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const decodedId = bookingId ? decodeURIComponent(bookingId) : '';
  const { details, isLoading, error, refetch } = useBookingDetails(decodedId);

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { call: submitReviewCall } = useFrappePostCall('servora.api.submit_booking_review');

  const handleSubmitReview = async () => {
    if (!rating) {
      setReviewError('Please select a rating.');
      return;
    }
    try {
      setReviewSubmitting(true);
      setReviewError(null);
      await submitReviewCall({
        booking_id: decodedId,
        rating,
        note: note || undefined,
      });
      setReviewSuccess(true);
      await refetch();
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
        <p className="text-sm text-slate-500">We could not locate this booking in your account.</p>
        <Link to="/orders">
          <Button variant="primary">View My Bookings</Button>
        </Link>
      </div>
    );
  }

  const { booking, pack_name, service_name, execution, payment } = details;
  const isCompleted = ['Completed', 'Customer Confirmed'].includes(booking.workflow_state);
  const alreadyReviewed = execution && (execution.customer_rating ?? 0) > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Link & Header */}
        <div>


          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-1">
              {/* Service Package Name */}
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  {service_name || 'Home Service'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {pack_name || booking.service_package}
              </h1>
              <span className="text-xs font-mono text-slate-400">#{booking.name}</span>
              {booking.scheduled_at && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Scheduled: <strong>{booking.scheduled_at}</strong></span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <OrderStatusBadge status={booking.workflow_state} size="md" />
              <span className="text-xs text-slate-400">
                Created: {new Date(booking.creation).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
              <Link
                to={`/orders/${encodeURIComponent(booking.order_id)}`}
                className="text-xs text-[#7C3AED] font-semibold hover:underline"
              >
                View Parent Order →
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Status Timeline + Review */}
          <div className="lg:col-span-7 space-y-6">

            {/* Progress Steps */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-700" />
                Booking Progress
              </h3>
              <div className="space-y-3">
                {[
                  { state: 'Confirmed', label: 'Booking Confirmed' },
                  { state: 'Assigned', label: 'Professional Assigned' },
                  { state: 'On The Way', label: 'On The Way' },
                  { state: 'Started', label: 'Service Started' },
                  { state: 'Completed', label: 'Service Completed' },
                  { state: 'Customer Confirmed', label: 'Confirmed by You' },
                ].map(({ state, label }) => {
                  const stateOrder = ['Confirmed', 'Assigned', 'On The Way', 'Started', 'Completed', 'Customer Confirmed'];
                  const currentIdx = stateOrder.indexOf(booking.workflow_state);
                  const stepIdx = stateOrder.indexOf(state);
                  const isDone = stepIdx <= currentIdx;
                  const isCurrent = state === booking.workflow_state;

                  return (
                    <div key={state} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                        isDone
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${
                        isCurrent ? 'text-teal-700' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {label}
                        {isCurrent && <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">Current</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Review Section */}
            {isCompleted && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Your Rating
                </h3>

                {alreadyReviewed || reviewSuccess ? (
                  <div>
                    <div className="mb-2">
                      <StarRating value={execution?.customer_rating || rating} readonly />
                    </div>
                    {execution?.customer_note && (
                      <p className="text-sm text-slate-600 italic mt-2">"{execution.customer_note}"</p>
                    )}
                    <p className="text-xs text-teal-700 font-semibold mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Thank you for your feedback!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <StarRating value={rating} onChange={setRating} />
                    <textarea
                      placeholder="Leave a comment (optional)..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none placeholder:text-slate-400"
                    />
                    {reviewError && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {reviewError}
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmitReview}
                      isLoading={reviewSubmitting}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                    >
                      Submit Review
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Before/After Photos */}
            {execution && (
              (execution.before_photo1 || execution.after_photo1) && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Service Photos
                  </h3>
                  {execution.before_photo1 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2">Before</p>
                      <div className="flex gap-2 flex-wrap">
                        {[execution.before_photo1, execution.before_photo2, execution.before_photo3]
                          .filter(Boolean)
                          .map((src, i) => (
                            <img key={i} src={src!} alt={`Before ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {execution.after_photo1 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2">After</p>
                      <div className="flex gap-2 flex-wrap">
                        {[execution.after_photo1, execution.after_photo2, execution.after_photo3]
                          .filter(Boolean)
                          .map((src, i) => (
                            <img key={i} src={src!} alt={`After ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Right: Bill + Payment */}
          <div className="lg:col-span-5 space-y-5">
            {/* Bill Summary (reuse with booking data) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bill Summary
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{pack_name || booking.service_package}</span>
                <span className="font-bold text-slate-900">
                  ₹{Number(booking.discounted_price || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Platform Fee</span>
                <span className="font-bold text-slate-900">
                  ₹{Number(booking.platform_fee || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-base font-black text-slate-900">
                  ₹{Number(booking.grand_total || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Payment
              </h4>
              {payment ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold text-slate-900">
                      {payment.payment_method === 'COD' ? 'Cash On Delivery' : 'Online (UPI)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-bold ${
                      payment.payment_status === 'Completed'
                        ? 'text-teal-700'
                        : payment.payment_status === 'Pending'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {payment.payment_status}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No payment record found.</p>
              )}
            </div>

            <div className="p-4 bg-teal-50/70 border border-teal-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>Need help with this booking? Call our support desk at +91 1800-SERVORA.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
