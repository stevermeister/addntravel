import Dexie from 'dexie';
import { defaultDestinations } from '../data/defaultDestinations';

class WishlistDatabase extends Dexie {
  constructor() {
    super('WishlistDB');
    
    // Define database schema
    this.version(1).stores({
      destinations: '++id, name, preferredSeason, estimatedBudget, dateAdded, status'
    });

    // Bind the destinations table to this instance
    this.destinations = this.table('destinations');
  }

  // Database Initialization
  async initialize() {
    try {
      // Check if database is empty
      const count = await this.destinations.count();
      
      if (count === 0) {
        console.log('Database is empty, seeding with default data...');
        await this.seedDatabase();
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      // Add timestamp to each destination
      const destinationsWithTimestamp = defaultDestinations.map(dest => ({
        ...dest,
        dateAdded: new Date().toISOString()
      }));

      // Use bulkAdd for better performance
      await this.destinations.bulkAdd(destinationsWithTimestamp);
      console.log('Database seeded successfully');
      return true;
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  // Check database health
  async isDatabaseHealthy() {
    try {
      await this.destinations.count();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // CRUD Operations
  async getAllDestinations() {
    try {
      return await this.destinations.toArray();
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  async addDestination(destination) {
    try {
      const id = await this.destinations.add({
        ...destination,
        dateAdded: new Date().toISOString()
      });
      return id;
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  }

  async updateDestination(id, updates) {
    try {
      await this.destinations.update(id, updates);
      return true;
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  }

  async deleteDestination(id) {
    try {
      await this.destinations.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting destination:', error);
      throw error;
    }
  }

  // Query Operations
  async searchDestinations(query) {
    try {
      return await this.destinations
        .filter(dest => 
          dest.name.toLowerCase().includes(query.toLowerCase()) ||
          dest.description.toLowerCase().includes(query.toLowerCase())
        )
        .toArray();
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  async filterDestinations({ season, types, minBudget, maxBudget }) {
    try {
      let collection = this.destinations;

      if (season) {
        collection = collection.filter(dest => dest.preferredSeason === season);
      }

      if (types && types.length > 0) {
        collection = collection.filter(dest => 
          dest.tags.some(tag => types.includes(tag))
        );
      }

      if (minBudget !== undefined) {
        collection = collection.filter(dest => dest.estimatedBudget >= minBudget);
      }

      if (maxBudget !== undefined) {
        collection = collection.filter(dest => dest.estimatedBudget <= maxBudget);
      }

      return await collection.toArray();
    } catch (error) {
      console.error('Error filtering destinations:', error);
      return [];
    }
  }

  // Database Management
  async clearDatabase() {
    try {
      await this.destinations.clear();
      return true;
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  async resetToDefaults() {
    try {
      await this.clearDatabase();
      await this.seedDatabase();
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

  // Backup and Restore
  async exportData() {
    try {
      const destinations = await this.getAllDestinations();
      return JSON.stringify(destinations);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData) {
    try {
      const destinations = JSON.parse(jsonData);
      await this.destinations.clear();
      await this.destinations.bulkAdd(destinations);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Create database instance
const db = new WishlistDatabase();

// Initialize database
db.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
});

// Export database instance
export default db;
