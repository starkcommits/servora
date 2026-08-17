import React from 'react';
import { CartItem } from '../../types';
import { Trash2 } from 'lucide-react';

interface CartItemRowProps {
  item: CartItem;
  onRemove: (packageName: string) => void;
  isLoading?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item, onRemove, isLoading = false }) => {
  const price = typeof item.discounted_price === 'string' ? parseFloat(item.discounted_price) : (item.discounted_price || 0);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {item.service_package}
        </h4>
        {item.service_name && (
          <p className="text-xs text-slate-500 font-medium">
            Category: {item.service_name}
          </p>
        )}
        <div className="text-sm font-extrabold text-teal-700 pt-0.5">
          ₹{price.toLocaleString('en-IN')}
        </div>
      </div>

      <button
        onClick={() => onRemove(item.service_package)}
        disabled={isLoading}
        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
        title="Remove from Cart"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
