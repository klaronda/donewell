import React from 'react';
import { Button } from './Button';
import logo from '../../assets/Logo.svg';

interface HeaderProps {
  onGetStartedClick?: () => void;
}

export function Header({ onGetStartedClick }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[--color-sand-200]">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
        <div className="flex items-center justify-self-start">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="DoneWell" 
              className="h-8 w-auto"
              loading="eager"
              width={120}
              height={32}
            />
          </a>
        </div>
        
        <nav className="hidden md:flex items-center justify-self-center gap-8">
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
        
        <div className="flex items-center justify-self-end gap-4">
          <Button variant="primary" size="medium" onClick={onGetStartedClick}>
            Book a Consult
          </Button>
        </div>
      </div>
    </header>
  );
}