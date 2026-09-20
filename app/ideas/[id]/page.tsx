'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2, Edit, Trash2, Calendar, User, Tag, Lightbulb, Target, Cog, DollarSign, TrendingUp } from 'lucide-react';
import { supabase, Idea } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toggleFavourite, isFavourited } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function IdeaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*, profiles!inner(full_name, profile_image)')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast.error('Idea not found');
          router.push('/explore');
          return;
        }

        const ideaData = data as unknown as Idea;
        setIdea(ideaData);

        const { count } = await supabase
          .from('favourites')
          .select('*', { count: 'exact', head: true })
          .eq('idea_id', id);
        setFavCount(count || 0);

        const fav = await isFavourited(id);
        setSaved(fav);
      } catch {
        toast.error('Failed to load idea');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, router]);

  const handleFav = async () => {
    if (!user) return;
    setToggling(true);
    const result = await toggleFavourite(id, saved);
    if (result.ok) {
      setSaved(!saved);
      setFavCount((c) => c + (saved ? -1 : 1));
      toast.success(saved ? 'Removed from saved' : 'Added to saved');
    } else {
      toast.error(result.error || 'Failed');
    }
    setToggling(false);
  };

  const handleDelete = async () => {
    if (!idea || !user) return;
    const { error } = await supabase.from('ideas').delete().eq('id', idea.id).eq('author_id', user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Idea deleted');
      router.push('/my-ideas');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!idea) return null;

  const isOwner = user?.id === idea.author_id;
  const authorName = (idea as any).profiles?.full_name || 'Unknown';
  const authorImage = (idea as any).profiles?.profile_image;

  const sections = [
    { icon: Lightbulb, label: 'Problem Statement', value: idea.problem_statement },
    { icon: Cog, label: 'Proposed Solution', value: idea.proposed_solution },
    { icon: Target, label: 'Target Audience', value: idea.target_audience },
    { icon: DollarSign, label: 'Business Model', value: idea.business_model },
    { icon: TrendingUp, label: 'Expected Impact', value: idea.expected_impact },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="isometric-card overflow-hidden">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600">
          {idea.image_url && (
            <img src={idea.image_url} alt={idea.title} className="h-full w-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
              {idea.category}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Title + actions */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{idea.title}</h1>
              <p className="mt-2 text-slate-600">{idea.short_description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFav}
                disabled={toggling}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  saved
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => router.push(`/edit-idea/${idea.id}`)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-red-300 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your idea and remove all associated favourites.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              {authorImage ? (
                <img src={authorImage} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                  {authorName[0]?.toUpperCase()}
                </div>
              )}
              {authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(idea.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {favCount} {favCount === 1 ? 'save' : 'saves'}
            </span>
          </div>

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {idea.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Detailed Description */}
          {idea.detailed_description && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">About This Idea</h2>
              <p className="whitespace-pre-wrap text-slate-600">{idea.detailed_description}</p>
            </div>
          )}

          {/* Sections */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {sections.map((s) => {
              if (!s.value) return null;
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Icon className="h-4 w-4 text-sky-500" />
                    {s.label}
                  </div>
                  <p className="text-sm text-slate-600">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* Technologies */}
          {idea.technologies && idea.technologies.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Required Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {idea.technologies.map((tech) => (
                  <span key={tech} className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm text-sky-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
