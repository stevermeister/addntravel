import { touristicTags } from '../data/touristicTags';
import { Tag, PopularTag } from '../types/tag';

/**
 * Get tag suggestions based on location and existing tags
 */
export async function getSuggestedTags(location: string, existingTags: Tag[] = []): Promise<Tag[]> {
  try {
    // Get location-based tags
    const locationWords = location.toLowerCase().split(/[\s,]+/);
    const locationBasedTags = touristicTags.filter((tag) => {
      // Convert tag to readable format
      const readableTag = tag.replace(/-/g, ' ');
      // Check if any location word is related to the tag
      return locationWords.some((word) => readableTag.includes(word) || word.includes(readableTag));
    });

    // Get popular tags that aren't already selected
    const popularTags: PopularTag[] = [
      'culture',
      'food-scene',
      'photography',
      'architecture',
      'historical',
      'nature',
      'shopping',
      'nightlife',
      'art-gallery',
      'local-cuisine',
    ];

    // Combine and filter suggestions
    const suggestions = [...new Set([...locationBasedTags, ...popularTags])]
      .filter((tag) => !existingTags.includes(tag))
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Error getting tag suggestions:', error);
    return [];
  }
}

/**
 * Get local tag suggestions without using AI
 */
export function getLocalTagSuggestions(input: string): Tag[] {
  if (!input) return [];

  const searchTerm = input.toLowerCase();
  return touristicTags
    .filter((tag) => {
      const readableTag = tag.replace(/-/g, ' ');
      return (
        readableTag.includes(searchTerm) ||
        tag.includes(searchTerm) ||
        levenshteinDistance(searchTerm, readableTag) <= 2
      );
    })
    .slice(0, 5);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if a tag might be misspelled and suggest corrections
 */
export async function correctTagSpelling(input: string): Promise<Tag | null> {
  try {
    const searchTerm = input.toLowerCase();
    const matchingTags = touristicTags.filter(
      (tag) =>
        tag.toLowerCase() === searchTerm || levenshteinDistance(searchTerm, tag.toLowerCase()) <= 2,
    );

    if (matchingTags.length > 0) {
      return matchingTags[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error correcting tag spelling:', error);
    return null;
  }
}
