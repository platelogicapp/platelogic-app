'use client';

import { useState, useEffect, useRef } from 'react';
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

// Food industry standard units
const UNITS = [
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'each', label: 'Each (ea)' },
  { value: 'case', label: 'Case' },
  { value: 'gal', label: 'Gallon (gal)' },
  { value: 'qt', label: 'Quart (qt)' },
  { value: 'pt', label: 'Pint (pt)' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'can', label: 'Can' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'head', label: 'Head' },
  { value: 'kg', label: 'Kilogram (kg)' },
];

// Top 50 most common restaurant ingredients with industry-standard units and avg costs
const TOP_INGREDIENTS = [
  // === PROTEINS (most tracked for waste) ===
  { name: 'Chicken Breast', category: 'Protein', unit: 'lbs', cost: 4.50 },
  { name: 'Chicken Thighs', category: 'Protein', unit: 'lbs', cost: 3.25 },
  { name: 'Ground Beef', category: 'Protein', unit: 'lbs', cost: 5.50 },
  { name: 'Salmon Fillet', category: 'Protein', unit: 'lbs', cost: 12.00 },
  { name: 'Shrimp', category: 'Protein', unit: 'lbs', cost: 9.00 },
  { name: 'Pork Loin', category: 'Protein', unit: 'lbs', cost: 4.00 },
  { name: 'Bacon', category: 'Protein', unit: 'lbs', cost: 7.00 },
  { name: 'Steak (Ribeye)', category: 'Protein', unit: 'lbs', cost: 16.00 },
  { name: 'Turkey Breast', category: 'Protein', unit: 'lbs', cost: 5.50 },
  { name: 'Tilapia', category: 'Protein', unit: 'lbs', cost: 6.00 },
  { name: 'Cod', category: 'Protein', unit: 'lbs', cost: 8.00 },
  { name: 'Sausage Links', category: 'Protein', unit: 'lbs', cost: 5.00 },
  // === PRODUCE ===
  { name: 'Lettuce (Romaine)', category: 'Produce', unit: 'head', cost: 2.00 },
  { name: 'Mixed Greens', category: 'Produce', unit: 'lbs', cost: 5.00 },
  { name: 'Tomatoes', category: 'Produce', unit: 'lbs', cost: 2.50 },
  { name: 'Onions (Yellow)', category: 'Produce', unit: 'lbs', cost: 1.00 },
  { name: 'Potatoes', category: 'Produce', unit: 'lbs', cost: 0.80 },
  { name: 'Garlic', category: 'Produce', unit: 'lbs', cost: 3.00 },
  { name: 'Carrots', category: 'Produce', unit: 'lbs', cost: 1.00 },
  { name: 'Bell Peppers', category: 'Produce', unit: 'each', cost: 1.25 },
  { name: 'Mushrooms', category: 'Produce', unit: 'lbs', cost: 4.00 },
  { name: 'Avocado', category: 'Produce', unit: 'each', cost: 1.50 },
  { name: 'Lemons', category: 'Produce', unit: 'each', cost: 0.50 },
  { name: 'Limes', category: 'Produce', unit: 'each', cost: 0.35 },
  { name: 'Cilantro', category: 'Produce', unit: 'bunch', cost: 0.75 },
  { name: 'Basil', category: 'Produce', unit: 'bunch', cost: 2.00 },
  { name: 'Celery', category: 'Produce', unit: 'bunch', cost: 1.50 },
  { name: 'Spinach', category: 'Produce', unit: 'lbs', cost: 4.00 },
  { name: 'Cucumbers', category: 'Produce', unit: 'each', cost: 0.75 },
  { name: 'Jalapeños', category: 'Produce', unit: 'lbs', cost: 2.00 },
  // === DAIRY ===
  { name: 'Butter', category: 'Dairy', unit: 'lbs', cost: 4.50 },
  { name: 'Heavy Cream', category: 'Dairy', unit: 'qt', cost: 4.00 },
  { name: 'Eggs', category: 'Dairy', unit: 'dozen', cost: 4.00 },
  { name: 'Whole Milk', category: 'Dairy', unit: 'gal', cost: 4.50 },
  { name: 'Cheddar Cheese', category: 'Dairy', unit: 'lbs', cost: 5.00 },
  { name: 'Mozzarella', category: 'Dairy', unit: 'lbs', cost: 4.50 },
  { name: 'Parmesan', category: 'Dairy', unit: 'lbs', cost: 10.00 },
  { name: 'Sour Cream', category: 'Dairy', unit: 'pt', cost: 2.50 },
  { name: 'Cream Cheese', category: 'Dairy', unit: 'lbs', cost: 4.00 },
  // === GRAINS & STARCHES ===
  { name: 'White Rice', category: 'Grain', unit: 'lbs', cost: 0.80 },
  { name: 'Pasta (Dried)', category: 'Grain', unit: 'lbs', cost: 1.50 },
  { name: 'Bread (Loaf)', category: 'Grain', unit: 'each', cost: 3.50 },
  { name: 'Flour (AP)', category: 'Grain', unit: 'lbs', cost: 0.50 },
  { name: 'Tortillas', category: 'Grain', unit: 'dozen', cost: 3.00 },
  { name: 'Burger Buns', category: 'Grain', unit: 'dozen', cost: 4.00 },
  // === OTHER (Oils, Sauces, Pantry) ===
  { name: 'Olive Oil', category: 'Other', unit: 'gal', cost: 25.00 },
  { name: 'Vegetable Oil', category: 'Other', unit: 'gal', cost: 8.00 },
  { name: 'Soy Sauce', category: 'Other', unit: 'gal', cost: 8.00 },
  { name: 'Tomato Sauce', category: 'Other', unit: 'can', cost: 3.00 },
  { name: 'Hot Sauce', category: 'Other', unit: 'each', cost: 4.00 },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'ingredients' | 'team'>('profile');
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('American');
  const [avgCovers, setAvgCovers] = useState('100');
  const [saving, setSaving] = useState(false);

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState('Protein');
  const [newIngCost, setNewIngCost] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('lbs');
  const [quickAddSearch, setQuickAddSearch] = useState('');
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<Array<{ name: string; category: string; unit: string; cost: number }>>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');

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

        const { data: ings } = await supabase
          .from('ingredients')
          .select('*')
          .eq('restaurant_id', r.id)
          .eq('is_active', true)
          .order('category')
          .order('name');
        if (ings) setIngredients(ings);

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
    setTimeout(() => setSaveMessage(''), 2500);
  };

  // === PROFILE ===
  const handleSaveProfile = async () => {
    if (!restaurantId) return;
    setSaving(true);
    const { error } = await supabase
      .from('restaurants')
      .update({ name: restaurantName, address, cuisine_type: cuisineType, avg_daily_covers: parseInt(avgCovers) || 100 })
      .eq('id', restaurantId);
    if (!error) showSaved('Profile saved!');
    setSaving(false);
  };

  // === INGREDIENTS ===
  const handleAddIngredient = async () => {
    if (!restaurantId || !newIngName) return;
    const { data, error } = await supabase
      .from('ingredients')
      .insert({ restaurant_id: restaurantId, name: newIngName, category: newIngCategory, unit: newIngUnit, cost_per_unit: parseFloat(newIngCost) || 0, is_active: true })
      .select().single();
    if (!error && data) {
      setIngredients(prev => [...prev, data]);
      setNewIngName(''); setNewIngCost('');
      setShowAddIngredient(false);
      showSaved('Ingredient added!');
    }
  };

  const handleQuickAdd = async (item: typeof TOP_INGREDIENTS[0]) => {
    if (!restaurantId) return;
    // Check if already exists
    if (ingredients.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
      showSaved(`${item.name} already exists`);
      return;
    }
    const { data, error } = await supabase
      .from('ingredients')
      .insert({ restaurant_id: restaurantId, name: item.name, category: item.category, unit: item.unit, cost_per_unit: item.cost, is_active: true })
      .select().single();
    if (!error && data) {
      setIngredients(prev => [...prev, data]);
      showSaved(`Added ${item.name}`);
    }
  };

  const handleQuickAddAll = async (items: typeof TOP_INGREDIENTS) => {
    if (!restaurantId) return;
    const existingNames = new Set(ingredients.map(i => i.name.toLowerCase()));
    const newItems = items.filter(i => !existingNames.has(i.name.toLowerCase()));
    if (newItems.length === 0) { showSaved('All items already added'); return; }

    const rows = newItems.map(i => ({
      restaurant_id: restaurantId, name: i.name, category: i.category, unit: i.unit, cost_per_unit: i.cost, is_active: true,
    }));
    const { data, error } = await supabase.from('ingredients').insert(rows).select();
    if (!error && data) {
      setIngredients(prev => [...prev, ...data]);
      showSaved(`Added ${data.length} ingredients`);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    await supabase.from('ingredients').update({ is_active: false }).eq('id', id);
    setIngredients(prev => prev.filter(i => i.id !== id));
    showSaved('Ingredient removed');
  };

  // === BULK UPLOAD ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());

      // Skip header if present
      const startIdx = lines[0]?.toLowerCase().includes('name') ? 1 : 0;
      const parsed: Array<{ name: string; category: string; unit: string; cost: number }> = [];

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/"/g, ''));
        if (parts.length >= 2) {
          parsed.push({
            name: parts[0],
            category: parts[1] || 'Other',
            unit: parts[2] || 'lbs',
            cost: parseFloat(parts[3]) || 0,
          });
        }
      }
      setBulkPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!restaurantId || bulkPreview.length === 0) return;
    setBulkUploading(true);
    const existingNames = new Set(ingredients.map(i => i.name.toLowerCase()));
    const newItems = bulkPreview.filter(i => !existingNames.has(i.name.toLowerCase()));

    if (newItems.length === 0) {
      showSaved('All items already exist');
      setBulkUploading(false);
      return;
    }

    const rows = newItems.map(i => ({
      restaurant_id: restaurantId, name: i.name, category: i.category, unit: i.unit, cost_per_unit: i.cost, is_active: true,
    }));
    const { data, error } = await supabase.from('ingredients').insert(rows).select();
    if (!error && data) {
      setIngredients(prev => [...prev, ...data]);
      showSaved(`Imported ${data.length} ingredients`);
      setBulkPreview([]);
      setShowBulkUpload(false);
    }
    setBulkUploading(false);
  };

  // === TEAM ===
  const handleInviteTeamMember = async () => {
    if (!restaurantId || !inviteEmail) return;
    const { data, error } = await supabase
      .from('team_members')
      .insert({ restaurant_id: restaurantId, invited_email: inviteEmail, role: inviteRole, status: 'invited' })
      .select().single();
    if (!error && data) {
      setTeamMembers(prev => [...prev, data]);
      setInviteEmail('');
      showSaved('Invitation saved!');
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    await supabase.from('team_members').update({ status: 'deactivated' }).eq('id', id);
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    showSaved('Member removed');
  };

  // Filtered quick-add list
  const existingNames = new Set(ingredients.map(i => i.name.toLowerCase()));
  const filteredQuickAdd = TOP_INGREDIENTS.filter(i => {
    if (quickAddCategory && i.category !== quickAddCategory) return false;
    if (quickAddSearch && !i.name.toLowerCase().includes(quickAddSearch.toLowerCase())) return false;
    return true;
  });

  // Filtered ingredient list
  const filteredIngredients = ingredients.filter(i =>
    !ingredientSearch || i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const tabs = [
    { id: 'profile', label: 'Restaurant Profile' },
    { id: 'ingredients', label: `Ingredients (${ingredients.length})` },
    { id: 'team', label: 'Team Members' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-lg">Loading settings...</p></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-6 py-3 rounded-lg shadow-xl slide-in font-semibold">{saveMessage}</div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-600">Manage your restaurant, ingredients, and team</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-4 font-semibold transition border-b-2 ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-gray-600 hover:text-primary'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {/* ========== PROFILE TAB ========== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Restaurant Name</label>
                <input type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Cuisine Type</label>
                  <select value={cuisineType} onChange={e => setCuisineType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none">
                    {['American','Italian','French','Asian','Mexican','Mediterranean','Indian','Japanese','Korean','Thai','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Average Daily Covers</label>
                  <input type="number" value={avgCovers} onChange={e => setAvgCovers(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ========== INGREDIENTS TAB ========== */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => { setShowQuickAdd(!showQuickAdd); setShowAddIngredient(false); setShowBulkUpload(false); }}
                  className={`px-4 py-3 font-semibold rounded-lg transition border-2 ${showQuickAdd ? 'bg-accent text-white border-accent' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
                  Top 50 Ingredients
                </button>
                <button onClick={() => { setShowAddIngredient(!showAddIngredient); setShowQuickAdd(false); setShowBulkUpload(false); }}
                  className={`px-4 py-3 font-semibold rounded-lg transition border-2 ${showAddIngredient ? 'bg-accent text-white border-accent' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
                  + Add Custom
                </button>
                <button onClick={() => { setShowBulkUpload(!showBulkUpload); setShowQuickAdd(false); setShowAddIngredient(false); }}
                  className={`px-4 py-3 font-semibold rounded-lg transition border-2 ${showBulkUpload ? 'bg-accent text-white border-accent' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
                  Bulk Upload CSV
                </button>
              </div>

              {/* ---- QUICK ADD: Top 50 Ingredients ---- */}
              {showQuickAdd && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary">Top 50 Restaurant Ingredients</h3>
                    <button onClick={() => handleQuickAddAll(filteredQuickAdd)}
                      className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-light transition">
                      Add All Visible
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <input type="text" placeholder="Search..." value={quickAddSearch} onChange={e => setQuickAddSearch(e.target.value)}
                      className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm" />
                    <button onClick={() => setQuickAddCategory(null)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${!quickAddCategory ? 'bg-accent text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>All</button>
                    {['Protein','Produce','Dairy','Grain','Other'].map(c => (
                      <button key={c} onClick={() => setQuickAddCategory(c)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${quickAddCategory === c ? 'bg-accent text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>{c}</button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {filteredQuickAdd.map(item => {
                      const alreadyAdded = existingNames.has(item.name.toLowerCase());
                      return (
                        <button key={item.name} onClick={() => !alreadyAdded && handleQuickAdd(item)} disabled={alreadyAdded}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left text-sm transition ${
                            alreadyAdded ? 'bg-gray-100 border-gray-200 opacity-60 cursor-default' : 'bg-white border-gray-300 hover:border-accent hover:shadow-sm'
                          }`}>
                          <div>
                            <span className="font-semibold text-primary">{item.name}</span>
                            <span className="text-gray-500 text-xs ml-2">{item.category}</span>
                          </div>
                          <div className="text-right">
                            {alreadyAdded ? (
                              <span className="text-green-600 text-xs font-semibold">Added</span>
                            ) : (
                              <div>
                                <span className="font-semibold text-primary">${item.cost.toFixed(2)}</span>
                                <span className="text-gray-400 text-xs ml-1">/{item.unit}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- ADD CUSTOM INGREDIENT ---- */}
              {showAddIngredient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-primary">Add Custom Ingredient</h3>
                  <input type="text" placeholder="Ingredient name" value={newIngName} onChange={e => setNewIngName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent" />
                  <div className="grid grid-cols-3 gap-3">
                    <select value={newIngCategory} onChange={e => setNewIngCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none">
                      {['Protein','Produce','Dairy','Grain','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input type="number" placeholder="Cost per unit" value={newIngCost} onChange={e => setNewIngCost(e.target.value)} step="0.01"
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                    <select value={newIngUnit} onChange={e => setNewIngUnit(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none">
                      {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddIngredient} disabled={!newIngName}
                    className="w-full px-4 py-2 bg-accent text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-accent-light transition">
                    Add Ingredient
                  </button>
                </div>
              )}

              {/* ---- BULK UPLOAD ---- */}
              {showBulkUpload && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-bold text-primary">Bulk Upload from CSV</h3>
                  <div className="bg-white border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">Upload a CSV file with your ingredients. Format:</p>
                    <code className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 mb-3">
                      Name, Category, Unit, Cost<br/>
                      Chicken Breast, Protein, lbs, 4.50<br/>
                      Avocado, Produce, each, 1.50<br/>
                      Heavy Cream, Dairy, qt, 4.00
                    </code>
                    <p className="text-xs text-gray-500 mb-1"><strong>Categories:</strong> Protein, Produce, Dairy, Grain, Other</p>
                    <p className="text-xs text-gray-500"><strong>Units:</strong> lbs, oz, each, case, gal, qt, pt, dozen, bag, box, can, bunch, head, kg</p>
                  </div>

                  <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" />

                  {bulkPreview.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-primary">{bulkPreview.length} items found</p>
                        <span className="text-sm text-gray-500">{bulkPreview.filter(i => existingNames.has(i.name.toLowerCase())).length} duplicates will be skipped</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2 font-semibold text-gray-600">Name</th>
                              <th className="text-left px-3 py-2 font-semibold text-gray-600">Category</th>
                              <th className="text-left px-3 py-2 font-semibold text-gray-600">Unit</th>
                              <th className="text-right px-3 py-2 font-semibold text-gray-600">Cost</th>
                              <th className="text-center px-3 py-2 font-semibold text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkPreview.map((item, idx) => {
                              const dup = existingNames.has(item.name.toLowerCase());
                              return (
                                <tr key={idx} className={dup ? 'bg-gray-50 text-gray-400' : ''}>
                                  <td className="px-3 py-2">{item.name}</td>
                                  <td className="px-3 py-2">{item.category}</td>
                                  <td className="px-3 py-2">{item.unit}</td>
                                  <td className="px-3 py-2 text-right">${item.cost.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-center">{dup ? <span className="text-yellow-600">Exists</span> : <span className="text-green-600">New</span>}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <button onClick={handleBulkImport} disabled={bulkUploading}
                        className="w-full mt-3 px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50">
                        {bulkUploading ? 'Importing...' : `Import ${bulkPreview.filter(i => !existingNames.has(i.name.toLowerCase())).length} New Ingredients`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ---- CURRENT INGREDIENTS LIST ---- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-primary">Your Ingredients ({ingredients.length})</h3>
                  <input type="text" placeholder="Filter..." value={ingredientSearch} onChange={e => setIngredientSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm w-48" />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredIngredients.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-primary">{item.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.category === 'Protein' ? 'bg-red-100 text-red-700' :
                            item.category === 'Produce' ? 'bg-green-100 text-green-700' :
                            item.category === 'Dairy' ? 'bg-blue-100 text-blue-700' :
                            item.category === 'Grain' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{item.category}</span>
                        </div>
                        <p className="text-sm text-gray-600">${item.cost_per_unit.toFixed(2)} per {item.unit}</p>
                      </div>
                      <button onClick={() => handleDeleteIngredient(item.id)}
                        className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded text-sm">Remove</button>
                    </div>
                  ))}
                  {filteredIngredients.length === 0 && (
                    <p className="text-center text-gray-500 py-8">{ingredients.length === 0 ? 'No ingredients yet. Add some using the buttons above.' : 'No matches found.'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== TEAM TAB ========== */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">Invite team members to log waste and view reports.</p>
              </div>
              <div className="flex gap-3">
                <input type="email" placeholder="team@restaurant.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent" />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg outline-none">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
                <button onClick={handleInviteTeamMember} disabled={!inviteEmail}
                  className="px-6 py-2 bg-accent text-white font-semibold rounded-lg disabled:opacity-50">Invite</button>
              </div>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-primary capitalize">{member.role}</h4>
                      <p className="text-sm text-gray-600">
                        {member.invited_email || 'You'} &middot;{' '}
                        <span className={member.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>{member.status}</span>
                      </p>
                    </div>
                    {member.role !== 'owner' && (
                      <button onClick={() => handleRemoveTeamMember(member.id)}
                        className="px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded">Remove</button>
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
