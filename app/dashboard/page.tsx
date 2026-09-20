'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase, Idea, CATEGORIES } from '@/lib/supabase/client';
import { Lightbulb, Heart, TrendingUp, Plus, Compass, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { IdeaCard } from '@/components/idea-card';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myIdeasCount, setMyIdeasCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [trendingIdeas, setTrendingIdeas] = useState<Idea[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [{ count: myCount }, { count: totalCount }, { data: myIdeas }] = await Promise.all([
          supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
          supabase.from('ideas').select('*', { count: 'exact', head: true }),
          supabase.from('ideas').select('id, title, short_description, category, created_at, image_url, tags').eq('author_id', user.id).order('created_at', { ascending: false }).limit(5),
        ]);
        setMyIdeasCount(myCount || 0);
        setTotalIdeas(totalCount || 0);

        const { count: favCount } = await supabase.from('favourites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        setSavedCount(favCount || 0);

        const { data: recent } = await supabase
          .from('ideas')
          .select('id, title, short_description, category, created_at, image_url, tags, author_id, profiles!inner(full_name)')
          .order('created_at', { ascending: false })
          .limit(4);
        setRecentIdeas((recent as unknown as Idea[]) || []);

        const { data: trending } = await supabase
          .from('ideas')
          .select('id, title, short_description, category, created_at, image_url, tags, author_id, profiles!inner(full_name), favourites(id)')
          .order('created_at', { ascending: false })
          .limit(20);
        const sorted = ((trending as unknown as Idea[]) || []).sort(
          (a, b) => (b.favourite_count || (b as any).favourites?.length || 0) - (a.favourite_count || (a as any).favourites?.length || 0)
        );
        setTrendingIdeas(sorted.slice(0, 4));

        const { data: allCats } = await supabase.from('ideas').select('category');
        if (allCats) {
          const counts: Record<string, number> = {};
          allCats.forEach((r: { category: string }) => {
            counts[r.category] = (counts[r.category] || 0) + 1;
          });
          const sortedCats = Object.entries(counts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          setCategoryCounts(sortedCats);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Ideas', value: totalIdeas, icon: Lightbulb, color: 'from-sky-400 to-cyan-500' },
    { label: 'My Ideas', value: myIdeasCount, icon: Sparkles, color: 'from-amber-400 to-orange-500' },
    { label: 'Saved Ideas', value: savedCount, icon: Heart, color: 'from-rose-400 to-pink-500' },
    { label: 'Categories', value: CATEGORIES.length, icon: TrendingUp, color: 'from-emerald-400 to-green-500' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back, {profile?.full_name || 'Explorer'}!
          </h1>
          <p className="mt-1 text-slate-600">Here's what's happening on IDEALAUNCH today.</p>
        </div>
        <Link href="/add-idea" className="btn-primary">
          <Plus className="h-5 w-5" />
          Add New Idea
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="isometric-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '–' : stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Categories */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Popular Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categoryCounts.length > 0 ? (
            categoryCounts.map((c) => (
              <Link
                key={c.category}
                href={`/explore?category=${encodeURIComponent(c.category)}`}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
              >
                {c.category}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600">
                  {c.count}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">No categories yet.</p>
          )}
        </div>
      </div>

      {/* Recently Added */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recently Added Ideas</h2>
          <Link href="/explore" className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        ) : recentIdeas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="isometric-card flex flex-col items-center justify-center p-12 text-center">
            <Compass className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-slate-500">No ideas yet. Be the first to share one!</p>
            <Link href="/add-idea" className="btn-primary mt-4">
              <Plus className="h-4 w-4" />
              Add the First Idea
            </Link>
          </div>
        )}
      </div>

      {/* Trending */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Trending Ideas</h2>
          <Link href="/explore?sort=saved" className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        ) : trendingIdeas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trendingIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No trending ideas yet.</p>
        )}
      </div>
    </div>
  );
}
