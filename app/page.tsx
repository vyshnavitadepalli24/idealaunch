'use client';

import Link from 'next/link';
import { Rocket, Lightbulb, Heart, TrendingUp, ArrowRight, Sparkles, Users, Compass, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative iso-hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-600">
                <Sparkles className="h-4 w-4" />
                Discover. Share. Launch.
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Where <span className="gradient-text">Startup Ideas</span> Take Flight
              </h1>
              <p className="mt-6 max-w-lg text-lg text-slate-600">
                IDEALAUNCH is a discovery platform where entrepreneurs share, explore, and save innovative startup ideas. Find your next venture or inspire others with yours.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/login" className="btn-outline">
                  Login
                </Link>
              </div>
              <div className="mt-10 flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">10+</div>
                  <div className="text-sm text-slate-500">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-500">Free to Join</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">∞</div>
                  <div className="text-sm text-slate-500">Ideas to Explore</div>
                </div>
              </div>
            </div>

            {/* Isometric illustration */}
            <div className="relative hidden h-[420px] lg:block">
              <div className="absolute left-10 top-10 h-48 w-48 animate-float rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-2xl shadow-sky-500/30" style={{ transform: 'rotate(-5deg)' }}>
                <div className="flex h-full items-center justify-center">
                  <Lightbulb className="h-20 w-20 text-white" />
                </div>
              </div>
              <div className="absolute right-0 top-24 h-40 w-40 animate-float-delayed rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-2xl shadow-emerald-500/30" style={{ transform: 'rotate(8deg)' }}>
                <div className="flex h-full items-center justify-center">
                  <Rocket className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-20 h-36 w-36 animate-float rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/30" style={{ transform: 'rotate(-12deg)', animationDelay: '1s' }}>
                <div className="flex h-full items-center justify-center">
                  <TrendingUp className="h-14 w-14 text-white" />
                </div>
              </div>
              <div className="absolute bottom-20 right-10 h-32 w-32 animate-float-delayed rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-2xl shadow-rose-500/30" style={{ transform: 'rotate(15deg)', animationDelay: '3s' }}>
                <div className="flex h-full items-center justify-center">
                  <Heart className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything You Need to Launch</h2>
          <p className="mt-3 text-slate-600">Powerful tools for discovering and sharing startup ideas</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Compass, title: 'Explore Ideas', desc: 'Browse through hundreds of startup ideas across 10+ categories with smart search and filtering.', color: 'from-sky-400 to-cyan-500' },
            { icon: Lightbulb, title: 'Share Your Ideas', desc: 'Post your startup concepts with detailed problem statements, solutions, and business models.', color: 'from-amber-400 to-orange-500' },
            { icon: Heart, title: 'Save Favorites', desc: 'Bookmark ideas that inspire you and build your personal collection of startup concepts.', color: 'from-rose-400 to-pink-500' },
            { icon: Users, title: 'Community Driven', desc: 'Connect with other entrepreneurs and discover ideas from creators around the world.', color: 'from-emerald-400 to-green-500' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your ideas are protected. Only you can edit or delete the ideas you create.', color: 'from-indigo-400 to-blue-500' },
            { icon: Zap, title: 'Fast & Modern', desc: 'A lightning-fast platform with a beautiful, intuitive interface designed for creators.', color: 'from-violet-400 to-purple-500' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="isometric-card p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-12 text-center shadow-2xl shadow-sky-500/20">
          <h2 className="text-3xl font-bold text-white">Ready to Launch Your Idea?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sky-50">
            Join IDEALAUNCH today and become part of a growing community of innovators and entrepreneurs.
          </p>
          <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-sky-600 shadow-lg transition-all hover:-translate-y-0.5">
            Create Your Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
