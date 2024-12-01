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
const saltRounds = 10;
const port = 3000;
env.config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // FRONTEND

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
app.get("/", (req, res) => { //FRONTEND
    if (req.isAuthenticated()) {
        //TODO: fetch the reccomendations for the user
        res.render("home.ejs", { user: req.user });
    } else {
        res.redirect("/register");
    }
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
app.get("/find", async (req, res) => {
  const query = req.query.query;

  if (!query) {
      res.redirect("/");
      return;
  }

  try {
      const data = await searchMovie(query); // Use your searchMovie function
      const movies = data.results || []; // Fallback if no results are returned

      res.render("find.ejs", { movies });
      // res.json(data);
  } catch (error) {
      console.error("Error fetching movie data:", error);
      res.status(500).send("Error fetching movie data.");
  }
});





const getMovieById = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;

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

// the movie page (imdb.com/title/tt1234567)
app.get("/title/:movieId", async (req, res) => {
  const movieId = req.params.movieId;

  if (!movieId) {
      res.redirect("/");
      return;
  }

  try {
      const data = await getMovieById(movieId); // Use your getMovieById function
      // res.json(data);
      res.render("movie.ejs", { movie: data });
  } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).send("Error fetching movie details.");
  }
});


// render the register page
// FRONTEND
app.get("/register", (req, res) => {
    res.render("register.ejs");
}
);

// render the signup page
// FRONTEND
app.get("/register/signup", (req, res) => {
  res.render("signup.ejs");
});


// render the signin page
// FRONTEND
app.get("/register/signin", (req, res) => {
  res.render("signin.ejs");
});




/////////Authentication!\\\\\\\\\\\



// register a new user
app.post("/register/signup", async (req,res) =>{
    const email = req.body.username;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    try{
        const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (checkUser.rows.length > 0){
            req.redirect("/register/signin"); //it may be res.redirect (we will see after testing)
        } else{
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err){
                    console.error("Error hashing password:", err);
                    res.status(500).send("Error hashing password.");
                } else {
                    const result = await db.query(
                        "INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
                        [email, hash, firstName, lastName]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log("User registered:", user);
                        res.redirect("/");
                    });
                }
            })
        }

    } catch (err) {
        console.error("Error registering user:", err);
    }

});



// sign in a user
app.post("/register/signin",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/register/signin",
    })
);



