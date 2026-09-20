'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Heart, X } from 'lucide-react';
import { supabase, Idea } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { IdeaCard } from '@/components/idea-card';
import { toggleFavourite } from '@/lib/api';

export default function SavedIdeasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: favs } = await supabase
          .from('favourites')
          .select('idea_id')
          .eq('user_id', user.id);
        if (!favs || favs.length === 0) {
          setLoading(false);
          return;
        }
        const ideaIds = favs.map((f) => f.idea_id);
        const { data: ideaData, error } = await supabase
          .from('ideas')
          .select('id, title, short_description, category, created_at, image_url, tags, author_id, profiles!inner(full_name), favourites(id)')
          .in('id', ideaIds)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setIdeas((ideaData as unknown as Idea[]) || []);
      } catch {
        toast.error('Failed to load saved ideas');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleRemove = async (ideaId: string) => {
    const result = await toggleFavourite(ideaId, true);
    if (result.ok) {
      setIdeas(ideas.filter((i) => i.id !== ideaId));
      toast.success('Removed from saved');
    } else {
      toast.error('Failed to remove');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Saved Ideas</h1>
        <p className="mt-1 text-slate-600">Ideas you've bookmarked for later</p>
      </div>

      {ideas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="relative">
              <IdeaCard idea={idea} />
              <button
                onClick={() => handleRemove(idea.id)}
                className="absolute right-3 top-[7.5rem] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:scale-110 hover:bg-red-50"
                title="Remove from saved"
              >
                <X className="h-4 w-4 text-rose-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="isometric-card flex flex-col items-center justify-center p-16 text-center">
          <Heart className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700">No saved ideas yet</h3>
          <p className="mt-1 text-sm text-slate-500">Browse ideas and save the ones that inspire you!</p>
          <button onClick={() => router.push('/explore')} className="btn-primary mt-4">
            Explore Ideas
          </button>
        </div>
      )}
    </div>
  );
}
