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
        console.log(response.data);
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
        console.log("No movie ID provided");
        return;
    } else {
        try {
            // Await the result of the getMovieById function
            const data = await getMovieById(movieId);
            console.log(data);

            // Send the result back to Postman
            res.json(data);  // Use .json() to send JSON data
        } catch (error) {
            console.log("Error fetching movie data:", error);
            res.status(500).send("Error fetching movie data.");
        }
    }
}
);

// render the register page
app.get("/register", (req, res) => {
    res.render("register.ejs");
}
);

/////////Authentication!\\\\\\\\\\\

// render the signup page
app.get("/register/signup", (req, res) => {
    res.render("signup.ejs");
});

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

// render the signin page
app.get("/register/signin", (req, res) => {
    res.render("signin.ejs");
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
























































  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });