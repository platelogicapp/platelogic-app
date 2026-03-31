'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import VoiceWasteLogger from '@/components/VoiceWasteLogger';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  cost_per_unit: number;
  unit: string;
}

interface WasteEntry {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  cost: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  Protein: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  Produce: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  Dairy: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  Grain: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  Other: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' },
};

const WASTE_REASONS = ['Expired', 'Spoiled', 'Overprepped', 'Dropped', 'Plate waste', 'Other'];

export default function WasteInputPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Modal state for logging waste
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Expired');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Today's logged waste
  const [todaysEntries, setTodaysEntries] = useState<WasteEntry[]>([]);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's restaurant
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (!restaurants || restaurants.length === 0) {
        // Also check team_members
        const { data: teamMemberships } = await supabase
          .from('team_members')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1);

        if (teamMemberships && teamMemberships.length > 0) {
          setRestaurantId(teamMemberships[0].restaurant_id);
        } else {
          setLoading(false);
          return;
        }
      } else {
        setRestaurantId(restaurants[0].id);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    const loadIngredients = async () => {
      const { data } = await supabase
        .from('ingredients')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (data) setIngredients(data);

      // Load today's waste logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: logs } = await supabase
        .from('waste_logs')
        .select('ingredient_id, ingredient_name, quantity, cost')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', today.toISOString());

      if (logs) setTodaysEntries(logs);

      setLoading(false);
    };
    loadIngredients();
  }, [restaurantId]);

  const categories = [...new Set(ingredients.map((i) => i.category))];
  const filteredIngredients = selectedCategory
    ? ingredients.filter((i) => i.category === selectedCategory)
    : ingredients;

  const totalWasteCount = todaysEntries.reduce((sum, e) => sum + Number(e.quantity), 0);
  const totalWasteCost = todaysEntries.reduce((sum, e) => sum + Number(e.cost), 0);

  const getCountForIngredient = (id: string) => {
    return todaysEntries
      .filter((e) => e.ingredient_id === id)
      .reduce((sum, e) => sum + Number(e.quantity), 0);
  };

  const handleIngredientTap = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setQuantity('1');
    setReason('Expired');
    setNotes('');
  };

  const handleSubmitWaste = async () => {
    if (!selectedIngredient || !restaurantId) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    const qty = parseFloat(quantity) || 1;
    const cost = qty * selectedIngredient.cost_per_unit;

    const { error } = await supabase.from('waste_logs').insert({
      restaurant_id: restaurantId,
      ingredient_id: selectedIngredient.id,
      ingredient_name: selectedIngredient.name,
      quantity: qty,
      unit: selectedIngredient.unit || 'lbs',
      cost,
      reason,
      notes: notes || null,
      logged_by: user?.id,
    });

    if (!error) {
      setTodaysEntries((prev) => [
        ...prev,
        {
          ingredient_id: selectedIngredient.id,
          ingredient_name: selectedIngredient.name,
          quantity: qty,
          cost,
        },
      ]);

      // Flash animation
      setFlashingId(selectedIngredient.id);
      setTimeout(() => setFlashingId(null), 300);

      // Success message
      setSuccessMessage(`Logged ${qty} ${selectedIngredient.unit || 'lbs'} of ${selectedIngredient.name}`);
      setTimeout(() => setSuccessMessage(''), 2000);

      setSelectedIngredient(null);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-primary mb-2">No Restaurant Found</h2>
          <p className="text-gray-600">Complete onboarding to set up your restaurant first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-accent text-white px-6 py-3 rounded-lg shadow-xl slide-in font-semibold">
          {successMessage}
        </div>
      )}

      {/* Header with Running Total */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">Log Waste</h1>
            {ingredients.length > 0 && restaurantId && (
              <VoiceWasteLogger
                ingredients={ingredients}
                restaurantId={restaurantId}
                onWasteLogged={(entry) => {
                  setTodaysEntries(prev => [...prev, entry]);
                  setFlashingId(entry.ingredient_id);
                  setTimeout(() => setFlashingId(null), 300);
                  setSuccessMessage(`Voice logged: ${entry.quantity} ${entry.ingredient_name}`);
                  setTimeout(() => setSuccessMessage(''), 2000);
                }}
              />
            )}
          </div>

          {/* Running Total */}
          <div className="bg-gradient-to-r from-primary to-blue-900 rounded-lg p-4 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-blue-100">Today&apos;s Waste</div>
                <div className="text-3xl font-bold">{totalWasteCount.toFixed(1)} units</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-100">Est. Cost</div>
                <div className="text-3xl font-bold">${totalWasteCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-[140px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === null
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({ingredients.length})
            </button>
            {categories.map((cat) => {
              const count = ingredients.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ingredient Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredIngredients.map((ingredient) => {
            const colors = CATEGORY_COLORS[ingredient.category] || CATEGORY_COLORS.Other;
            const count = getCountForIngredient(ingredient.id);
            return (
              <button
                key={ingredient.id}
                onClick={() => handleIngredientTap(ingredient)}
                className={`${
                  flashingId === ingredient.id ? 'flash' : ''
                } relative rounded-lg border-2 p-4 transition transform hover:scale-105 active:scale-95 min-h-[120px] flex flex-col justify-between ${
                  colors.bg
                } ${colors.border}`}
              >
                {count > 0 && (
                  <div className="absolute -top-3 -right-3 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {count}
                  </div>
                )}
                <div className="text-left">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${colors.badge}`}>
                    {ingredient.category}
                  </div>
                  <h3 className="font-bold text-primary text-sm line-clamp-2">
                    {ingredient.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    ${ingredient.cost_per_unit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">per {ingredient.unit || 'lb'}</div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {ingredients.length === 0 ? 'No ingredients yet' : 'No ingredients in this category'}
            </h3>
            {ingredients.length === 0 && (
              <p className="text-gray-600">Add ingredients in Settings to start logging waste.</p>
            )}
          </div>
        )}
      </div>

      {/* Waste Log Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 slide-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-primary">Log Waste</h2>
                <p className="text-gray-600">{selectedIngredient.name}</p>
              </div>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Quantity ({selectedIngredient.unit || 'lbs'})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.1"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-lg"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                  Est. cost: ${((parseFloat(quantity) || 0) * selectedIngredient.cost_per_unit).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Reason</label>
                <div className="grid grid-cols-3 gap-2">
                  {WASTE_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        reason === r
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <button
                onClick={handleSubmitWaste}
                disabled={submitting || !quantity || parseFloat(quantity) <= 0}
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? 'Logging...' : 'Log Waste'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Summary */}
      {totalWasteCount > 0 && !selectedIngredient && (
        <div className="fixed bottom-6 right-6 bg-accent text-white rounded-lg shadow-xl p-4 min-w-[200px]">
          <div className="text-sm font-semibold text-green-100">Total Logged Today</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalWasteCount.toFixed(1)}</span>
            <span className="text-sm">units</span>
          </div>
          <div className="text-2xl font-bold mt-2">${totalWasteCost.toFixed(2)}</div>
          <div className="text-xs text-green-100 mt-1">Est. cost</div>
        </div>
      )}
    </div>
  );
}
