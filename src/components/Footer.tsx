import React from 'react';
import { Linkedin, Twitter, Instagram, Settings } from 'lucide-react';
import logoWhite from '../../assets/Logo_wh.svg';

export function Footer() {
  return (
    <footer className="bg-[#1B4D2E] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src={logoWhite} 
                  alt="DoneWell" 
                  className="h-8 w-auto opacity-90"
                  loading="lazy"
                  width={120}
                  height={32}
                />
              </a>
            </div>
            <p className="!text-white text-base">
              Professional websites designed, built, and launched with care.
            </p>
          </div>
          
          <div>
            <h5 className="mb-4 text-sm uppercase tracking-wider !text-white pt-[0px] pr-[0px] pb-[16px] pl-[0px]">
              Navigation
            </h5>
            <nav className="flex flex-col gap-3">
              <a href="/" className="!text-white hover:!text-white transition-colors">
                Home
              </a>
              <a href="/work" className="!text-white hover:!text-white transition-colors">
                Work
              </a>
              <a href="/about" className="!text-white hover:!text-white transition-colors">
                About
              </a>
            </nav>
          </div>
          
          <div>
            <h5 className="mb-[16px] text-sm uppercase tracking-wider !text-white mt-[0px] mr-[0px] ml-[0px]">
              Connect
            </h5>
            <div className="flex gap-4 mt-[16px] mr-[0px] mb-[0px] ml-[0px]">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors !text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors !text-white"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors !text-white"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center !text-white text-sm">
          <div className="flex items-center justify-center gap-2">
            <p className="!text-white">&copy; {new Date().getFullYear()} DoneWell. All rights reserved.</p>
            <a 
              href="/admin" 
              className="inline-flex items-center justify-center transition-colors !text-white opacity-30 hover:opacity-50"
              aria-label="Admin"
              title="Admin"
            >
              <Settings size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}