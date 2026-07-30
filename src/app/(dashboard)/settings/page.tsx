'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api-client';

export default function SettingsPage() {
  const [readOnly, setReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const data = await apiFetch<{ read_only_mode: boolean }>('/api/settings/read-only-mode');
      setReadOnly(data.read_only_mode);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleReadOnly() {
    const newValue = !readOnly;
    try {
      setSaving(true);
      setError(null);
      await apiFetch('/api/settings/read-only-mode', {
        method: 'PUT',
        body: JSON.stringify({ enabled: newValue }),
      });
      setReadOnly(newValue);
      setSuccess(`Write access ${newValue ? 'disabled' : 'enabled'}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you absolutely sure you want to delete your account? This will immediately and permanently delete your profile, writing style, memories, and all posts. This action CANNOT be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await apiFetch('/api/account', { method: 'DELETE' });
      // Redirect to landing page which should trigger the session to be cleared or just go to /
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete account.');
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account and integration preferences.</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>}
      {success && <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">{success}</div>}

      <div className="space-y-8">
        
        {/* MCP Settings */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="border-b border-gray-800 bg-gray-800/50 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Model Context Protocol</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-200">Prevent AI Writes</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xl">
                  When enabled, AI clients can only read your context. They cannot update your profile, writing style, or save draft posts on your behalf.
                </p>
              </div>
              <button
                disabled={loading || saving}
                onClick={toggleReadOnly}
                className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${readOnly ? 'bg-indigo-500' : 'bg-gray-600'} disabled:opacity-50`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${readOnly ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-red-500/20 bg-gray-900 overflow-hidden">
          <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-4">
            <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-200">Delete Account</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xl">
                  Permanently delete your account and all associated data. This action is immediate and cannot be undone.
                </p>
              </div>
              <button
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-50 border border-red-500/20"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
