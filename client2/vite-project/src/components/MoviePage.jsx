import {
    Image,
    Text,
    Title,
    Container,
    SimpleGrid,
    Rating,
    Button,
  } from '@mantine/core';
  import React, { useState, useEffect  } from 'react';
  import axios from 'axios';
  import {useParams} from 'react-router-dom'
   
  function MoviePage() {
    // State for the watchlist button and rating
    const { id } = useParams();
    const [movie, setMovie] = useState({});
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [rating, setRating] = useState(2.5);

    const fetchUrl = `http://localhost:5000/movies/${id}`
    const watchListUrl = `http://localhost:5000/watchlist/${id}`
    useEffect(() => {
        const fetchMovies = async () => {
          try {
            const watchlist = await axios.get(watchListUrl);
            const res = await axios.get(fetchUrl);
            console.log(res)
            if (watchlist.data){
              setIsInWatchlist(true)
              setRating(watchlist.data.rating)
            }
            setMovie(res.data);    
          } catch (error) {
            console.error("Failed to fetch movies:", error);
          }
        };
        
        fetchMovies();
      }, []);
  
    // Function to handle button click (add/remove from watchlist)
    const handleWatchlistClick = async () => {
      try {
        if (isInWatchlist) {
          // If the item is already in the watchlist, send a DELETE request to remove it
          const response = await axios.delete(`http://localhost:5000/watchlist/${id}`);
          
          if (response.status === 200) {
            setIsInWatchlist(false); // Update state to reflect removal
          } else {
            console.error('Error removing from watchlist:', response);
          }
        } else {
          // If the item is not in the watchlist, send a POST request to add it
          const response = await axios.post(`http://localhost:5000/watchlist/${id}`, { rating });
    
          if (response.status === 200) {
            setIsInWatchlist(true); // Update state to reflect addition
          } else {
            console.error('Error adding to watchlist:', response);
          }
        }
      } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error making request to watchlist:', error);
      }
    };
  
    return (
      <Container
        style={{
          borderRadius: '16px',
          padding: '20px',
          backgroundColor: '#141517',
          margin: '10px',
          color: 'white',
        }}
      >
        <SimpleGrid
          cols={2}
          spacing="lg"
          breakpoints={[
            { maxWidth: 768, cols: 1 }, // Switch to single-column layout on smaller screens
          ]}
          style={{ alignItems: 'center' }} // Vertically align items
        >
          {/* Image with Gray Border */}
          <div
            style={{
              maxWidth: '200px',
              margin: '0 auto',
              border: '1px solid gray', // Gray border around the image
              borderRadius: '8px', // Rounded corners for the border
              padding: '5px', // Optional padding between image and border
            }}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              radius="md"
              fit="contain" // Ensures the full image is visible
              
            />
          </div>
  
          {/* Text with Title */}
          <div>
            <Text size="xl" variant="gradient" gradient={{ from: 'gray', to: 'rgba(184, 171, 171, 1)', deg: 360 }}>
              {movie.title}
            </Text>
            <Text>
              {movie.overview}
            </Text>
  
            {/* Rating Component */}
            <div style={{ marginTop: '20px' }}>
              <Text size="sm" c="dimmed">Rating:</Text>
              <Rating
                value={rating}
                onChange={setRating}
                fractions={2} // Allow for decimal ratings
                size="lg"
              />
            </div>
  
            {/* Button to Add/Remove from Watchlist */}
            <Button
              onClick={handleWatchlistClick}
              style={{
                marginTop: '20px',
                backgroundColor: isInWatchlist ? '#630118' : '#0a3302',
                color: 'white',
              }}
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </SimpleGrid>
      </Container>
    );
  }
  
  export default MoviePage;
  