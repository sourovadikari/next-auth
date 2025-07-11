import type { Metadata } from 'next';
import React from 'react';

// Static metadata for the Sign In page
export const metadata: Metadata = {
  title: 'Sign In', // Clear and concise title
  description: 'Sign in to your account to access your personalized coaching and AI tools.',
  // Optional: Add Open Graph and Twitter card metadata for social sharing
  // openGraph: {
  //   title: 'Sign In to Your Account',
  //   description: 'Access your personalized coaching and AI tools.',
  //   url: 'https://your-app.com/signin', // Replace with your actual domain
  //   siteName: 'Your App Name',
  //   images: [
  //     {
  //       url: 'https://placehold.co/1200x630/000000/FFFFFF?text=Sign+In', // Placeholder for social sharing image
  //       width: 1200,
  //       height: 630,
  //       alt: 'Sign In Page',
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Sign In - Your App Name',
  //   description: 'Access your personalized coaching and AI tools.',
  //   creator: '@yourtwitterhandle',
  //   images: ['https://placehold.co/1200x630/000000/FFFFFF?text=Sign+In'],
  // },
};

// This layout component will wrap your SignInPage.tsx
export default function SignInLayout({
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
