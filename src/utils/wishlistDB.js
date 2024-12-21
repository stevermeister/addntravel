import Dexie from 'dexie';

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

  // Fallback to localStorage if IndexedDB is not available
  static async createFallbackStorage() {
    const storage = {
      async getAllDestinations() {
        try {
          const data = localStorage.getItem('destinations');
          return data ? JSON.parse(data) : [];
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return [];
        }
      },

      async addDestination(destination) {
        try {
          const destinations = await this.getAllDestinations();
          const newDestination = {
            ...destination,
            id: Date.now(),
            dateAdded: new Date().toISOString()
          };
          destinations.push(newDestination);
          localStorage.setItem('destinations', JSON.stringify(destinations));
          return newDestination.id;
        } catch (error) {
          console.error('Error adding to localStorage:', error);
          throw error;
        }
      },

      async updateDestination(id, updates) {
        try {
          const destinations = await this.getAllDestinations();
          const index = destinations.findIndex(d => d.id === id);
          if (index !== -1) {
            destinations[index] = { ...destinations[index], ...updates };
            localStorage.setItem('destinations', JSON.stringify(destinations));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating in localStorage:', error);
          throw error;
        }
      },

      async deleteDestination(id) {
        try {
          const destinations = await this.getAllDestinations();
          const filtered = destinations.filter(d => d.id !== id);
          localStorage.setItem('destinations', JSON.stringify(filtered));
          return true;
        } catch (error) {
          console.error('Error deleting from localStorage:', error);
          throw error;
        }
      }
    };

    return storage;
  }
}

// Create database instance
const db = new WishlistDatabase();

// Export database instance
export default db;
