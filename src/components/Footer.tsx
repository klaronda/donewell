import React from 'react';
import { Linkedin, Twitter, Instagram, Leaf, Settings } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1B4D2E] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-[--radius-sm] bg-[rgb(255,255,255)] flex items-center justify-center rounded-[8px]">
                <Leaf className="w-5 h-5 !text-[#1B4D2E]" />
              </div>
              <h5 className="!text-white">DoneWell</h5>
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
              <a href="#home" className="!text-white hover:!text-white transition-colors">
                Home
              </a>
              <a href="#services" className="!text-white hover:!text-white transition-colors">
                Services
              </a>
              <a href="#work" className="!text-white hover:!text-white transition-colors">
                Work
              </a>
              <a href="#about" className="!text-white hover:!text-white transition-colors">
                About
              </a>
              <a href="#contact" className="!text-white hover:!text-white transition-colors">
                Contact
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
              <a 
                href="/admin" 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors !text-white opacity-30 hover:opacity-50"
                aria-label="Admin"
                title="Admin"
              >
                <Settings size={16} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center !text-white text-sm">
          <p className="!text-white">&copy; 2024 DoneWell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}