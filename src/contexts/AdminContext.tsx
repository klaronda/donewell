import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../components/ProjectCard';
import { mockProjects } from '../data/mockProjects';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  order: number;
  showOnHomepage: boolean;
}

export interface Metric {
  id: string;
  value: string;
  label: string;
  order: number;
}

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Metrics
  metrics: Metric[];
  addMetric: (metric: Omit<Metric, 'id'>) => void;
  updateMetric: (id: string, metric: Partial<Metric>) => void;
  deleteMetric: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'donewell_admin_auth',
  PROJECTS: 'donewell_projects',
  TESTIMONIALS: 'donewell_testimonials',
  METRICS: 'donewell_metrics',
  CREDENTIALS: 'donewell_admin_credentials',
};

// Default admin credentials - in production this would be handled by a real auth system
const DEFAULT_ADMIN_EMAIL = 'admin@donewell.com';
const DEFAULT_ADMIN_PASSWORD = 'donewell2024';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const authStatus = localStorage.getItem(STORAGE_KEYS.AUTH);
    setIsAuthenticated(authStatus === 'true');

    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      // Initialize with mock data if nothing in storage
      setProjects(mockProjects);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects));
    }

    const storedTestimonials = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    if (storedTestimonials) {
      setTestimonials(JSON.parse(storedTestimonials));
    } else {
      // Initialize with default testimonials
      const defaultTestimonials: Testimonial[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Founder',
          company: 'Strategy Partners',
          quote: 'DoneWell transformed our online presence. Within a month of launching, we booked 12 new clients. Their attention to detail and understanding of our business was exceptional.',
          order: 1,
          showOnHomepage: true,
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Creative Director',
          company: 'Studio Bright',
          quote: 'The redesign exceeded all expectations. Our lead generation increased by 340% in just 60 days. The team was professional, responsive, and truly understood our vision.',
          order: 2,
          showOnHomepage: true,
        },
      ];
      setTestimonials(defaultTestimonials);
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(defaultTestimonials));
    }

    const storedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    } else {
      // Initialize with default metrics
      const defaultMetrics: Metric[] = [
        { id: '1', value: '50+', label: 'Projects Delivered', order: 1 },
        { id: '2', value: '98%', label: 'Client Satisfaction', order: 2 },
        { id: '3', value: '2 weeks', label: 'Average Timeline', order: 3 },
        { id: '4', value: '24/7', label: 'Support Available', order: 4 },
      ];
      setMetrics(defaultMetrics);
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(defaultMetrics));
    }
  }, []);

  // Auth functions
  const login = (email: string, password: string): boolean => {
    const storedCredentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials);
      if (email === credentials.email && password === credentials.password) {
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        return true;
      }
    } else {
      // Initialize with default credentials if nothing in storage
      const defaultCredentials = {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      };
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(defaultCredentials));
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  // Project functions
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  };

  // Testimonial functions
  const addTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Date.now().toString(),
    };
    const updatedTestimonials = [...testimonials, newTestimonial];
    setTestimonials(updatedTestimonials);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updatedTestimonials));
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updatedTestimonials = testimonials.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTestimonials(updatedTestimonials);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updatedTestimonials));
  };

  const deleteTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.filter(t => t.id !== id);
    setTestimonials(updatedTestimonials);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updatedTestimonials));
  };

  // Metric functions
  const addMetric = (metric: Omit<Metric, 'id'>) => {
    const newMetric: Metric = {
      ...metric,
      id: Date.now().toString(),
    };
    const updatedMetrics = [...metrics, newMetric];
    setMetrics(updatedMetrics);
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updatedMetrics));
  };

  const updateMetric = (id: string, updates: Partial<Metric>) => {
    const updatedMetrics = metrics.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    setMetrics(updatedMetrics);
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updatedMetrics));
  };

  const deleteMetric = (id: string) => {
    const updatedMetrics = metrics.filter(m => m.id !== id);
    setMetrics(updatedMetrics);
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updatedMetrics));
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        projects,
        addProject,
        updateProject,
        deleteProject,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        metrics,
        addMetric,
        updateMetric,
        deleteMetric,
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