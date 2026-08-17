import React from 'react';
import { cn } from '../../lib/utils';

// UC accurate status badge — muted colors, small pill
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'Draft':              { label: 'Draft',           className: 'bg-[#F5F5F5] text-[#737373] border-[#E8E8E8]' },
  'Payment Pending':    { label: 'Payment Pending', className: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' },
  'Confirmed':          { label: 'Confirmed',       className: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' },
  'Assigned':           { label: 'Assigned',        className: 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]' },
  'On The Way':         { label: 'On The Way',      className: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]' },
  'Started':            { label: 'In Progress',     className: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]' },
  'Completed':          { label: 'Completed',       className: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' },
  'Customer Confirmed': { label: 'Done ✓',          className: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' },
  'Cancelled':          { label: 'Cancelled',       className: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]' },
};

interface OrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-[#F5F5F5] text-[#737373] border-[#E8E8E8]',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-medium border rounded-full',
      config.className,
      size === 'md' ? 'text-[12px] px-3 py-1' : 'text-[11px] px-2.5 py-0.5'
    )}>
      {config.label}
    </span>
  );
};
