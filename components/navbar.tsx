'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Rocket, Menu, X, Plus, LogOut, User as UserIcon, LayoutDashboard, Compass, Lightbulb, Heart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const authedLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/explore', label: 'Explore Ideas', icon: Compass },
    { href: '/my-ideas', label: 'My Ideas', icon: Lightbulb },
    { href: '/saved', label: 'Saved Ideas', icon: Heart },
  ];

  const guestLinks = [
    { href: '/', label: 'Home', icon: Rocket },
    { href: '/about', label: 'About', icon: Info },
  ];

  const links = user ? authedLinks : guestLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/30">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">IDEA</span>
            <span className="text-slate-800">LAUNCH</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {user && (
            <Link href="/add-idea" className="btn-primary ml-2 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" />
              Add New Idea
            </Link>
          )}

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-50"
              >
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-semibold text-white">
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600">
                Login
              </Link>
              <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                    active ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <Link
                href="/add-idea"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add New Idea
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="btn-outline flex-1 px-4 py-2.5 text-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary flex-1 px-4 py-2.5 text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
