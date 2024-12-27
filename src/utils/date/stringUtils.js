/**
 * String manipulation utilities for date parsing
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i-1] === b[j-1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j-1][i] + 1,
                matrix[j][i-1] + 1,
                matrix[j-1][i-1] + cost
            );
        }
    }
    
    return matrix[b.length][a.length];
}

/**
 * Parse numeric words into numbers
 */
export function parseNumericWords(str) {
    const numberWords = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
        'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
        'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };

    str = str.toLowerCase().trim();
    if (numberWords.hasOwnProperty(str)) return numberWords[str];
    
    const parts = str.split(/[\s-]+/);
    let total = 0;
    
    for (let part of parts) {
        if (numberWords.hasOwnProperty(part)) {
            total += numberWords[part];
        }
    }
    
    return total || null;
}

/**
 * Check if a chunk has no unit
 */
export function chunkHasNoUnit(str) {
    return /^[\d.-]+$/.test(str.trim());
}

/**
 * Check if a chunk has a unit
 */
export function chunkHasUnit(str) {
    return /\b(day|week|month|year)s?\b/i.test(str);
}

/**
 * Extract unit from a chunk
 */
export function extractUnit(str) {
    const match = str.match(/\b(day|week|month|year)s?\b/i);
    return match ? match[1].toLowerCase() : null;
}
