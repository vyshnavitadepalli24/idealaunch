'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { Idea } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toggleFavourite } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  'AI & Machine Learning': 'from-violet-400 to-purple-500',
  'Web Development': 'from-sky-400 to-blue-500',
  'FinTech': 'from-emerald-400 to-green-500',
  'HealthTech': 'from-rose-400 to-pink-500',
  'EdTech': 'from-amber-400 to-orange-500',
  'Agriculture': 'from-lime-400 to-green-500',
  'Environment': 'from-teal-400 to-cyan-500',
  'Cybersecurity': 'from-red-400 to-rose-500',
  'E-Commerce': 'from-indigo-400 to-blue-500',
  'Social Impact': 'from-orange-400 to-amber-500',
  'Other': 'from-slate-400 to-slate-500',
};

export function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [favCount, setFavCount] = useState(idea.favourite_count || 0);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    const result = await toggleFavourite(idea.id, saved);
    if (result.ok) {
      setSaved(!saved);
      setFavCount((c) => c + (saved ? -1 : 1));
    } else {
      toast.error(result.error || 'Failed to update');
    }
  };

  const colorClass = CATEGORY_COLORS[idea.category] || CATEGORY_COLORS['Other'];
  const authorName = (idea as any).author?.full_name || (idea as any).profiles?.full_name || 'Unknown';

  return (
    <Link href={`/ideas/${idea.id}`} className="isometric-card group flex flex-col overflow-hidden">
      {/* Image / gradient header */}
      <div className={`relative h-28 bg-gradient-to-br ${colorClass}`}>
        {idea.image_url && (
          <img src={idea.image_url} alt={idea.title} className="h-full w-full object-cover opacity-80" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
          {idea.category}
        </span>
        <button
          onClick={handleFav}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:scale-110"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-sky-600">{idea.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{idea.short_description}</p>

        {idea.tags && idea.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {idea.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">by {authorName}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Heart className="h-3 w-3" />
            {favCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
