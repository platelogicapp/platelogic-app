'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface OnboardingStep {
  step: number;
  title: string;
  description: string;
}

const COMMON_INGREDIENTS = [
  // Proteins
  { name: 'Chicken Breast', category: 'Protein', cost: 8.5 },
  { name: 'Salmon', category: 'Protein', cost: 16.0 },
  { name: 'Shrimp', category: 'Protein', cost: 14.0 },
  { name: 'Ground Beef', category: 'Protein', cost: 7.5 },
  { name: 'Pork Chops', category: 'Protein', cost: 9.0 },
  { name: 'Turkey Breast', category: 'Protein', cost: 10.0 },
  // Produce
  { name: 'Mixed Greens', category: 'Produce', cost: 2.5 },
  { name: 'Tomatoes', category: 'Produce', cost: 1.5 },
  { name: 'Onions', category: 'Produce', cost: 0.8 },
  { name: 'Potatoes', category: 'Produce', cost: 1.2 },
  { name: 'Garlic', category: 'Produce', cost: 0.3 },
  { name: 'Carrots', category: 'Produce', cost: 0.5 },
  // Dairy
  { name: 'Butter', category: 'Dairy', cost: 4.5 },
  { name: 'Heavy Cream', category: 'Dairy', cost: 3.5 },
  { name: 'Eggs', category: 'Dairy', cost: 0.3 },
  { name: 'Cheese', category: 'Dairy', cost: 5.0 },
  { name: 'Milk', category: 'Dairy', cost: 0.8 },
  { name: 'Yogurt', category: 'Dairy', cost: 1.5 },
  // Grains
  { name: 'Rice', category: 'Grain', cost: 0.5 },
  { name: 'Pasta', category: 'Grain', cost: 0.6 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('American');
  const [avgCovers, setAvgCovers] = useState('100');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientsLoaded, setIngredientsLoaded] = useState(false);

  useEffect(() => {
    // Get restaurant name from session storage if available
    const savedName = sessionStorage.getItem('restaurantName');
    if (savedName) {
      setRestaurantName(savedName);
    }
  }, []);

  const handleLoadIngredients = () => {
    const ingredientNames = COMMON_INGREDIENTS.map((i) => i.name);
    setSelectedIngredients(ingredientNames);
    setIngredientsLoaded(true);
  };

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : [...prev, name]
    );
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleComplete = async () => {
    setSaving(true);
    setSaveError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Create restaurant
      const { data: restaurant, error: restError } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantName,
          address,
          cuisine_type: cuisineType,
          avg_daily_covers: parseInt(avgCovers) || 100,
          owner_id: user.id,
          settings: {},
        })
        .select()
        .single();

      if (restError) {
        setSaveError(restError.message);
        setSaving(false);
        return;
      }

      // Create team_members row (owner)
      await supabase.from('team_members').insert({
        restaurant_id: restaurant.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
      });

      // Seed selected ingredients
      const ingredientRows = selectedIngredients.map((name) => {
        const found = COMMON_INGREDIENTS.find((i) => i.name === name);
        return {
          restaurant_id: restaurant.id,
          name,
          category: found?.category || 'Other',
          unit: 'lbs',
          cost_per_unit: found?.cost || 0,
          is_active: true,
        };
      });

      if (ingredientRows.length > 0) {
        await supabase.from('ingredients').insert(ingredientRows);
      }

      router.push('/dashboard');
    } catch (err) {
      setSaveError('Failed to complete setup. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      step: 1,
      title: 'Restaurant Details',
      description: 'Tell us about your restaurant',
    },
    {
      step: 2,
      title: 'Add Ingredients',
      description: 'Choose items you track for waste',
    },
    {
      step: 3,
      title: 'Confirmation',
      description: 'Review and complete setup',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">PL</span>
            </div>
            <span className="text-white text-2xl font-bold">PlateLogic</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-accent h-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className={`flex flex-col items-center gap-2 ${
                currentStep >= step.step ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                  currentStep >= step.step
                    ? 'bg-accent text-white'
                    : 'bg-white bg-opacity-20 text-white'
                }`}
              >
                {currentStep > step.step ? '✓' : step.step}
              </div>
              <span className="text-xs text-white text-center">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {/* Step 1: Restaurant Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {steps[0].title}
                </h2>
                <p className="text-gray-600">{steps[0].description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g., Tony's Italian Kitchen"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
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
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
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
                    Avg Daily Covers
                  </label>
                  <input
                    type="number"
                    value={avgCovers}
                    onChange={(e) => setAvgCovers(e.target.value)}
                    placeholder="e.g., 150"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Ingredients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {steps[1].title}
                </h2>
                <p className="text-gray-600">{steps[1].description}</p>
              </div>

              <button
                onClick={handleLoadIngredients}
                disabled={ingredientsLoaded}
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50"
              >
                {ingredientsLoaded ? '✓ Loaded Common Ingredients' : 'Load Common Ingredients'}
              </button>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  Selected: {selectedIngredients.length} items
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {COMMON_INGREDIENTS.map((ingredient) => (
                    <button
                      key={ingredient.name}
                      onClick={() => toggleIngredient(ingredient.name)}
                      className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition ${
                        selectedIngredients.includes(ingredient.name)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-gray-50 text-primary border-gray-300 hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{ingredient.name}</span>
                        {selectedIngredients.includes(ingredient.name) && (
                          <span>✓</span>
                        )}
                      </div>
                      <div className="text-xs opacity-75 mt-1">${ingredient.cost}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {steps[2].title}
                </h2>
                <p className="text-gray-600">{steps[2].description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase">Restaurant</p>
                  <p className="text-lg font-bold text-primary">{restaurantName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase">Address</p>
                  <p className="text-lg font-bold text-primary">{address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase">Cuisine</p>
                    <p className="text-lg font-bold text-primary">{cuisineType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase">Daily Covers</p>
                    <p className="text-lg font-bold text-primary">{avgCovers}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Tracking Ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.slice(0, 5).map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 bg-accent text-white text-sm rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                  {selectedIngredients.length > 5 && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full">
                      +{selectedIngredients.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {saveError}
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-semibold">Ready to go!</p>
                <p className="text-green-800 text-sm mt-1">
                  Click "Complete Setup" to create your restaurant and start tracking waste.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex-1 px-6 py-3 bg-white bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={
                (currentStep === 1 && !restaurantName) ||
                (currentStep === 2 && selectedIngredients.length === 0)
              }
              className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Setting up...' : 'Complete Setup'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/login" className="text-blue-100 hover:text-white text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
