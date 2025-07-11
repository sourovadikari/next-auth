import type { Metadata } from 'next';
import React from 'react';

// Static metadata for the Sign Up page
export const metadata: Metadata = {
  title: 'Sign Up', // Clear and concise title for signup
  description: 'Create an account to start your personalized coaching journey with AI-powered matching.',
  // Optional: Add Open Graph and Twitter card metadata for social sharing
  // openGraph: {
  //   title: 'Sign Up for Your Account',
  //   description: 'Start your personalized coaching journey with AI-powered matching.',
  //   url: 'https://your-app.com/signup', // Replace with your actual domain
  //   siteName: 'Your App Name',
  //   images: [
  //     {
  //       url: 'https://placehold.co/1200x630/000000/FFFFFF?text=Sign+Up', // Placeholder for social sharing image
  //       width: 1200,
  //       height: 630,
  //       alt: 'Sign Up Page',
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Sign Up - Your App Name',
  //   description: 'Create an account to start your personalized coaching journey.',
  //   creator: '@yourtwitterhandle',
  //   images: ['https://placehold.co/1200x630/000000/FFFFFF?text=Sign+Up'],
  // },
};

// This layout component will wrap your SignUpPage.tsx
export default function SignUpLayout({
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
