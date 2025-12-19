import React, { useState } from 'react';
import { useAdmin, Testimonial } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, Save, X, Star, Upload, Image as ImageIcon } from 'lucide-react';

export function TestimonialsManager() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      role: '',
      company: '',
      quote: '',
      image: '',
      showOnHomepage: false,
      order: testimonials.length + 1,
    });
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData(testimonial);
  };

  const handleSave = () => {
    if (isAdding) {
      if (formData.name && formData.quote) {
        addTestimonial(formData as Omit<Testimonial, 'id'>);
        setIsAdding(false);
        setFormData({});
      }
    } else if (editingId) {
      updateTestimonial(editingId, formData);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the testimonial from "${name}"?`)) {
      deleteTestimonial(id);
    }
  };

  const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[--color-forest-700]">Testimonials</h2>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors"
          >
            <Plus size={20} />
            Add Testimonial
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-[--color-sage-50] p-6 rounded-lg border border-[--color-sage-200] mb-6">
          <h3 className="text-[--color-forest-700] mb-4">
            {isAdding ? 'Add New Testimonial' : 'Edit Testimonial'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2 text-[--color-stone-700]">Name*</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[--color-stone-700]">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                placeholder="CEO"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[--color-stone-700]">Company</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                placeholder="Company Name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-[--color-stone-700]">
                Profile Image
                <span className="text-xs text-[--color-stone-500] ml-2">(Preferred: 400x400px square)</span>
              </label>
              
              {/* Image Upload Section */}
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  {/* Upload Button */}
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
                  
                  {/* Or Text */}
                  <span className="text-[--color-stone-500] py-2">or</span>
                  
                  {/* URL Input */}
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                    placeholder="https://... or paste image URL"
                  />
                </div>
                
                {/* Image Preview */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[--color-stone-200]">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-[--color-stone-700]">Image preview</p>
                      <p className="text-xs text-[--color-stone-500]">Recommended: Square image, 400x400px</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-[--color-stone-700]">Testimonial*</label>
              <textarea
                value={formData.quote || ''}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                rows={4}
                placeholder="What the client said..."
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
            <div className="flex items-center">
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
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors"
            >
              <Save size={18} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-[--color-stone-200] text-[--color-stone-700] rounded-lg hover:bg-[--color-stone-300] transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="space-y-4">
        {sortedTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white p-4 rounded-lg border border-[--color-stone-200] hover:border-[--color-sage-300] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-[--color-forest-700]">{testimonial.name}</h3>
                  <p className="text-sm text-[--color-stone-600]">
                    {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 bg-[--color-stone-100] text-[--color-stone-700] rounded-lg hover:bg-[--color-stone-200] transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id, testimonial.name)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-[--color-stone-700] mb-3 italic">"{testimonial.quote}"</p>
            <div className="flex gap-4 text-sm text-[--color-stone-600]">
              <span>Order: {testimonial.order}</span>
              {testimonial.showOnHomepage && (
                <span className="flex items-center gap-1 text-[--color-forest-700]">
                  <Star size={14} fill="currentColor" />
                  Featured on Homepage
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-[--color-stone-500]">
          No testimonials yet. Click "Add Testimonial" to create your first one.
        </div>
      )}
    </div>
  );
}