import wishlistDB from './wishlistDB.js';

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Clear existing data
    await wishlistDB.clearDatabase();
    console.log('Database cleared');
    
    // Seed with default data
    await wishlistDB.seedDatabase();
    console.log('Database seeded with default data');
    
    // Verify data
    const destinations = await wishlistDB.getAllDestinations();
    console.log(`Successfully added ${destinations.length} destinations`);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
