'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider';
import Image from 'next/image';

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

// Explicitly define Navbar as a functional component with no props
const Navbar: React.FC = () => {
  const { user, loading } = useAuth(); // `user` is now typed as UserData | null

  // ALL hooks must be declared unconditionally at the top level
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState<boolean>(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState<string>('');
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false); // State for client-side mounting

  // Set isMounted to true after the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prev) => !prev);
    // Ensure desktop search is closed when mobile menu is toggled
    if (isDesktopSearchOpen) setIsDesktopSearchOpen(false);
  };

  const toggleDesktopSearch = (): void => {
    setIsDesktopSearchOpen((prev) => !prev);
    // Ensure mobile menu is closed when desktop search is toggled
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleLinkClick = (): void => {
    // Close both menus when a link is clicked
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (isDesktopSearchOpen) {
      setIsDesktopSearchOpen(false);
    }
  };

  // Effect to manage body scroll and prevent content shifting
  useEffect(() => {
    if (!isMounted) return; // Only run on client after hydration

    const scrollbarWidth: number = window.innerWidth - document.documentElement.clientWidth;

    // Apply overflow hidden if either mobile menu or desktop search is open
    if (isMobileMenuOpen || isDesktopSearchOpen) {
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Function to handle window resize
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // If screen size goes to desktop (lg breakpoint)
        setIsMobileMenuOpen(false); // Close mobile menu
        // Keep desktop search state as is, but ensure it's not open if screen is too small
      } else if (window.innerWidth < 1024 && isDesktopSearchOpen) {
        setIsDesktopSearchOpen(false); // Close desktop search if screen size goes below lg
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (isMounted) { // Only clean up if mounted
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      window.removeEventListener('resize', handleResize); // Clean up resize listener
    };
  }, [isMobileMenuOpen, isDesktopSearchOpen, isMounted]); // Added isMounted to dependencies

  const handleMobileSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMobileSearchQuery(e.target.value);
  };

  // Placeholder for mobile search action
  const performMobileSearch = (): void => {
    console.log("Mobile search for:", mobileSearchQuery);
    // Add your mobile search logic here (e.g., redirect or filter)
    // setIsMobileMenuOpen(false); // Optionally close menu after search
  };

  // --- Navbar Skeleton Component ---
  // FIX: Changed React.FC<{}> to React.FC to address the ESLint error.
  // React.FC without a generic argument implies no props, which is the intended behavior.
  const NavbarSkeleton: React.FC = () => (
    <nav className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-lg font-inter z-50 border-b border-gray-200 animate-pulse">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        {/* Logo Placeholder */}
        <div className="h-6 w-24 bg-gray-200 rounded"></div>

        {/* Desktop Links Placeholder */}
        <div className="hidden lg:flex space-x-8 items-center">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-14 bg-gray-200 rounded"></div>
          <div className="h-4 w-18 bg-gray-200 rounded"></div>
        </div>

        {/* Desktop Search/Auth Placeholder */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div> {/* Search icon placeholder */}
          <div className="h-10 w-24 rounded bg-gray-200"></div> {/* Sign In button placeholder */}
        </div>

        {/* Mobile Icons Placeholder */}
        <div className="lg:hidden flex items-center space-x-2">
          <div className="h-9 w-9 rounded-full bg-gray-200"></div> {/* Profile icon placeholder */}
          <div className="h-10 w-10 rounded-md bg-gray-200"></div> {/* Menu icon placeholder */}
        </div>
      </div>
    </nav>
  );

  // Render skeleton if loading is true (from AuthProvider)
  if (loading) {
    return <NavbarSkeleton />;
  }

  return (
    <>
      {/* Fixed Navbar - Light Theme */}
      <nav className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-lg font-inter z-50 border-b border-gray-200">
        <div className="mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-wide text-gray-800" onClick={handleLinkClick}>
              MyBrand
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium relative pb-1 transition-colors duration-300
                  ${pathname === link.href ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={handleLinkClick}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Search and User/Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search button, now opens modal */}
            <button
              onClick={toggleDesktopSearch}
              className="p-2 rounded-full hover:bg-gray-100 transition duration-300"
              aria-label="Open desktop search"
            >
              <Search className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </button>
            {!user ? (
              <Link
                href="/signin"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition duration-300 shadow-md"
                onClick={handleLinkClick}
              >
                Sign In
              </Link>
            ) : (
              // Display profile avatar if user is logged in (Desktop)
              <Link href="/profile" onClick={handleLinkClick} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-lg transition duration-300 overflow-hidden shadow-sm">
                {/* Using Next.js Image component */}
                <Image
                  src={`https://placehold.co/40x40/6366F1/FFFFFF?text=${user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}`}
                  alt={`${user.name || 'User'}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                  width={40} // Required for Next.js Image
                  height={40} // Required for Next.js Image
                />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger icon) and Profile Icon */}
          <div className="lg:hidden flex items-center space-x-2"> {/* Added space-x-2 for spacing */}
            {user && (
              // Profile avatar icon for logged-in users on mobile
              <Link href="/profile" onClick={handleLinkClick} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-md transition duration-300 overflow-hidden shadow-sm">
                {/* Using Next.js Image component */}
                <Image
                  src={`https://placehold.co/36x36/6366F1/FFFFFF?text=${user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}`}
                  alt={`${user.name || 'User'}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                  width={36} // Required for Next.js Image
                  height={36} // Required for Next.js Image
                />
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-haspopup="true"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for both Mobile Menu and Desktop Search */}
      {(isMobileMenuOpen || isDesktopSearchOpen) && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ease-in-out blurred-overlay"
          onClick={isMobileMenuOpen ? toggleMobileMenu : toggleDesktopSearch}
          aria-hidden="true" // Hide from screen readers when not active
        ></div>
      )}

      {/* Mobile Navigation Links (slide-out from right) */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-gray-50 text-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}
        role="dialog" // ARIA role for dialog
        aria-modal="true" // Indicate it's a modal
        aria-label="Mobile Navigation"
      >
        <div className="py-4 px-4 sm:px-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-2xl font-bold tracking-wide text-gray-800" onClick={handleLinkClick}>
              MyBrand
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Close mobile menu"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-4 pr-10 py-3 border border-gray-300 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              value={mobileSearchQuery}
              onChange={handleMobileSearchInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  performMobileSearch();
                }
              }}
              aria-label="Mobile search input"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
              onClick={performMobileSearch}
              aria-label="Perform mobile search"
            />
          </div>
          <div className="flex flex-col space-y-4 flex-grow overflow-y-auto hide-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block font-medium transition duration-300 py-2 rounded-md px-3
                  ${pathname === link.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={handleLinkClick}
              >
                {link.name}
              </Link>
            ))}
            {/* Conditional Sign In button for mobile menu */}
            {!user && (
              <Link
                href="/signin"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition duration-300 shadow-md block text-center mt-4" // Added mt-4 for spacing
                onClick={handleLinkClick}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Search Modal */}
      {isDesktopSearchOpen && (
        <div className="fixed inset-0 z-[100] px-4 hidden lg:block bg-black/20 backdrop-blur-sm" // Added backdrop for modal
          onClick={toggleDesktopSearch}
          role="dialog" // ARIA role for dialog
          aria-modal="true" // Indicate it's a modal
          aria-label="Desktop Search"
        >
          <div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl w-full max-w-lg transition-all duration-300 px-2 py-2" // Adjusted top
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-12 py-2 border-2 rounded-lg text-lg focus:outline-none"
                autoFocus // Automatically focus the input when modal opens
                aria-label="Desktop search input"
              />
              <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <button
                onClick={toggleDesktopSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* You can add search results or suggestions here */}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
