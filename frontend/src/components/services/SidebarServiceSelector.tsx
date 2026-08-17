import React from 'react';
import { Service } from '../../types';

interface SidebarServiceSelectorProps {
  services: Service[];
  selectedService: string;
  onSelectService: (serviceName: string) => void;
}

export const SidebarServiceSelector: React.FC<SidebarServiceSelectorProps> = ({
  services,
  selectedService,
  onSelectService,
}) => {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm">
      <div className="pb-3 mb-3 border-b border-[#F0F0F0]">
        <h2 className="text-[14px] font-bold text-[#1C1C1C] tracking-tight">
          Select a service
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* "All" button card */}
        <button
          onClick={() => onSelectService('')}
          className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border text-center transition-all group ${
            !selectedService
              ? 'border-[#1C1C1C] bg-[#FAFAFA] shadow-sm'
              : 'border-[#F0F0F0] hover:border-[#D1D1D1] bg-white'
          }`}
        >
          <div className="w-14 h-14 rounded-lg bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center overflow-hidden">
            <span className="text-[20px]">✨</span>
          </div>
          <span
            className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
              !selectedService ? 'text-[#1C1C1C]' : 'text-[#525252] group-hover:text-[#1C1C1C]'
            }`}
          >
            All Services
          </span>
        </button>

        {/* List of sub-services */}
        {services.map((svc) => {
          const isSelected = selectedService === svc.service_name;
          const imageUrl = svc.service_image || '/files/service-collage.jpg';

          return (
            <button
              key={svc.name}
              onClick={() => onSelectService(svc.service_name)}
              className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border text-center transition-all group ${
                isSelected
                  ? 'border-[#1C1C1C] bg-[#FAFAFA] shadow-sm'
                  : 'border-[#F0F0F0] hover:border-[#D1D1D1] bg-white'
              }`}
            >
              <div className="w-14 h-14 rounded-lg bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center overflow-hidden">
                <img
                  src={imageUrl}
                  alt={svc.service_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/service-collage.jpg';
                  }}
                />
              </div>
              <span
                className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                  isSelected ? 'text-[#1C1C1C]' : 'text-[#525252] group-hover:text-[#1C1C1C]'
                }`}
              >
                {svc.service_name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
