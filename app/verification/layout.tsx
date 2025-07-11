import type { Metadata } from 'next';
import React from 'react';

// Static metadata for the Verification page(s)
// This applies to /verification/[email]/[type]
export const metadata: Metadata = {
  title: 'Verify Your Account', // A general title for verification
  description: 'Complete your email verification or reset your password by entering the provided code.',
  // Optional: Add Open Graph and Twitter card metadata for social sharing
  // openGraph: {
  //   title: 'Account Verification',
  //   description: 'Verify your email or reset your password.',
  //   url: 'https://your-app.com/verification', // Replace with your actual domain
  //   siteName: 'Your App Name',
  //   images: [
  //     {
  //       url: 'https://placehold.co/1200x630/000000/FFFFFF?text=Verification', // Placeholder for social sharing image
  //       width: 1200,
  //       height: 630,
  //       alt: 'Account Verification Page',
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Verify Your Account - Your App Name',
  //   description: 'Complete your email verification or reset your password.',
  //   creator: '@yourtwitterhandle',
  //   images: ['https://placehold.co/1200x630/000000/FFFFFF?text=Verification'],
  // },
};

// This layout component will wrap your VerificationPage.tsx
export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
