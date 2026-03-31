// Voice transcript parser for waste logging
// Parses natural language like "2 pounds of chicken expired" into structured data

interface IngredientInput {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
}

export interface ParsedWasteEntry {
  ingredientMatch: { ingredient: IngredientInput; score: number } | null;
  quantity: number;
  unit: string | null;
  reason: string | null;
  rawTranscript: string;
}

// ============ FUZZY MATCHING ============

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function getWords(text: string): Set<string> {
  return new Set(normalizeText(text).split(/\s+/).filter(w => w.length > 0));
}

// Dice coefficient on word sets - handles partial name matching well
function diceScore(a: string, b: string): number {
  const wordsA = getWords(a);
  const wordsB = getWords(b);
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach(w => { if (wordsB.has(w)) intersection++; });

  return (2 * intersection) / (wordsA.size + wordsB.size);
}

function findBestIngredientMatch(
  transcript: string,
  ingredients: IngredientInput[]
): { ingredient: IngredientInput; score: number } | null {
  const normalized = normalizeText(transcript);
  let bestMatch: { ingredient: IngredientInput; score: number } | null = null;

  for (const ingredient of ingredients) {
    const ingName = normalizeText(ingredient.name);
    let score = 0;

    // Exact substring match - highest priority
    if (normalized.includes(ingName)) {
      score = 1.0;
    } else {
      // Dice coefficient
      score = diceScore(transcript, ingredient.name);

      // Check if any ingredient word appears as a substring in transcript
      const ingWords = ingName.split(/\s+/);
      for (const word of ingWords) {
        if (word.length >= 3 && normalized.includes(word)) {
          score = Math.max(score, 0.5 + (word.length / (ingName.length * 2)));
        }
      }

      // First word match bonus
      if (ingWords[0] && normalized.includes(ingWords[0]) && ingWords[0].length >= 3) {
        score += 0.15;
      }
    }

    if (score > (bestMatch?.score || 0) && score >= 0.35) {
      bestMatch = { ingredient, score };
    }
  }

  return bestMatch;
}

// ============ QUANTITY PARSING ============

const WORD_TO_NUMBER: Record<string, number> = {
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20,
};

const PHRASE_TO_NUMBER: [RegExp, number][] = [
  [/half\s+a\s+dozen/i, 6],
  [/a\s+dozen/i, 12],
  [/a\s+couple\s*(of)?/i, 2],
  [/a\s+few/i, 3],
  [/half\s+(a\s+)?/i, 0.5],
  [/quarter\s+(of\s+)?(a\s+)?/i, 0.25],
];

// Serving/portion approximations (in the ingredient's default unit)
const PORTION_WORDS = new Set(['serving', 'servings', 'portion', 'portions', 'piece', 'pieces', 'slice', 'slices']);

