import React from 'react';
import { ServiceCategory, Service } from '../../types';

interface ServiceCategoryNavProps {
  categories: ServiceCategory[];
  services: Service[];
  selectedCategory: string;
  selectedService: string;
  onSelectCategory: (cat: string) => void;
  onSelectService: (service: string) => void;
}

export const ServiceCategoryNav: React.FC<ServiceCategoryNavProps> = ({
  categories,
  services,
  selectedCategory,
  selectedService,
  onSelectCategory,
  onSelectService,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            onSelectCategory('');
            onSelectService('');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.category_name;
          return (
            <button
              key={cat.name}
              onClick={() => {
                onSelectCategory(cat.category_name);
                onSelectService('');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.category_name}
            </button>
          );
        })}
      </div>

      {/* Sub-Service Chips (if filtered or all) */}
      {services.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Service:
          </span>

          <button
            onClick={() => onSelectService('')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedService === ''
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subservices
          </button>

          {services.map((srv) => {
            const isActive = selectedService === srv.service_name;
            return (
              <button
                key={srv.name}
                onClick={() => onSelectService(srv.service_name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {srv.service_name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
