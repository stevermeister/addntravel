import { ref, set, get, remove, update, child, DatabaseReference } from 'firebase/database';
import { database, auth } from './firebase';
import { defaultDestinations } from '../data/defaultDestinations';
import { Destination } from '../types/destination';

class WishlistDatabase {
  private baseRef: DatabaseReference;

  constructor() {
    this.baseRef = ref(database, 'users');
  }

  private getUserRef(): DatabaseReference {
    if (!auth.currentUser) {
      throw new Error('No user is signed in');
    }
    return child(this.baseRef, `${auth.currentUser.uid}/destinations`);
  }

  // Initialize database with default data
  async initialize(): Promise<boolean> {
    if (!auth.currentUser) {
      throw new Error('No user is signed in');
    }
    await this.seedDatabase();
    return true;
  }

  // Seed database with default destinations
  private async seedDatabase(): Promise<void> {
    const dbRef = this.getUserRef();

    // First clear any existing data
    await set(dbRef, null);

    // Then add each default destination
    for (const destination of defaultDestinations) {
      const newId = destination.id || crypto.randomUUID();
      const newRef = child(dbRef, String(newId));
      await set(newRef, {
        ...destination,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Add a new destination
  async addDestination(destination: Omit<Destination, 'id'>): Promise<string> {
    const dbRef = this.getUserRef();
    const newId = crypto.randomUUID();
    const newRef = child(dbRef, String(newId));

    await set(newRef, {
      ...destination,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newId;
  }

  // Get a specific destination by ID
  async getDestination(id: string): Promise<Destination | null> {
    const dbRef = child(this.getUserRef(), id);
    const snapshot = await get(dbRef);
    return snapshot.val() as Destination | null;
  }

  // Get all destinations
  async getAllDestinations(): Promise<Destination[]> {
    const dbRef = this.getUserRef();
    const snapshot = await get(dbRef);
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data).map(([id, dest]) => ({
      id,
      ...(dest as Omit<Destination, 'id'>),
    }));
  }

  // Update a destination
  async updateDestination(
    id: string,
    updates: Partial<Omit<Destination, 'id' | 'createdAt'>>,
  ): Promise<void> {
    const dbRef = child(this.getUserRef(), id);
    await update(dbRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Delete a destination
  async deleteDestination(id: string): Promise<void> {
    const dbRef = child(this.getUserRef(), id);
    await remove(dbRef);
  }

  // Clear all destinations
  async clearAllDestinations(): Promise<void> {
    const dbRef = this.getUserRef();
    await set(dbRef, null);
  }

  // Import data from a JSON string
  async importData(jsonData: string): Promise<void> {
    const destinations = JSON.parse(jsonData) as Destination[];
    const dbRef = this.getUserRef();

    // Clear existing data
    await set(dbRef, null);

    // Import new destinations
    for (const destination of destinations) {
      const newId = destination.id || crypto.randomUUID();
      const newRef = child(dbRef, String(newId));
      await set(newRef, {
        ...destination,
        id: newId,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

// Create and export a single instance
const wishlistDB = new WishlistDatabase();
export default wishlistDB;