function parseQuantity(transcript: string): { quantity: number; unit: string | null; isPortional: boolean } {
  const normalized = normalizeText(transcript);

  // 1. Check phrase quantities first ("half a dozen", "a couple", etc.)
  for (const [pattern, value] of PHRASE_TO_NUMBER) {
    if (pattern.test(normalized)) {
      return { quantity: value, unit: null, isPortional: false };
    }
  }

  // 2. Numeric + unit: "2 pounds", "1.5 oz", "3 cases"
  const numUnitMatch = normalized.match(/(\d+\.?\d*)\s*(pound|pounds|lb|lbs|ounce|ounces|oz|case|cases|gallon|gallons|gal|quart|quarts|qt|pint|pints|pt|dozen|bag|bags|box|boxes|can|cans|bunch|bunches|head|heads|kg|kilogram|kilograms|each|ea)/);
  if (numUnitMatch) {
    return {
      quantity: parseFloat(numUnitMatch[1]),
      unit: normalizeUnit(numUnitMatch[2]),
      isPortional: false,
    };
  }

  // 3. Numeric + portion word: "2 servings", "1 portion"
  const numPortionMatch = normalized.match(/(\d+\.?\d*)\s*(serving|servings|portion|portions|piece|pieces|slice|slices)/);
  if (numPortionMatch) {
    return {
      quantity: parseFloat(numPortionMatch[1]),
      unit: null,
      isPortional: true,
    };
  }

  // 4. Word number + unit: "two pounds", "three cases"
  const wordNumPattern = Object.keys(WORD_TO_NUMBER).join('|');
  const wordUnitMatch = normalized.match(new RegExp(`(${wordNumPattern})\\s+(pound|pounds|lb|lbs|ounce|ounces|oz|case|cases|gallon|gallons|gal|quart|quarts|qt|dozen|bag|bags|box|boxes|can|cans|bunch|bunches|head|heads|kg|each|ea)`));
  if (wordUnitMatch) {
    return {
      quantity: WORD_TO_NUMBER[wordUnitMatch[1]] || 1,
      unit: normalizeUnit(wordUnitMatch[2]),
      isPortional: false,
    };
  }

  // 5. Word number + portion: "two servings"
  const wordPortionMatch = normalized.match(new RegExp(`(${wordNumPattern})\\s+(serving|servings|portion|portions|piece|pieces|slice|slices)`));
  if (wordPortionMatch) {
    return {
      quantity: WORD_TO_NUMBER[wordPortionMatch[1]] || 1,
      unit: null,
      isPortional: true,
    };
  }

  // 6. Word number alone: "two chicken"
  for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
    if (word !== 'a' && word !== 'an' && normalized.includes(word)) {
      return { quantity: num, unit: null, isPortional: false };
    }
  }

  // 7. Bare number: "2 chicken"
  const bareNum = normalized.match(/(\d+\.?\d*)/);
  if (bareNum) {
    return { quantity: parseFloat(bareNum[1]), unit: null, isPortional: false };
  }

  // Default
  return { quantity: 1, unit: null, isPortional: false };
}

// ============ UNIT NORMALIZATION ============

function normalizeUnit(spoken: string): string {
  const map: Record<string, string> = {
    'pound': 'lbs', 'pounds': 'lbs', 'lb': 'lbs', 'lbs': 'lbs',
    'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz',
    'case': 'case', 'cases': 'case',
    'gallon': 'gal', 'gallons': 'gal', 'gal': 'gal',
    'quart': 'qt', 'quarts': 'qt', 'qt': 'qt',
    'pint': 'pt', 'pints': 'pt', 'pt': 'pt',
    'dozen': 'dozen',
    'bag': 'bag', 'bags': 'bag',
    'box': 'box', 'boxes': 'box',
    'can': 'can', 'cans': 'can',
    'bunch': 'bunch', 'bunches': 'bunch',
    'head': 'head', 'heads': 'head',
    'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
    'each': 'each', 'ea': 'each',
  };
  return map[spoken.toLowerCase()] || spoken.toLowerCase();
}

// ============ REASON PARSING ============

const REASON_KEYWORDS: [RegExp, string][] = [
  [/expir|past\s+date|out\s+of\s+date|old/i, 'Expired'],
  [/spoil|rotten|moldy|mold|bad|gone\s+off|smell/i, 'Spoiled'],
  [/over\s*prep|too\s+much|extra|leftover|left\s+over|excess/i, 'Overprepped'],
  [/drop|fell|floor|spill|knock|accident/i, 'Dropped'],
  [/plate|return|sent\s+back|uneaten|customer|table/i, 'Plate waste'],
];

function parseReason(transcript: string): string | null {
  const normalized = normalizeText(transcript);
  for (const [pattern, reason] of REASON_KEYWORDS) {
    if (pattern.test(normalized)) {
      return reason;
    }
  }
  return null;
}

// ============ MAIN PARSER ============

// Approximate portion size in lbs for portional language
const PORTION_APPROX = 0.5; // ~8oz serving

export function parseWasteTranscript(
  transcript: string,
  ingredients: IngredientInput[]
): ParsedWasteEntry {
  const ingredientMatch = findBestIngredientMatch(transcript, ingredients);
  const { quantity: rawQty, unit: parsedUnit, isPortional } = parseQuantity(transcript);
  const reason = parseReason(transcript);

  // If portional language used, convert to approximate weight
  let quantity = rawQty;
  if (isPortional) {
    quantity = rawQty * PORTION_APPROX;
  }

  // Determine final unit: spoken unit > ingredient's stored unit > 'lbs'
  const unit = parsedUnit || (ingredientMatch?.ingredient.unit) || null;

  return {
    ingredientMatch,
    quantity,
    unit,
    reason,
    rawTranscript: transcript,
  };
}
