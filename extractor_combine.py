#!/usr/bin/env python3
"""
Combine all destination files into a single clean JSON file.
"""

import json
from pathlib import Path
from typing import Dict, List

def clean_destination(dest: Dict) -> Dict:
    """Clean a destination entry by removing unnecessary fields and ensuring required fields."""
    return {
        'name': dest['name'],
        'city': dest['city'],
        'country': dest['country'],
        'type': dest['type'],
        'description': dest['description']
    }

def combine_destinations():
    """Combine all destination files into one clean file."""
    data_dir = Path('destination_data')
    all_destinations = []
    destination_files = list(data_dir.glob('destinations_*.json'))
    
    print(f"Found {len(destination_files)} destination files")
    
    # Track statistics
    countries_processed = set()
    type_counts = {}
    
    for file_path in sorted(destination_files):
        try:
            with open(file_path, 'r') as f:
                destinations = json.load(f)
                
            # Clean and add destinations
            clean_destinations = [clean_destination(dest) for dest in destinations]
            all_destinations.extend(clean_destinations)
            
            # Update statistics
            country = clean_destinations[0]['country'] if clean_destinations else None
            if country:
                countries_processed.add(country)
            
            for dest in clean_destinations:
                dest_type = dest['type']
                type_counts[dest_type] = type_counts.get(dest_type, 0) + 1
                
        except Exception as e:
            print(f"Error processing {file_path.name}: {str(e)}")
    
    # Save combined file
    output_file = data_dir / 'destinations.json'
    with open(output_file, 'w') as f:
        json.dump(all_destinations, f, indent=2)
    
    # Print statistics
    print(f"\nProcessed {len(countries_processed)} countries")
    print(f"Total destinations: {len(all_destinations)}")
    print("\nDestinations by type:")
    for dest_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(all_destinations)) * 100
        print(f"{dest_type}: {count} ({percentage:.1f}%)")
    
    print(f"\nCombined file saved to {output_file}")

if __name__ == "__main__":
    combine_destinations()
