import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useProjects } from '../hooks/useProjects';
import { useTestimonials } from '../hooks/useTestimonials';
import { useMetrics } from '../hooks/useMetrics';
import { useLeads } from '../hooks/useLeads';
import { Project } from '../components/ProjectCard';
import { Testimonial, Metric, Lead } from '../types/database';

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  // Metrics
  metrics: Metric[];
  addMetric: (metric: Omit<Metric, 'id'>) => Promise<void>;
  updateMetric: (id: string, metric: Partial<Metric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;

  // Leads
  leads: Lead[];
  deleteLead: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use Supabase hooks for data
  const projectsHook = useProjects();
  const testimonialsHook = useTestimonials();
  const metricsHook = useMetrics();
  const leadsHook = useLeads();

  // Check auth status on mount and on auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth functions using Supabase Auth
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      setIsAuthenticated(!!data.session);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Project functions (wrapped to match interface)
  const addProject = async (project: Omit<Project, 'id'>): Promise<void> => {
    await projectsHook.addProject(project);
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    await projectsHook.updateProject(id, updates);
  };

  const deleteProject = async (id: string): Promise<void> => {
    await projectsHook.deleteProject(id);
  };

  // Testimonial functions (wrapped to match interface)
  const addTestimonial = async (testimonial: Omit<Testimonial, 'id'>): Promise<void> => {
    await testimonialsHook.addTestimonial(testimonial);
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>): Promise<void> => {
    await testimonialsHook.updateTestimonial(id, updates);
  };

  const deleteTestimonial = async (id: string): Promise<void> => {
    await testimonialsHook.deleteTestimonial(id);
  };

  // Metric functions (wrapped to match interface)
  const addMetric = async (metric: Omit<Metric, 'id'>): Promise<void> => {
    await metricsHook.addMetric(metric);
  };

  const updateMetric = async (id: string, updates: Partial<Metric>): Promise<void> => {
    await metricsHook.updateMetric(id, updates);
  };

  const deleteMetric = async (id: string): Promise<void> => {
    await metricsHook.deleteMetric(id);
  };

  // Lead functions (read-only for admin, leads are created via form)
  const deleteLead = async (id: string): Promise<void> => {
    await leadsHook.deleteLead(id);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        loading: loading || projectsHook.loading || testimonialsHook.loading || metricsHook.loading || leadsHook.loading,
        projects: projectsHook.projects,
        addProject,
        updateProject,
        deleteProject,
        testimonials: testimonialsHook.testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        metrics: metricsHook.metrics,
        addMetric,
        updateMetric,
        deleteMetric,
        leads: leadsHook.leads,
        deleteLead,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}