import React, { useState } from 'react';
import { useAdmin, Metric } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export function MetricsManager() {
  const { metrics, addMetric, updateMetric, deleteMetric } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Metric>>({});

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      value: '',
      label: '',
      order: metrics.length + 1,
    });
  };

  const handleEdit = (metric: Metric) => {
    setEditingId(metric.id);
    setFormData(metric);
  };

  const handleSave = () => {
    if (isAdding) {
      if (formData.value && formData.label) {
        addMetric(formData as Omit<Metric, 'id'>);
        setIsAdding(false);
        setFormData({});
      }
    } else if (editingId) {
      updateMetric(editingId, formData);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Are you sure you want to delete the "${label}" metric?`)) {
      deleteMetric(id);
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[--color-forest-700]">Metrics</h2>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors"
          >
            <Plus size={20} />
            Add Metric
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-[--color-sage-50] p-6 rounded-lg border border-[--color-sage-200] mb-6">
          <h3 className="text-[--color-forest-700] mb-4">
            {isAdding ? 'Add New Metric' : 'Edit Metric'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2 text-[--color-stone-700]">Value*</label>
              <input
                type="text"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                placeholder="50+"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[--color-stone-700]">Label*</label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
                placeholder="Projects Delivered"
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
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors"
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white p-6 rounded-lg border border-[--color-stone-200] hover:border-[--color-sage-300] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-center flex-1">
                <div className="text-3xl text-[--color-forest-700] mb-1">{metric.value}</div>
                <div className="text-sm text-[--color-stone-600]">{metric.label}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-[--color-stone-200]">
              <button
                onClick={() => handleEdit(metric)}
                className="flex-1 p-2 bg-[--color-stone-100] text-[--color-stone-700] rounded-lg hover:bg-[--color-stone-200] transition-colors text-sm"
              >
                <Edit2 size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => handleDelete(metric.id, metric.label)}
                className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                <Trash2 size={16} className="mx-auto" />
              </button>
            </div>
            <div className="text-xs text-center text-[--color-stone-500] mt-2">
              Order: {metric.order}
            </div>
          </div>
        ))}
      </div>

      {metrics.length === 0 && (
        <div className="text-center py-12 text-[--color-stone-500]">
          No metrics yet. Click "Add Metric" to create your first one.
        </div>
      )}
    </div>
  );
}
