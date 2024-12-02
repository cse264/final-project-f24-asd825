// server.js
import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import passport from './config/passport.js';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import logger from 'morgan'
import jwt from 'jsonwebtoken';
import cors from 'cors';  // Import cors
import { query } from './db/connectPostgres.js';
import axios from 'axios';



// NOTE: there is almost NO input validation. If you wrote a duplicate email, it will pass
// TMDB api is exposed too 
const app = express();
app.use(logger('dev'));
// Update cors configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],  // Allow multiple origins
  credentials: true  // Allows sending cookies from the client
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await query('INSERT INTO users (first_name, last_name, email, password, user_type) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, email, hashedPassword, 'user']);
    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    });
  })(req, res);
});
// server.js
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err });
    }   
    res.json({ message: 'Logged out successfully!' });
  });
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Return the authenticated user's information
  res.json({ user: req.user });
});
// Geta popular movies using  TMDB api
app.get('/movies/popular', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const fetchUrl = 'https://api.themoviedb.org/3/trending/movie/week?language=en-US'
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTJiNDU0OTU0Y2M2NDI2OGJkMmNlNDk2YmQ2M2YxZSIsIm5iZiI6MTczMjc1ODE0MS40OCwic3ViIjoiNjc0N2NhN2QzNzliMDNhOWYxZDA1MTlhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.gmnqlSF7lsQkorFgFQfpwgOcfs2eqH25R-mQOy9ygew',
      },
    };
    const response = await fetch(fetchUrl, options);
    const data = await response.json();
    console.log(data)
    res.json(data.results);
  } catch (error) {
    console.log(error)
    res.status(400).send()
  }
  
});


app.get('/movies/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { query } = req.query; // Extract 'query' parameter from the request

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTJiNDU0OTU0Y2M2NDI2OGJkMmNlNDk2YmQ2M2YxZSIsIm5iZiI6MTczMjc1ODE0MS40OCwic3ViIjoiNjc0N2NhN2QzNzliMDNhOWYxZDA1MTlhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.gmnqlSF7lsQkorFgFQfpwgOcfs2eqH25R-mQOy9ygew',
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Error from TMDB: ${response.statusText}` });
    }

    const data = await response.json();

    // Filter out movies with duplicate titles (Mantine search doesnt accept duplicate values. It can be fixed by including some dummy values (e.g id) and hiding it but I cba)
    const uniqueMovies = [];
    const titlesSet = new Set();

    for (const movie of data.results) {
      if (!titlesSet.has(movie.title)) {
        uniqueMovies.push(movie);
        titlesSet.add(movie.title);
      }
    }

    res.json({ results: uniqueMovies }); // Return filtered results
  } catch (error) {
    console.error('Error fetching data from TMDB:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/movies/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const id = req.params.id
  console.log(id)
  const fetchUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=692b454954cc64268bd2ce496bd63f1e`
  try {
    console.log(fetchUrl)
    const response = await fetch(fetchUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(400).send()
  }
  
});








app.post('/watchlist/:tmdb_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Return the authenticated user's information
  const movieId = req.params.tmdb_id
  const userId = req.user.id
  const rating = req.body.rating
  try {
    const result = await query("INSERT INTO watchedlist (tmdb_id, rating, user_id) VALUES ($1, $2, $3) RETURNING *",
        [movieId, rating, userId])
    res.status(200).send()
  } catch (error) {
    console.log(error)
    res.status(400).send()
  }
  
});

app.delete('/watchlist/:tmdb_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Get the movie ID from the URL and user ID from the authenticated user
  const movieId = req.params.tmdb_id;
  const userId = req.user.id;

  try { 
    // Perform the DELETE operation on the database
    const result = await query(
      "DELETE FROM watchedlist WHERE tmdb_id = $1 AND user_id = $2 RETURNING *", 
      [movieId, userId]
    );
    
    // If no record was found and deleted, return a 404
    if (result.rowCount === 0) {
      return res.status(404).send('Movie not found in the watchlist.');
    }

    // Send a success response
    res.status(200).send('Movie removed from the watchlist.');
  } catch (error) {
    console.log(error);
    res.status(400).send('An error occurred while removing the movie.');
  }
});



// Note: Movie table should include all necessary information for each movie, but I don't think it is configured to include it
app.get('/watchlist', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch the user's watchlist from the database
    const result = await query("SELECT * FROM watchedlist WHERE user_id = $1", [userId]);
    const watchlist = result.rows;

    // If watchlist is empty, return early
    if (!watchlist.length) {
      return res.json([]);
    }

    // Function to fetch movie details from TMDB API
    const fetchMovieDetails = async (tmdb_id) => {
      const apiUrl = `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=692b454954cc64268bd2ce496bd63f1e`;
      try {
        const response = await axios.get(apiUrl);
        return response.data; // Return the movie details
      } catch (error) {
        console.error(`Failed to fetch movie details for TMDB ID ${tmdb_id}:`, error.message);
        return null; // Return null for any failed fetches
      }
    };

    // Fetch movie details concurrently for all watchlist items
    const moviesWithDetails = await Promise.all(
      watchlist.map(async (item) => {
        const movieDetails = await fetchMovieDetails(item.tmdb_id);
        return {
          movieDetails, // Include the movie details in the response
        };
      })
    );

    // Filter out any null results due to failed fetches
    res.json(moviesWithDetails);
  } catch (error) {
    console.error("Error fetching watchlist or movie details:", error);
    res.status(400).send();
  }
});

app.get('/watchlist/:tmdb_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.tmdb_id;

  try {
    // Fetch the user's watchlist from the database
    const result = await query("SELECT * FROM watchedlist WHERE user_id = $1 AND tmdb_id = $2", [userId, movieId]);
    const watchlist = result.rows;
    res.json(watchlist[0])

  
  } catch (error) {
    console.error("Error fetching watchlist or movie details:", error);
    res.status(400).send();
  }
});


// get all users
app.get("/admin/users",  passport.authenticate('jwt', { session: false }),  async (req, res) => {
  if (req.user.user_type === "admin") {
    try {
      // Only select necessary fields (e.g., id, name, email, user_type)
      const result = await query("SELECT id, email, first_name, last_name, user_type FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error("Error getting all users:", err);
      res.status(500).send("Error getting all users.");
    }
  } else {
    res.status(401).send("Unauthorized. Admin access required.");
  }
});


app.put('/admin/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.user_type === "admin") {
    const { id } = req.params;
    const { email, first_name, last_name, user_type } = req.body;
    
    try {
      const result = await query(
        `UPDATE users SET email = $1, first_name = $2, last_name = $3, user_type = $4 WHERE id = $5 RETURNING *`,
        [email, first_name, last_name, user_type, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).send('User not found.');
      }
      res.status(200).send('User updated.');
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user.');
    }
  } else {
    res.status(401).send('Unauthorized. Admin access required.');
  }
});


app.delete('/admin/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.user_type === "admin") {
    const { id } = req.params;
    
    try {
      const result = await query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
      if (result.rowCount === 0) {
        return res.status(404).send('User not found.');
      }
      res.status(200).send('User deleted.');
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user.');
    }
  } else {
    res.status(401).send('Unauthorized. Admin access required.');
  }
});




// Get profile
app.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id; 
    const result = await query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
app.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id; 
    const { first_name, last_name, email } = req.body; 

    // Validate inputs 
    if (!email || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, first_name, last_name, email',
      [first_name, last_name, email, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

