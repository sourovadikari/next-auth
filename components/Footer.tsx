import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const sections = {
    product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Status", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
    resources: [
      { name: "Guides", href: "#" },
      { name: "Tutorials", href: "#" },
      { name: "Case Studies", href: "#" },
      { name: "Webinars", href: "#" },
    ]
  };

  const SocialIcon = ({ Icon, href }: { Icon: React.ElementType, href: string }) => (
    <a href={href} className="text-white hover:text-gray-400 transition-colors">
      <Icon size={20} />
    </a>
  );

  const PinterestIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pinterest">
      <path d="M12 8a7.25 7.25 0 0 0-7.25 7.25c0 3.99 2.94 7.25 7.25 7.25 4.08 0 7.25-3.26 7.25-7.25 0-2.88-1.57-5.32-3.8-6.66l-.55-.33-.06-.5c-.24-1.92-1.84-3.48-3.72-3.6-2.02-.13-3.87 1.3-4.4 3.32-.4 1.5.17 3.03 1.5 3.96L8 12.55c.66.4.82 1.2.3 1.84s-1.3.8-1.9-.38L5.2 13.5c-1.8-1.8-2.6-4.5-.46-6.6 2.4-2.4 6.7-2.3 9.4-.04c1.8 1.5 2.6 3.8 2.3 6.6-.2 1.8-.8 3.5-2 4.9-1.3 1.4-3 2.5-4.8 2.9-1.7.4-3.4-.1-4.8-1.2l-.7-.6c-1.6-1.5-2.2-3.9-1.5-6.1.6-2.1 2.5-3.6 4.7-4.1.2-.05.4-.1.6-.1 1.7-.06 3.1 1.3 3.1 3 0 1.2-.6 2.3-1.6 2.9l-1.8 1.1c-.8.5-1.9.3-2.6-.5-.7-.8-.5-2 0-2.6l1.3-1.6c.4-.5.3-1.3-.1-1.8-.5-.5-1.3-.6-1.8-.1l-1.3 1.6c-.7.8-1.3 1.8-1.6 2.8-.4 1.2-.3 2.5 0 3.7.3 1 .9 1.9 1.7 2.6 1.1 1 2.4 1.6 3.8 1.7 1.5 0 3-.4 4.3-1.1 1.3-.7 2.4-1.7 3.2-2.9.8-1.2 1.2-2.6 1.2-4.1-.02-1.9-.8-3.7-2.1-5.1-1.3-1.4-3.1-2.2-5-2.2z" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 16.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />
    </svg>
  );

  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">NextStack</h1>
            <p className="text-sm text-gray-300">Building the future of web development, one component at a time.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold mb-2">Product</h3>
            {sections.product.map((item) => (
              <a key={item.name} href={item.href} className="text-sm hover:text-gray-400 transition-colors">{item.name}</a>
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold mb-2">Company</h3>
            {sections.company.map((item) => (
              <a key={item.name} href={item.href} className="text-sm hover:text-gray-400 transition-colors">{item.name}</a>
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold mb-2">Support</h3>
            {sections.support.map((item) => (
              <a key={item.name} href={item.href} className="text-sm hover:text-gray-400 transition-colors">{item.name}</a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-center md:text-left">
            <p className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} NextStack | Powered by: NextStack</p>
            <p>
              Copyright: Any unauthorized use or reproduction of NextStack content for commercial purposes
              is strictly prohibited and constitutes copyright infringement liable to legal action.
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <SocialIcon Icon={Facebook} href="#" />
            <SocialIcon Icon={Youtube} href="#" />
            <SocialIcon Icon={Twitter} href="#" />
            <SocialIcon Icon={Instagram} href="#" />
            <SocialIcon Icon={PinterestIcon} href="#" />
          </div>
        </div>
      </div>
    </footer>
  );
}
