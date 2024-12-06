import React, { useContext } from 'react';
import { Container, Center, Title, Card} from '@mantine/core';
import WatchList from './WatchList'; // Watchlist component

const WatchListPage = () => {

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
          WatchList
        </Title>
      </Center>


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

export default WatchListPage;
