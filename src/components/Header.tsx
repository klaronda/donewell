import React from 'react';
import { Button } from './Button';
import { Leaf } from 'lucide-react';

interface HeaderProps {
  onGetStartedClick?: () => void;
}

export function Header({ onGetStartedClick }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[--color-sand-200]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[--radius-sm] bg-[#1a4d2e] flex items-center justify-center rounded-[8px]">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h5 className="tracking-tight">DoneWell</h5>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="/" className="text-[--color-stone-700] hover:text-[--color-forest-700] transition-colors font-semibold">
            Home
          </a>
          <a href="/work" className="text-[--color-stone-700] hover:text-[--color-forest-700] transition-colors font-semibold">
            Work
          </a>
          <a href="/about" className="text-[--color-stone-700] hover:text-[--color-forest-700] transition-colors font-semibold">
            About
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="primary" size="medium" onClick={onGetStartedClick}>
            Book a Consult
          </Button>
        </div>
      </div>
    </header>
  );
}