import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Center, Title, Card, SimpleGrid, Divider } from '@mantine/core';
import Demo from './MovieSlider'; // Movie slider component
import WatchList from './WatchList'; // Watchlist component

const Protected = () => {
  const { user } = useContext(AuthContext);

  return (
    <Container size="xl" style={{ marginTop: '20px', marginBottom: '40px' }}>
      {/* User's Header */}
      <Center>
        <Title
          order={2}
          style={{
            color: '#fff',
            fontSize: '28px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Welcome back, {user?.firstName || 'Movie Enthusiast'}!
        </Title>
      </Center>

      {/* Popular Movies Section */}
      <Card
        shadow="md"
        radius="lg"
        style={{
          backgroundColor: '#1a1b1e',
          color: '#fff',
          padding: '20px',
          marginBottom: '30px',
        }}
      >
        <Title
          order={3}
          style={{
            color: '#e0e0e0',
            marginBottom: '15px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '8px',
          }}
        >
          Trending Movies
        </Title>
        <Demo />
      </Card>

      {/* Watchlist Section */}
      <Card
        shadow="md"
        radius="lg"
        style={{
          backgroundColor: '#1a1b1e',
          color: '#fff',
          padding: '20px',
        }}
      >
        <Title
          order={3}
          style={{
            color: '#e0e0e0',
            marginBottom: '15px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '8px',
          }}
        >
          Your Watchlist
        </Title>
        <WatchList />
      </Card>
    </Container>
  );
};

export default Protected;
