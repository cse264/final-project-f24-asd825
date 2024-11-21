const axios = require('axios');

// Function to search for a movie by name
const searchMovie = async (movieName) => {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&include_adult=false&language=en-US&page=1`;

  const options = {
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer YOUR_API_KEY' // Use your actual TMDB API key here
    }
  };

  try {
    const response = await axios.get(url, options);
    console.log(response.data); // Logs the search results from the TMDB API
  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
};

// Example usage: search for the movie "war"
searchMovie('war');
