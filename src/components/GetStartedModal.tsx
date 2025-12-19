import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { CheckCircle2 } from 'lucide-react';
import logo from '../../assets/Logo.svg';
import { useLeads } from '../hooks/useLeads';

// Calendly types
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
  const [step, setStep] = useState(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bookedConsult, setBookedConsult] = useState(false);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);
  const { addLead, updateLead } = useLeads();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Save form data to Supabase
      const newLead = await addLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        bookedConsult: false,
      });
      
      setLeadId(newLead.id);
      setStep(step + 1);
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setLeadId(null);
    setBookedConsult(false);
    setFormData({
      firstName: '',
      lastName: '',
      businessName: '',
      email: '',
      phone: '',
      message: ''
    });
    onClose();
  };

  const handleBookingConfirmed = async (payload: any) => {
    if (leadId) {
      try {
        await updateLead(leadId, {
          bookedConsult: true,
          calendlyEventUri: payload.event?.uri || undefined,
        });
        setBookedConsult(true);
      } catch (error) {
        console.error('Error updating lead with booking:', error);
      }
    }
  };

  // Set up Calendly event listener once
  useEffect(() => {
    const handleCalendlyMessage = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          handleBookingConfirmed(e.data.payload);
        }
      }
    };

    window.addEventListener('message', handleCalendlyMessage);
    return () => {
      window.removeEventListener('message', handleCalendlyMessage);
    };
  }, [leadId]);

  // Load Calendly script when step 2 is reached
  // Calendly will auto-initialize via the data-url attribute
  useEffect(() => {
    if (step === 2) {
      const calendlyUrl = import.meta.env.VITE_CALENDLY_URL;
      if (!calendlyUrl) {
        console.warn('VITE_CALENDLY_URL is not set');
        return;
      }

      // Load Calendly script if not already loaded
      if (!document.querySelector('script[src*="calendly.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onerror = () => {
          console.error('Failed to load Calendly script');
        };
        document.body.appendChild(script);
      }
    }
  }, [step]);

  const handleSkipBooking = () => {
    setStep(3);
  };

  const handleConfirmBooking = () => {
    // If they clicked "Confirm Booking" but haven't actually booked via Calendly,
    // we still proceed to step 3 but bookedConsult remains false
    setStep(3);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={step === 2 ? 'large' : 'default'}>
      <div className="p-12 rounded-[16px]">
        {/* Logo */}
        <div className="text-left mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <img 
              src={logo} 
              alt="DoneWell" 
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Step 1: Contact Form */}
        {step === 1 && (
          <div>
            <h3 className="text-left mb-2 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Let's Get Started</h3>
            <p className="text-left text-[--color-stone-600] mb-[24px] mt-[0px] mr-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
              Tell us about your project and we'll be in touch within 24 hours.
            </p>

            <form onSubmit={handleContinue} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-[--color-stone-700]">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[--color-stone-700]">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">
                  How can we help? *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-[#1B4D2E] resize-none"
                  placeholder="Tell us about your project, timeline, and goals..."
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                className="w-full"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Continue →'}
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Book a Time */}
        {step === 2 && (
          <div>
            <h3 className="text-center mb-2">Book Your Free Consultation</h3>
            <p className="text-center text-[--color-stone-600] mb-8">
              Choose a time that works best for you.
            </p>

            {/* Calendly Embed */}
            {import.meta.env.VITE_CALENDLY_URL ? (
              <div 
                ref={calendlyContainerRef}
                className="calendly-inline-widget mb-8 overflow-hidden"
                data-url={import.meta.env.VITE_CALENDLY_URL}
                style={{ 
                  minWidth: '100%', 
                  minHeight: '500px', 
                  width: '100%',
                  height: '500px'
                }}
              />
            ) : (
              <div className="bg-[--color-stone-100] rounded-lg p-12 text-center mb-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[--color-stone-400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[--color-stone-600]">
                  Calendar booking integration will appear here
                </p>
                <p className="text-sm text-[--color-stone-500] mt-2">
                  Please configure VITE_CALENDLY_URL in your environment variables
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                size="large" 
                className="flex-1"
                onClick={handleSkipBooking}
              >
                Skip for Now
              </Button>
              {bookedConsult && (
                <Button 
                  variant="primary" 
                  size="large" 
                  className="flex-1"
                  onClick={handleConfirmBooking}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[--color-forest-100] to-[--color-sage-100] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-[--color-forest-600]" />
            </div>
            
            <h3 className="mb-4">Thanks — We'll Reach Out Shortly!</h3>
            {bookedConsult ? (
              <p className="text-xl text-[--color-stone-600] mb-8 max-w-md mx-auto">
                We've received your information and we'll see you at your scheduled time!
              </p>
            ) : (
              <p className="text-xl text-[--color-stone-600] mb-8 max-w-md mx-auto">
                We've received your information and will get back to you within 24 hours with next steps.
              </p>
            )}

            <Button 
              variant="primary" 
              size="large"
              onClick={handleClose}
            >
              Back to Site
            </Button>

            <p className="text-sm text-[--color-stone-500] mt-6">
              {bookedConsult 
                ? 'Check your email for calendar confirmation and meeting details.'
                : 'Check your email for a confirmation message.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}