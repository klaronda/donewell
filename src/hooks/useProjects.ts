import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseProject, Project, transformProject, projectToDatabase } from '../types/database';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('Raw Supabase data:', data);
      const transformed = (data as DatabaseProject[]).map(transformProject);
      console.log('Transformed projects:', transformed);
      setProjects(transformed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const dbProject = projectToDatabase(project);
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([dbProject])
        .select()
        .single();

      if (insertError) throw insertError;

      const newProject = transformProject(data as DatabaseProject);
      setProjects((prev) => [...prev, newProject].sort((a, b) => a.order - b.order));
      return newProject;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const dbUpdates: Partial<DatabaseProject> = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.keyframeImage !== undefined) dbUpdates.keyframe_image = updates.keyframeImage;
      if (updates.shortDescription !== undefined) dbUpdates.short_description = updates.shortDescription;
      if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
      if (updates.metricValue !== undefined) dbUpdates.metric_value = updates.metricValue;
      if (updates.metricLabel !== undefined) dbUpdates.metric_label = updates.metricLabel;
      if (updates.showOnWorkPage !== undefined) dbUpdates.show_on_work_page = updates.showOnWorkPage;
      if (updates.showOnHomepage !== undefined) dbUpdates.show_on_homepage = updates.showOnHomepage;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.summary !== undefined) dbUpdates.summary = updates.summary ?? null;
      if (updates.problem !== undefined) dbUpdates.problem = updates.problem ?? null;
      if (updates.objective !== undefined) dbUpdates.objective = updates.objective ?? null;
      if (updates.ourActions !== undefined) dbUpdates.our_actions = updates.ourActions ?? null;
      if (updates.results !== undefined) dbUpdates.results = updates.results ?? null;
      if (updates.resultMetrics !== undefined) dbUpdates.result_metrics = updates.resultMetrics ?? null;
      if (updates.liveWebsiteUrl !== undefined) dbUpdates.live_website_url = updates.liveWebsiteUrl ?? null;

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedProject = transformProject(data as DatabaseProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p)).sort((a, b) => a.order - b.order)
      );
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
}



