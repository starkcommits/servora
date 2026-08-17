import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Skeleton } from '../components/common/Skeleton';
import { AddressManagerModal } from '../components/checkout/AddressManagerModal';
import { RefundModal } from '../components/common/RefundModal';
import {
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  RotateCcw,
  LogOut,
  Plus,
  Home,
  Briefcase,
  Navigation,
  ChevronRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, refetch } = useCustomerProfile();
  const { currentUser, logout } = useFrappeAuth();
  const navigate = useNavigate();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!currentUser || currentUser === 'Guest') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center space-y-4 bg-[#FAFAFA]">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-xl font-bold text-[#1C1C1C]">Please Log In</h2>
          <p className="text-sm text-[#737373]">
            Log in to view your profile, booking history, and saved doorstep addresses.
          </p>
          <Link to="/login">
            <button className="px-6 py-2.5 bg-[#1C1C1C] hover:bg-[#404040] text-white text-sm font-bold rounded-xl transition-colors">
              Log In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const user = profile?.user;
  const customer = profile?.customer;
  const addresses = customer?.address || [];

  const getAddressIcon = (type?: string) => {
    if (type?.toLowerCase() === 'work') return <Briefcase className="w-4 h-4 text-[#7C3AED]" />;
    if (type?.toLowerCase() === 'home') return <Home className="w-4 h-4 text-[#7C3AED]" />;
    return <Navigation className="w-4 h-4 text-[#7C3AED]" />;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 md:py-12 pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header & User Info Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E8E8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xl font-bold shadow-sm">
              {(customer?.first_name || user?.first_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C]">
                {customer?.full_name || customer?.first_name || user?.first_name || 'Customer'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#737373] mt-1">
                {customer?.mobile_number && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.mobile_number}
                  </span>
                )}
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* ── 3 Action Cards: Saved Addresses | Your Bookings | My Refunds ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Saved Addresses */}
          <div
            onClick={() => setAddressModalOpen(true)}
            className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-[#7C3AED] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1C]">Saved Addresses</div>
                <div className="text-[12px] text-[#737373] mt-0.5">Manage locations</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#7C3AED] transition-colors" />
          </div>

          {/* 2. Your Bookings */}
          <Link
            to="/orders"
            className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-sm flex items-center justify-between gap-4 hover:border-[#1C1C1C] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] text-[#1C1C1C] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1C]">Your Bookings</div>
                <div className="text-[12px] text-[#737373] mt-0.5">View & track orders</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#1C1C1C] transition-colors" />
          </Link>

          {/* 3. My Refunds */}
          <div
            onClick={() => setRefundModalOpen(true)}
            className="bg-white p-5 rounded-2xl border border-[#E8E8E8] shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-[#059669] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1C]">My Refunds</div>
                <div className="text-[12px] text-[#737373] mt-0.5">Refund status</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#059669] transition-colors" />
          </div>
        </div>

        {/* Saved Addresses Detailed Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-[15px] font-semibold text-[#1C1C1C]">Saved Addresses</h2>
            </div>
            <button
              onClick={() => setAddressModalOpen(true)}
              className="text-xs font-semibold text-[#5B21B6] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Address
            </button>
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr, idx) => (
                <div
                  key={addr.name || idx}
                  className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center shrink-0 mt-0.5">
                      {getAddressIcon(addr.saved_as)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1C1C1C] bg-[#E8E8E8] px-2 py-0.5 rounded">
                          {addr.saved_as || 'Home'}
                        </span>
                        {addr.is_current ? (
                          <span className="text-[10px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[13px] text-[#1C1C1C] font-semibold">
                        {addr.houseflat_no}
                      </p>
                      {addr.location && (
                        <p className="text-[12px] text-[#737373] leading-relaxed">
                          {addr.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="text-xs font-semibold text-[#5B21B6] hover:underline shrink-0"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-[#E8E8E8] rounded-xl space-y-2">
              <p className="text-xs text-[#737373]">
                No saved addresses found. Add an address for seamless doorstep bookings.
              </p>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="px-4 py-1.5 bg-[#1C1C1C] hover:bg-[#404040] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + Add Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Manager Modal */}
      <AddressManagerModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        addresses={addresses}
        onAddressUpdated={() => refetch()}
      />

      {/* My Refunds Modal */}
      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
      />
    </div>
  );
};
