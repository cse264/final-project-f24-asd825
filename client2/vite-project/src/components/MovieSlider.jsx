import { Carousel } from '@mantine/carousel';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useMediaQuery } from '@mantine/hooks';
import { Button, Paper, Title, useMantineTheme, Text } from '@mantine/core';
import classes from './Demo.module.css';
import { Link } from 'react-router-dom';




function Card({ image, title, category }) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
    >
      <div>
        <Text className={classes.category} size="xs">
          {category}
        </Text>
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
      
    </Paper>
  );
}

function Demo() {
  const [movies, setMovies] = useState([]);
  const fetchUrl = 'http://localhost:5000/movies/popular'
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(fetchUrl);
        console.log(res)
        setMovies(res.data);    
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    
    fetchMovies();
  }, []);
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const slides = movies.map((item) => (
    <Carousel.Slide key={item.id}>
    <Link to={`/movie/${item.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <Card {...{
        image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        title: item.title,
        category: item.popularity
      }} />
      </Link>
    </Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize={{ base: '100%', sm: '25%' }}
      slideGap={{ base: 'xl', sm: 7 }}
      align="start"
      slidesToScroll={mobile ? 1 : 2}
    >
      {slides}
    </Carousel>
  );
}

export default Demo

