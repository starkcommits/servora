import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetails } from '../hooks/useOrderDetails';
import { useFrappePostCall } from 'frappe-react-sdk';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { OrderTrackingTimeline } from '../components/orders/OrderTrackingTimeline';
import { BillSummary } from '../components/cart/BillSummary';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import {
  ArrowLeft,
  Calendar,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const decodedOrderId = orderId ? decodeURIComponent(orderId) : '';
  const { order, isLoading, error, refetch } = useOrderDetails(decodedOrderId);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { call: makePaymentCall } = useFrappePostCall('servora.api.make_payment');
  const { call: customerConfirmCall } = useFrappePostCall('servora.api.customer_confirm_order');

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await makePaymentCall({ order_id: order.name });
      if (res && res.message && res.message.payment_url) {
        window.location.href = res.message.payment_url;
      } else {
        setErrorMsg('Failed to generate payment gateway URL.');
      }
    } catch (err: any) {
      console.error('Payment retry error:', err);
      setErrorMsg(err?.message || 'Payment initiation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCustomerConfirm = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await customerConfirmCall({ order_id: order.name });
      if (res && res.message && res.message.status === 'success') {
        setSuccessMsg('Thank you! You have confirmed the completed service.');
        await refetch();
      }
    } catch (err: any) {
      console.error('Customer confirmation error:', err);
      setErrorMsg(err?.message || 'Failed to confirm order completion.');
    } finally {
      setActionLoading(false);
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

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">We could not locate this order in your account.</p>
        <Link to="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const assignedWorkers = order.assigned_worker || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Link & Header */}
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all bookings</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Booking Reference
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {order.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Scheduled: <strong>{order.scheduled_at || 'Schedule Pending'}</strong></span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <OrderStatusBadge status={order.workflow_state} size="md" />
              <span className="text-xs text-slate-400">
                Created: {new Date(order.creation).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-2xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Special Actions Banner */}
        {order.workflow_state === 'Payment Pending' && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">Payment Pending</h4>
              <p className="text-xs text-amber-700">Please complete online payment to confirm your booking.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleRetryPayment}
              isLoading={actionLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Pay Now (₹{Number(order.grand_total || 0).toLocaleString('en-IN')})
            </Button>
          </div>
        )}

        {order.workflow_state === 'Completed' && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-900">Service Completed!</h4>
              <p className="text-xs text-emerald-700">Our professional has finished the job. Please confirm your satisfaction.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleCustomerConfirm}
              isLoading={actionLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Service Completed
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Tracking & Details */}
          <div className="lg:col-span-7 space-y-6">

            {/* Live Progress Timeline */}
            <OrderTrackingTimeline
              workflowState={order.workflow_state}
              startTime={order.start_time}
              finishTime={order.finish_time}
            />

            {/* Assigned Professionals */}
            {assignedWorkers.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-700" />
                  <span>Assigned Professional</span>
                </h3>
                <div className="space-y-2 pt-1">
                  {assignedWorkers.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                          {w.worker.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Verified Service Pro</div>
                          <div className="text-xs text-slate-500 font-mono">ID: {w.worker}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        Assigned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booked Services List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Services Booked ({order.items.length})
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

          {/* Right Bill & Payment Status */}
          <div className="lg:col-span-5 space-y-5">
            <BillSummary order={order} />

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Information
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900">
                  {order.payment_mode === 'CASH' ? 'Cash On Delivery' : 'Online Payment (UPI)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-teal-800">
                  {order.payment_collected ? 'Payment Received' : (order.payment_mode === 'CASH' ? 'Pay on completion' : 'Verified')}
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
