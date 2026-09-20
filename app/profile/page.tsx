'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Pencil, Save, X, Lightbulb, Heart, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myIdeasCount, setMyIdeasCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    skills: '',
    interests: '',
    profile_image: '',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        skills: (profile.skills || []).join(', '),
        interests: (profile.interests || []).join(', '),
        profile_image: profile.profile_image || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: myCount }, { count: favCount }] = await Promise.all([
        supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('favourites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setMyIdeasCount(myCount || 0);
      setSavedCount(favCount || 0);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        profile_image: form.profile_image.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!user) return null;

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Profile</h1>

      {/* Profile header card */}
      <div className="isometric-card mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            {profile?.profile_image || form.profile_image ? (
              <img
                src={form.profile_image || profile?.profile_image}
                alt=""
                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-sky-400 to-cyan-500 text-3xl font-bold text-white shadow-lg">
                {(profile?.full_name || user.email || 'U')[0]?.toUpperCase()}
              </div>
            )}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="mt-4">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Profile Image URL</label>
                  <input
                    type="url"
                    value={form.profile_image}
                    onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="React, Python, Design"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={form.interests}
                    onChange={(e) => setForm({ ...form, interests: e.target.value })}
                    placeholder="AI, Startups, Sustainability"
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-outline flex-1">
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'Anonymous'}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {profile?.bio && <p className="mt-3 text-slate-600">{profile.bio}</p>}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                    <Lightbulb className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                    <div className="text-2xl font-bold text-slate-900">{myIdeasCount}</div>
                    <div className="text-xs text-slate-500">Ideas Created</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                    <Heart className="mx-auto mb-1 h-5 w-5 text-rose-500" />
                    <div className="text-2xl font-bold text-slate-900">{savedCount}</div>
                    <div className="text-xs text-slate-500">Ideas Saved</div>
                  </div>
                </div>

                {profile?.skills && profile.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s) => (
                        <span key={s} className="rounded-lg bg-sky-50 px-3 py-1 text-sm text-sky-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.interests && profile.interests.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((s) => (
                        <span key={s} className="rounded-lg bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
