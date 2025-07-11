import type { Metadata } from 'next';
import React from 'react';

// Static metadata for the Profile page
// This will be rendered on the server and is good for SEO.
export const metadata: Metadata = {
  title: 'Profile', // A generic but descriptive title
  description: 'Manage your user profile and account settings.',
  // You can add more metadata tags here, e.g., keywords, openGraph, twitter
  // openGraph: {
  //   title: 'User Profile',
  //   description: 'Manage your user profile and account settings.',
  //   url: 'https://your-app.com/profile', // Replace with your actual domain
  //   siteName: 'Your App Name',
  //   images: [
  //     {
  //       url: 'https://placehold.co/1200x630/000000/FFFFFF?text=User+Profile', // Placeholder for social sharing image
  //       width: 1200,
  //       height: 630,
  //       alt: 'User Profile Page',
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'User Profile - Your App Name',
  //   description: 'Manage your user profile and account settings.',
  //   creator: '@yourtwitterhandle',
  //   images: ['https://placehold.co/1200x630/000000/FFFFFF?text=User+Profile'],
  // },
};

// This layout component will wrap your ProfilePage.tsx
export default function ProfileLayout({
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