// local strategy (email and password)
passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                return cb(null, user);
              } else {
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );

  // google OAuth strategy TODO:
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          console.log(profile);
          const result = await db.query("SELECT * FROM users WHERE email = $1", [
            profile.email,
          ]);
          if (result.rows.length === 0) {
            const newUser = await db.query(
              "INSERT INTO users (email, password) VALUES ($1, $2)",
              [profile.email, "google"]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
          }
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/register/signin",
    })
  );


  app.get("/register/signout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });


  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });


  ///////////Watchlists\\\\\\\\\\\\


  const getUserIDByEmail = async (email) => {
    return db.query("SELECT id FROM users WHERE email = $1", [email]);
  };

  //get the watchedlist


  app.get("/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      // Use req.user.id instead of req.params to ensure proper ownership of data
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
  
      // Query the user's watched list
      const result = await db.query(
        "SELECT * FROM watchedlist WHERE user_id = $1",
        [userId]
      );
  
      // Send JSON response (or render a frontend page if needed)
      // res.json(result.rows);
      res.render("watchlist.ejs", { watchlist: result.rows }); // FRONTEND
    } catch (err) {
      console.error("Error getting watchedlist:", err);
      res.status(500).send("Error getting watched list.");
    }
  }
  );

  // get movie title by tmdb id
  const getMovieTitle = async (tmdbId) => {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?language=en-US`;

    const options = {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
        }
    };

    try {
        const response = await axios.get(url, options);
        return response.data.title;
    } catch (error) {
        console.error("Error fetching movie data:", error);
    }
};


  //get the wishlist

  app.get("/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      // Use req.user.id instead of req.params to ensure proper ownership of data
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
  
      // Query the user's watched list
      const result = await db.query(
        "SELECT * FROM wishlist WHERE user_id = $1",
        [userId]
      );
  
      // Send JSON response (or render a frontend page if needed)
      // res.json(result.rows);
      res.render("wishlist.ejs", { wishlist: result.rows }); // FRONTEND
    } catch (err) {
      console.error("Error getting wishlist:", err);
      res.status(500).send("Error getting wish list.");
    }
  });

  // Another way in case the first one doesn't work (for the wishlist)

  // app.get("/watchedlist", async (req, res) => {
  //   if (!req.isAuthenticated()) {
  //     res.redirect("/register/signin");
  //     return;
  //   }
  
  //   try {
  //     const email = req.user.email;
  
  //     // Query watchedlist using a JOIN to fetch by email directly
  //     const result = await db.query(
  //       "SELECT w.* FROM watchedlist w JOIN users u ON w.user_id = u.id WHERE u.email = $1",
  //       [email]
  //     );
  
  //     if (result.rows.length === 0) {
  //       res.status(404).send("No wished items found.");
  //       return;
  //     }
  
  //     // Send JSON response (or render EJS)
  //     res.json(result.rows);
  //     // res.render("wishlist.ejs", { watchedlist: result.rows }); // FRONTEND
  //   } catch (err) {
  //     console.error("Error getting wishlist:", err);
  //     res.status(500).send("Error getting wish list.");
  //   }
  // });

  //add a movie to the watchedlist
  app.post("/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/register/signin");
        return;
    }

    try {
        const email = req.user.email;
        const userId = (await getUserIDByEmail(email)).rows[0].id;
        const movieId = req.body.movie_id; // Movie ID sent in the form

        // Insert the movie into the watchlist
        const result = await db.query(
            "INSERT INTO watchedlist (tmdb_id, user_id) VALUES ($1, $2) RETURNING *",
            [movieId, userId]
        );

        res.redirect("/watchlist"); // Redirect back to the watchlist page after adding
    } catch (err) {
        console.error("Error adding movie to watchlist:", err);
        res.status(500).send("Error adding movie to watchlist.");
    }
});


  // if the first one doesn't work (for the watchedlist adding) TODO:


  // add a movie to the wishlist
  app.post("/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const movieId = req.body.movie_id;
  
      const result = await db.query(
        "INSERT INTO wishlist (tmdb_id, user_id) VALUES ($1, $2) RETURNING *",
        [movieId, userId]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error adding movie to wishlist:", err);
      res.status(500).send("Error adding movie to wishlist.");
    }
  });

  // if the first one doesn't work (for the wishlist adding) TODO:


  // remove a movie from the watchedlist
  app.delete("/watchedlist/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const movieId = req.params.movieId;
  
      const result = await db.query(
        "DELETE FROM watchedlist WHERE tmdb_id = $1 AND user_id = $2 RETURNING *",
        [movieId, userId]
      );
  
      if (result.rows.length === 0) {
        res.status(404).send("Movie not found in watchedlist.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error removing movie from watchedlist:", err);
      res.status(500).send("Error removing movie from watchedlist.");
    }
  });

  // Delete a movie from the wishlist
  app.delete("/wishlist/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const movieId = req.params.movieId;
  
      const result = await db.query(
        "DELETE FROM wishlist WHERE tmdb_id = $1 AND user_id = $2 RETURNING *",
        [movieId, userId]
      );
  
      if (result.rows.length === 0) {
        res.status(404).send("Movie not found in wishlist.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error removing movie from wishlist:", err);
      res.status(500).send("Error removing movie from wishlist.");
    }
  });


  // update a movie in the watchedlist
  app.put("/watchedlist/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const movieId = req.params.movieId;
      const rating = req.body.rating;
  
      const result = await db.query(
        "UPDATE watchedlist SET rating = $1 WHERE tmdb_id = $2 AND user_id = $3 RETURNING *",
        [rating, movieId, userId]
      );
  
      if (result.rows.length === 0) {
        res.status(404).send("Movie not found in watchedlist.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error updating movie in watchedlist:", err);
      res.status(500).send("Error updating movie in watchedlist.");
    }
  });

  // update a movie in the wishlist
  app.put("/wishlist/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
  
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const movieId = req.params.movieId;
  
      const result = await db.query(
        "UPDATE wishlist SET tmdb_id = $1 WHERE tmdb_id = $2 AND user_id = $3 RETURNING *",
        [req.body.new_movie_id, movieId, userId]
      );
  
      if (result.rows.length === 0) {
        res.status(404).send("Movie not found in wishlist.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error updating movie in wishlist:", err);
      res.status(500).send("Error updating movie in wishlist.");
    }
  });



  // add movies from letterboxd to the database
  app.post("/letterboxd", async (req, res) =>{
    if (!req.isAuthenticated()) {
      res.redirect("/register/signin");
      return;
    }
    try {
      const email = req.user.email;
      const userId = (await getUserIDByEmail(email)).rows[0].id;
      const letterboxdUser= req.body.letterboxdUser;
      const userURL = `https://letterboxd.com/${letterboxdUser}/films/`;
      console.log(`Starting to scrape movies from: ${userURL}`);
      const movies = await scrapeMovieRatings(userURL);
      console.log('Finished scraping movies.');

      const titles = movies.map(movie => movie.title);

      const ratings = movies.map(movie => {
        const stars = movie.rating.match(/★/g)?.length || 0; // Count full stars
        const halfStar = movie.rating.includes('½') ? 0.5 : 0; // Check for half-star
        return stars + halfStar;
    });

    const tmdbIds = await getAllTmdbIds(titles);


    // adding movies to the database
    await addMoviesToDatabase(tmdbIds, ratings, userId);
    res.status(200).send('Movies added to database successfully.');

      
    }
    catch (error) {
      console.error("Error fetching movie data:", error);
    }

  });

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

