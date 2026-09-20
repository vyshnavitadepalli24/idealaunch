'use client';

import Link from 'next/link';
import { Rocket, Target, Compass, Heart, Shield, Zap, Users, Lightbulb, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/30">
          <Rocket className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About <span className="gradient-text">IDEALAUNCH</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          IDEALAUNCH is a startup ideas discovery platform where entrepreneurs, innovators, and creators come together to share, explore, and save groundbreaking startup concepts.
        </p>
      </div>

      {/* Mission */}
      <div className="isometric-card mb-8 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-2 text-slate-600">
              We believe every great startup begins with a single idea. IDEALAUNCH exists to give those ideas a home — a place where they can be shared, refined, and discovered by like-minded individuals. Whether you're a seasoned entrepreneur or a first-time founder, our platform makes it easy to document your vision and find inspiration in the ideas of others.
            </p>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">What You Can Do</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Compass, title: 'Explore Ideas', desc: 'Browse hundreds of startup ideas across 10+ categories with powerful search and filtering tools.' },
            { icon: Lightbulb, title: 'Share Your Vision', desc: 'Document your startup ideas with structured fields: problem, solution, target audience, and more.' },
            { icon: Heart, title: 'Save Favorites', desc: 'Build a personal collection of ideas that inspire you and revisit them anytime.' },
            { icon: Users, title: 'Connect with Creators', desc: 'See who is behind each idea and discover what the community is building.' },
            { icon: Shield, title: 'Own Your Content', desc: 'Your ideas stay yours. Only you can edit or delete what you create.' },
            { icon: Zap, title: 'Fast & Beautiful', desc: 'A modern, responsive platform designed for a seamless experience on any device.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="isometric-card p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                  <Icon className="h-5 w-5 text-sky-600" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', title: 'Create an Account', desc: 'Sign up for free and set up your profile with your skills and interests.' },
            { step: '2', title: 'Share or Explore', desc: 'Post your own startup ideas or browse what others have shared across categories.' },
            { step: '3', title: 'Save & Connect', desc: 'Bookmark ideas you love and track your contributions from your dashboard.' },
          ].map((s) => (
            <div key={s.step} className="isometric-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xl font-bold text-white shadow-lg">
                {s.step}
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-10 text-center shadow-2xl shadow-sky-500/20">
        <h2 className="text-2xl font-bold text-white">Ready to Join?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sky-50">
          Start your journey today. Create an account and become part of a growing community of innovators.
        </p>
        <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-sky-600 shadow-lg transition-all hover:-translate-y-0.5">
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
