export interface DateRange {
  startDate: Date;
  endDate: Date;
  availableDays: number;
  seasons: string[];
}

export interface DayRange {
  min_days: number;
  max_days: number;
}

export interface SortOptions {
  criteria: 'dateAdded' | 'name' | 'visitDate';
  direction: 'asc' | 'desc';
}

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export interface UnitRange {
  min: number;
  max: number;
}

export type UnitMap = Record<TimeUnit, UnitRange>;

export interface AIModelSession {
  generateText: (prompt: string) => Promise<string>;
}

export type AIModelSessionFactory = () => Promise<AIModelSession>;
