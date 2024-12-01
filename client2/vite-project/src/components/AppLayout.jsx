import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Box, Container, Button, Title, Group, Center, Stack, Paper } from '@mantine/core';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box>
      {/* Always render the CustomNavbar */}
      {(location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') && <Navbar />}

      {/* Conditionally render content for root path */}
      {location.pathname === '/' ? (
        <Container size="xs" mt={40}>
          <Center>
            <Paper padding="xl" radius="md" shadow="xl" style={{ width: '100%' }}>
              <Stack align="center">
                <Title order={1} size={40} color="blue" mb={20}>Welcome</Title>

                <Group position="center" spacing="xl">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/login')} 
                    style={{ width: '150px' }}
                  >
                    Login
                  </Button>

                  <Button 
                    size="lg" 
                    variant="light" 
                    onClick={() => navigate('/register')} 
                    style={{ width: '150px' }}
                  >
                    Register
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Center>
        </Container>
      ) : (
        <Outlet />
      )}
    </Box>
  );
};

export default AppLayout;
