import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategoryCards } from '../components/home/CategoryCards';
import { PopularPackages } from '../components/home/PopularPackages';
import { HowItWorks } from '../components/home/HowItWorks';
import { WhyServora } from '../components/home/WhyServora';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroBanner />
      <CategoryCards />
      <PopularPackages />
      <HowItWorks />
      <WhyServora />
    </div>
  );
};
