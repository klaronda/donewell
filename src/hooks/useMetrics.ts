import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseMetric, Metric, transformMetric, metricToDatabase } from '../types/database';

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('metrics')
        .select('*')
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      const transformed = (data as DatabaseMetric[]).map(transformMetric);
      setMetrics(transformed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const addMetric = async (metric: Omit<Metric, 'id'>) => {
    try {
      const dbMetric = metricToDatabase(metric);
      const { data, error: insertError } = await supabase
        .from('metrics')
        .insert([dbMetric])
        .select()
        .single();

      if (insertError) throw insertError;

      const newMetric = transformMetric(data as DatabaseMetric);
      setMetrics((prev) => [...prev, newMetric].sort((a, b) => a.order - b.order));
      return newMetric;
    } catch (err) {
      console.error('Error adding metric:', err);
      throw err;
    }
  };

  const updateMetric = async (id: string, updates: Partial<Metric>) => {
    try {
      const dbUpdates: Partial<DatabaseMetric> = {};
      
      if (updates.value !== undefined) dbUpdates.value = updates.value;
      if (updates.label !== undefined) dbUpdates.label = updates.label;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { data, error: updateError } = await supabase
        .from('metrics')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedMetric = transformMetric(data as DatabaseMetric);
      setMetrics((prev) =>
        prev.map((m) => (m.id === id ? updatedMetric : m)).sort((a, b) => a.order - b.order)
      );
      return updatedMetric;
    } catch (err) {
      console.error('Error updating metric:', err);
      throw err;
    }
  };

  const deleteMetric = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('metrics')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setMetrics((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Error deleting metric:', err);
      throw err;
    }
  };

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    addMetric,
    updateMetric,
    deleteMetric,
  };
}



