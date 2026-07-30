'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api-client';
import type { ProfileWithCompleteness, Experience } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileWithCompleteness | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await apiFetch<ProfileWithCompleteness>('/api/profile');
      setProfile(data);
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setSkills(data.skills || []);
      setGoals(data.goals || []);
      setExperience(data.experience || []);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const data = await apiFetch<ProfileWithCompleteness>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ headline, bio, skills, goals, experience }),
      });
      setProfile(data);
      setSuccess('Profile saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  function addExperience() {
    setExperience([...experience, { title: '', company: '', startDate: '', endDate: null, description: '' }]);
  }

  function updateExperience(index: number, field: keyof Experience, value: string | null) {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  }

  function removeExperience(index: number) {
    setExperience(experience.filter((_, i) => i !== index));
  }

  function addSkill() {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  }

  function addGoal() {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
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
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your professional profile for AI personalization.</p>
        {profile && !profile.isProfileComplete && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
            ⚠️ Finish setting up your profile for better personalized posts.
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={150}
            placeholder="e.g. Senior Software Engineer at Acme Corp"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">{headline.length}/150 characters</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell AI clients about your professional background..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <p className={`mt-1 text-xs ${bio.length > 2000 ? 'text-amber-400' : 'text-gray-500'}`}>
            {bio.length}/2,000 characters {bio.length > 2000 && '(recommended max)'}
          </p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20">
                {skill}
                <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <button onClick={addSkill} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600">Add</button>
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Goals</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {goals.map((goal, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20">
                {goal}
                <button onClick={() => setGoals(goals.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              placeholder="Add a goal..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <button onClick={addGoal} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600">Add</button>
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-300">Experience</label>
            <button onClick={addExperience} className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600">
              + Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i} className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Experience #{i + 1}</span>
                  <button onClick={() => removeExperience(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text" value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)}
                    placeholder="Job title" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)}
                    placeholder="Company" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text" value={exp.startDate} onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                    placeholder="Start date (e.g. Jan 2020)" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text" value={exp.endDate || ''} onChange={(e) => updateExperience(i, 'endDate', e.target.value || null)}
                    placeholder="End date (or leave blank)" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <textarea
                  value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)}
                  placeholder="Description..." rows={2}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
