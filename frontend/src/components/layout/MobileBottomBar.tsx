import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, ShoppingCart, CalendarCheck, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';

// UC mobile nav: white, dark text, minimal — no colored active backgrounds
export const MobileBottomBar: React.FC = () => {
  const { itemsCount } = useCart();
  const location = useLocation();

  const tabs = [
    { label: 'Home',     icon: Home,          to: '/' },
    { label: 'Services', icon: Layers,         to: '/services' },
    { label: 'Cart',     icon: ShoppingCart,   to: '/cart',   badge: itemsCount },
    { label: 'Bookings', icon: CalendarCheck,  to: '/orders' },
    { label: 'Profile',  icon: User,           to: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8E8] shadow-[0_-2px_8px_0_rgba(0,0,0,0.05)]">
      <div className="flex items-stretch">
        {tabs.map(tab => {
          const isActive = tab.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 relative',
                isActive ? 'text-[#1C1C1C]' : 'text-[#A0A0A0]'
              )}
            >
              {/* Active: top bar indicator like UC */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#1C1C1C] rounded-full" />
              )}
              <div className="relative">
                <tab.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2 : 1.5} />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[9px] font-bold bg-[#1C1C1C] text-white rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-[#1C1C1C]' : 'text-[#A0A0A0]')}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} className="bg-white" />
    </nav>
  );
};
