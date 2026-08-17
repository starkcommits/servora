import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const MiniCartWidget: React.FC = () => {
  const { cart, itemsCount } = useCart();

  const items = cart?.items || [];
  const grandTotal = Number(cart?.grand_total || 0);

  if (itemsCount === 0 || items.length === 0) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3 text-[#A0A0A0]">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <p className="text-[13px] font-medium text-[#737373]">
          No items in your cart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <h4 className="text-[14px] font-bold text-[#1C1C1C]">
          Cart ({itemsCount})
        </h4>
        <Link to="/cart" className="text-[12px] font-semibold text-[#5B21B6] hover:underline">
          Edit
        </Link>
      </div>

      {/* Items preview list */}
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2 text-[12px]">
            <span className="text-[#1C1C1C] font-medium line-clamp-1 flex-1">
              {item.service_package}
            </span>
            <span className="text-[#1C1C1C] font-bold shrink-0">
              ₹{Number(item.discounted_price || 0).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#F0F0F0] pt-3 space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#737373]">Total</span>
          <span className="text-[16px] font-extrabold text-[#1C1C1C]">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <Link
          to="/cart"
          className="w-full py-2.5 px-4 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
