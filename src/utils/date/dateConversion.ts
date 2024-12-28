import { TimeUnit, UnitMap, DayRange } from '../../types/date';
import { levenshteinDistance } from './stringUtils';

/**
 * Date conversion utilities
 */

const UNITS: UnitMap = {
    day: { min: 1, max: 1 },
    week: { min: 7, max: 7 },
    month: { min: 28, max: 31 },
    year: { min: 365, max: 366 }
};

/**
 * Convert a value and unit to a range of days
 */
export function valueUnitToRange(value: number, unit: TimeUnit): DayRange | null {
    if (!UNITS[unit]) return null;
    
    const { min, max } = UNITS[unit];
    return {
        min_days: Math.round(value * min),
        max_days: Math.round(value * max)
    };
}

/**
 * Fuzzy match a unit string to a known unit
 */
export function fuzzyUnit(u: string | null): TimeUnit | null {
    if (!u) return null;
    u = u.toLowerCase();
    
    // Direct match
    if (u in UNITS) return u as TimeUnit;
    
    // Remove trailing 's'
    if (u.endsWith('s') && (u.slice(0, -1) in UNITS)) {
        return u.slice(0, -1) as TimeUnit;
    }
    
    // Find closest match
    let minDistance = Infinity;
    let bestMatch: TimeUnit | null = null;
    
    for (const unit of Object.keys(UNITS) as TimeUnit[]) {
        const distance = levenshteinDistance(u, unit);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = unit;
        }
    }
    
    return minDistance <= 2 ? bestMatch : null;
}

/**
 * Get the season from a date range
 */
export function getSeasonFromDateRange(startDate: Date | string, endDate: Date | string): string {
    const seasons: Record<string, number[]> = {
        winter: [12, 1, 2],
        spring: [3, 4, 5],
        summer: [6, 7, 8],
        autumn: [9, 10, 11]
    };

    const startMonth = new Date(startDate).getMonth() + 1;
    const endMonth = new Date(endDate).getMonth() + 1;

    for (const [season, months] of Object.entries(seasons)) {
        if (months.includes(startMonth) && months.includes(endMonth)) {
            return season;
        }
    }

    return 'any';
}
