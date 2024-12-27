import React, { useRef } from 'react';
import { ref, get, push } from 'firebase/database';
import { database, auth } from '../utils/firebase';

const sampleData = {
  "version": 1,
  "timestamp": "2024-12-21T16:49:09.000Z",
  "data": {
    "-NqXyZ1": {
      "name": "Paris",
      "description": "The City of Light, known for its art, culture, and iconic landmarks",
      "preferredSeason": "spring",
      "tags": ["city", "culture"],
      "daysRequired": "4-7",
      "estimatedBudget": 2000,
      "dateAdded": "2024-12-21T16:49:09.000Z",
      "imageUrl": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
    },
    "-NqXyZ2": {
      "name": "Bali",
      "description": "Tropical paradise with beautiful beaches and rich culture",
      "preferredSeason": "summer",
      "tags": ["beach", "cultural"],
      "daysRequired": "7-14",
      "estimatedBudget": 1500,
      "dateAdded": "2024-12-21T16:49:09.000Z",
      "imageUrl": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop"
    },
    "-NqXyZ3": {
      "name": "Swiss Alps",
      "description": "Perfect for winter sports and mountain adventures",
      "preferredSeason": "winter",
      "tags": ["mountain", "adventure"],
      "daysRequired": "5-10",
      "estimatedBudget": 3000,
      "dateAdded": "2024-12-21T16:49:09.000Z",
      "imageUrl": "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=2070&auto=format&fit=crop"
    }
  }
};

const DataTransfer = () => {
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      const destinationsRef = ref(database, `users/${userId}/destinations`);
      const snapshot = await get(destinationsRef);
      const rawData = snapshot.val() || {};
      
      // Ensure each destination has an imageUrl field
      const data = Object.keys(rawData).reduce((acc, key) => {
        acc[key] = {
          ...rawData[key],
          imageUrl: rawData[key].imageUrl || ''  // Ensure imageUrl exists
        };
        return acc;
      }, {});
      
      const exportData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `addntravel-destinations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting destinations:', error);
      alert('Failed to export destinations. Please try again.');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      const content = await file.text();
      const importData = JSON.parse(content);
      
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import file format');
      }

      const destinationsRef = ref(database, `users/${userId}/destinations`);
      
      // Import each destination
      for (const [key, destination] of Object.entries(importData.data)) {
        await push(destinationsRef, {
          ...destination,
          dateAdded: destination.dateAdded || new Date().toISOString()
        });
      }

      alert('Destinations imported successfully!');
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Error importing destinations:', error);
      alert('Failed to import destinations. Please check the file format and try again.');
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSampleData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      const destinationsRef = ref(database, `users/${userId}/destinations`);
      
      // Import each sample destination
      for (const destination of Object.values(sampleData.data)) {
        await push(destinationsRef, {
          ...destination,
          dateAdded: new Date().toISOString() // Use current timestamp
        });
      }

      alert('Sample destinations loaded successfully!');
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Failed to load sample data. Please try again.');
    }
  };

  return (
    <>
      <input
        type="file"
        id="import-input"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />
      <button
        id="export-button"
        onClick={handleExport}
        className="hidden"
      />
      <button
        id="load-sample-button"
        onClick={loadSampleData}
        className="hidden"
      />
    </>
  );
};

export default DataTransfer;
