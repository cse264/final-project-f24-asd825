import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Burger, Text, Box, Button, Drawer, Autocomplete } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import classes from './HeaderSearch.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure(false);

  const [searchValue, setSearchValue] = useState('');
  const [searchData, setSearchData] = useState([]);


  useEffect(()=>{setSearchValue('')}, [])

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchChange = async (value) => {
    setSearchValue(value);

    if (value.trim().length === 0) {
      setSearchData([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/movies/search?query=${value}`);
      const movies = response.data.results.map((movie) => ({
        value: movie.title, // Displayed in the dropdown
        id: movie.id, // Used for navigation
      }));
      setSearchData(movies);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleOptionSubmit = (value) => {
    const selectedMovie = searchData.find((movie) => movie.value === value);
    if (selectedMovie) {
      navigate(`/movie/${selectedMovie.id}`);
    }
    setSearchValue('');
  };

  const links = [
    { link: '/protected', label: 'Home' },
    { link: '/profile', label: 'Profile' },
    { link: '/watchlist', label: 'WatchList' },
  ];
  if(user && user.user_type === "admin")
    links.push({ link: '/admin', label: 'Admin Page' })
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
            IMDB2.0
          </Text>
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>
          <Box sx={{ position: 'relative', width: '300px' }}>
            <Autocomplete
              value={searchValue}
              onChange={handleSearchChange}
              data={searchData.map((movie) => movie.value)} // Dropdown options
              onOptionSubmit={handleOptionSubmit}
              placeholder="Search movies"
              withScrollArea
              maxDropdownHeight={250}
              limit={5} // Show up to 5 options
              size="md"
            />
          </Box>
          <Group>
            {user ? (
              <>
                <Text>Welcome, {user.first_name}</Text>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="light" onClick={() => navigate('/register')}>
                  Register
                </Button>
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
