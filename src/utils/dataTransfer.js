import { ref, get, set } from 'firebase/database';
import { database, auth } from './firebase';

export const exportDestinations = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const destinationsRef = ref(database, `users/${userId}/destinations`);
    const snapshot = await get(destinationsRef);
    const destinations = snapshot.val() || {};

    const exportData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: destinations
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `addntravel-destinations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting destinations:', error);
    throw error;
  }
};

export const importDestinations = async (file) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target.result);
          
          // Validate the import data structure
          if (!content.version || !content.data) {
            throw new Error('Invalid import file format');
          }

          // Import the destinations
          const destinationsRef = ref(database, `users/${userId}/destinations`);
          await set(destinationsRef, content.data);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error importing destinations:', error);
    throw error;
  }
};
