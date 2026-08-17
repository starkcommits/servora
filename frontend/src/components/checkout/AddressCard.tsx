import React, { useState } from 'react';
import { CustomerAddress } from '../../types';
import { AddressManagerModal } from './AddressManagerModal';
import { MapPin, Plus, Home, Briefcase, Navigation, AlertCircle } from 'lucide-react';

interface AddressCardProps {
  addresses: CustomerAddress[];
  onAddressUpdated: () => void;
  customerName: string;
  customerPhone?: string;
  hasError?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  addresses,
  onAddressUpdated,
  customerName,
  customerPhone,
  hasError = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'list' | 'search'>('list');

  const currentAddress = addresses.find((a) => a.is_current === 1) || addresses[0];

  const handleOpenAdd = () => {
    setModalMode('search');
    setModalOpen(true);
  };

  const handleOpenChange = () => {
    setModalMode('list');
    setModalOpen(true);
  };

  const getTagIcon = (tag?: string) => {
    if (tag?.toLowerCase() === 'work') return <Briefcase className="w-3 h-3 text-[#7C3AED]" />;
    if (tag?.toLowerCase() === 'home') return <Home className="w-3 h-3 text-[#7C3AED]" />;
    return <Navigation className="w-3 h-3 text-[#7C3AED]" />;
  };

  return (
    <>
      <div
        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
          hasError
            ? 'border-[#EF4444] bg-[#FEF2F2]/30 ring-2 ring-[#EF4444]/20'
            : 'border-[#E8E8E8]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${hasError ? 'text-[#EF4444]' : 'text-[#7C3AED]'}`} />
            <h3 className="text-[14px] font-bold text-[#1C1C1C]">
              Doorstep Service Address
            </h3>
          </div>

          {currentAddress && (
            <button
              type="button"
              onClick={handleOpenChange}
              className="text-[12px] font-bold text-[#5B21B6] hover:underline"
            >
              Change
            </button>
          )}
        </div>

        {/* If NO address is saved */}
        {!currentAddress ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5 text-[12px] text-[#737373] leading-relaxed">
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <span>
                Please add your house/apartment and area details so our service professional can arrive at your location.
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full py-2.5 px-4 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Service Address</span>
            </button>
          </div>
        ) : (
          /* If address exists */
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1C1C1C] bg-[#F5F5F5] border border-[#E8E8E8] px-2 py-0.5 rounded-md">
                {getTagIcon(currentAddress.saved_as)}
                {currentAddress.saved_as || 'Home'}
              </span>
              <span className="text-[13px] font-bold text-[#1C1C1C]">{customerName}</span>
              {customerPhone && (
                <span className="text-[12px] text-[#737373]">({customerPhone})</span>
              )}
            </div>

            <div className="text-[13px] text-[#1C1C1C] font-semibold">
              {currentAddress.houseflat_no}
            </div>

            {currentAddress.location && (
              <div className="text-[12px] text-[#737373] leading-relaxed">
                {currentAddress.location}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Manager Modal */}
      <AddressManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        addresses={addresses}
        onAddressUpdated={onAddressUpdated}
        initialMode={modalMode}
      />
    </>
  );
};
