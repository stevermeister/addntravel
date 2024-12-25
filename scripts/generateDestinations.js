import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinations = [
  // Famous Cities
  {
    name: "Paris, France",
    tags: ["city-break", "culture", "food-scene", "architecture", "art-gallery", "historical"]
  },
  {
    name: "Tokyo, Japan",
    tags: ["city-break", "modern", "food-scene", "culture", "shopping", "technology"]
  },
  {
    name: "New York City, USA",
    tags: ["city-break", "shopping", "culture", "food-scene", "art-gallery", "nightlife"]
  },
  // Natural Wonders
  {
    name: "Grand Canyon, USA",
    tags: ["nature", "hiking", "photography", "national-park", "adventure"]
  },
  {
    name: "Great Barrier Reef, Australia",
    tags: ["nature", "diving", "snorkeling", "marine-life", "beach"]
  },
  // Historical Sites
  {
    name: "Petra, Jordan",
    tags: ["historical", "archaeological", "unesco", "culture", "desert"]
  },
  {
    name: "Machu Picchu, Peru",
    tags: ["historical", "hiking", "archaeological", "unesco", "mountains"]
  },
  // Islands & Beaches
  {
    name: "Maldives",
    tags: ["beach", "luxury", "diving", "romantic", "island"]
  },
  {
    name: "Santorini, Greece",
    tags: ["island", "beach", "romantic", "luxury", "photography"]
  },
  // Add more destinations here...
];

// Generate more destinations programmatically
const countries = [
  "Italy", "Spain", "Germany", "United Kingdom", "Thailand", "Vietnam", "Morocco", 
  "Egypt", "South Africa", "Brazil", "Mexico", "Canada", "India", "China", 
  "New Zealand", "Indonesia", "Turkey", "Greece", "Croatia", "Portugal"
];

const cities = [
  "Rome", "Barcelona", "Berlin", "London", "Bangkok", "Hanoi", "Marrakech",
  "Cairo", "Cape Town", "Rio de Janeiro", "Mexico City", "Vancouver", "Mumbai",
  "Beijing", "Auckland", "Bali", "Istanbul", "Athens", "Dubrovnik", "Lisbon"
];

const landmarks = [
  "Colosseum", "Sagrada Familia", "Brandenburg Gate", "Big Ben", "Grand Palace",
  "Ha Long Bay", "Hassan II Mosque", "Pyramids", "Table Mountain", "Christ the Redeemer",
  "Chichen Itza", "Niagara Falls", "Taj Mahal", "Great Wall", "Milford Sound",
  "Borobudur", "Hagia Sophia", "Parthenon", "Diocletian's Palace", "Belem Tower"
];

// Combine cities and countries
cities.forEach((city, index) => {
  destinations.push({
    name: `${city}, ${countries[index]}`,
    tags: ["city-break", "culture", "food-scene", 
           Math.random() > 0.5 ? "historical" : "modern",
           Math.random() > 0.5 ? "shopping" : "architecture",
           Math.random() > 0.5 ? "nightlife" : "art-gallery"]
  });
});

// Add landmarks
landmarks.forEach((landmark, index) => {
  destinations.push({
    name: `${landmark}, ${countries[index]}`,
    tags: ["historical", "culture", "photography",
           Math.random() > 0.5 ? "architecture" : "archaeological",
           Math.random() > 0.5 ? "unesco" : "heritage-site"]
  });
});

// Write to file
const destinationsPath = path.join(__dirname, '../src/data/destinations.js');
const content = `export const destinations = ${JSON.stringify(destinations, null, 2)};`;
fs.writeFileSync(destinationsPath, content);
console.log('Generated destinations file successfully!');
