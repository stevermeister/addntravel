/**
 * Parses a free-form text description of a time period into minimum and maximum days.
 * First tries local parsing, then falls back to AI-based parsing if needed.
 * 
 * @param {string} input - The time period description (e.g., "2 weeks", "1-2 months", "around 5 days")
 * @param {Function} aiModelSessionFactory - Optional factory function to create AI model session
 * @returns {Promise<{min_days: number, max_days: number}>} The parsed minimum and maximum days
 */
export async function parseDatePeriod(input, aiModelSessionFactory) {
    if (!input) return { min_days: 0, max_days: 0 };

    const local = parseLocal(input);
    if (
        local &&
        local.min_days >= 0 &&
        local.max_days >= 0 &&
        local.min_days <= local.max_days &&
        (local.min_days + local.max_days) > 0
    ) {
        return local;
    }

    // fallback to AI-based parsing
    try {
        // Create a session with Chrome's built-in AI feature or use provided factory
        const session = aiModelSessionFactory ? 
            await aiModelSessionFactory() : 
            await ai.languageModel.create();

        // Craft the prompt for the AI model
        const prompt = `Convert the following time period to minimum and maximum days.
        OUTPUT in a format (keep all the quotes) {"min_days": "X", "max_days": "Y"}.
        Use these conversion rules:
        - For weeks multiply by 7
        - For months multiply by 30
        - For years multiply by 365
        
        Examples:
        - "2-3 days" -> {"min_days": "2", "max_days": "3"}
        - "1 week" -> {"min_days": "7", "max_days": "7"}
        - "2-3 weeks" -> {"min_days": "14", "max_days": "21"}
        - "1-2 months" -> {"min_days": "30", "max_days": "60"}
        - "around 5 days" -> {"min_days": "4", "max_days": "6"}
        - "2 years" -> {"min_days": "730", "max_days": "730"}
        - "1-2 years" -> {"min_days": "365", "max_days": "730"}
        
        INPUT: ${input}`;

        // Get and parse the AI response
        const result = await session.prompt(prompt);
        const parsed = JSON.parse(result);
        
        // Validate the parsed numbers
        const min_days = parseInt(parsed.min_days);
        const max_days = parseInt(parsed.max_days);
        
        if (isNaN(min_days) || isNaN(max_days)) {
            throw new Error('Invalid number format in AI response');
        }
        
        return { min_days, max_days };
    } catch (error) {
        console.error('Error parsing date period:', error);
        return { min_days: 0, max_days: 0 };
    }
}

/**
 * Constants and helper functions for date period parsing
 */

const DAYS_PER = {
    day: 1,
    days: 1,
    week: 7,
    weeks: 7,
    month: 30,
    months: 30,
    year: 365,
    years: 365
};

// Approx offsets
const APPROX_OFFSETS = {
    day: 1,
    days: 1,
    week: 2,
    weeks: 2,
    month: 10,
    months: 10,
    year: 30,
    years: 30
};

// Default approximate offset
const DEFAULT_APPROX_OFFSET = 5;

// "minimum" / "at least"
const MINIMUM_OFFSETS = {
    day: 2,
    days: 2,
    week: 3,
    weeks: 3,
    month: 10,
    months: 10,
    year: 30,
    years: 30
};

// "maximum" / "no more than"
const MAXIMUM_OFFSETS = {
    day: 1,
    days: 1,
    week: 1,
    weeks: 1,
    month: 1,
    months: 1,
    year: 1,
    years: 1
};

// Known units + typical misspellings
const KNOWN_UNITS = [
    "day","days","week","weeks","month","months","year","years",
    "weekz","mnth"
];

// Special phrases with predefined ranges
const SPECIAL_PHRASES = {
    "weekend getaway": { min_days: 2, max_days: 3 },
    "extended weekend": { min_days: 3, max_days: 4 },
    "weekend trip": { min_days: 2, max_days: 3 },
    "long weekend": { min_days: 3, max_days: 4 },
    "half a year":  { min_days: 182, max_days: 183 }
};

// Number words mapping
const NUMBER_WORDS = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    half: 0.5
};

