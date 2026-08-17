import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { CalendarCheck, ArrowRight, Calendar, Plus } from 'lucide-react';

export const OrdersListPage: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['Confirmed', 'Assigned', 'On The Way', 'Started', 'Payment Pending'].includes(order.workflow_state);
    }
    if (filter === 'completed') {
      return ['Completed', 'Customer Confirmed'].includes(order.workflow_state);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 md:py-12 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
              My Bookings
            </h1>
            <p className="text-sm text-[#737373] mt-1">
              Track and manage your upcoming and completed home service bookings.
            </p>
          </div>

          <Link to="/services">
            <button className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#404040] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              Book New Service
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E8E8] pb-3 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#1C1C1C] text-white shadow-sm'
                : 'bg-white text-[#525252] hover:bg-[#F5F5F5] border border-[#E8E8E8]'
            }`}
          >
            All Bookings ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'active'
                ? 'bg-[#1C1C1C] text-white shadow-sm'
                : 'bg-white text-[#525252] hover:bg-[#F5F5F5] border border-[#E8E8E8]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-[#1C1C1C] text-white shadow-sm'
                : 'bg-white text-[#525252] hover:bg-[#F5F5F5] border border-[#E8E8E8]'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 bg-white rounded-2xl border border-[#E8E8E8] space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = order.items || [];
              const firstItem = items[0];
              const remainingCount = items.length - 1;

              return (
                <Link
                  key={order.name}
                  to={`/orders/${encodeURIComponent(order.name)}`}
                  className="block group p-6 bg-white rounded-2xl border border-[#E8E8E8] hover:border-[#1C1C1C] hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.06)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.workflow_state} size="md" />
                      <span className="text-xs font-mono text-[#737373] font-semibold">
                        #{order.name}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-[#1C1C1C]">
                      ₹{Number(order.grand_total || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="py-4 space-y-2">
                    <h3 className="text-base font-bold text-[#1C1C1C] group-hover:text-[#5B21B6] transition-colors">
                      {firstItem ? firstItem.service_package : 'Home Service Booking'}
                      {remainingCount > 0 && (
                        <span className="text-xs text-[#737373] font-normal ml-2">
                          +{remainingCount} more {remainingCount === 1 ? 'service' : 'services'}
                        </span>
                      )}
                    </h3>

                    {order.scheduled_at && (
                      <div className="flex items-center gap-2 text-xs text-[#525252]">
                        <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Scheduled: <strong>{order.scheduled_at}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs font-semibold text-[#1C1C1C] group-hover:text-[#5B21B6]">
                    <span>View Booking Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarCheck className="w-8 h-8 text-[#A0A0A0]" />}
            title="No Bookings Found"
            description="You don't have any bookings in this category yet. Book your first home service now."
            actionText="Book a Service"
            onAction={() => window.location.assign('/services')}
          />
        )}
      </div>
    </div>
  );
};
