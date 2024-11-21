import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
// import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import axios from "axios";

const app = express();
const port = 3000;
env.config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

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

// renders the home page
app.get("/", (req, res) => {

    // TODO: fetch the reccomendations from the model.
    res.render("home.ejs");
});

// function to search for a movie
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
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching movie data:", error);
    }
};


// the find page (imdb.com/find?query=wonderwoman)
// the find page (imdb.com/find?query=wonderwoman)
app.get("/find", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        res.redirect("/");
        console.log("No query provided");
        return;
    } else {
        try {
            // Await the result of the searchMovie function
            const data = await searchMovie(query);
            console.log(data);

            // Send the result back to Postman
            res.json(data);  // Use .json() to send JSON data
        } catch (error) {
            console.log("Error fetching movie data:", error);
            res.status(500).send("Error fetching movie data.");
        }
    }
});



















































  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });