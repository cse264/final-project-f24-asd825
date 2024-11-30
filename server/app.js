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

app.post('/login', (req, res, next) => {
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
  // Return the authenticated user's information
  const fetchUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=692b454954cc64268bd2ce496bd63f1e'
  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    res.json(data.results);
  } catch (error) {
    console.log(error)
    res.status(400).send()
  }
  
});


app.get('/movies/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Return the authenticated user's information
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
    res.status(200)
  } catch (error) {
    console.log(error)
    res.status(400).send()
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
    console.log(moviesWithDetails)
    res.json(moviesWithDetails);
  } catch (error) {
    console.error("Error fetching watchlist or movie details:", error);
    res.status(400).send();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

