'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const weeklyData = [
  { week: 'Week 1', waste: 85, cost: 3400, savings: 1200 },
  { week: 'Week 2', waste: 92, cost: 3680, savings: 1400 },
  { week: 'Week 3', waste: 78, cost: 3120, savings: 1500 },
  { week: 'Week 4', waste: 105, cost: 4200, savings: 1100 },
];

const categoryData = [
  { name: 'Protein', value: 2400, percentage: 45 },
  { name: 'Produce', value: 1200, percentage: 23 },
  { name: 'Dairy', value: 800, percentage: 15 },
  { name: 'Grain', value: 600, percentage: 11 },
  { name: 'Other', value: 200, percentage: 6 },
];

const COLORS = ['#E63946', '#27AE60', '#3B82F6', '#F59E0B', '#8B5CF6'];

const topWastedItems = [
  { name: 'Salmon', units: 34, cost: 544, trend: '↑ 35%' },
  { name: 'Heavy Cream', units: 28, cost: 98, trend: '↑ 12%' },
  { name: 'Mixed Greens', units: 26, cost: 65, trend: '↓ 8%' },
  { name: 'Chicken Breast', units: 22, cost: 187, trend: '↑ 5%' },
  { name: 'Shrimp', units: 18, cost: 252, trend: '↓ 3%' },
];

const insights = [
  {
    title: 'Salmon waste is up 35% this week',
    description: 'You\'ve wasted $560 worth of salmon. Check your prep portions or ordering quantities.',
    icon: '🐟',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    title: 'Friday had your highest waste day',
    description: 'Total of $880 in waste. Consider adjusting your ordering for weekend prep.',
    icon: '📈',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    title: 'Potential monthly savings: $1,200',
    description: 'If you reduce waste by 20%, you could save $1,200 per month. Here\'s how other restaurants do it.',
    icon: '💰',
    color: 'bg-green-50 border-green-200',
  },
  {
    title: 'Your waste ratio is 8%',
    description: 'Industry average for restaurants is 8-10%. You\'re right on track. Aim for 5-6% next month.',
    icon: '🎯',
    color: 'bg-purple-50 border-purple-200',
  },
];

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Reports & Insights</h1>
        <p className="text-gray-600">Weekly breakdown of your food waste metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-accent">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">This Month's Waste</h3>
          <p className="text-3xl font-bold text-primary">360 items</p>
          <p className="text-xs text-gray-500 mt-2">↑ 5% vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Est. Cost</h3>
          <p className="text-3xl font-bold text-primary">$14,400</p>
          <p className="text-xs text-gray-500 mt-2">Average daily: $480</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Projected Savings</h3>
          <p className="text-3xl font-bold text-accent">$5,200</p>
          <p className="text-xs text-gray-500 mt-2">With 40% waste reduction</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Waste Ratio</h3>
          <p className="text-3xl font-bold text-primary">8%</p>
          <p className="text-xs text-gray-500 mt-2">of total food costs</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="waste"
                stroke="#E63946"
                strokeWidth={2}
                dot={{ fill: '#E63946', r: 4 }}
                name="Units Wasted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Waste by Category (This Month)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Wasted Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-primary mb-4">Top Wasted Items This Week</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-primary">Item</th>
                <th className="text-right px-4 py-3 font-semibold text-primary">Units</th>
                <th className="text-right px-4 py-3 font-semibold text-primary">Est. Cost</th>
                <th className="text-right px-4 py-3 font-semibold text-primary">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topWastedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary">{item.name}</td>
                  <td className="text-right px-4 py-3 text-gray-600">{item.units}</td>
                  <td className="text-right px-4 py-3 font-semibold text-primary">${item.cost}</td>
                  <td className="text-right px-4 py-3">
                    <span className={item.trend.startsWith('↑') ? 'text-red-600' : 'text-green-600'}>
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Cards */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Weekly Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${insight.color} border rounded-lg p-6 transition hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{insight.icon}</span>
                <div>
                  <h3 className="font-bold text-primary mb-2">{insight.title}</h3>
                  <p className="text-gray-600 text-sm">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Section */}
      <div className="mt-8 bg-gradient-to-r from-primary to-blue-900 rounded-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-3">Export Your Data</h3>
        <p className="text-blue-100 mb-4">Generate detailed reports for your records or team meetings.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition">
            📊 Export as PDF
          </button>
          <button className="px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition">
            📋 Export as CSV
          </button>
          <button className="px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition">
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
}
