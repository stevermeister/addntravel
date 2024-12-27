import db from './wishlistDB';

/**
 * Exports all wishlist data to a JSON file
 */
export async function exportWishlistData() {
  try {
    // Get all destinations from the database
    const destinations = await db.getAllDestinations();
    
    // Create a JSON blob
    const jsonData = JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      destinations
    }, null, 2);
    
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
export async function importWishlistData(file) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          // Validate the data structure
          const validation = validateImportData(jsonData);
          if (!validation.isValid) {
            throw new Error(validation.error);
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
export async function createBackup() {
  try {
    const destinations = await db.getAllDestinations();
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: destinations
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
export async function restoreFromBackup() {
  try {
    const backupStr = localStorage.getItem('wishlist_backup');
    if (!backupStr) {
      throw new Error('No backup found');
    }
    
    const backup = JSON.parse(backupStr);
    await db.clearDatabase();
    await db.destinations.bulkAdd(backup.data);
    
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error;
  }
}

/**
 * Validates imported data
 */
export function validateImportData(data) {
  const requiredFields = ['name', 'description', 'estimatedBudget', 'preferredSeason', 'daysRequired'];
  
  // Check if data has the correct structure
  if (!data.version || !data.exportDate || !data.destinations) {
    return { isValid: false, error: 'Invalid data format' };
  }

  if (!Array.isArray(data.destinations)) {
    return { isValid: false, error: 'Destinations must be an array' };
  }
  
  for (const item of data.destinations) {
    for (const field of requiredFields) {
      if (!(field in item)) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }
  }
  
  return { isValid: true };
}
