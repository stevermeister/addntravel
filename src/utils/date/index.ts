import { parseWithAI } from './aiDateParser';
import { valueUnitToRange, getSeasonFromDateRange } from './dateConversion';
import { 
    parseNumericWords,
    extractUnit
} from './stringUtils';
import { DayRange, AIModelSessionFactory } from '../../types/date';

/**
 * Parse a chunk of text into a range
 */
function parseChunk(chunk: string): DayRange | null {
    chunk = chunk.trim().toLowerCase();
    
    // Handle special cases
    if (['couple', 'few'].includes(chunk)) {
        return { min_days: 2, max_days: 4 };
    }
    
    // Extract numeric values
    const numbers = chunk.match(/\d+(\.\d+)?/g);
    if (numbers) {
        const values = numbers.map(n => parseFloat(n));
        const unit = extractUnit(chunk) || 'day';
        
        if (values.length === 1) {
            return valueUnitToRange(values[0], unit);
        } else if (values.length === 2) {
            const min = valueUnitToRange(Math.min(...values), unit);
            const max = valueUnitToRange(Math.max(...values), unit);
            if (min && max) {
                return {
                    min_days: min.min_days,
                    max_days: max.max_days
                };
            }
        }
    }
    
    // Try parsing word numbers
    const wordNum = parseNumericWords(chunk);
    if (wordNum !== null) {
        const unit = extractUnit(chunk) || 'day';
        return valueUnitToRange(wordNum, unit);
    }
    
    return null;
}

/**
 * Parse input using local rules
 */
function parseLocal(input: string): DayRange | null {
    if (!input) return null;
    input = input.toLowerCase().trim();
    
    // Split into chunks
    const chunks = input.split(/(?:to|or|[-–—])/);
    if (chunks.length === 0) return null;
    
    // Parse each chunk
    const ranges = chunks.map(chunk => parseChunk(chunk)).filter((r): r is DayRange => r !== null);
    if (ranges.length === 0) return null;
    
    // Combine ranges
    return {
        min_days: Math.min(...ranges.map(r => r.min_days)),
        max_days: Math.max(...ranges.map(r => r.max_days))
    };
}

/**
 * Main function to parse a date period
 */
export async function parseDatePeriod(input: string, aiModelSessionFactory?: AIModelSessionFactory): Promise<DayRange> {
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
    return parseWithAI(input, aiModelSessionFactory);
}

export { getSeasonFromDateRange };
