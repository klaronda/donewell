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
    const { error } = await supabase.functions.invoke('send-lead-email', {
      body: params,
    });

    if (error) {
      console.error('Failed to send email:', error);
      // Don't throw - we don't want email failures to break the lead creation flow
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - we don't want email failures to break the lead creation flow
  }
}
