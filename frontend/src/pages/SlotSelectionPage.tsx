import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SlotSelector } from '../components/checkout/SlotSelector';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const SlotSelectionPage: React.FC = () => {
  const { cart, setSchedule, isActionLoading } = useCart();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState<string>(cart?.scheduled_at || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select a date and time slot to continue.');
      return;
    }
    setErrorMsg(null);
    const success = await setSchedule(selectedSlot);
    if (success) navigate('/checkout/review');
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Your Cart is Empty</h2>
        <p className="text-[14px] text-[#737373]">Add services before selecting a slot.</p>
        <Link to="/services">
          <button className="mt-2 bg-[#1C1C1C] text-white px-6 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-[#404040] transition-colors">
            Browse Services
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-10">
      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/cart" className="flex items-center gap-1 text-[13px] text-[#737373] hover:text-[#1C1C1C] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cart
          </Link>
          <span className="text-[#D1D1D1]">/</span>
          <span className="text-[13px] text-[#1C1C1C] font-medium">Schedule</span>
        </div>

        {/* Step progress — UC style: plain numbered steps */}
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1C1C1C] text-white text-[11px] font-bold flex items-center justify-center">
              1
            </div>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Schedule</span>
          </div>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-[#D1D1D1] text-[#A0A0A0] text-[11px] font-bold flex items-center justify-center">
              2
            </div>
            <span className="text-[13px] text-[#A0A0A0]">Review & Pay</span>
          </div>
        </div>

        <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-1">When should we arrive?</h1>
        <p className="text-[13px] text-[#737373] mb-7">
          Slots are available from 30 minutes onwards.
        </p>

        {/* Slot selector — in white card */}
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 mb-5">
          <SlotSelector
            selectedScheduledAt={selectedSlot}
            onSelectSlot={(dt) => { setSelectedSlot(dt); setErrorMsg(null); }}
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#DC2626] mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link to="/cart">
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#737373] border border-[#E8E8E8] rounded-xl px-5 py-2.5 hover:border-[#1C1C1C] hover:text-[#1C1C1C] transition-colors bg-white">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>

          <button
            onClick={handleContinue}
            disabled={isActionLoading || !selectedSlot}
            className="flex items-center gap-2 bg-[#1C1C1C] hover:bg-[#404040] text-white text-[13px] font-semibold rounded-xl px-7 py-2.5 transition-colors disabled:opacity-40"
          >
            {isActionLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>Review Order <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
