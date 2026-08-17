import React from 'react';
import { Order } from '../../types';

interface BillSummaryProps {
  order: Order;
  showBreakdown?: boolean;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ order, showBreakdown = true }) => {
  const items = order.items || [];
  
  // Calculate item total, base total, and discount
  let itemsBaseTotal = 0;
  let itemsDiscountedTotal = 0;

  items.forEach((it) => {
    const discountedPrice =
      typeof it.discounted_price === 'string'
        ? parseFloat(it.discounted_price)
        : Number(it.discounted_price || 0);
    const basePrice =
      typeof it.base_price === 'string'
        ? parseFloat(it.base_price)
        : Number(it.base_price || discountedPrice);

    itemsDiscountedTotal += discountedPrice;
    itemsBaseTotal += basePrice > discountedPrice ? basePrice : discountedPrice;
  });

  const packDiscount = itemsBaseTotal - itemsDiscountedTotal;
  const platformFee = Number(order.platform_fee || 49);
  const grandTotal = Number(order.grand_total || itemsDiscountedTotal + platformFee);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8] shadow-sm space-y-4">
      <h3 className="text-[15px] font-bold text-[#1C1C1C]">
        Payment summary
      </h3>

      {showBreakdown && (
        <div className="space-y-2.5 text-[13px] text-[#525252]">
          <div className="flex items-center justify-between">
            <span>Item total</span>
            <span className="font-semibold text-[#1C1C1C]">
              ₹{itemsBaseTotal > 0 ? itemsBaseTotal.toLocaleString('en-IN') : itemsDiscountedTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {packDiscount > 0 && (
            <div className="flex items-center justify-between text-[#059669]">
              <span>Pack discount</span>
              <span className="font-semibold">-₹{packDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="underline decoration-dotted cursor-help" title="Standard platform safety and professional fee">
              Taxes and Fee
            </span>
            <span className="font-semibold text-[#1C1C1C]">
              ₹{platformFee.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Total amount */}
      <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
        <div className="flex items-center justify-between text-[13px] text-[#525252]">
          <span>Total amount</span>
          <span className="font-semibold text-[#1C1C1C]">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-baseline justify-between text-[16px] font-extrabold text-[#1C1C1C] pt-1">
          <span>Amount to pay</span>
          <span className="text-[20px] font-black text-[#1C1C1C]">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
