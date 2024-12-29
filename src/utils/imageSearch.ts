export interface ImageSearchResult {
  link: string;
  title: string;
  snippet?: string;
}

const GOOGLE_SEARCH_API_KEY = 'AIzaSyA4K-ifLYl9NBH5m-L2XwRpQ-UGhJ9Lsgc';
const GOOGLE_SEARCH_CX = 'b28797b508c8e4146';

export async function searchImages(query: string): Promise<ImageSearchResult[]> {
  try {
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      key: GOOGLE_SEARCH_API_KEY,
      cx: GOOGLE_SEARCH_CX,
      q: `${query} photo`,
      searchType: 'image',
      num: '10',
      imgSize: 'large',
      imgType: 'photo',
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${baseUrl}?${queryString}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Return all items, the random selection will be done where the function is called
      return data.items.map((item: { link: string; title?: string }) => ({
        link: item.link,
        title: item.title || query,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching image:', error);
    return [];
  }
}
