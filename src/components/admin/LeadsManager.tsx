import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Lead } from '../../types/database';
import { Trash2, Mail, Phone, Calendar, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export function LeadsManager() {
  const { leads, deleteLead } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'booked' | 'not_booked'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setDeletingId(id);
      try {
        await deleteLead(id);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'booked') return lead.bookedConsult;
    if (filter === 'not_booked') return !lead.bookedConsult;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[--color-forest-700] mb-2">Leads</h2>
          <p className="text-[--color-stone-600]">
            View and manage all form submissions from the Get Started modal.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'all'
              ? 'bg-[--color-forest-700] text-white'
              : 'bg-white border border-[--color-stone-300] text-[--color-stone-700] hover:bg-[--color-stone-50]'
          }`}
        >
          All ({leads.length})
        </button>
        <button
          onClick={() => setFilter('booked')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'booked'
              ? 'bg-[--color-forest-700] text-white'
              : 'bg-white border border-[--color-stone-300] text-[--color-stone-700] hover:bg-[--color-stone-50]'
          }`}
        >
          Booked ({leads.filter((l) => l.bookedConsult).length})
        </button>
        <button
          onClick={() => setFilter('not_booked')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'not_booked'
              ? 'bg-[--color-forest-700] text-white'
              : 'bg-white border border-[--color-stone-300] text-[--color-stone-700] hover:bg-[--color-stone-50]'
          }`}
        >
          Not Booked ({leads.filter((l) => !l.bookedConsult).length})
        </button>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-[--color-stone-200] rounded-lg p-12 text-center">
          <p className="text-[--color-stone-600]">No leads found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-[--color-stone-200] rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-[--color-forest-700]">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    {lead.bookedConsult ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[--color-sage-100] text-[--color-forest-700] rounded text-xs font-medium">
                        <CheckCircle2 size={12} />
                        Booked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[--color-stone-100] text-[--color-stone-600] rounded text-xs font-medium">
                        <XCircle size={12} />
                        Not Booked
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 mb-3 text-sm text-[--color-stone-600]">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:text-[--color-forest-700] transition-colors"
                      >
                        {lead.email}
                      </a>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:text-[--color-forest-700] transition-colors"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    {lead.businessName && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lead.businessName}</span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-3">
                    <p className="text-sm text-[--color-stone-700] whitespace-pre-wrap">
                      {lead.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-[--color-stone-500]">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                    {lead.calendlyEventUri && (
                      <a
                        href={lead.calendlyEventUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[--color-forest-700] transition-colors"
                      >
                        <ExternalLink size={12} />
                        View Calendly Event
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(lead.id)}
                  disabled={deletingId === lead.id}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete lead"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

