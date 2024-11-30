import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Group, Button, Text, Box } from '@mantine/core';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  console.log(12)
  return (
    <Box
      sx={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      {/* Logo */}
      <Text weight={700} size="lg" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        MyApp
      </Text>

      {/* Conditional Buttons */}
      <Group>
        {user ? (
          <>
            <Text>Welcome, {user.firstName}</Text>
            {location.pathname !== '/protected' && (
              <Button variant="default" onClick={() => navigate('/protected')}>
                Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            {location.pathname !== '/login' && (
              <Button variant="default" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
            {location.pathname !== '/register' && (
              <Button variant="light" onClick={() => navigate('/register')}>
                Register
              </Button>
            )}
          </>
        )}
      </Group>
    </Box>
  );
};

export default Navbar;
