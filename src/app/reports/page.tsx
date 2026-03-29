'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';

const COLORS = ['#E63946', '#27AE60', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | '3months'>('month');

  const [totalWaste, setTotalWaste] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [wasteByReason, setWasteByReason] = useState<any[]>([]);

  useEffect(() => {
    const getRestaurant = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (restaurants?.[0]) {
        setRestaurantId(restaurants[0].id);
      } else {
        const { data: team } = await supabase
          .from('team_members')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1);
        if (team?.[0]) setRestaurantId(team[0].restaurant_id);
      }
      setLoading(false);
    };
    getRestaurant();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    const loadReports = async () => {
      setLoading(true);
      const now = new Date();
      const start = new Date(now);
      if (dateRange === 'week') start.setDate(now.getDate() - 7);
      else if (dateRange === 'month') start.setDate(now.getDate() - 30);
      else start.setDate(now.getDate() - 90);
      start.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', start.toISOString())
        .order('created_at');

      if (!logs || logs.length === 0) {
        setTotalWaste(0);
        setTotalCost(0);
        setCategoryData([]);
        setTrendData([]);
        setTopItems([]);
        setWasteByReason([]);
        setLoading(false);
        return;
      }

      // Totals
      setTotalWaste(logs.reduce((s: number, l: any) => s + Number(l.quantity), 0));
      setTotalCost(logs.reduce((s: number, l: any) => s + Number(l.cost), 0));

      // Get ingredient categories
      const { data: ingredients } = await supabase
        .from('ingredients')
        .select('name, category')
        .eq('restaurant_id', restaurantId);
      const ingCatMap: Record<string, string> = {};
      ingredients?.forEach((i: any) => { ingCatMap[i.name] = i.category; });

      // Category breakdown
      const catMap: Record<string, number> = {};
      logs.forEach((l: any) => {
        const cat = ingCatMap[l.ingredient_name] || 'Other';
        catMap[cat] = (catMap[cat] || 0) + Number(l.cost);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: Math.round((value / logs.reduce((s: number, l: any) => s + Number(l.cost), 0)) * 100),
      })));

      // Trend data (group by date)
      const dateMap: Record<string, { date: string; waste: number; cost: number }> = {};
      logs.forEach((l: any) => {
        const d = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[d]) dateMap[d] = { date: d, waste: 0, cost: 0 };
        dateMap[d].waste += Number(l.quantity);
        dateMap[d].cost += Number(l.cost);
      });
      setTrendData(Object.values(dateMap));

      // Top wasted items
      const itemMap: Record<string, { name: string; units: number; cost: number }> = {};
      logs.forEach((l: any) => {
        if (!itemMap[l.ingredient_name]) itemMap[l.ingredient_name] = { name: l.ingredient_name, units: 0, cost: 0 };
        itemMap[l.ingredient_name].units += Number(l.quantity);
        itemMap[l.ingredient_name].cost += Number(l.cost);
      });
      setTopItems(Object.values(itemMap).sort((a, b) => b.cost - a.cost).slice(0, 5));

      // Waste by reason
      const reasonMap: Record<string, number> = {};
      logs.forEach((l: any) => {
        const r = l.reason || 'Unknown';
        reasonMap[r] = (reasonMap[r] || 0) + Number(l.quantity);
      });
      setWasteByReason(Object.entries(reasonMap).map(([name, value]) => ({ name, value: Math.round(value) })));

      setLoading(false);
    };
    loadReports();
  }, [restaurantId, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Reports & Insights</h1>
          <p className="text-gray-600">Analyze your food waste patterns</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', '3months'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateRange === range
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {totalWaste === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-primary mb-2">No data for this period</h2>
          <p className="text-gray-600">Start logging waste to see reports here.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-accent">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Waste</h3>
              <p className="text-3xl font-bold text-primary">{totalWaste.toFixed(1)} units</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Cost</h3>
              <p className="text-3xl font-bold text-primary">${totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Potential Savings</h3>
              <p className="text-3xl font-bold text-accent">${(totalCost * 0.4).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">With 40% waste reduction</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Daily Average</h3>
              <p className="text-3xl font-bold text-primary">
                ${(totalCost / (dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90)).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per day</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Waste Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#E63946" strokeWidth={2} dot={{ fill: '#E63946', r: 3 }} name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-primary mb-4">Waste by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Waste by Reason */}
          {wasteByReason.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-bold text-primary mb-4">Waste by Reason</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wasteByReason} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#27AE60" name="Units" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Wasted Items */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-bold text-primary mb-4">Top Wasted Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-primary">Item</th>
                    <th className="text-right px-4 py-3 font-semibold text-primary">Units</th>
                    <th className="text-right px-4 py-3 font-semibold text-primary">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-primary">{item.name}</td>
                      <td className="text-right px-4 py-3 text-gray-600">{item.units.toFixed(1)}</td>
                      <td className="text-right px-4 py-3 font-semibold text-primary">${item.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
