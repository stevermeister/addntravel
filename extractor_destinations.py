#!/usr/bin/env python3
"""
Extract travel destinations for each country using Azure OpenAI.
"""

import asyncio
import json
import os
from pathlib import Path
from typing import List, Dict

from openai import AzureOpenAI
from tqdm import tqdm

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.environ['AZURE_OPENAI_API_KEY'],
    api_version=os.environ['AZURE_OPENAI_API_VERSION'],
    azure_endpoint=os.environ['AZURE_OPENAI_ENDPOINT']
)

async def get_destinations(country: str, num_destinations: int) -> List[Dict]:
    """Get travel destinations for a country."""
    try:
        prompt = f"""
        Give me a list of {num_destinations} most interesting tourist destinations in {country}.
        For less known destinations, include hidden gems and unique places.
        Return only a JSON array where each object has:
        - name (string): name of the place
        - city (string): city where it's located
        - type (string): one of [nature, culture, landmark, entertainment]
        - description (string): 2-3 sentences about what makes it special
        Example: [{{"name": "Eiffel Tower", "city": "Paris", "type": "landmark", "description": "Iconic iron lattice tower..."}}]
        """
        
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=os.environ['AZURE_OPENAI_DEPLOYMENT_NAME'],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
            
        # Clean the response
        content = content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
        if content.endswith('```'):
            content = content.rsplit('\n', 1)[0]
        if content.startswith('json'):
            content = content.split('\n', 1)[1]
            
        destinations = json.loads(content)
        if not isinstance(destinations, list):
            raise ValueError("Expected a list of destinations")
            
        return destinations
        
    except Exception as e:
        print(f"\nError getting destinations for {country}: {str(e)}")
        if 'content' in locals():
            print(f"Raw response: {content}")
        return []

async def process_countries():
    """Process all countries and get their destinations."""
    try:
        # Load rankings
        with open('destination_data/country_rankings.json', 'r') as f:
            rankings = json.load(f)
            
        # Calculate total expected destinations
        total_destinations = sum(r['rank'] * 10 for r in rankings)
        
        print(f"\nProcessing {len(rankings)} countries")
        print(f"Will collect approximately {total_destinations} destinations total")
        print("Number of destinations per country will be rank * 10")
        print("Example: rank 10 country = 100 destinations, rank 1 country = 10 destinations")
        
        # Create progress bar
        pbar = tqdm(total=len(rankings), desc="Processing countries")
        
        # Process each country
        all_destinations = []
        for country_data in rankings:
            country = country_data['country']
            rank = country_data['rank']
            num_destinations = rank * 10
            
            print(f"\nGetting {num_destinations} destinations for {country} (Rank: {rank})")
            destinations = await get_destinations(country, num_destinations)
            
            if destinations:
                # Add country and rank to destinations
                for dest in destinations:
                    dest['country'] = country
                    dest['country_rank'] = rank
                
                # Save country destinations
                country_file = f'destination_data/destinations_{country.lower().replace(" ", "_")}.json'
                with open(country_file, 'w') as f:
                    json.dump(destinations, f, indent=2)
                all_destinations.extend(destinations)
            
            pbar.update(1)
            await asyncio.sleep(1)  # Rate limiting
            
        pbar.close()
        
        # Save all destinations
        with open('destination_data/all_destinations.json', 'w') as f:
            json.dump(all_destinations, f, indent=2)
            
        print(f"\nCompleted! Total destinations collected: {len(all_destinations)}")
        print("\nDestinations collected by country rank:")
        rank_counts = {}
        for dest in all_destinations:
            rank = dest['country_rank']
            rank_counts[rank] = rank_counts.get(rank, 0) + 1
        
        for rank in sorted(rank_counts.keys(), reverse=True):
            expected = len([c for c in rankings if c['rank'] == rank]) * rank * 10
            actual = rank_counts[rank]
            print(f"Rank {rank}: {actual} destinations (Expected: {expected})")
        
    except Exception as e:
        print(f"\nError in main process: {str(e)}")
        raise

async def main():
    """Main entry point."""
    Path('destination_data').mkdir(exist_ok=True)
    await process_countries()

if __name__ == "__main__":
    asyncio.run(main())
