import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'default' | 'large';
}

export function Modal({ isOpen, onClose, children, size = 'default' }: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClass = size === 'large' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-[var(--radius-xl)] ${maxWidthClass} w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[--color-stone-100] rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={24} className="text-[--color-stone-600]" />
        </button>
        
        {children}
      </div>
    </div>
  );
}
