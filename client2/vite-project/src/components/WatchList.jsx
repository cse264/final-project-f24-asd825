
import { SimpleGrid, Image, Anchor} from '@mantine/core';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';



  function Card({ image, id}) {
    console.log(image)
    return (
    <Link to={`/movie/${id}`} style={{ display: 'block' }}>
      <Image
      src={`https://image.tmdb.org/t/p/w500${image}`}
      radius="md" 
      width={300}  // Set custom width
      height={200}
      > 
      </Image>
      </Link> 
    );
  }
function WatchList() {
    const fetchUrl = 'http://localhost:5000/watchlist'
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        const fetchMovies = async () => {
          try {
            const res = await axios.get(fetchUrl);
            console.log(res.data)
            setMovies(res.data);    
          } catch (error) {
            console.error("Failed to fetch movies:", error);
          }
        };
        
        fetchMovies();
      }, []);
      
    const slides = movies.map((item) => (
        <div key={item.movieDetails.id} >
          <Card {...{image: item.movieDetails.poster_path, id: item.movieDetails.id}} />
        </div>
      ));
  return (
    <SimpleGrid 
    cols={{ base: 1, sm: 2, lg: 7 }}
    spacing={{ base: 10, sm: 'xl' }}
    verticalSpacing={{ base: 'md', sm: 'xl' }}
       >
        {slides}
    </SimpleGrid>
  );
}

export default WatchList
