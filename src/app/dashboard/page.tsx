'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const PIE_COLORS = ['#E63946', '#27AE60', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');

  // Stats
  const [weeklyWasteCount, setWeeklyWasteCount] = useState(0);
  const [weeklyWasteCost, setWeeklyWasteCost] = useState(0);
  const [mostWasted, setMostWasted] = useState({ name: '-', count: 0 });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get restaurant
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', user.id)
        .limit(1);

      let restId = restaurants?.[0]?.id;
      let restName = restaurants?.[0]?.name || '';

      if (!restId) {
        const { data: team } = await supabase
          .from('team_members')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1);
        if (team?.[0]) {
          restId = team[0].restaurant_id;
          const { data: r } = await supabase.from('restaurants').select('name').eq('id', restId).single();
          restName = r?.name || '';
        }
      }

      if (!restId) { setLoading(false); return; }
      setRestaurantId(restId);
      setRestaurantName(restName);

      // Get this week's waste logs
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('restaurant_id', restId)
        .gte('created_at', startOfWeek.toISOString())
        .order('created_at');

      if (logs && logs.length > 0) {
        // Weekly totals
        const totalCount = logs.reduce((s: number, l: any) => s + Number(l.quantity), 0);
        const totalCost = logs.reduce((s: number, l: any) => s + Number(l.cost), 0);
        setWeeklyWasteCount(totalCount);
        setWeeklyWasteCost(totalCost);

        // Most wasted ingredient
        const ingredientCounts: Record<string, { name: string; count: number }> = {};
        logs.forEach((l: any) => {
          if (!ingredientCounts[l.ingredient_name]) {
            ingredientCounts[l.ingredient_name] = { name: l.ingredient_name, count: 0 };
          }
          ingredientCounts[l.ingredient_name].count += Number(l.quantity);
        });
        const sorted = Object.values(ingredientCounts).sort((a, b) => b.count - a.count);
        if (sorted[0]) setMostWasted(sorted[0]);
        setTopItems(sorted.slice(0, 5));

        // Daily breakdown
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyMap: Record<string, { day: string; waste: number; cost: number }> = {};
        days.forEach((d) => (dailyMap[d] = { day: d, waste: 0, cost: 0 }));
        logs.forEach((l: any) => {
          const d = days[new Date(l.created_at).getDay()];
          dailyMap[d].waste += Number(l.quantity);
          dailyMap[d].cost += Number(l.cost);
        });
        setDailyData(Object.values(dailyMap));

        // Category breakdown
        const catMap: Record<string, number> = {};
        logs.forEach((l: any) => {
          // Use reason as a rough category proxy, or we can use ingredient lookup
          const cat = l.reason || 'Other';
          catMap[cat] = (catMap[cat] || 0) + Number(l.cost);
        });

        // Actually, let's group by ingredient name's category from ingredients table
        const { data: ingredients } = await supabase
          .from('ingredients')
          .select('name, category')
          .eq('restaurant_id', restId);

        const ingCatMap: Record<string, string> = {};
        ingredients?.forEach((i: any) => { ingCatMap[i.name] = i.category; });

        const catCostMap: Record<string, number> = {};
        logs.forEach((l: any) => {
          const cat = ingCatMap[l.ingredient_name] || 'Other';
          catCostMap[cat] = (catCostMap[cat] || 0) + Number(l.cost);
        });

        setCategoryData(
          Object.entries(catCostMap).map(([name, value]) => ({ name, value: Math.round(value as number) }))
        );
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-primary mb-2">No Restaurant Found</h2>
          <p className="text-gray-600 mb-4">Complete onboarding to get started.</p>
          <Link href="/onboarding" className="px-6 py-3 bg-accent text-white font-semibold rounded-lg">
            Set Up Restaurant
          </Link>
        </div>
      </div>
    );
  }

  const hasData = weeklyWasteCount > 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-gray-600">{restaurantName} &mdash; This Week</p>
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-primary mb-2">No waste logged yet this week</h2>
          <p className="text-gray-600 mb-6">Start logging waste to see your analytics here.</p>
          <Link
            href="/waste-input"
            className="px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition"
          >
            Log Your First Waste
          </Link>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-3xl mb-2">🗑️</div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Weekly Waste</h3>
              <p className="text-2xl font-bold text-primary">{weeklyWasteCount.toFixed(1)} units</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Weekly Cost</h3>
              <p className="text-2xl font-bold text-primary">${weeklyWasteCost.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-3xl mb-2">🐟</div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Most Wasted</h3>
              <p className="text-2xl font-bold text-primary">{mostWasted.name}</p>
              <p className="text-xs text-gray-500">{mostWasted.count.toFixed(1)} units</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Potential Savings</h3>
              <p className="text-2xl font-bold text-accent">${(weeklyWasteCost * 0.4).toFixed(2)}</p>
              <p className="text-xs text-gray-500">40% waste reduction</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Daily Waste This Week</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="waste" fill="#27AE60" name="Units Wasted" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Cost by Category</h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} $${value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No category data yet</p>
              )}
            </div>
          </div>

          {/* Top Wasted Items */}
          {topItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-bold text-primary mb-4">Top Wasted Items</h2>
              <div className="space-y-3">
                {topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-semibold text-primary">{item.name}</span>
                    </div>
                    <span className="text-gray-600">{item.count.toFixed(1)} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary to-blue-900 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/waste-input" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left block">
            📝 Log Waste
          </Link>
          <Link href="/reports" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left block">
            📊 View Reports
          </Link>
          <Link href="/settings" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left block">
            ⚙️ Manage Ingredients
          </Link>
          <Link href="/settings" className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left block">
            👥 Manage Team
          </Link>
        </div>
      </div>
    </div>
  );
}
