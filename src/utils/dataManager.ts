import db from './wishlistDB';
import { Destination } from '../types/destination';

interface WishlistExport {
  version: string;
  exportDate: string;
  destinations: Destination[];
}

interface WishlistBackup {
  version: string;
  timestamp: string;
  data: Destination[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Exports all wishlist data to a JSON file
 */
export async function exportWishlistData(): Promise<boolean> {
  try {
    // Get all destinations from the database
    const destinations: Destination[] = await db.getAllDestinations();

    // Sanitize the data to ensure it matches current structure
    const sanitizedDestinations = destinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      description: dest.description,
      coordinates: dest.coordinates,
      preferredSeasons: dest.preferredSeasons || [],
      tags: dest.tags || [],
      daysRequired: dest.daysRequired,
      estimatedBudget: dest.estimatedBudget,
      imageUrl: dest.imageUrl,
      visitDate: dest.visitDate,
      createdAt: dest.createdAt,
    }));

    // Create a JSON blob
    const jsonData = JSON.stringify(
      {
        version: '1.0',
        exportDate: new Date().toISOString(),
        destinations: sanitizedDestinations,
      },
      null,
      2,
    );

    // Create and trigger download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `wishlist-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export wishlist data');
  }
}

/**
 * Imports wishlist data from a JSON file
 */
export async function importWishlistData(file: File): Promise<boolean> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          if (!event.target?.result) {
            throw new Error('Failed to read file');
          }

          const jsonData = JSON.parse(event.target.result as string) as WishlistExport;

          // Validate the data structure
          const validation = validateImportData(jsonData);
          if (!validation.isValid) {
            throw new Error(validation.error || 'Invalid data format');
          }

          // Import new data using wishlistDB
          await db.importData(JSON.stringify(jsonData.destinations));

          resolve(true);
        } catch (error) {
          console.error('Import error:', error);
          reject(new Error('Failed to import data. Please check the file format and try again.'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read import file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}

/**
 * Creates a backup of the current wishlist data
 */
export async function createBackup(): Promise<boolean> {
  try {
    const destinations: Destination[] = await db.getAllDestinations();
    const backup: WishlistBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: destinations,
    };

    localStorage.setItem('wishlist_backup', JSON.stringify(backup));
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

/**
 * Restores data from a backup
 */
export async function restoreFromBackup(): Promise<boolean> {
  try {
    const backupStr = localStorage.getItem('wishlist_backup');
    if (!backupStr) {
      throw new Error('No backup found');
    }

    const backup = JSON.parse(backupStr) as WishlistBackup;
    await db.clearAllDestinations();
    await db.importData(JSON.stringify(backup.data));

    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error;
  }
}

/**
 * Validates imported data
 */
export function validateImportData(data: unknown): ValidationResult {
  const requiredFields = ['name']; // Only name is truly required

  // Type guard to check if data has the correct structure
  const isWishlistExport = (value: unknown): value is WishlistExport => {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value.version === 'string' &&
      typeof value.exportDate === 'string' &&
      Array.isArray(value.destinations)
    );
  };

  if (!isWishlistExport(data)) {
    return { isValid: false, error: 'Invalid data format' };
  }

  // Convert old format to new format
  data.destinations = data.destinations.map((dest: Partial<Destination>) => {
    const newDest: Destination = {
      ...dest,
      preferredSeasons:
        dest.preferredSeasons ||
        (Object.prototype.hasOwnProperty.call(dest, 'preferredSeason')
          ? [dest['preferredSeason'] as string]
          : []),
      daysRequired:
        typeof dest.daysRequired === 'string'
          ? {
              label: `${dest.daysRequired} days`,
              minDays: parseInt((dest.daysRequired as string).split('-')[0]),
              maxDays: parseInt(
                (dest.daysRequired as string).split('-')[1] || (dest.daysRequired as string),
              ),
            }
          : dest.daysRequired,
    };

    // Remove old fields if they exist using object destructuring
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { preferredSeason: _, ...restDest } = newDest as Destination & {
      preferredSeason?: string;
    };
    return restDest;
  });

  for (const item of data.destinations) {
    for (const field of requiredFields) {
      if (!(field in item)) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }
  }

  return { isValid: true };
}