// Synonym ranges
const SYNONYM_RANGES = {
    couple: [2, 3],
    few: [2, 3],
    several: [3, 5]
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
    const dp = [];
    for (let i = 0; i <= a.length; i++) {
        dp[i] = [i];
    }
    for (let j = 1; j <= b.length; j++) {
        dp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[a.length][b.length];
}

/**
 * Fuzzy match a unit string to a known unit
 */
function fuzzyUnit(u) {
    if (!u) return "days";
    const lower = u.toLowerCase();
    if (KNOWN_UNITS.includes(lower)) {
        if (lower === "weekz") return "weeks";
        if (lower === "mnth")  return "months";
        return lower;
    }
    let best = "days";
    let bestDist = Infinity;
    for (const cand of KNOWN_UNITS) {
        const dist = levenshteinDistance(lower, cand);
        if (dist < bestDist) {
            bestDist = dist;
            best = cand;
        }
    }
    if (best === "weekz") return "weeks";
    if (best === "mnth")  return "months";
    return bestDist <= 3 ? best : "days";
}

/**
 * Parse numeric words into numbers
 */
function parseNumericWords(str) {
    const lowerTrim = str.toLowerCase().trim();
    if (SYNONYM_RANGES[lowerTrim]) {
        const [lo, hi] = SYNONYM_RANGES[lowerTrim];
        return { synonymMin: lo, synonymMax: hi };
    }

    const direct = parseFloat(str);
    if (!isNaN(direct)) return direct;

    let normalized = str
        .replace(/\band a half\b/gi, "andaHalf")
        .replace(/\band half\b/gi,  "andaHalf");

    let total = 0;
    const parts = normalized.split(/\s+/);
    for (const p of parts) {
        const lower = p.toLowerCase();
        if (lower === "andahalf") {
            total += 0.5;
        } else if (NUMBER_WORDS.hasOwnProperty(lower)) {
            total += NUMBER_WORDS[lower];
        } else {
            const f = parseFloat(lower);
            if (!isNaN(f)) total += f;
        }
    }
    return total;
}

/**
 * Convert a value and unit to a range of days
 */
function valueUnitToRange(value, unit) {
    const factor = DAYS_PER[unit] || 1;
    if (typeof value === "object" && value.synonymMin != null) {
        const minDays = Math.floor(value.synonymMin * factor);
        const maxDays = Math.ceil(value.synonymMax * factor);
        return { min: minDays, max: maxDays };
    }
    const raw = value * factor;
    return {
        min: Math.floor(raw),
        max: Math.ceil(raw)
    };
}

/**
 * Parse a chunk of text into a range
 */
function parseChunk(chunk) {
    chunk = chunk.trim();

    // Range + unit => e.g. "2-3 weeks"
    let m = chunk.match(/^(.+)-(.+)\s+([a-z]+)$/i);
    if (m) {
        const leftVal  = parseNumericWords(m[1]);
        const rightVal = parseNumericWords(m[2]);
        const unitRaw  = fuzzyUnit(m[3]);
        const leftR  = valueUnitToRange(leftVal,  unitRaw);
        const rightR = valueUnitToRange(rightVal, unitRaw);
        return {
            min: Math.min(leftR.min, rightR.min),
            max: Math.max(leftR.max, rightR.max)
        };
    }

    // Range no unit => "2-3"
    m = chunk.match(/^(.+)-(.+)$/);
    if (m) {
        const leftVal  = parseNumericWords(m[1]);
        const rightVal = parseNumericWords(m[2]);
        const leftR  = valueUnitToRange(leftVal, "days");
        const rightR = valueUnitToRange(rightVal,"days");
        return {
            min: Math.min(leftR.min, rightR.min),
            max: Math.max(leftR.max, rightR.max)
        };
    }

    // Single + unit => "2 weeks"
    m = chunk.match(/^(.+)\s+([a-z]+)$/i);
    if (m) {
        const numericPart = m[1].trim();
        const unitPart    = fuzzyUnit(m[2]);
        const val         = parseNumericWords(numericPart);
        return valueUnitToRange(val, unitPart);
    }

    // Single => interpret as days
    const val = parseNumericWords(chunk);
    if (!val || (typeof val === "number" && val === 0)) {
        return null;
    }
    return valueUnitToRange(val, "days");
}

/**
 * Check if a chunk has no unit
 */
function chunkHasNoUnit(str) {
    return !/[a-z]+$/.test(str.trim());
}

/**
 * Check if a chunk has a unit
 */
function chunkHasUnit(str) {
    return /[a-z]+$/.test(str.trim());
}

/**
 * Extract unit from a chunk
 */
function extractUnit(str) {
    const m = str.trim().match(/[a-z]+$/i);
    return m ? fuzzyUnit(m[0]) : "days";
}

/**
 * Parse input using local rules
 */
function parseLocal(input) {
    if (!input) return null;
    const original = input.trim().toLowerCase();

    // If input is exactly a single known special phrase
    if (SPECIAL_PHRASES[original]) {
        return SPECIAL_PHRASES[original];
    }

    // If input is EXACTLY a single known/fuzzy unit => interpret as "1 unit"
    if (KNOWN_UNITS.includes(original)) {
        const mapped = fuzzyUnit(original);
        const factor = DAYS_PER[mapped] || 1;
        return { min_days: factor, max_days: factor };
    }

    // approximate words
    const approxWords = ["about","around","approximately","approx","nearly","roughly"];
    let isApprox = approxWords.some(w => original.includes(w));

    let isMinimum  = /\bminimum\b/.test(original) || /\bat least\b/.test(original);
    let isMaximum  = /\bmaximum\b/.test(original) || /\bno more than\b/.test(original);
    let isBetween  = /\bbetween\b/.test(original);
    let isFrom     = /\bfrom\b/.test(original);
    let isUpTo     = /\bup to\b/.test(original);

    let working = original;
    // remove approximate words
    for (const w of approxWords) {
        working = working.replace(new RegExp(`\\b${w}\\b`, "gi"), "");
    }
    // remove min/max words
    working = working
        .replace(/\bminimum\b/gi, "")
        .replace(/\bat least\b/gi, "")
        .replace(/\bmaximum\b/gi, "")
        .replace(/\bno more than\b/gi, "");

    // handle "between" / "from" => we specifically check for pattern "^(.*)\band\b(.*)$"
    if (isBetween || isFrom) {
        const match = working.match(/^(.*)\band\b(.*)$/i);
        if (match) {
            const leftChunk  = match[1].trim();
            const rightChunk = match[2].trim();
            const leftVal    = parseChunk(leftChunk);
            const rightVal   = parseChunk(rightChunk);
            if (leftVal && rightVal) {
                // If the left chunk has no explicit unit but the right chunk does => assume same unit for left
                if (chunkHasNoUnit(leftChunk) && chunkHasUnit(rightChunk)) {
                    const rightU = extractUnit(rightChunk);
                    // parse the left again as if it had that unit
                    const forcedLeft = parseChunk(`${leftChunk} ${rightU}`);
                    if (forcedLeft) {
                        leftVal.min = forcedLeft.min;
                        leftVal.max = forcedLeft.max;
                    }
                }
                // combine => min..max
                const finalMin = Math.min(leftVal.min, rightVal.min);
                const finalMax = Math.max(leftVal.max, rightVal.max);
                let totalMin = finalMin;
                let totalMax = finalMax;
                // approximate => ±
                if (isApprox) {
                    const biggerSpan = totalMax - totalMin;
                    const offset = biggerSpan < 10 ? DEFAULT_APPROX_OFFSET : Math.floor(0.2 * biggerSpan);
                    totalMin = Math.max(0, totalMin - offset);
                    totalMax += offset;
                }
                return { min_days: totalMin, max_days: totalMax };
            }
        }
    }

    // "from X to Y" => unify => "X-Y"
    working = working.replace(/\bfrom\b/gi, "").replace(/\bto\b/gi, "-");
    // "up to X" => "1-X"
    if (isUpTo) {
        working = working.replace(/\bup to\b/gi, "1-");
    }
    // remove "of" if we have synonyms => e.g. "couple of days" => "couple days"
    working = working.replace(/\bcouple of\b/gi, "couple");
    working = working.replace(/\bfew of\b/gi, "few");
    working = working.replace(/\bseveral of\b/gi, "several");

    // plus => + 
    working = working.replace(/\bplus\b/gi, "+").replace(/\+/g, " + ");

    // "and" => "+" except if "and a half"
    working = working.replace(/\band\b/gi, (m, off, str) => {
        const tail = str.slice(off, off+8).toLowerCase();
        if (tail.startsWith("and a h") || tail.startsWith("and half")) {
            return m;
        }
        return "+";
    });
    working = working.replace(/\+/g, " + ");

    // unify dash => no spaces
    working = working.replace(/\s*-\s*/g, "-");

    // parse each chunk => sum
    const chunks = working.split("+").map(s => s.trim()).filter(Boolean);

    let totalMin = 0, totalMax = 0;
    for (const c of chunks) {
        const r = parseChunk(c);
        if (!r) return null;
        totalMin += r.min;
        totalMax += r.max;
    }

    // approx => smaller offsets
    if (isApprox) {
        const lastUnitMatch = chunks[chunks.length - 1].match(/[a-z]+$/i);
        const lastUnit = lastUnitMatch ? fuzzyUnit(lastUnitMatch[0]) : "days";
        const off = APPROX_OFFSETS[lastUnit] || DEFAULT_APPROX_OFFSET;
        totalMin = Math.max(0, totalMin - off);
        totalMax += off;
    }

    // "minimum" => offset max
    if (isMinimum) {
        const lastUnitMatch = chunks[chunks.length - 1].match(/[a-z]+$/i);
        const lastUnit = lastUnitMatch ? fuzzyUnit(lastUnitMatch[0]) : "days";
        const off = MINIMUM_OFFSETS[lastUnit] || 2;
        totalMax += off;
    }
    // "maximum" => if totalMin==totalMax => shift min
    if (isMaximum && totalMin === totalMax) {
        const lastUnitMatch = chunks[chunks.length - 1].match(/[a-z]+$/i);
        const lastUnit = lastUnitMatch ? fuzzyUnit(lastUnitMatch[0]) : "days";
        const factor = DAYS_PER[lastUnit] || 1;
        const off = (MAXIMUM_OFFSETS[lastUnit]||1) * factor;
        totalMin = Math.max(0, totalMax - off);
    }

    if (totalMin > totalMax) {
        [totalMin, totalMax] = [totalMax, totalMin];
    }
    return { min_days: totalMin, max_days: totalMax };
}
