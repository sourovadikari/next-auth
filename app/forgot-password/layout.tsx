import type { Metadata } from 'next';
import React from 'react';

// Specific metadata for the "Forgot Password" page
export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset code to regain access to your account.',
  // Optional: Add Open Graph and Twitter card metadata for social sharing
  // openGraph: {
  //   title: 'Forgot Your Password?',
  //   description: 'Request a password reset code for your account.',
  //   url: 'https://your-app.com/forgot-password', // Replace with your actual domain
  //   siteName: 'Your App Name',
  //   images: [
  //     {
  //       url: 'https://placehold.co/1200x630/000000/FFFFFF?text=Forgot+Password', // Placeholder for social sharing image
  //       width: 1200,
  //       height: 630,
  //       alt: 'Forgot Password Page',
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Forgot Password - Your App Name',
  //   description: 'Request a password reset code to regain access.',
  //   creator: '@yourtwitterhandle',
  //   images: ['https://placehold.co/1200x630/000000/FFFFFF?text=Forgot+Password'],
  // },
};

export default function ForgotPasswordLayout({
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
