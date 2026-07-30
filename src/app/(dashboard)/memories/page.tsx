'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api-client';
import type { Memory, MemoryCategory } from '@/lib/types';
import { MEMORY_CATEGORIES } from '@/lib/types';

const CATEGORY_COLORS: Record<MemoryCategory, { bg: string; text: string; ring: string }> = {
  topic: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20' },
  fact: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  tone_note: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  experience_detail: { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/20' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-400', ring: 'ring-gray-500/20' },
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<MemoryCategory | 'all'>('all');

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('other');

  useEffect(() => { loadMemories(); }, [filter]);

  async function loadMemories() {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/memories' : `/api/memories?category=${filter}`;
      const data = await apiFetch<{ data: Memory[] }>(url);
      setMemories(data.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load memories.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setCreating(true);
      setError(null);
      await apiFetch<Memory>('/api/memories', {
        method: 'POST',
        body: JSON.stringify({ key: newKey, value: newValue, category: newCategory }),
      });
      setNewKey('');
      setNewValue('');
      setNewCategory('other');
      setShowForm(false);
      setSuccess('Memory added.');
      setTimeout(() => setSuccess(null), 3000);
      loadMemories();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create memory.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setError(null);
      await apiFetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories(memories.filter((m) => m.id !== id));
      setSuccess('Memory deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete memory.');
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Memories</h1>
          <p className="mt-1 text-sm text-gray-400">Categorized facts AI clients use to personalize your content.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          {showForm ? 'Cancel' : '+ New Memory'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">{success}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key (e.g. Favorite topic)" maxLength={100}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={newCategory} onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {MEMORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <textarea
            value={newValue} onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value (e.g. I love writing about distributed systems)" rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleCreate} disabled={creating || !newKey.trim() || !newValue.trim()}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            filter === 'all' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {MEMORY_CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                filter === cat ? `${colors.bg} ${colors.text} ring-1 ${colors.ring}` : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Memory list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : memories.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-2xl mb-2">🧠</p>
          <p className="text-sm text-gray-400">No memories yet. Add your first one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => {
            const colors = CATEGORY_COLORS[memory.category];
            return (
              <div key={memory.id} className="group rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-all hover:border-gray-600">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white truncate">{memory.key}</h3>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
                        {memory.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{memory.value}</p>
                    <p className="mt-2 text-xs text-gray-600">{new Date(memory.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
