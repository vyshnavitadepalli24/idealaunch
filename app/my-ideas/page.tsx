'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Lightbulb, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase, Idea } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
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
import { IdeaCard } from '@/components/idea-card';

export default function MyIdeasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('id, title, short_description, category, created_at, image_url, tags, author_id, profiles!inner(full_name), favourites(id)')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setIdeas((data as unknown as Idea[]) || []);
      } catch {
        toast.error('Failed to load ideas');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDelete = async (ideaId: string) => {
    if (!user) return;
    const { error } = await supabase.from('ideas').delete().eq('id', ideaId).eq('author_id', user.id);
    if (error) {
      toast.error(error.message);
    } else {
      setIdeas(ideas.filter((i) => i.id !== ideaId));
      toast.success('Idea deleted');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Ideas</h1>
          <p className="mt-1 text-slate-600">Manage the ideas you've created</p>
        </div>
        <button onClick={() => router.push('/add-idea')} className="btn-primary">
          <Plus className="h-5 w-5" />
          Add New Idea
        </button>
      </div>

      {ideas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="isometric-card group flex flex-col overflow-hidden">
              <div className="relative h-28 bg-gradient-to-br from-amber-400 to-orange-500">
                {idea.image_url && (
                  <img src={idea.image_url} alt={idea.title} className="h-full w-full object-cover opacity-80" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
                  {idea.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 font-semibold text-slate-900">{idea.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{idea.short_description}</p>
                {idea.tags && idea.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={() => router.push(`/ideas/${idea.id}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/edit-idea/${idea.id}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-red-300 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{idea.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your idea and remove all associated favourites.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(idea.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="isometric-card flex flex-col items-center justify-center p-16 text-center">
          <Lightbulb className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700">No ideas yet</h3>
          <p className="mt-1 text-sm text-slate-500">Start sharing your startup ideas with the community!</p>
          <button onClick={() => router.push('/add-idea')} className="btn-primary mt-4">
            <Plus className="h-4 w-4" />
            Add Your First Idea
          </button>
        </div>
      )}
    </div>
  );
}
