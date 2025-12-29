import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload } from 'lucide-react';
import { Project } from '../ProjectCard';
import { RichTextEditor } from './RichTextEditor';

export function ProjectsManager() {
  const { projects, addProject, updateProject, deleteProject } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      title: '',
      slug: '',
      keyframeImage: '',
      shortDescription: '',
      badge: '',
      metricValue: '',
      metricLabel: '',
      showOnWorkPage: true,
      showOnHomepage: false,
      order: projects.length + 1,
      summary: '',
      problem: '',
      objective: '',
      ourActions: '',
      results: '',
      resultMetrics: [],
    });
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      ...project,
      resultMetrics: project.resultMetrics || [],
    });
  };

  const handleSave = () => {
    if (isAdding) {
      if (formData.title && formData.slug) {
        addProject(formData as Omit<Project, 'id'>);
        setIsAdding(false);
        setFormData({});
      }
    } else if (editingId) {
      updateProject(editingId, formData);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProject(id);
    }
  };

  const toggleVisibility = (project: Project, field: 'showOnWorkPage' | 'showOnHomepage') => {
    updateProject(project.id, { [field]: !project[field] });
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setFormData({ ...formData, keyframeImage: imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  // Result metrics management
  const addResultMetric = () => {
    const currentMetrics = formData.resultMetrics || [];
    setFormData({
      ...formData,
      resultMetrics: [...currentMetrics, { value: '', title: '', description: '' }],
    });
  };

  const updateResultMetric = (index: number, field: 'value' | 'title' | 'description', value: string) => {
    const currentMetrics = formData.resultMetrics || [];
    const updatedMetrics = currentMetrics.map((metric, i) =>
      i === index ? { ...metric, [field]: value } : metric
    );
    setFormData({ ...formData, resultMetrics: updatedMetrics });
  };

  const removeResultMetric = (index: number) => {
    const currentMetrics = formData.resultMetrics || [];
    const updatedMetrics = currentMetrics.filter((_, i) => i !== index);
    setFormData({ ...formData, resultMetrics: updatedMetrics });
  };

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[--color-forest-700]">Projects</h2>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors"
          >
            <Plus size={20} />
            Add Project
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-[--color-sage-50] p-6 rounded-lg border border-[--color-sage-200] mb-6 max-h-[80vh] overflow-y-auto">
          <h3 className="text-[--color-forest-700] mb-6">
            {isAdding ? 'Add New Project' : 'Edit Project'}
          </h3>

          {/* Basic Information */}
          <div className="mb-8">
            <h4 className="text-[--color-forest-600] mb-4 border-b border-[--color-stone-300] pb-[24px] pt-[0px] pr-[0px] pl-[0px]">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Title*</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Slug*</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  placeholder="project-slug"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Badge</label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  placeholder="Web Design"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Order</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-2 text-[--color-stone-700]">Short Description</label>
                <textarea
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  rows={2}
                  placeholder="Brief project description for cards"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Card Metric Value</label>
                <input
                  type="text"
                  value={formData.metricValue || ''}
                  onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  placeholder="98%"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[--color-stone-700]">Card Metric Label</label>
                <input
                  type="text"
                  value={formData.metricLabel || ''}
                  onChange={(e) => setFormData({ ...formData, metricLabel: e.target.value })}
                  className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                  placeholder="Performance"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnWorkPage || false}
                    onChange={(e) => setFormData({ ...formData, showOnWorkPage: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[--color-stone-700]">Show on Work page</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage || false}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[--color-stone-700]">Show on Homepage</span>
                </label>
              </div>
            </div>
          </div>

          {/* Hero/Keyframe Image */}
          <div className="mb-8">
            <h4 className="text-[--color-forest-600] mb-4 border-b border-[--color-stone-300] pb-2">
              Hero Image
            </h4>
            <div>
              <label className="block text-sm mb-[16px] text-[--color-stone-700] mt-[0px] mr-[0px] ml-[0px]">
                Keyframe/Hero Image
                <span className="text-xs text-[--color-stone-500] ml-2">(Preferred: 1920x1080px, 16:9 ratio)</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-3 items-start mt-[0px] mr-[0px] mb-[24px] ml-[0px]">
                  <label className="flex items-center gap-2 px-4 py-2 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors cursor-pointer">
                    <Upload size={18} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[--color-stone-500] py-2">or</span>
                  <input
                    type="text"
                    value={formData.keyframeImage || ''}
                    onChange={(e) => setFormData({ ...formData, keyframeImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                    placeholder="https://... or paste image URL"
                  />
                </div>
                {formData.keyframeImage && (
                  <div className="relative">
                    <img
                      src={formData.keyframeImage}
                      alt="Hero preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, keyframeImage: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rich Text Sections */}
          <div className="mb-8 space-y-6">
            <h4 className="text-[--color-forest-600] mb-4 border-b border-[--color-stone-300] pb-2">
              Project Content
            </h4>
            
            <RichTextEditor
              label="Summary"
              value={formData.summary || ''}
              onChange={(value) => setFormData({ ...formData, summary: value })}
              placeholder="Enter project summary..."
            />

            <RichTextEditor
              label="Problem"
              value={formData.problem || ''}
              onChange={(value) => setFormData({ ...formData, problem: value })}
              placeholder="Describe the problem or challenge..."
            />

            <RichTextEditor
              label="Objective"
              value={formData.objective || ''}
              onChange={(value) => setFormData({ ...formData, objective: value })}
              placeholder="What were the goals and objectives..."
            />

            <RichTextEditor
              label="Our Actions"
              value={formData.ourActions || ''}
              onChange={(value) => setFormData({ ...formData, ourActions: value })}
              placeholder="Describe the actions taken and approach..."
            />

            <RichTextEditor
              label="Results"
              value={formData.results || ''}
              onChange={(value) => setFormData({ ...formData, results: value })}
              placeholder="Describe the outcomes and results..."
            />
          </div>

          {/* Result Metrics */}
          <div className="mb-8">
            <h4 className="text-[--color-forest-600] mb-4 border-b border-[--color-stone-300] pb-2">
              Result Metrics (for metric cards)
            </h4>
            <button
              type="button"
              onClick={addResultMetric}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors mb-4"
            >
              <Plus size={18} />
              Add Metric Card
            </button>

            <div className="space-y-4">
              {formData.resultMetrics && formData.resultMetrics.map((metric, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-[--color-stone-300]">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-sm text-[--color-stone-700]">Metric Card {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeResultMetric(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs mb-1 text-[--color-stone-600]">Metric Value</label>
                      <input
                        type="text"
                        value={metric.value}
                        onChange={(e) => updateResultMetric(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600] text-sm"
                        placeholder="e.g., 300%, 50+, $10K"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-[--color-stone-600]">Metric Title</label>
                      <input
                        type="text"
                        value={metric.title}
                        onChange={(e) => updateResultMetric(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600] text-sm"
                        placeholder="e.g., Traffic Increase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-[--color-stone-600]">Metric Description</label>
                      <textarea
                        value={metric.description}
                        onChange={(e) => updateResultMetric(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600] text-sm"
                        rows={2}
                        placeholder="Brief description of this metric"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[--color-stone-300]">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors"
            >
              <Save size={18} />
              Save Project
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-[--color-stone-200] text-[--color-stone-700] rounded-lg hover:bg-[--color-stone-300] transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-4 rounded-lg border border-[--color-stone-200] hover:border-[--color-sage-300] transition-colors"
          >
            <div className="flex items-start gap-4">
              {project.keyframeImage && (
                <img
                  src={project.keyframeImage}
                  alt={project.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[--color-forest-700] mb-1">{project.title}</h3>
                    <p className="text-sm text-[--color-stone-600]">/{project.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(project, 'showOnWorkPage')}
                      className={`p-2 rounded-lg transition-colors ${
                        project.showOnWorkPage
                          ? 'bg-[--color-sage-100] text-[--color-forest-700]'
                          : 'bg-[--color-stone-100] text-[--color-stone-400]'
                      }`}
                      title="Toggle Work page visibility"
                    >
                      {project.showOnWorkPage ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 bg-[--color-stone-100] text-[--color-stone-700] rounded-lg hover:bg-[--color-stone-200] transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[--color-stone-700] mb-2">{project.shortDescription}</p>
                <div className="flex gap-4 text-sm text-[--color-stone-600]">
                  <span className="px-2 py-1 bg-[--color-sage-50] rounded">{project.badge}</span>
                  {project.metricValue && (
                    <span>
                      {project.metricValue} {project.metricLabel}
                    </span>
                  )}
                  <span>Order: {project.order}</span>
                  {project.showOnHomepage && (
                    <span className="text-[--color-forest-700]">★ Featured on Homepage</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-[--color-stone-500]">
          No projects yet. Click "Add Project" to create your first one.
        </div>
      )}
    </div>
  );
}