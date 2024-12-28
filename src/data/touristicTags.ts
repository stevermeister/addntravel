import { Tag } from '../types/tag';

export const touristicTags: Tag[] = [
    // Nature & Outdoors
    'beach', 'mountains', 'hiking', 'skiing', 'surfing', 'diving', 'snorkeling', 'camping', 'wildlife', 'national-park',
    'lake', 'forest', 'desert', 'island', 'waterfall', 'hot-springs', 'volcano', 'reef', 'glacier', 'fjord',
    
    // Cultural
    'historical', 'museum', 'art-gallery', 'architecture', 'castle', 'temple', 'church', 'mosque', 'ruins', 'archaeological',
    'unesco', 'heritage-site', 'traditional', 'local-culture', 'indigenous', 'festivals', 'music', 'theater', 'dance', 'crafts',
    
    // Urban Experience
    'city-break', 'shopping', 'nightlife', 'food-scene', 'cafe-culture', 'street-food', 'markets', 'urban-exploration',
    'photography', 'skyline', 'metro', 'downtown', 'old-town', 'modern', 'cosmopolitan',
    
    // Activities & Sports
    'adventure', 'adrenaline', 'water-sports', 'cycling', 'rock-climbing', 'kayaking', 'sailing', 'golf', 'tennis',
    'horse-riding', 'paragliding', 'zip-lining', 'bungee-jumping', 'rafting', 'canyoning',
    
    // Relaxation & Wellness
    'spa', 'wellness', 'yoga', 'meditation', 'retreat', 'thermal-baths', 'massage', 'detox', 'mindfulness', 'healing',
    
    // Food & Drink
    'gastronomy', 'wine-tasting', 'brewery', 'food-tour', 'cooking-class', 'local-cuisine', 'seafood', 'vegetarian',
    'vegan', 'fine-dining', 'street-food', 'food-market', 'coffee', 'tea', 'cocktails',
    
    // Accommodation Types
    'luxury', 'boutique-hotel', 'resort', 'eco-lodge', 'camping', 'glamping', 'hostel', 'villa', 'apartment',
    'bed-and-breakfast', 'homestay', 'treehouse', 'cabin', 'yacht', 'rural',
    
    // Special Interest
    'photography', 'bird-watching', 'stargazing', 'northern-lights', 'sunset', 'sunrise', 'wildlife-safari',
    'whale-watching', 'botanical', 'geology', 'astronomy', 'archaeology', 'history', 'art', 'architecture',
    
    // Seasonal
    'summer', 'winter', 'spring', 'autumn', 'christmas-market', 'cherry-blossom', 'autumn-foliage', 'winter-sports',
    'summer-festival', 'new-year', 'carnival', 'seasonal', 'off-season', 'peak-season', 'shoulder-season',
    
    // Travel Style
    'family-friendly', 'romantic', 'solo-travel', 'backpacking', 'luxury-travel', 'budget-friendly', 'all-inclusive',
    'adventure-travel', 'eco-tourism', 'sustainable', 'accessible', 'pet-friendly', 'digital-nomad', 'work-friendly',
    
    // Transportation
    'road-trip', 'train-journey', 'cruise', 'ferry', 'scenic-drive', 'bike-friendly', 'walkable', 'public-transport',
    'airport-nearby', 'car-free', 'bike-rental', 'boat-tour', 'scenic-flight', 'helicopter-tour',
    
    // Climate & Weather
    'tropical', 'mediterranean', 'alpine', 'desert-climate', 'temperate', 'sunny', 'mild', 'dry', 'humid',
    'snow', 'rain-forest', 'monsoon', 'year-round', 'microclimate', 'weather-dependent',
    
    // Social & Atmosphere
    'peaceful', 'quiet', 'bustling', 'lively', 'friendly', 'safe', 'romantic', 'family-oriented', 'party',
    'social', 'exclusive', 'authentic', 'touristy', 'undiscovered', 'emerging',
    
    // Practical Considerations
    'budget-friendly', 'expensive', 'mid-range', 'value-for-money', 'all-inclusive', 'self-catering',
    'accessible', 'wheelchair-friendly', 'family-friendly', 'senior-friendly', 'solo-friendly', 'group-friendly',
    
    // Special Features
    'instagram-worthy', 'photogenic', 'scenic-views', 'hidden-gem', 'off-the-beaten-path', 'iconic',
    'bucket-list', 'trending', 'award-winning', 'famous', 'popular', 'exclusive', 'unique', 'authentic',
    
    // Time-based
    'day-trip', 'weekend-getaway', 'short-break', 'long-stay', 'stopover', 'layover', 'multi-day',
    'overnight', 'early-morning', 'late-night', 'sunrise', 'sunset', '24-hour', 'seasonal'
] as const;

// Categories for better organization and suggestions
export const tagCategories: Record<string, Tag[]> = {
    'Nature & Outdoors': ['beach', 'mountains', 'hiking', 'skiing', 'surfing', 'diving', 'snorkeling', 'camping', 'wildlife'],
    'Cultural': ['historical', 'museum', 'art-gallery', 'architecture', 'castle', 'temple', 'church', 'mosque'],
    'Urban Experience': ['city-break', 'shopping', 'nightlife', 'food-scene', 'cafe-culture', 'street-food'],
    'Activities & Sports': ['adventure', 'adrenaline', 'water-sports', 'cycling', 'rock-climbing', 'kayaking'],
    'Relaxation & Wellness': ['spa', 'wellness', 'yoga', 'meditation', 'retreat', 'thermal-baths'],
    'Food & Drink': ['gastronomy', 'wine-tasting', 'brewery', 'food-tour', 'cooking-class', 'local-cuisine'],
    'Special Interest': ['photography', 'bird-watching', 'stargazing', 'northern-lights', 'sunset', 'wildlife-safari'],
    'Travel Style': ['family-friendly', 'romantic', 'solo-travel', 'backpacking', 'luxury-travel', 'budget-friendly']
};
