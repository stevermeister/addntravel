import { ref, set, get, remove, update, child } from 'firebase/database';
import { database, auth } from './firebase';
import { defaultDestinations } from '../data/defaultDestinations';

class WishlistDatabase {
  constructor() {
    this.baseRef = ref(database, 'users');
  }

  getUserRef() {
    if (!auth.currentUser) {
      throw new Error('No user is signed in');
    }
    return child(this.baseRef, `${auth.currentUser.uid}/destinations`);
  }

  // Initialize database with default data
  async initialize() {
    if (!auth.currentUser) {
      throw new Error('No user is signed in');
    }
    await this.seedDatabase();
    return true;
  }

  // Seed database with default destinations
  async seedDatabase() {
    const dbRef = this.getUserRef();
    
    // First clear any existing data
    await set(dbRef, null);
    
    // Then add default destinations
    for (const destination of defaultDestinations) {
      const newRef = child(dbRef, destination.id.toString());
      await set(newRef, {
        ...destination,
        dateAdded: new Date().toISOString()
      });
    }
    return true;
  }

  // Check database health
  async isDatabaseHealthy() {
    try {
      if (!auth.currentUser) return false;
      const dbRef = this.getUserRef();
      await get(dbRef);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Get all destinations
  async getAllDestinations() {
    const dbRef = this.getUserRef();
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) {
      return [];
    }
    return Object.values(snapshot.val());
  }

  // Add a new destination
  async addDestination(destination) {
    const dbRef = this.getUserRef();
    const newRef = child(dbRef, Math.random().toString(36).substring(2, 15));
    const newDestination = {
      ...destination,
      id: newRef.key,
      dateAdded: new Date().toISOString()
    };
    await set(newRef, newDestination);
    return newDestination;
  }

  // Update an existing destination
  async updateDestination(id, updates) {
    const destinationRef = child(this.getUserRef(), id);
    await update(destinationRef, updates);
    return { id, ...updates };
  }

  // Delete a destination
  async deleteDestination(id) {
    const destinationRef = child(this.getUserRef(), id);
    await remove(destinationRef);
    return true;
  }

  // Query destinations
  async queryDestinations(filters = {}) {
    const destinations = await this.getAllDestinations();
    return destinations.filter(dest => {
      let matches = true;
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        matches = matches && (
          dest.name.toLowerCase().includes(query) ||
          dest.description.toLowerCase().includes(query)
        );
      }

      if (filters.season && filters.season !== 'all') {
        matches = matches && dest.preferredSeason === filters.season;
      }

      if (filters.types && filters.types.length > 0) {
        matches = matches && filters.types.includes(dest.type);
      }

      return matches;
    });
  }

  // Filter destinations
  async filterDestinations({ season, types, minBudget, maxBudget }) {
    const destinations = await this.getAllDestinations();
    let filteredDestinations = destinations;

    if (season) {
      filteredDestinations = filteredDestinations.filter(dest => dest.preferredSeason === season);
    }

    if (types && types.length > 0) {
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.tags.some(tag => types.includes(tag))
      );
    }

    if (minBudget !== undefined) {
      filteredDestinations = filteredDestinations.filter(dest => dest.estimatedBudget >= minBudget);
    }

    if (maxBudget !== undefined) {
      filteredDestinations = filteredDestinations.filter(dest => dest.estimatedBudget <= maxBudget);
    }

    return filteredDestinations;
  }

  // Search destinations
  async searchDestinations(query) {
    const destinations = await this.getAllDestinations();
    return destinations.filter(dest => 
      dest.name.toLowerCase().includes(query.toLowerCase()) ||
      dest.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Clear database
  async clearDatabase() {
    const dbRef = this.getUserRef();
    await remove(dbRef);
    return true;
  }

  // Reset to defaults
  async resetToDefaults() {
    await this.clearDatabase();
    await this.seedDatabase();
    return true;
  }

  // Export data
  async exportData() {
    const destinations = await this.getAllDestinations();
    return JSON.stringify(destinations);
  }

  // Import data
  async importData(jsonData) {
    const destinations = JSON.parse(jsonData);
    await remove(this.getUserRef());
    for (const destination of destinations) {
      const id = destination.id || Math.random().toString(36).substring(2, 15);
      const newRef = child(this.getUserRef(), id);
      await set(newRef, {
        ...destination,
        id: id
      });
    }
    return true;
  }

  // Update all 'any' seasons to empty season
  async updateAllAnySeasons() {
    const destinations = await this.getAllDestinations();
    const updates = destinations.filter(dest => dest.preferredSeason === 'any').map(dest => {
      const destinationRef = child(this.getUserRef(), dest.id);
      return update(destinationRef, { preferredSeason: '' });
    });
    await Promise.all(updates);
    console.log(`Updated ${updates.length} destinations from 'any' to empty season`);
    return updates.length;
  }
}

// Create and export a single instance
const wishlistDB = new WishlistDatabase();
export default wishlistDB;
