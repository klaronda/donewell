import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseTestimonial, Testimonial, transformTestimonial, testimonialToDatabase } from '../types/database';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      const transformed = (data as DatabaseTestimonial[]).map(transformTestimonial);
      setTestimonials(transformed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch testimonials'));
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
    try {
      const dbTestimonial = testimonialToDatabase(testimonial);
      const { data, error: insertError } = await supabase
        .from('testimonials')
        .insert([dbTestimonial])
        .select()
        .single();

      if (insertError) throw insertError;

      const newTestimonial = transformTestimonial(data as DatabaseTestimonial);
      setTestimonials((prev) => [...prev, newTestimonial].sort((a, b) => a.order - b.order));
      return newTestimonial;
    } catch (err) {
      console.error('Error adding testimonial:', err);
      throw err;
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const dbUpdates: Partial<DatabaseTestimonial> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.quote !== undefined) dbUpdates.quote = updates.quote;
      if (updates.image !== undefined) dbUpdates.image = updates.image ?? null;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.showOnHomepage !== undefined) dbUpdates.show_on_homepage = updates.showOnHomepage;

      const { data, error: updateError } = await supabase
        .from('testimonials')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedTestimonial = transformTestimonial(data as DatabaseTestimonial);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? updatedTestimonial : t)).sort((a, b) => a.order - b.order)
      );
      return updatedTestimonial;
    } catch (err) {
      console.error('Error updating testimonial:', err);
      throw err;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      throw err;
    }
  };

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}



