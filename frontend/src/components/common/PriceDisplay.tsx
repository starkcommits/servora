import React from 'react';

interface PriceDisplayProps {
  basePrice?: number | string | null;
  discountPrice?: number | string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  basePrice,
  discountPrice,
  size = 'md',
  showSavings = true,
}) => {
  const numBase = typeof basePrice === 'string' ? parseFloat(basePrice) : (basePrice || 0);
  const numDiscount = typeof discountPrice === 'string' ? parseFloat(discountPrice) : (discountPrice || numBase);
  
  const hasDiscount = numBase > numDiscount && numDiscount > 0;
  const savings = hasDiscount ? numBase - numDiscount : 0;
  const savingsPct = hasDiscount && numBase > 0 ? Math.round((savings / numBase) * 100) : 0;

  const sizeClasses = {
    sm: { price: 'text-sm font-semibold', original: 'text-xs', savings: 'text-[10px]' },
    md: { price: 'text-base font-bold', original: 'text-xs', savings: 'text-xs' },
    lg: { price: 'text-xl font-bold', original: 'text-sm', savings: 'text-xs' },
    xl: { price: 'text-2xl font-extrabold', original: 'text-base', savings: 'text-xs' },
  };

  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className={`text-slate-900 ${sizeClasses[size].price}`}>
        ₹{numDiscount.toLocaleString('en-IN')}
      </span>
      {hasDiscount && (
        <>
          <span className={`text-slate-400 line-through ${sizeClasses[size].original}`}>
            ₹{numBase.toLocaleString('en-IN')}
          </span>
          {showSavings && savingsPct > 0 && (
            <span className={`font-semibold text-emerald-600 ${sizeClasses[size].savings}`}>
              ({savingsPct}% off)
            </span>
          )}
        </>
      )}
    </div>
  );
};
