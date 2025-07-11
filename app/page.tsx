'use client'

import HeroSection from '@/components/HeroSection'; // Corrected import path and component name
import PricingSection from '@/components/Pricing'; // Assuming you have this component
import FAQ from '@/components/FAQ'; // Assuming you have this component
import React from 'react';

export default function Home() {
  return (
    <div>
      <HeroSection/>
      <PricingSection/>
      <FAQ/>
    </div>
  )
}
