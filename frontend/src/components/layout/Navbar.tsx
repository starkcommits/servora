import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useCart } from '../../context/CartContext';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  MapPin,
  ChevronDown,
  CalendarCheck,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ServiceCategoryDialog, CATEGORY_DIALOGS } from '../home/ServiceCategoryDialog';
import type { CategoryDialogData } from '../home/ServiceCategoryDialog';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { AddressManagerModal } from '../checkout/AddressManagerModal';
import { GlobalSearch } from '../common/GlobalSearch';
import { RefundModal } from '../common/RefundModal';

const ServoraLogo = () => (
  <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
    <div className="w-7 h-7 rounded bg-[#1C1C1C] flex items-center justify-center">
      <span className="text-white text-xs font-black tracking-tight">S</span>
    </div>
    <span className="text-sm font-bold text-[#1C1C1C] leading-tight">Servora</span>
  </Link>
);

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useFrappeAuth();
  const { itemsCount } = useCart();
  const { profile, refetch: refetchProfile } = useCustomerProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<CategoryDialogData | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const isLoggedIn = Boolean(
    (currentUser && currentUser !== 'Guest') || (profile?.user?.name && profile?.user?.name !== 'Guest')
  );
  const userDisplayName =
    profile?.customer?.first_name ||
    profile?.user?.first_name ||
    (currentUser && currentUser !== 'Guest' ? currentUser.split('@')[0] : 'Account');

  const [guestLocation, setGuestLocation] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('servora_guest_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.title || parsed.location || '';
      }
    } catch {}
    return '';
  });

  const addresses = profile?.customer?.address || [];
  const currentAddress = addresses.find((a) => a.is_current === 1) || addresses[0];
  const locationDisplay = currentAddress
    ? `${currentAddress.houseflat_no ? currentAddress.houseflat_no + ', ' : ''}${currentAddress.location || ''}`
    : (guestLocation || 'Select Location');

  useEffect(() => {
    const updateLoc = () => {
      try {
        const stored = localStorage.getItem('servora_guest_location');
        if (stored) {
          const parsed = JSON.parse(stored);
          setGuestLocation(parsed.title || parsed.location || '');
        }
      } catch {}
    };
    window.addEventListener('servora_location_changed', updateLoc);
    return () => window.removeEventListener('servora_location_changed', updateLoc);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {}
  };

  const NAV_ITEMS = [
    { label: 'Home', to: '/', isCategory: false },
    { label: 'Cleaning', categoryKey: 'Home Cleaning', isCategory: true },
    { label: 'Painting', categoryKey: 'Painting', isCategory: true },
    { label: 'Pest Control', categoryKey: 'Pest Control', isCategory: true },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-150',
          scrolled ? 'shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]' : 'border-b border-[#E8E8E8]'
        )}
      >
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-[60px] flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ServoraLogo />

            {/* Location Selector Pill — ALWAYS VISIBLE on Mobile & Desktop */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E8E8E8] rounded-xl text-[11px] sm:text-[12px] font-semibold text-[#1C1C1C] transition-colors max-w-[120px] sm:max-w-[200px]"
              title={locationDisplay}
            >
              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#7C3AED] shrink-0" />
              <span className="truncate">{locationDisplay}</span>
              <ChevronDown className="w-3 h-3 text-[#737373] shrink-0" />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0 ml-2">
            {NAV_ITEMS.map((item) => {
              if (!item.isCategory) {
                return (
                  <Link
                    key={item.to}
                    to={item.to!}
                    className={cn(
                      'px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap',
                      location.pathname === '/' ? 'text-[#1C1C1C]' : 'text-[#525252] hover:text-[#1C1C1C]'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={item.categoryKey}
                  onClick={() => setActiveDialog(CATEGORY_DIALOGS[item.categoryKey!] ?? null)}
                  className="px-4 py-1.5 text-[13px] font-medium text-[#525252] hover:text-[#1C1C1C] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Global Interactive Search bar (Desktop) */}
          <div className="hidden md:block w-64 lg:w-80">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-[#525252] hover:text-[#1C1C1C] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[#1C1C1C] text-white rounded-full flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Desktop User Profile / Auth */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E8E8E8] rounded-xl text-[13px] font-semibold text-[#1C1C1C] transition-colors shadow-sm"
                  title="View Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px] font-bold">
                    {userDisplayName[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate font-semibold text-[#1C1C1C]">
                    {userDisplayName}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#333333] text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-[#525252] hover:text-[#1C1C1C] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E8E8E8] bg-white animate-fade-in shadow-xl">
            <div className="px-4 pt-3 pb-2">
              <GlobalSearch onSelect={() => setMobileOpen(false)} />
            </div>

            <div className="px-4 pb-4 space-y-1 divide-y divide-[#F5F5F5]">
              {/* Home */}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3 text-[14px] font-semibold text-[#1C1C1C] hover:text-[#7C3AED] transition-colors"
              >
                Home
              </Link>

              {/* Saved Addresses */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLocationModalOpen(true);
                }}
                className="flex items-center gap-3 w-full text-left py-3 text-[14px] font-semibold text-[#1C1C1C] hover:text-[#7C3AED] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#7C3AED]" />
                <span>Saved Addresses</span>
              </button>

              {/* Your Bookings */}
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3 text-[14px] font-semibold text-[#1C1C1C] hover:text-[#7C3AED] transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-[#1C1C1C]" />
                <span>Your Bookings</span>
              </Link>

              {/* My Refunds */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setRefundModalOpen(true);
                }}
                className="flex items-center gap-3 w-full text-left py-3 text-[14px] font-semibold text-[#1C1C1C] hover:text-[#059669] transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[#059669]" />
                <span>My Refunds</span>
              </button>

              {/* Profile & Auth */}
              {isLoggedIn ? (
                <div className="pt-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-[14px] font-semibold text-[#1C1C1C]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px] font-bold">
                      {userDisplayName[0].toUpperCase()}
                    </div>
                    <span>My Profile ({userDisplayName})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 py-2 text-xs font-semibold text-[#EF4444] w-full text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1C1C1C] hover:bg-[#333333] text-white text-[13px] font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-[60px]" />

      {/* Category dialog — rendered from navbar too */}
      <ServiceCategoryDialog
        data={activeDialog}
        onClose={() => setActiveDialog(null)}
      />

      {/* Location / Address manager modal */}
      <AddressManagerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        addresses={addresses}
        onAddressUpdated={refetchProfile}
        initialMode="search"
      />

      {/* Reusable Refund Protection Modal */}
      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
      />
    </>
  );
};
