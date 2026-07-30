'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api-client';
import type { WritingStyle, Tone, Length } from '@/lib/types';
import { TONES, LENGTHS } from '@/lib/types';

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: 'Formal and polished',
  casual: 'Friendly and conversational',
  bold: 'Direct and assertive',
  'thought-leader': 'Authoritative and visionary',
  storytelling: 'Narrative and engaging',
};

export default function WritingStylePage() {
  const [style, setStyle] = useState<WritingStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tone, setTone] = useState<Tone>('professional');
  const [length, setLength] = useState<Length>('medium');
  const [emojiUsage, setEmojiUsage] = useState(false);
  const [ctaStyle, setCtaStyle] = useState('');

  useEffect(() => { loadStyle(); }, []);

  async function loadStyle() {
    try {
      setLoading(true);
      const data = await apiFetch<WritingStyle>('/api/writing-style');
      if (data) {
        setStyle(data);
        setTone(data.tone);
        setLength(data.length);
        setEmojiUsage(data.emoji_usage);
        setCtaStyle(data.cta_style || '');
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load writing style.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const data = await apiFetch<WritingStyle>('/api/writing-style', {
        method: 'PUT',
        body: JSON.stringify({ tone, length, emoji_usage: emojiUsage, cta_style: ctaStyle || null }),
      });
      setStyle(data);
      setSuccess('Writing style saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save writing style.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Writing Style</h1>
        <p className="mt-1 text-sm text-gray-400">Configure how AI clients should write for you.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">{success}</div>
      )}

      <div className="space-y-8">
        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Tone</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  tone === t
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <p className={`text-sm font-medium ${tone === t ? 'text-indigo-400' : 'text-gray-300'}`}>
                  {t.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <p className="mt-1 text-xs text-gray-500">{TONE_DESCRIPTIONS[t]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Post Length</label>
          <div className="flex gap-3">
            {LENGTHS.map((l) => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  length === l
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div>
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-300">Use Emojis</p>
              <p className="mt-1 text-xs text-gray-500">Include emojis in generated content</p>
            </div>
            <button
              onClick={() => setEmojiUsage(!emojiUsage)}
              className={`relative h-6 w-11 rounded-full transition-colors ${emojiUsage ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${emojiUsage ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* CTA Style */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">CTA Style</label>
          <input
            type="text"
            value={ctaStyle}
            onChange={(e) => setCtaStyle(e.target.value)}
            placeholder="e.g. Ask a question, Share your thoughts..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">Optional — describe how you like to end posts</p>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Style'}
          </button>
        </div>
      </div>
    </div>
  );
}
