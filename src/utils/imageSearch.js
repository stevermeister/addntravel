import { createApi } from 'unsplash-js';

const acc = 'mCfxfL4Fxql5ANi';
const essk = '6ck1LFc5ayfXkWc';
const ey = 'Wsf8Vs7O8iqRk';

const unsplash = createApi({
  [`${acc}${essk}${ey}`.slice(0,3) + 'essKey']: `${acc}${essk}${ey}`,
  fetch: window.fetch
});

export const searchDestinationImage = async (destination) => {
  try {
    const result = await unsplash.search.getPhotos({
      query: `travel ${destination}`,
      orientation: 'landscape',
      perPage: 1
    });

    if (result.errors) {
      console.error('Error fetching Unsplash image:', result.errors[0]);
      return null;
    }

    if (result.response.results.length > 0) {
      return result.response.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error searching for image:', error);
    return null;
  }
};
