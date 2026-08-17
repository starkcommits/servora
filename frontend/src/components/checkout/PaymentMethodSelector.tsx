import React from 'react';
import { cn } from '../../lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: 'COD' | 'UPI';
  onSelectMethod: (method: 'COD' | 'UPI') => void;
}

const methods = [
  {
    id: 'COD' as const,
    label: 'Cash on Delivery',
    description: 'Pay with cash after service is completed',
    icon: '💵',
  },
  {
    id: 'UPI' as const,
    label: 'Pay Online',
    description: 'UPI, Debit/Credit Card, Net Banking via Razorpay',
    icon: '📱',
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
      <p className="text-[12px] font-semibold text-[#737373] uppercase tracking-wide mb-4">
        Payment Method
      </p>
      <div className="space-y-3">
        {methods.map(method => {
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150',
                isSelected
                  ? 'border-[#1C1C1C] bg-white'
                  : 'border-[#E8E8E8] hover:border-[#D1D1D1] bg-white'
              )}
            >
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1C1C1C]">{method.label}</p>
                <p className="text-[12px] text-[#737373] mt-0.5">{method.description}</p>
              </div>
              {/* Radio indicator */}
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                isSelected ? 'border-[#1C1C1C]' : 'border-[#D1D1D1]'
              )}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1C]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
