import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-6 md:px-12 flex justify-between items-center bg-paper sticky top-0 z-50 border-b border-transparent transition-colors duration-300">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
        <div className="w-8 h-8 border border-ink flex items-center justify-center rounded-sm group-hover:bg-ink group-hover:text-paper transition-colors">
            <span className="font-serif font-bold text-lg">1</span>
        </div>
        {/* Main title moved to HeroSearch for search-engine layout */}
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-subtle">
        <a href="#" className="hover:text-ink transition-colors">About</a>
        <a href="#" className="hover:text-ink transition-colors">How it works</a>
        <a href="#" className="flex items-center gap-1.5 text-ink hover:opacity-70 transition-opacity">
          <ShieldCheck className="w-4 h-4" />
          <span>Verify</span>
        </a>
        <a href="#" className="hover:text-ink transition-colors">Contribute</a>
      </nav>
      
      {/* Mobile Menu Icon Placeholder (minimal) */}
      <div className="md:hidden text-ink cursor-pointer">
        <div className="w-6 h-0.5 bg-ink mb-1.5"></div>
        <div className="w-6 h-0.5 bg-ink"></div>
      </div>
    </header>
  );
};

export default Header;