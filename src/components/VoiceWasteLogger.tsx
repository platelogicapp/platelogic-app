'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseWasteTranscript, ParsedWasteEntry } from '@/lib/voice-parser';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
}

interface WasteEntry {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  cost: number;
}

interface VoiceWasteLoggerProps {
  ingredients: Ingredient[];
  restaurantId: string;
  onWasteLogged: (entry: WasteEntry) => void;
}

const WASTE_REASONS = ['Expired', 'Spoiled', 'Overprepped', 'Dropped', 'Plate waste', 'Other'];

export default function VoiceWasteLogger({ ingredients, restaurantId, onWasteLogged }: VoiceWasteLoggerProps) {
  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [parsed, setParsed] = useState<ParsedWasteEntry | null>(null);

  // Editable fields for confirmation
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState('lbs');
  const [editReason, setEditReason] = useState('Expired');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleVoiceResult = useCallback((transcript: string) => {
    const result = parseWasteTranscript(transcript, ingredients);
    setParsed(result);

    // Pre-fill editable fields
    if (result.ingredientMatch) {
      setSelectedIngredient(result.ingredientMatch.ingredient);
      setEditUnit(result.unit || result.ingredientMatch.ingredient.unit || 'lbs');
    } else {
      setSelectedIngredient(null);
      setEditUnit(result.unit || 'lbs');
    }
    setEditQuantity(String(result.quantity));
    setEditReason(result.reason || 'Expired');
    setIngredientSearch('');
    setShowIngredientDropdown(false);
    setShowConfirm(true);
  }, [ingredients]);

  const { state, error, interimTranscript, startListening, stopListening, resetError, isSupported } = useSpeechRecognition(handleVoiceResult);

  const estimatedCost = selectedIngredient
    ? (parseFloat(editQuantity) || 0) * selectedIngredient.cost_per_unit
    : 0;

  const handleConfirmSubmit = async () => {
    if (!selectedIngredient || !restaurantId) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    const qty = parseFloat(editQuantity) || 1;
    const cost = qty * selectedIngredient.cost_per_unit;

    const { error: insertError } = await supabase.from('waste_logs').insert({
      restaurant_id: restaurantId,
      ingredient_id: selectedIngredient.id,
      ingredient_name: selectedIngredient.name,
      quantity: qty,
      unit: editUnit,
      cost,
      reason: editReason,
      notes: parsed?.rawTranscript ? `Voice: "${parsed.rawTranscript}"` : null,
      logged_by: user?.id,
    });

    if (!insertError) {
      onWasteLogged({
        ingredient_id: selectedIngredient.id,
        ingredient_name: selectedIngredient.name,
        quantity: qty,
        cost,
      });
    }

    setShowConfirm(false);
    setParsed(null);
    setSubmitting(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setParsed(null);
    stopListening();
  };

  const handleMicClick = () => {
    if (state === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  // Filtered ingredients for dropdown search
  const filteredIngredients = ingredientSearch
    ? ingredients.filter(i => i.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
    : ingredients;

  // Don't render if browser doesn't support speech
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg" title="Voice logging requires Chrome or Safari">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} />
        </svg>
        <span className="text-xs text-gray-400">Voice N/A</span>
      </div>
    );
  }

  return (
    <>
      {/* Mic Button */}
      <button
        onClick={handleMicClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          state === 'listening'
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-accent text-white hover:bg-accent-light'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {state === 'listening' ? 'Listening...' : 'Voice Log'}
      </button>

      {/* Listening Overlay */}
      {state === 'listening' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center" onClick={stopListening}>
          {/* Pulsing rings */}
          <div className="relative mb-8">
            <div className="absolute inset-0 w-32 h-32 -m-4 rounded-full bg-accent opacity-20 animate-ping" />
            <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full bg-accent opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">Listening...</h2>
          <p className="text-blue-200 text-sm mb-6">Say what you wasted, e.g. &quot;2 pounds of chicken, expired&quot;</p>

          {/* Live transcript */}
          {interimTranscript && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg px-6 py-3 max-w-md">
              <p className="text-white text-lg text-center italic">&quot;{interimTranscript}&quot;</p>
            </div>
          )}

          <p className="text-gray-400 text-xs mt-8">Tap anywhere to stop</p>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4" onClick={resetError}>
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="text-lg font-bold text-primary mb-2">Voice Error</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <div className="flex gap-3">
              <button onClick={resetError} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium">
                Dismiss
              </button>
              <button onClick={() => { resetError(); startListening(); }} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && parsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-primary">Confirm Waste Log</h2>
                <p className="text-gray-500 text-sm">Review and confirm what was heard</p>
              </div>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {/* Raw transcript */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">You said:</p>
              <p className="text-primary font-medium italic">&quot;{parsed.rawTranscript}&quot;</p>
            </div>

            <div className="space-y-4">
              {/* Ingredient */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Ingredient</label>
                {selectedIngredient ? (
                  <div className="flex items-center justify-between p-3 border-2 border-accent rounded-lg bg-green-50">
                    <div>
                      <span className="font-bold text-primary">{selectedIngredient.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{selectedIngredient.category}</span>
                      {parsed.ingredientMatch && parsed.ingredientMatch.score < 0.6 && (
                        <span className="text-amber-600 text-xs ml-2">Best match</span>
                      )}
                    </div>
                    <button onClick={() => { setSelectedIngredient(null); setShowIngredientDropdown(true); }}
                      className="text-sm text-accent font-medium hover:underline">Change</button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={ingredientSearch}
                        onChange={e => { setIngredientSearch(e.target.value); setShowIngredientDropdown(true); }}
                        onFocus={() => setShowIngredientDropdown(true)}
                        className="w-full px-4 py-3 border-2 border-amber-400 rounded-lg bg-amber-50 outline-none focus:ring-2 focus:ring-accent"
                        autoFocus
                      />
                      <p className="text-amber-600 text-xs mt-1">Could not match an ingredient. Please select one:</p>
                    </div>
                    {showIngredientDropdown && (
                      <div className="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-lg">
                        {filteredIngredients.map(ing => (
                          <button key={ing.id} onClick={() => {
                            setSelectedIngredient(ing);
                            setEditUnit(ing.unit);
                            setShowIngredientDropdown(false);
                            setIngredientSearch('');
                          }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <span className="font-medium text-primary">{ing.name}</span>
                            <span className="text-gray-400 text-sm ml-2">${ing.cost_per_unit.toFixed(2)}/{ing.unit}</span>
                          </button>
                        ))}
                        {filteredIngredients.length === 0 && (
                          <p className="text-gray-500 text-sm px-4 py-3">No ingredients found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Quantity</label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={e => setEditQuantity(e.target.value)}
                    min="0.1"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Unit</label>
                  <select value={editUnit} onChange={e => setEditUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none">
                    {['lbs','oz','each','case','gal','qt','pt','dozen','bag','box','can','bunch','head','kg'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Reason
                  {parsed.reason && <span className="text-accent text-xs ml-2">(detected from voice)</span>}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WASTE_REASONS.map(r => (
                    <button key={r} onClick={() => setEditReason(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        editReason === r ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost estimate */}
              {selectedIngredient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Estimated cost:</span>
                    <span className="text-xl font-bold text-blue-900">${estimatedCost.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {editQuantity} {editUnit} x ${selectedIngredient.cost_per_unit.toFixed(2)}/{selectedIngredient.unit}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button onClick={handleConfirmSubmit}
                  disabled={!selectedIngredient || submitting || !editQuantity || parseFloat(editQuantity) <= 0}
                  className="flex-1 px-4 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Logging...' : 'Confirm & Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
