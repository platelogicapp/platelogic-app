'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Check if user has a restaurant (returning user) or needs onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1);

          if (restaurants && restaurants.length > 0) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">PL</span>
            </div>
            <span className="text-white text-2xl font-bold">PlateLogic</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">Sign in to your restaurant account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-100">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white font-semibold hover:text-accent transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
