import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ShieldCheck, X } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl space-y-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1C1C1C]">My Refunds</h3>
              <p className="text-xs text-[#737373]">Servora Payment Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#737373] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center py-6 space-y-2">
          <ShieldCheck className="w-10 h-10 text-[#059669] mx-auto" />
          <h4 className="text-sm font-semibold text-[#1C1C1C]">No Active Refunds</h4>
          <p className="text-xs text-[#737373] max-w-[280px] mx-auto leading-relaxed">
            All your service bookings are protected. If you ever cancel or encounter an issue, refunds are credited directly to your source account.
          </p>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate('/orders');
          }}
          className="w-full h-11 bg-[#1C1C1C] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors"
        >
          View Order History
        </button>
      </div>
    </div>
  );
};
