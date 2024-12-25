import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll use direct Unsplash URLs for reliable, high-quality images
const getImageUrl = (name) => {
  // Map of destinations to specific Unsplash photo IDs
  const imageMap = {
    'Paris': 'photo-1502602898657-3e91760cbb34',
    'Tokyo': 'photo-1540959733332-eab4deabeeaf',
    'New York': 'photo-1522083165195-3424ed129620',
    'London': 'photo-1513635269975-59663e0ac1ad',
    'Rome': 'photo-1552832230-c0197dd311b5',
    'Barcelona': 'photo-1583422409516-2895a77efded',
    'Dubai': 'photo-1512453979798-5ea266f8880c',
    'Singapore': 'photo-1525625293386-3f8f99389edd',
    'Venice': 'photo-1514890547357-a9ee288728e0',
    'Amsterdam': 'photo-1534351590666-13e3e96b5017',
    'Prague': 'photo-1513805959324-96eb66ca8713',
    'Sydney': 'photo-1506973035872-a4ec16b8e8d9',
    'Istanbul': 'photo-1524231757912-21f4fe3a7200',
    'Rio': 'photo-1483729558449-99ef09a8c325',
    'Cairo': 'photo-1572252009286-268acec5ca0a',
    'Athens': 'photo-1503152394-c571994fd383',
    'Bangkok': 'photo-1508009603885-50cf7c579365',
    'Berlin': 'photo-1560969184-10fe8719e047',
    'Moscow': 'photo-1513326738677-b964603b136d',
    'Madrid': 'photo-1539037116277-4db20889f2d4'
  };

  // Find the matching city/destination
  const matchingKey = Object.keys(imageMap).find(key => name.toLowerCase().includes(key.toLowerCase()));
  
  if (matchingKey) {
    return `https://images.unsplash.com/${imageMap[matchingKey]}?auto=format&fit=crop&w=1200&q=80`;
  }
  
  // Default image for destinations without specific matches
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
};

async function verifyAndUpdateDestinations() {
  const destinationsPath = path.join(__dirname, '../src/data/destinations.js');
  const { destinations } = await import('../src/data/destinations.js');
  
  for (const destination of destinations) {
    if (!destination.imageUrl) {
      const imageUrl = getImageUrl(destination.name);
      destination.imageUrl = imageUrl;
      console.log(`✓ Updated image for ${destination.name}`);
    }
  }

  const content = `export const destinations = ${JSON.stringify(destinations, null, 2)};`;
  fs.writeFileSync(destinationsPath, content);
  console.log('Destinations file updated successfully!');
}

verifyAndUpdateDestinations().catch(console.error);
