'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  avg_daily_covers: number;
  owner_id: string;
  created_at: string;
  ingredientCount?: number;
  wasteLogCount?: number;
  totalWasteCost?: number;
}

interface TeamMember {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  invited_email: string | null;
  role: string;
  status: string;
  created_at: string;
  restaurantName?: string;
}

interface WasteLog {
  id: string;
  restaurant_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: string;
  created_at: string;
  restaurantName?: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'activity'>('overview');

  // Data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recentLogs, setRecentLogs] = useState<WasteLog[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWasteLogs, setTotalWasteLogs] = useState(0);
  const [totalWasteCost, setTotalWasteCost] = useState(0);

  useEffect(() => {
    const load = async () => {
      // Load all restaurants
      const { data: rests } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      const restaurantList = rests || [];

      // Build restaurant name lookup
      const restNameMap: Record<string, string> = {};
      restaurantList.forEach((r) => { restNameMap[r.id] = r.name; });

      // Load all team members
      const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      const memberList = (members || []).map((m: any) => ({
        ...m,
        restaurantName: restNameMap[m.restaurant_id] || 'Unknown',
      }));

      // Load all waste logs (count + cost)
      const { data: allLogs } = await supabase
        .from('waste_logs')
        .select('id, restaurant_id, cost');

      const logCount = allLogs?.length || 0;
      const logCost = allLogs?.reduce((s: number, l: any) => s + Number(l.cost), 0) || 0;

      // Per-restaurant stats
      const ingredientCounts: Record<string, number> = {};
      const wasteLogCounts: Record<string, number> = {};
      const wasteCostTotals: Record<string, number> = {};

      allLogs?.forEach((l: any) => {
        wasteLogCounts[l.restaurant_id] = (wasteLogCounts[l.restaurant_id] || 0) + 1;
        wasteCostTotals[l.restaurant_id] = (wasteCostTotals[l.restaurant_id] || 0) + Number(l.cost);
      });

      const { data: allIngredients } = await supabase
        .from('ingredients')
        .select('id, restaurant_id')
        .eq('is_active', true);

      allIngredients?.forEach((i: any) => {
        ingredientCounts[i.restaurant_id] = (ingredientCounts[i.restaurant_id] || 0) + 1;
      });

      const enrichedRestaurants = restaurantList.map((r) => ({
        ...r,
        ingredientCount: ingredientCounts[r.id] || 0,
        wasteLogCount: wasteLogCounts[r.id] || 0,
        totalWasteCost: wasteCostTotals[r.id] || 0,
      }));

      // Recent waste logs (last 20)
      const { data: recent } = await supabase
        .from('waste_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const recentWithNames = (recent || []).map((l: any) => ({
        ...l,
        restaurantName: restNameMap[l.restaurant_id] || 'Unknown',
      }));

      setRestaurants(enrichedRestaurants);
      setTeamMembers(memberList);
      setRecentLogs(recentWithNames);
      setTotalUsers(memberList.length);
      setTotalWasteLogs(logCount);
      setTotalWasteCost(logCost);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400 text-lg">Loading admin data...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'restaurants', label: `Restaurants (${restaurants.length})` },
    { id: 'users', label: `Users (${teamMembers.length})` },
    { id: 'activity', label: 'Recent Activity' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform-wide overview of PlateLogic</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Restaurants</h3>
          <p className="text-3xl font-bold text-white">{restaurants.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Waste Logs</h3>
          <p className="text-3xl font-bold text-white">{totalWasteLogs.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Waste Cost</h3>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(totalWasteCost)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Platform Summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Avg Waste/Restaurant</p>
                <p className="text-white font-bold text-lg">
                  {restaurants.length > 0 ? formatCurrency(totalWasteCost / restaurants.length) : '$0'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Avg Logs/Restaurant</p>
                <p className="text-white font-bold text-lg">
                  {restaurants.length > 0 ? Math.round(totalWasteLogs / restaurants.length) : 0}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Active Users</p>
                <p className="text-white font-bold text-lg">
                  {teamMembers.filter((m) => m.status === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Pending Invites</p>
                <p className="text-white font-bold text-lg">
                  {teamMembers.filter((m) => m.status === 'invited').length}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Restaurant List */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Restaurants by Waste Cost</h2>
            <div className="space-y-3">
              {restaurants
                .sort((a, b) => (b.totalWasteCost || 0) - (a.totalWasteCost || 0))
                .slice(0, 5)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="text-white font-semibold">{r.name}</p>
                      <p className="text-gray-400 text-sm">{r.cuisine_type} &middot; {r.wasteLogCount} logs</p>
                    </div>
                    <p className="text-red-400 font-bold">{formatCurrency(r.totalWasteCost || 0)}</p>
                  </div>
                ))}
              {restaurants.length === 0 && (
                <p className="text-gray-500 text-center py-4">No restaurants yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-750">
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Name</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Cuisine</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Address</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-sm font-semibold">Ingredients</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-sm font-semibold">Waste Logs</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-sm font-semibold">Total Cost</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-gray-300">{r.cuisine_type}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{r.address || '-'}</td>
                    <td className="px-4 py-3 text-gray-300 text-right">{r.ingredientCount}</td>
                    <td className="px-4 py-3 text-gray-300 text-right">{r.wasteLogCount}</td>
                    <td className="px-4 py-3 text-red-400 text-right font-semibold">{formatCurrency(r.totalWasteCost || 0)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(new Date(r.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {restaurants.length === 0 && (
            <p className="text-gray-500 text-center py-8">No restaurants yet</p>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Email</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Restaurant</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((m) => (
                  <tr key={m.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3 text-white">{m.invited_email || m.user_id?.slice(0, 8) || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        m.role === 'owner' ? 'bg-red-900 text-red-300' :
                        m.role === 'manager' ? 'bg-blue-900 text-blue-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{m.restaurantName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        m.status === 'active' ? 'bg-green-900 text-green-300' :
                        m.status === 'invited' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(new Date(m.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teamMembers.length === 0 && (
            <p className="text-gray-500 text-center py-8">No users yet</p>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-bold">Last 20 Waste Log Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Restaurant</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Ingredient</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-sm font-semibold">Qty</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-sm font-semibold">Cost</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Reason</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((l) => (
                  <tr key={l.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.restaurantName}</td>
                    <td className="px-4 py-3 text-white font-medium">{l.ingredient_name}</td>
                    <td className="px-4 py-3 text-gray-300 text-right">{l.quantity} {l.unit}</td>
                    <td className="px-4 py-3 text-red-400 text-right font-semibold">{formatCurrency(l.cost)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{l.reason}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(new Date(l.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentLogs.length === 0 && (
            <p className="text-gray-500 text-center py-8">No waste logs yet</p>
          )}
        </div>
      )}
    </div>
  );
}
