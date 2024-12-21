import { ref, set, get, remove, update, child } from 'firebase/database';
import { database } from './firebase.js';
import { defaultDestinations } from '../data/defaultDestinations.js';

class WishlistDatabase {
  constructor() {
    this.dbRef = ref(database, 'destinations');
  }

  // Initialize database with default data if empty
  async initialize() {
    const snapshot = await get(this.dbRef);
    if (!snapshot.exists()) {
      await this.seedDatabase();
    }
    return true;
  }

  // Seed database with default destinations
  async seedDatabase() {
    for (const destination of defaultDestinations) {
      const newRef = child(this.dbRef, destination.id.toString());
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
      await get(this.dbRef);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Get all destinations
  async getAllDestinations() {
    const snapshot = await get(this.dbRef);
    if (!snapshot.exists()) {
      return [];
    }
    return Object.values(snapshot.val());
  }

  // Add a new destination
  async addDestination(destination) {
    const newRef = child(this.dbRef, Date.now().toString());
    const newDestination = {
      ...destination,
      id: Date.now(),
      dateAdded: new Date().toISOString()
    };
    await set(newRef, newDestination);
    return newDestination;
  }

  // Update an existing destination
  async updateDestination(id, updates) {
    const destinationRef = child(this.dbRef, id.toString());
    await update(destinationRef, updates);
    return { id, ...updates };
  }

  // Delete a destination
  async deleteDestination(id) {
    const destinationRef = child(this.dbRef, id.toString());
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
    await remove(this.dbRef);
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
    await remove(this.dbRef);
    for (const destination of destinations) {
      const newRef = child(this.dbRef, destination.id.toString());
      await set(newRef, destination);
    }
    return true;
  }

  // Update all 'any' seasons to empty season
  async updateAllAnySeasons() {
    const destinations = await this.getAllDestinations();
    const updates = destinations.filter(dest => dest.preferredSeason === 'any').map(dest => {
      const destinationRef = child(this.dbRef, dest.id.toString());
      return update(destinationRef, { preferredSeason: '' });
    });
    await Promise.all(updates);
    console.log(`Updated ${updates.length} destinations from 'any' to empty season`);
    return updates.length;
  }
}

// Create and export a single instance
const wishlistDB = new WishlistDatabase();
wishlistDB.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
});
export default wishlistDB;
