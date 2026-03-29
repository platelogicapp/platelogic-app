'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState('My Restaurant');
  const [address, setAddress] = useState('123 Food Street, NYC');
  const [cuisineType, setCuisineType] = useState('American');
  const [avgCovers, setAvgCovers] = useState('150');
  const [activeTab, setActiveTab] = useState<'profile' | 'ingredients' | 'team'>('profile');

  const tabs = [
    { id: 'profile', label: '🏢 Restaurant Profile' },
    { id: 'ingredients', label: '🥘 Ingredient Management' },
    { id: 'team', label: '👥 Team Members' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and restaurant information</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-4 font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-600 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Restaurant Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  >
                    <option>American</option>
                    <option>Italian</option>
                    <option>French</option>
                    <option>Asian</option>
                    <option>Mexican</option>
                    <option>Mediterranean</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Average Daily Covers
                  </label>
                  <input
                    type="number"
                    value={avgCovers}
                    onChange={(e) => setAvgCovers(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition">
                Save Changes
              </button>
            </div>
          )}

          {/* Ingredient Management Tab */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Manage the ingredients available for waste logging. Add, edit, or remove items from your library.
                </p>
              </div>

              <button className="w-full px-4 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition">
                + Add New Ingredient
              </button>

              <div className="space-y-3">
                {[
                  { name: 'Salmon', cost: '$16.00' },
                  { name: 'Chicken Breast', cost: '$8.50' },
                  { name: 'Heavy Cream', cost: '$3.50' },
                  { name: 'Mixed Greens', cost: '$2.50' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-primary">{item.name}</h4>
                      <p className="text-sm text-gray-600">Cost per unit: {item.cost}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 text-accent font-medium hover:bg-blue-50 rounded">Edit</button>
                      <button className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition">
                Save Changes
              </button>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Invite team members to log waste and view reports. Your plan includes up to 3 team members.
                </p>
              </div>

              <button className="w-full px-4 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition">
                + Invite Team Member
              </button>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-primary">Your Account</h4>
                    <p className="text-sm text-gray-600">you@restaurant.com • Owner</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-primary">Chef Manager</h4>
                    <p className="text-sm text-gray-600">chef@restaurant.com • Can log & view reports</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-accent font-medium hover:bg-blue-50 rounded">Edit</button>
                    <button className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded">Remove</button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">
                  You have 1 team member slot available. Upgrade your plan to add more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
        <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
        <p className="text-red-700 mb-6">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition">
            Download My Data
          </button>
          <button className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
