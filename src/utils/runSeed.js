import { seedDatabase, initialDestinations } from './seedData';

// Run the seeding process
seedDatabase(initialDestinations)
  .then((success) => {
    if (success) {
      console.log('Database seeded successfully!');
    } else {
      console.error('Failed to seed database');
    }
  })
  .catch((error) => {
    console.error('Error running seed:', error);
  });
