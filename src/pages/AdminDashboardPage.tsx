import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { LogOut, FolderOpen, MessageSquare, BarChart3, Plus } from 'lucide-react';
import { ProjectsManager } from '../components/admin/ProjectsManager';
import { TestimonialsManager } from '../components/admin/TestimonialsManager';
import { MetricsManager } from '../components/admin/MetricsManager';

type TabType = 'projects' | 'testimonials' | 'metrics';

export function AdminDashboardPage() {
  const { logout, projects, testimonials, metrics } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      window.history.pushState({}, '', '/admin');
      window.location.reload();
    }
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen },
    { label: 'Testimonials', value: testimonials.length, icon: MessageSquare },
    { label: 'Metrics', value: metrics.length, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[--color-stone-50]">
      {/* Header */}
      <header className="bg-white border-b border-[--color-stone-200]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-1">DoneWell CMS</h1>
              <p className="text-sm text-[--color-stone-600]">Manage your content</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-[--color-stone-700] hover:bg-[--color-stone-100] rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-xl border border-[--color-stone-200]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[--color-stone-600] mb-1">{stat.label}</p>
                    <p className="text-3xl text-[--color-forest-700]">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-[--color-sage-100] rounded-lg flex items-center justify-center">
                    <Icon className="text-[--color-forest-700]" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[--color-stone-200] overflow-hidden">
          <div className="border-b border-[--color-stone-200]">
            <div className="flex">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-4 text-sm transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`px-6 py-4 text-sm transition-colors ${
                  activeTab === 'testimonials'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Testimonials
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-6 py-4 text-sm transition-colors ${
                  activeTab === 'metrics'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Metrics
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'testimonials' && <TestimonialsManager />}
            {activeTab === 'metrics' && <MetricsManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
