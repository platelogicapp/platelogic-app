'use client';

import { useState, useCallback } from 'react';

interface IngredientItem {
  id: string;
  name: string;
  category: 'Protein' | 'Produce' | 'Dairy' | 'Grain' | 'Other';
  cost: number;
  count: number;
}

const SAMPLE_INGREDIENTS: IngredientItem[] = [
  { id: '1', name: 'Chicken Breast', category: 'Protein', cost: 8.5, count: 0 },
  { id: '2', name: 'Salmon', category: 'Protein', cost: 16.0, count: 0 },
  { id: '3', name: 'Shrimp', category: 'Protein', cost: 14.0, count: 0 },
  { id: '4', name: 'Ground Beef', category: 'Protein', cost: 7.5, count: 0 },
  { id: '5', name: 'Mixed Greens', category: 'Produce', cost: 2.5, count: 0 },
  { id: '6', name: 'Tomatoes', category: 'Produce', cost: 1.5, count: 0 },
  { id: '7', name: 'Onions', category: 'Produce', cost: 0.8, count: 0 },
  { id: '8', name: 'Potatoes', category: 'Produce', cost: 1.2, count: 0 },
  { id: '9', name: 'Rice', category: 'Grain', cost: 0.5, count: 0 },
  { id: '10', name: 'Pasta', category: 'Grain', cost: 0.6, count: 0 },
  { id: '11', name: 'Bread', category: 'Grain', cost: 3.0, count: 0 },
  { id: '12', name: 'Butter', category: 'Dairy', cost: 4.5, count: 0 },
  { id: '13', name: 'Heavy Cream', category: 'Dairy', cost: 3.5, count: 0 },
  { id: '14', name: 'Eggs', category: 'Dairy', cost: 0.3, count: 0 },
  { id: '15', name: 'Cheese', category: 'Dairy', cost: 5.0, count: 0 },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  Protein: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  Produce: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  Dairy: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  Grain: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  Other: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' },
};

export default function WasteInputPage() {
  const [ingredients, setIngredients] = useState<IngredientItem[]>(SAMPLE_INGREDIENTS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [history, setHistory] = useState<IngredientItem[][]>([]);

  const categories = ['Protein', 'Produce', 'Dairy', 'Grain'];
  const filteredIngredients = selectedCategory
    ? ingredients.filter((i) => i.category === selectedCategory)
    : ingredients;

  const totalWasteCount = ingredients.reduce((sum, i) => sum + i.count, 0);
  const totalWasteCost = ingredients.reduce((sum, i) => sum + i.count * i.cost, 0);

  const handleIngredientTap = useCallback((ingredientId: string) => {
    // Save current state to history for undo
    setHistory((prev) => [...prev, ingredients]);

    // Update ingredient count
    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, count: i.count + 1 } : i))
    );

    // Flash animation
    setFlashingId(ingredientId);
    setTimeout(() => setFlashingId(null), 300);
  }, [ingredients]);

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setIngredients(previousState);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setIngredients(SAMPLE_INGREDIENTS);
    setHistory([]);
    setFlashingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Running Total */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">Log Waste</h1>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↶ Undo
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-200 text-red-800 font-medium rounded-lg hover:bg-red-300 transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Running Total */}
          <div className="bg-gradient-to-r from-primary to-blue-900 rounded-lg p-4 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-blue-100">Today's Waste</div>
                <div className="text-3xl font-bold">{totalWasteCount} items</div>
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
            const colors = CATEGORY_COLORS[ingredient.category];
            return (
              <button
                key={ingredient.id}
                onClick={() => handleIngredientTap(ingredient.id)}
                className={`${
                  flashingId === ingredient.id ? 'flash' : ''
                } relative rounded-lg border-2 p-4 transition transform hover:scale-105 active:scale-95 min-h-[120px] flex flex-col justify-between ${
                  colors.bg
                } ${colors.border}`}
              >
                {/* Count Badge */}
                {ingredient.count > 0 && (
                  <div className="absolute -top-3 -right-3 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {ingredient.count}
                  </div>
                )}

                {/* Content */}
                <div className="text-left">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${colors.badge}`}>
                    {ingredient.category}
                  </div>
                  <h3 className="font-bold text-primary text-sm line-clamp-2">
                    {ingredient.name}
                  </h3>
                </div>

                {/* Cost */}
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    ${ingredient.cost.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">per unit</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              No ingredients in this category
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-accent hover:text-accent-light font-semibold"
            >
              View all ingredients
            </button>
          </div>
        )}
      </div>

      {/* Today's Waste Summary (Floating) */}
      {totalWasteCount > 0 && (
        <div className="fixed bottom-6 right-6 bg-accent text-white rounded-lg shadow-xl p-4 min-w-[200px]">
          <div className="text-sm font-semibold text-green-100">Total Logged Today</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalWasteCount}</span>
            <span className="text-sm">items</span>
          </div>
          <div className="text-2xl font-bold mt-2">${totalWasteCost.toFixed(2)}</div>
          <div className="text-xs text-green-100 mt-1">Est. cost</div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <h3 className="font-semibold text-primary mb-2">💡 How to use</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Tap any ingredient card to log 1 unit of waste</li>
          <li>• Filter by category to find items faster</li>
          <li>• The counter badge shows how many units you've logged</li>
          <li>• Use "Undo" to remove the last logged item</li>
          <li>• Your running total is updated in real-time</li>
        </ul>
      </div>
    </div>
  );
}
