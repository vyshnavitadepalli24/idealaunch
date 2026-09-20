'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Loader2, Plus, SlidersHorizontal, X } from 'lucide-react';
import { supabase, Idea, CATEGORIES } from '@/lib/supabase/client';
import { IdeaCard } from '@/components/idea-card';
import { useAuth } from '@/lib/auth-context';

type SortOption = 'newest' | 'popular' | 'saved';

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const fetchIdeas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('ideas')
        .select('id, title, short_description, category, created_at, image_url, tags, author_id, profiles!inner(full_name), favourites(id)');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'popular') {
        query = query.order('created_at', { ascending: false }).limit(50);
      } else if (sort === 'saved') {
        query = query.order('created_at', { ascending: false }).limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data as unknown as Idea[]) || [];

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        results = results.filter(
          (idea) =>
            idea.title.toLowerCase().includes(q) ||
            idea.short_description.toLowerCase().includes(q) ||
            idea.category.toLowerCase().includes(q) ||
            (idea.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }

      // Sort by popularity/saved
      if (sort === 'popular' || sort === 'saved') {
        results = results.sort(
          (a, b) => ((b as any).favourites?.length || 0) - ((a as any).favourites?.length || 0)
        );
      }

      setIdeas(results);
    } finally {
      setLoading(false);
    }
  }, [user, category, sort, search]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Explore Ideas</h1>
          <p className="mt-1 text-slate-600">Discover startup ideas from the community</p>
        </div>
        <button
          onClick={() => router.push('/add-idea')}
          className="btn-primary"
        >
          <Plus className="h-5 w-5" />
          Add New Idea
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, category, or tags..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-sky-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="isometric-card animate-fade-in p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="saved">Most Saved</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : ideas.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-slate-500">{ideas.length} idea{ideas.length !== 1 ? 's' : ''} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </>
      ) : (
        <div className="isometric-card flex flex-col items-center justify-center p-16 text-center">
          <Filter className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700">No ideas found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {search ? 'Try different search terms or filters.' : 'Be the first to add an idea!'}
          </p>
          <button onClick={() => router.push('/add-idea')} className="btn-primary mt-4">
            <Plus className="h-4 w-4" />
            Add New Idea
          </button>
        </div>
      )}
    </div>
  );
}
