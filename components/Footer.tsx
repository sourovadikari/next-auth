import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Logo / Brand Name */}
          <Link
            href="https://pagedone.io/"
            className="text-white text-2xl font-bold"
          >
            MyBrand
          </Link>
          
          {/* Footer Navigation */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-white">
              About
            </Link>
            <Link href="#" className="hover:text-white">
              Services
            </Link>
            <Link href="#" className="hover:text-white">
              Blog
            </Link>
            <Link href="#" className="hover:text-white">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MyBrand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
