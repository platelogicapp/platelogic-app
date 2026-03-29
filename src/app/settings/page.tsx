'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  user_id: string | null;
  invited_email: string | null;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'ingredients' | 'team'>('profile');
  const [saveMessage, setSaveMessage] = useState('');

  // Profile state
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('American');
  const [avgCovers, setAvgCovers] = useState('100');
  const [saving, setSaving] = useState(false);

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState('Other');
  const [newIngCost, setNewIngCost] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('lbs');

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (restaurants?.[0]) {
        const r = restaurants[0];
        setRestaurantId(r.id);
        setRestaurantName(r.name || '');
        setAddress(r.address || '');
        setCuisineType(r.cuisine_type || 'American');
        setAvgCovers(String(r.avg_daily_covers || 100));

        // Load ingredients
        const { data: ings } = await supabase
          .from('ingredients')
          .select('*')
          .eq('restaurant_id', r.id)
          .eq('is_active', true)
          .order('category')
          .order('name');
        if (ings) setIngredients(ings);

        // Load team members
        const { data: team } = await supabase
          .from('team_members')
          .select('*')
          .eq('restaurant_id', r.id)
          .order('role');
        if (team) setTeamMembers(team);
      }
      setLoading(false);
    };
    load();
  }, []);

  const showSaved = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleSaveProfile = async () => {
    if (!restaurantId) return;
    setSaving(true);
    const { error } = await supabase
      .from('restaurants')
      .update({
        name: restaurantName,
        address,
        cuisine_type: cuisineType,
        avg_daily_covers: parseInt(avgCovers) || 100,
      })
      .eq('id', restaurantId);

    if (!error) showSaved('Profile saved!');
    setSaving(false);
  };

  const handleAddIngredient = async () => {
    if (!restaurantId || !newIngName) return;
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        restaurant_id: restaurantId,
        name: newIngName,
        category: newIngCategory,
        unit: newIngUnit,
        cost_per_unit: parseFloat(newIngCost) || 0,
        is_active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setIngredients((prev) => [...prev, data]);
      setNewIngName('');
      setNewIngCost('');
      setShowAddIngredient(false);
      showSaved('Ingredient added!');
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    // Soft delete
    await supabase.from('ingredients').update({ is_active: false }).eq('id', id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    showSaved('Ingredient removed');
  };

  const handleInviteTeamMember = async () => {
    if (!restaurantId || !inviteEmail) return;
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        restaurant_id: restaurantId,
        invited_email: inviteEmail,
        role: inviteRole,
        status: 'invited',
      })
      .select()
      .single();

    if (!error && data) {
      setTeamMembers((prev) => [...prev, data]);
      setInviteEmail('');
      showSaved('Invitation saved!');
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    await supabase.from('team_members').update({ status: 'deactivated' }).eq('id', id);
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    showSaved('Member removed');
  };

  const tabs = [
    { id: 'profile', label: 'Restaurant Profile' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'team', label: 'Team Members' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Success Toast */}
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-6 py-3 rounded-lg shadow-xl slide-in font-semibold">
          {saveMessage}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-600">Manage your restaurant, ingredients, and team</p>
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

        <div className="p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Cuisine Type</label>
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
                  <label className="block text-sm font-semibold text-primary mb-2">Average Daily Covers</label>
                  <input
                    type="number"
                    value={avgCovers}
                    onChange={(e) => setAvgCovers(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Manage the ingredients available for waste logging. These appear on the Log Waste page.
                </p>
              </div>

              <button
                onClick={() => setShowAddIngredient(!showAddIngredient)}
                className="w-full px-4 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition"
              >
                + Add New Ingredient
              </button>

              {showAddIngredient && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={newIngName}
                    onChange={(e) => setNewIngName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={newIngCategory}
                      onChange={(e) => setNewIngCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option>Protein</option>
                      <option>Produce</option>
                      <option>Dairy</option>
                      <option>Grain</option>
                      <option>Other</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Cost per unit"
                      value={newIngCost}
                      onChange={(e) => setNewIngCost(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                    <select
                      value={newIngUnit}
                      onChange={(e) => setNewIngUnit(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="lbs">lbs</option>
                      <option value="oz">oz</option>
                      <option value="each">each</option>
                      <option value="gal">gal</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddIngredient}
                    disabled={!newIngName}
                    className="w-full px-4 py-2 bg-accent text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    Add Ingredient
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {ingredients.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-primary">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.category} &middot; ${item.cost_per_unit.toFixed(2)} per {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteIngredient(item.id)}
                      className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No ingredients yet. Add some above.</p>
                )}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Invite team members to log waste and view reports.
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="team@restaurant.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
                <button
                  onClick={handleInviteTeamMember}
                  disabled={!inviteEmail}
                  className="px-6 py-2 bg-accent text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  Invite
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-primary capitalize">{member.role}</h4>
                      <p className="text-sm text-gray-600">
                        {member.invited_email || 'You'} &middot;{' '}
                        <span className={member.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                          {member.status}
                        </span>
                      </p>
                    </div>
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
