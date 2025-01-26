#!/usr/bin/env python3
"""
Get top 200 tourist countries using Azure OpenAI.
"""

import asyncio
import json
import os
from pathlib import Path

from openai import AzureOpenAI

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.environ['AZURE_OPENAI_API_KEY'],
    api_version=os.environ['AZURE_OPENAI_API_VERSION'],
    azure_endpoint=os.environ['AZURE_OPENAI_ENDPOINT']
)

async def get_countries() -> list[str]:
    """Get top 200 touristic countries."""
    try:
        print("Sending request to Azure OpenAI...")
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=os.environ['AZURE_OPENAI_DEPLOYMENT_NAME'],
            messages=[{
                "role": "user", 
                "content": "Give me a list of 200 countries in the world that people might want to visit. Include both popular tourist destinations and less-known but interesting countries. Return only a JSON array of country names, nothing else. Example: [\"France\", \"Spain\", \"United States\", ...]"
            }],
            temperature=0.7,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
            
        # Clean the response - remove markdown formatting and handle truncation
        content = content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]  # Remove first line
        if content.endswith('```'):
            content = content.rsplit('\n', 1)[0]  # Remove last line
        if content.startswith('json'):
            content = content.split('\n', 1)[1]  # Remove 'json' line if present
            
        # Handle potential truncation
        if not content.endswith(']'):
            content = content.rsplit(',', 1)[0] + ']'
            
        try:
            countries = json.loads(content)
        except json.JSONDecodeError:
            # Try to clean up any malformed JSON
            content = content.replace('\n', '').replace('  ', '')
            if '",' in content:  # Try to fix truncated response
                content = '[' + ','.join(part for part in content.split('",') if part.strip()) + ']'
                content = content.replace('[,', '[')  # Clean up beginning if needed
            countries = json.loads(content)
            
        if not isinstance(countries, list):
            raise ValueError("Expected a list of country names")
            
        # Save to file
        Path('destination_data').mkdir(exist_ok=True)
        with open('destination_data/countries.json', 'w') as f:
            json.dump(countries, f, indent=2)
            
        return countries
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Full error details: {repr(e)}")
        if 'content' in locals():
            print(f"Raw response: {content}")
        return []

async def main():
    """Main entry point."""
    countries = await get_countries()
    if countries:
        print(f"\nSuccessfully retrieved {len(countries)} countries:")
        for i, country in enumerate(countries, 1):
            print(f"{i}. {country}")
    else:
        print("Failed to retrieve countries")

if __name__ == "__main__":
    asyncio.run(main())
