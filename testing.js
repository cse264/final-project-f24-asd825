import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import axios from "axios";
import scrapeMovieRatings from './letterboxd.js';
 



const app = express();
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // FRONTEND

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
      rejectUnauthorized: false
    }
  });
  db.connect();

  app.get("/", async (req, res) => {
    const userUrl = 'https://letterboxd.com/mrsiko12/films/';
    console.log(`Starting to scrape movies from: ${userUrl}`);
    const movies = await scrapeMovieRatings(userUrl);
    console.log('Finished scraping movies.');
    // res.json(movies);

    const titles = movies.map(movie => movie.title);
    console.log(titles);

    const ratings = movies.map(movie => {
        const stars = movie.rating.match(/★/g)?.length || 0; // Count full stars
        const halfStar = movie.rating.includes('½') ? 0.5 : 0; // Check for half-star
        return stars + halfStar;
    });

    console.log(ratings);

    const tmdbIds = await getAllTmdbIds(titles);
    const max = 10; // Replace with your desired maximum value
    


    
    // adding movies to the database
 
    await addMoviesToDatabase(tmdbIds, ratings);
    res.status(200).send('Movies added to database successfully.');


  

    });



    const searchMovie = async (movieName) => {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&include_adult=true&language=en-US&page=1`;
    
        const options = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        };
    
        try {
            const response = await axios.get(url, options);
            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching movie data:", error);
        }
    };



const getAllTmdbIds = async (titles) => {
    const cleanTitle = (title) => title.replace(/\s*\(\d{4}\)$/, '').trim();
    let tmdbIds = [];
    for (const title of titles) {
        console.log(cleanTitle(title));
        const movieData = await searchMovie(cleanTitle(title));
        if (movieData.results.length > 0) {
            console.log(movieData.results[0].id);
            tmdbIds.push(movieData.results[0].id);
        }
    }
    return tmdbIds;
};

// Assuming 'db' is your database client and 'tmdbIds' and 'ratings' are arrays
const maxUserId = 100; // Define max range for random user_id (e.g., 100 users)

async function addMoviesToDatabase(tmdbIds, ratings) {
    for (let i = 0; i < tmdbIds.length; i++) {
        // Generate a random user_id between 1 and maxUserId (inclusive)
        const randomUserId = Math.floor(Math.random() * maxUserId) + 1;

        const query = {
            text: `INSERT INTO watchedlist (tmdb_id, rating , user_id) VALUES ($1, $2 , $3)`,
            values: [tmdbIds[i], ratings[i], randomUserId]
        };

        try {
            await db.query(query); // Await the query execution to handle asynchronous behavior
            console.log(`Movie with TMDB ID: ${tmdbIds[i]} added to watched list.`);
        } catch (error) {
            console.error('Error adding movie to database:', error);
        }
    }
}




















  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });