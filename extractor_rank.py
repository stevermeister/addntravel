#!/usr/bin/env python3
"""
Get travel ranks for countries using Azure OpenAI.
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

async def get_travel_ranks_batch(countries: List[str], reference_countries: Dict[str, int] = None) -> List[Dict]:
    """Get travel rank (1-10) for a batch of countries."""
    try:
        reference_text = ""
        if reference_countries:
            reference_text = "For reference, these countries were previously rated:\n"
            for country, rank in reference_countries.items():
                reference_text += f"- {country}: {rank}/10\n"
        
        prompt = f"""
        Rate these countries based on their tourism popularity on a scale of 1-10 (10 being most popular).
        Consider factors like:
        - Number of international visitors
        - Tourism infrastructure
        - Famous attractions
        - Ease of travel

        {reference_text}
        Countries to rate:
        {', '.join(countries)}
        
        Return only a JSON array where each object has:
        - country (string): country name
        - rank (integer): 1-10 rank
        - reasoning (string): brief explanation of the rank
        
        Be consistent with rankings relative to other countries. A rank of 10 should only be given to the absolute top tourist destinations globally.
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
            
        rankings = json.loads(content)
        if not isinstance(rankings, list):
            raise ValueError("Expected a list of rankings")
            
        return rankings
        
    except Exception as e:
        print(f"\nError getting travel ranks for batch: {str(e)}")
        if 'content' in locals():
            print(f"Raw response: {content}")
        return []

async def process_countries_in_batches(countries: List[str], batch_size: int = 20) -> List[Dict]:
    """Process countries in batches and combine results."""
    all_rankings = []
    reference_countries = {}  # Store some reference countries for consistency
    
    # Process initial batch with well-known countries to establish baseline
    baseline_countries = [
        "France",  # Known for being top tourist destination
        "United States",
        "Spain",
        "China",
        "Italy",
        "United Kingdom",
        "Germany",
        "Mexico",
        "Thailand",
        "Turkey"
    ]
    baseline_countries = [c for c in baseline_countries if c in countries]
    
    if baseline_countries:
        print("\nProcessing baseline countries to establish ranking scale...")
        baseline_rankings = await get_travel_ranks_batch(baseline_countries)
        if baseline_rankings:
            all_rankings.extend(baseline_rankings)
            reference_countries.update({r['country']: r['rank'] for r in baseline_rankings})
            # Remove processed countries
            countries = [c for c in countries if c not in baseline_countries]
    
    # Process remaining countries in batches
    batches = [countries[i:i + batch_size] for i in range(0, len(countries), batch_size)]
    
    with tqdm(total=len(batches), desc="Processing country batches") as pbar:
        for batch in batches:
            rankings = await get_travel_ranks_batch(batch, reference_countries)
            if rankings:
                all_rankings.extend(rankings)
                # Update reference countries with some high and low ranked countries from this batch
                batch_rankings = {r['country']: r['rank'] for r in rankings}
                sorted_ranks = sorted(batch_rankings.items(), key=lambda x: x[1], reverse=True)
                reference_countries.update(dict(sorted_ranks[:2] + sorted_ranks[-2:]))
            await asyncio.sleep(1)  # Rate limiting
            pbar.update(1)
    
    return all_rankings

def normalize_rankings(rankings: List[Dict]) -> List[Dict]:
    """Normalize rankings to ensure consistency."""
    # Get all ranks
    ranks = [r['rank'] for r in rankings]
    min_rank = min(ranks)
    max_rank = max(ranks)
    
    # If ranks are not using full scale (1-10), adjust them
    if min_rank > 1 or max_rank < 10:
        for ranking in rankings:
            # Normalize to 1-10 scale
            ranking['rank'] = round(1 + (ranking['rank'] - min_rank) * 9 / (max_rank - min_rank))
    
    return rankings

async def main():
    """Main entry point."""
    try:
        # Create data directory
        Path('destination_data').mkdir(exist_ok=True)
        
        # Load countries
        with open('destination_data/countries.json', 'r') as f:
            countries = json.load(f)
            
        print(f"\nProcessing {len(countries)} countries in batches...")
        
        # Get rankings in batches
        rankings = await process_countries_in_batches(countries)
        
        if not rankings:
            raise ValueError("Failed to get country rankings")
            
        # Normalize rankings to ensure we use full 1-10 scale
        rankings = normalize_rankings(rankings)
            
        # Sort rankings by rank (descending)
        rankings.sort(key=lambda x: x['rank'], reverse=True)
            
        # Save rankings
        with open('destination_data/country_rankings.json', 'w') as f:
            json.dump(rankings, f, indent=2)
            
        print("\nRankings saved to destination_data/country_rankings.json")
        print("\nRank distribution:")
        rank_counts = {}
        for r in rankings:
            rank_counts[r['rank']] = rank_counts.get(r['rank'], 0) + 1
        for rank in range(10, 0, -1):
            print(f"Rank {rank}: {rank_counts.get(rank, 0)} countries")
            
        print("\nTop 10 tourist countries:")
        for i, country in enumerate(rankings[:10], 1):
            print(f"{i}. {country['country']} (Rank: {country['rank']} - {country['reasoning']}")
            
    except Exception as e:
        print(f"\nError in main process: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
