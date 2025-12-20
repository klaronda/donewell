import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseLead, Lead, transformLead, leadToDatabase } from '../types/database';
import { sendEmail } from '../lib/email';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed = (data as DatabaseLead[]).map(transformLead);
      setLeads(transformed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch leads'));
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    try {
      const dbLead = leadToDatabase(lead);
      const { data, error: insertError } = await supabase
        .from('leads')
        .insert([dbLead])
        .select()
        .single();

      if (insertError) {
        console.error('Database error adding lead:', insertError);
        throw insertError;
      }

      const newLead = transformLead(data as DatabaseLead);
      setLeads((prev) => [newLead, ...prev]);
      
      // Send email for new lead (bookedConsult is false by default)
      // This is fire-and-forget - don't wait for it or let it break the flow
      if (!newLead.bookedConsult) {
        // Use setTimeout to ensure this runs after the function returns
        setTimeout(() => {
          sendEmail({
            to: newLead.email,
            firstName: newLead.firstName,
            lastName: newLead.lastName,
            businessName: newLead.businessName || undefined,
            message: newLead.message || undefined,
            bookedConsult: false,
          }).catch((error) => {
            console.warn('Failed to send email after lead creation (non-critical):', error);
          });
        }, 0);
      }
      
      return newLead;
    } catch (err) {
      console.error('Error adding lead:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      // Get the current lead to check if bookedConsult is changing
      const currentLead = leads.find((l) => l.id === id);
      const isBookingConfirmed = currentLead && !currentLead.bookedConsult && updates.bookedConsult === true;

      const dbUpdates: Partial<DatabaseLead> = {};
      
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName ?? null;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone ?? null;
      if (updates.message !== undefined) dbUpdates.message = updates.message;
      if (updates.bookedConsult !== undefined) dbUpdates.booked_consult = updates.bookedConsult;
      if (updates.calendlyEventUri !== undefined) dbUpdates.calendly_event_uri = updates.calendlyEventUri ?? null;

      const { data, error: updateError } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedLead = transformLead(data as DatabaseLead);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? updatedLead : l))
      );
      
      // Send email when booking is confirmed (bookedConsult changes from false to true)
      // This is fire-and-forget - don't wait for it or let it break the flow
      if (isBookingConfirmed) {
        // Use setTimeout to ensure this runs after the function returns
        setTimeout(() => {
          sendEmail({
            to: updatedLead.email,
            firstName: updatedLead.firstName,
            lastName: updatedLead.lastName,
            businessName: updatedLead.businessName || undefined,
            message: updatedLead.message || undefined,
            bookedConsult: true,
          }).catch((error) => {
            console.warn('Failed to send email after booking confirmation (non-critical):', error);
          });
        }, 0);
      }
      
      return updatedLead;
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    addLead,
    updateLead,
    deleteLead,
  };
}



