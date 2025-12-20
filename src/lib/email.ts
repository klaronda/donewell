import { supabase } from './supabase';

interface SendEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  message?: string;
  bookedConsult: boolean;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-lead-email', {
      body: params,
    });

    if (error) {
      console.warn('Email sending failed (non-critical):', error);
      // Don't throw - we don't want email failures to break the lead creation flow
      return;
    }

    if (data) {
      console.log('Email sent successfully:', data);
    }
  } catch (error) {
    // Edge Function might not be deployed yet, or other network issues
    console.warn('Email sending failed (non-critical):', error);
    // Don't throw - we don't want email failures to break the lead creation flow
  }
}
