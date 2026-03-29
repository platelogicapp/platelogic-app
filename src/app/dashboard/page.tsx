'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const dailyData = [
  { day: 'Mon', waste: 12, cost: 480 },
  { day: 'Tue', waste: 15, cost: 600 },
  { day: 'Wed', waste: 10, cost: 400 },
  { day: 'Thu', waste: 18, cost: 720 },
  { day: 'Fri', waste: 22, cost: 880 },
  { day: 'Sat', waste: 28, cost: 1120 },
  { day: 'Sun', waste: 14, cost: 560 },
];

const statCards = [
  {
    label: "Today's Waste",
    value: '14 items',
    subtext: '$560 estimated cost',
    icon: '🗑️',
    color: 'bg-red-50 border-red-200',
  },
  {
    label: 'Weekly Cost',
    value: '$5,360',
    subtext: '↑ 12% from last week',
    icon: '💰',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    label: 'Most Wasted',
    value: 'Salmon',
    subtext: '34 units this week',
    icon: '🐟',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    label: 'Waste Trend',
    value: '↑ 8%',
    subtext: 'vs 2 weeks ago',
    icon: '📈',
    color: 'bg-yellow-50 border-yellow-200',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-gray-600">Week of March 24 - March 30, 2024</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} border rounded-lg p-6 transition hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-3xl">{card.icon}</div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{card.label}</h3>
            <p className="text-2xl font-bold text-primary mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Daily Waste This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="waste" fill="#27AE60" name="Units Wasted" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Estimated Cost Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
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
                dataKey="cost"
                stroke="#27AE60"
                strokeWidth={2}
                dot={{ fill: '#27AE60', r: 4 }}
                name="Estimated Cost ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-primary to-blue-900 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left">
            📝 Log Today's Waste
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left">
            📊 View This Week's Report
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left">
            ⚙️ Configure Ingredients
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-3 px-6 font-semibold transition text-left">
            👥 Manage Team
          </button>
        </div>
      </div>

      {/* Sample Insights */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Latest Insights</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 border-l-4 border-accent">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-primary">Salmon waste is up 35% this week</h3>
                <p className="text-gray-600 text-sm mt-1">
                  You've wasted $560 worth of salmon. Check your prep portions or ordering quantities.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border-l-4 border-accent">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-primary">Friday had your highest waste day</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Total of $880 in waste. Consider adjusting your ordering for weekend prep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