async function addMoviesToDatabase(tmdbIds, ratings,user_id) {
  for (let i = 0; i < tmdbIds.length; i++) {
      

      const query = {
          text: `INSERT INTO watchedlist (tmdb_id, rating , user_id) VALUES ($1, $2 , $3)`,
          values: [tmdbIds[i], ratings[i], user_id]
      };

      try {
          await db.query(query); // Await the query execution to handle asynchronous behavior
          console.log(`Movie with TMDB ID: ${tmdbIds[i]} added to watched list.`);
      } catch (error) {
          console.error('Error adding movie to database:', error);
      }
  }
};



/////////Users\\\\\\\\\\\\

// render user profile page

// app.get("/user", async (req, res) => { //FRONTEND
//   if (!req.isAuthenticated()) {
//     res.redirect("/register/signin");
//     return;
//   }
//   // u have acess to req.user.email & password & first_name & last_name & id
//   res.render("profile.ejs", { user: req.user });
// }
// );

// update user profile
app.put("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  try {
    const email = req.user.email;
    const userId = (await getUserIDByEmail(email)).rows[0].id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const result = await db.query(
      "UPDATE users SET first_name = $1, last_name = $2, password = $3 WHERE id = $4 RETURNING *",
      [firstName, lastName, hashedPassword, userId]
    );

    res.json(result.rows[0]);
  }
  catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).send("Error updating user profile.");
  }
}
);

// delete user profile (may need to implement cascade delete for related tables)
app.delete("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const userId = req.user.id; // Use user ID directly if available from middleware

    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId]
    );

    // Handle case where no user was deleted
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found. Unable to delete." });
    }

    // Remove sensitive fields before sending the response
    const { id, email, first_name, last_name } = result.rows[0];
    res.json({ id, email, first_name, last_name });
  } catch (err) {
    console.error("Error deleting user profile:", err);
    res.status(500).json({ error: "An unexpected error occurred while deleting the user profile." });
  }
});

// get user profile
app.get("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  try {
    const userId = req.user.id; // Use user ID directly if available from middleware

    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    // Handle case where no user was found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove sensitive fields before sending the response
    const { id, email, first_name, last_name } = result.rows[0];
    res.json({ id, email, first_name, last_name });
  }
  catch (err) {
    console.error("Error getting user profile:", err);
    res.status(500).json({ error: "An unexpected error occurred while getting the user profile." });
  }
}
);

/////////Admin Only\\\\\\\\\\\\

// get all users
app.get("/admin/users", async (req, res) => {
  if (req.isAuthenticated() && req.user.user_type === "admin") {
    try {
      // Only select necessary fields (e.g., id, name, email, user_type)
      const result = await db.query("SELECT id, email, first_name, last_name, user_type FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error("Error getting all users:", err);
      res.status(500).send("Error getting all users.");
    }
  } else {
    res.status(401).send("Unauthorized. Admin access required.");
  }
});

// get user by id
app.get("/admin/users/:userId", async (req, res) => {
  if (req.isAuthenticated() && req.user.user_type === "admin") {
    try {
      const userId = req.params.userId;
      const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);

      if (result.rows.length === 0) {
        res.status(404).send("User not found.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error getting user by ID:", err);
      res.status(500).send("Error getting user by ID.");
    }
  } else {
    res.status(401).send("Unauthorized. Admin access required.");
  }
}
);

// update user by id
app.put("/admin/users/:userId", async (req, res) => {
  if (req.isAuthenticated() && req.user.user_type === "admin") {
    try {
      const userId = req.params.userId;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const userType = req.body.userType;

      const result = await db.query(
        "UPDATE users SET first_name = $1, last_name = $2, email = $3, user_type = $4 WHERE id = $5 RETURNING *",
        [firstName, lastName, email, userType, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).send("User not found.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error updating user by ID:", err);
      res.status(500).send("Error updating user by ID.");
    }
  } else {
    res.status(401).send("Unauthorized. Admin access required.");
  }
}
);

// delete user by id
app.delete("/admin/users/:userId", async (req, res) => {
  if (req.isAuthenticated() && req.user.user_type === "admin") {
    try {
      const userId = req.params.userId;
      const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId]);

      if (result.rows.length === 0) {
        res.status(404).send("User not found.");
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error("Error deleting user by ID:", err);
      res.status(500).send("Error deleting user by ID.");
    }
  } else {
    res.status(401).send("Unauthorized. Admin access required.");
  }
}
);


  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });