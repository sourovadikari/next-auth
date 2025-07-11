'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="w-full py-20"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center text-gray-900">
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-2 text-xl text-gray-700 sm:text-2xl">
            Find the perfect plan to accelerate your coaching journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-12 lg:grid-cols-3">
          {[
            {
              name: 'Starter',
              price: '$0',
              features: ['1 Coach Profile', 'Basic AI Matching', 'Community Support'],
            },
            {
              name: 'Basic',
              price: '$29',
              features: [
                'Up to 15 Coach Profiles',
                'Advanced AI Matching',
                'Customizable Profiles',
                'Priority Support',
              ],
            },
            {
              name: 'Plus',
              price: '$49',
              features: [
                'Unlimited Coach Profiles',
                'Premium AI Matching & Insights',
                'Dedicated Account Manager',
                'Advanced Analytics',
                'Integration Support',
                'Custom Branding',
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col h-full p-6 text-white bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl transition-all duration-500 hover:from-indigo-600 hover:to-fuchsia-600"
            >
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {plan.name}
              </h3>
              <div className="flex items-end mt-6">
                <p className="text-6xl font-semibold leading-none">{plan.price}</p>
                <p className="ml-1 text-lg">/ month</p>
              </div>

              <ul className="flex-1 mt-4 text-left list-none w-full">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="inline-flex items-center w-full mb-2 font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2 text-white md:w-6 md:h-6" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4 w-full">
                <Link
                  href="/signup"
                  className="block w-full px-6 py-3 text-sm font-semibold text-center text-blue-600 bg-white rounded-lg transition md:text-base"
                >
                  Start Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
