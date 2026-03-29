'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const ADMIN_EMAIL = 'mehtakrishna13@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Verifying admin access...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="text-white font-bold text-lg">PlateLogic</span>
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded ml-2">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
