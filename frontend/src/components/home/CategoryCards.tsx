import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { Skeleton } from '../common/Skeleton';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface CategorySpotlight {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
}

const SPOTLIGHTS: CategorySpotlight[] = [
  {
    id: 'cleaning',
    category: 'Cleaning',
    title: 'Home Deep Cleaning',
    subtitle: 'Intense washroom, modular kitchen & full house sanitization',
    badge: 'Popular',
    image: '/files/category_cleaning.jpg',
  },
  {
    id: 'painting',
    category: 'Painting and Water Proofing',
    title: 'Expert Home Painting',
    subtitle: 'Accent walls, room color revamp & damp-proof coatings',
    badge: 'New',
    image: '/files/category_painting.jpg',
  },
  {
    id: 'pest',
    category: 'Pest Control',
    title: 'Pest & Termite Shield',
    subtitle: '100% odorless gel treatment with up to 2-year warranty',
    badge: 'Guaranteed',
    image: '/files/category_pest.jpg',
  },
];

export const CategoryCards: React.FC = () => {
  const { isLoading } = useCategories();
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-white border-b border-[#E8E8E8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading — UC: "New and noteworthy" */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1C1C1C] tracking-tight">
              New and noteworthy
            </h2>
            <p className="text-[13px] text-[#737373] mt-0.5">
              Explore curated home improvement and maintenance collections
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="text-[13px] font-semibold text-[#1C1C1C] hover:text-[#5B21B6] transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Explore all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spotlights 3-Card Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-3">
                <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SPOTLIGHTS.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/services/${encodeURIComponent(item.category)}`)}
                className="cursor-pointer group relative rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#1C1C1C] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.08)] transition-all bg-[#FAFAFA] flex flex-col"
              >
                {/* Image Container */}
                <div className="w-full aspect-[16/9] overflow-hidden relative bg-[#1C1C1C]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/service-collage.jpg';
                    }}
                  />
                  {/* Badge */}
                  <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#1C1C1C]/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1C1C1C] group-hover:text-[#5B21B6] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[#737373] mt-1 leading-relaxed line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center text-[12px] font-bold text-[#1C1C1C] group-hover:text-[#5B21B6] pt-1">
                    <span>View Services</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
