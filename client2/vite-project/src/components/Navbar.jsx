import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Group, Burger, Autocomplete, Text, Box, Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthContext } from '../context/AuthContext';
import classes from './HeaderSearch.module.css';  // Assuming CSS file is in the same folder

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure(false);
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { link: '/protected', label: 'Home' },
    { link: '/profile', label: 'Profile' },
  ];

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => {
        event.preventDefault();
        navigate(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          <Text
            weight={700}
            size="lg"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: '#1c7ed6' }}
          >
            MyApp
          </Text>
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>
          <Autocomplete
            className={classes.search}
            placeholder="Search"
            data={['React', 'Angular', 'Vue', 'Next.js', 'Riot.js', 'Svelte', 'Blitz.js']}
            visibleFrom="xs"
          />
          <Group>
            {user ? (
              <>
                <Text>Welcome, {user.first_name}</Text>
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
        </Group>
      </div>

      {/* Drawer for mobile menu */}
      <Drawer
        opened={opened}
        onClose={toggle}
        title="Navigation"
        padding="md"
        size="sm"
        hiddenFrom="sm"
      >
        <Group direction="column" spacing="sm">
          {items}
        </Group>
      </Drawer>
    </header>
  );
};

export default Navbar;
