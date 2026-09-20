'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, X } from 'lucide-react';
import { supabase, CATEGORIES } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function EditIdeaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    detailed_description: '',
    category: CATEGORIES[0] as string,
    problem_statement: '',
    proposed_solution: '',
    target_audience: '',
    business_model: '',
    expected_impact: '',
    image_url: '',
  });
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          toast.error('Idea not found');
          router.push('/my-ideas');
          return;
        }
        if (data.author_id !== user.id) {
          toast.error('You can only edit your own ideas');
          router.push('/my-ideas');
          return;
        }
        setForm({
          title: data.title || '',
          short_description: data.short_description || '',
          detailed_description: data.detailed_description || '',
          category: data.category || CATEGORIES[0],
          problem_statement: data.problem_statement || '',
          proposed_solution: data.proposed_solution || '',
          target_audience: data.target_audience || '',
          business_model: data.business_model || '',
          expected_impact: data.expected_impact || '',
          image_url: data.image_url || '',
        });
        setTechnologies(data.technologies || []);
        setTags(data.tags || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.short_description.trim()) e.short_description = 'Short description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.problem_statement.trim()) e.problem_statement = 'Problem statement is required';
    if (!form.proposed_solution.trim()) e.proposed_solution = 'Proposed solution is required';
    if (!form.target_audience.trim()) e.target_audience = 'Target audience is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          title: form.title.trim(),
          short_description: form.short_description.trim(),
          detailed_description: form.detailed_description.trim(),
          category: form.category,
          problem_statement: form.problem_statement.trim(),
          proposed_solution: form.proposed_solution.trim(),
          target_audience: form.target_audience.trim(),
          technologies,
          business_model: form.business_model.trim(),
          expected_impact: form.expected_impact.trim(),
          tags,
          image_url: form.image_url.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('author_id', user.id);
      if (error) throw error;
      toast.success('Idea updated!');
      router.push(`/ideas/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update idea';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !technologies.includes(t)) setTechnologies([...technologies, t]);
    setTechInput('');
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const fieldClass = (name: string) =>
    `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${
      errors[name] ? 'border-red-300' : 'border-slate-200'
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Edit Idea</h1>
        <p className="mt-1 text-slate-600">Update your startup idea</p>
      </div>

      <form onSubmit={handleSubmit} className="isometric-card space-y-6 p-6 sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Idea Title <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className={fieldClass('short_description')} />
          {errors.short_description && <p className="mt-1 text-xs text-red-500">{errors.short_description}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Detailed Description</label>
          <textarea value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} rows={4} className={fieldClass('detailed_description')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldClass('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Problem Statement <span className="text-red-500">*</span>
          </label>
          <textarea value={form.problem_statement} onChange={(e) => setForm({ ...form, problem_statement: e.target.value })} rows={3} className={fieldClass('problem_statement')} />
          {errors.problem_statement && <p className="mt-1 text-xs text-red-500">{errors.problem_statement}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Proposed Solution <span className="text-red-500">*</span>
          </label>
          <textarea value={form.proposed_solution} onChange={(e) => setForm({ ...form, proposed_solution: e.target.value })} rows={3} className={fieldClass('proposed_solution')} />
          {errors.proposed_solution && <p className="mt-1 text-xs text-red-500">{errors.proposed_solution}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className={fieldClass('target_audience')} />
          {errors.target_audience && <p className="mt-1 text-xs text-red-500">{errors.target_audience}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Required Technologies</label>
          <div className="flex gap-2">
            <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} placeholder="Add a technology" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            <button type="button" onClick={addTech} className="btn-outline px-4 py-2.5 text-sm"><Plus className="h-4 w-4" /></button>
          </div>
          {technologies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {technologies.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs text-sky-700">
                  {t}
                  <button type="button" onClick={() => setTechnologies(technologies.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Business Model</label>
          <input type="text" value={form.business_model} onChange={(e) => setForm({ ...form, business_model: e.target.value })} className={fieldClass('business_model')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Expected Impact</label>
          <textarea value={form.expected_impact} onChange={(e) => setForm({ ...form, expected_impact: e.target.value })} rows={2} className={fieldClass('expected_impact')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add a tag" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            <button type="button" onClick={addTag} className="btn-outline px-4 py-2.5 text-sm"><Plus className="h-4 w-4" /></button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Image URL (Optional)</label>
          <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={fieldClass('image_url')} />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline flex-1">Cancel</button>
        </div>
      </form>
    </div>
  );
}
