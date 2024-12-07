# Project Name: IMDB 2.0

## Roles:
* **Alexander Docu** – Frontend Logic
  * Alex managed the frontend logic, including page serving, routing, and integrating backend data into React components.
* **Turki Alyamani** – Frontend, with focus on the React interactive UI
  * Turki managed the interactive UI with Vite and React, focusing on responsiveness, maintaining frontend components, and implementing interactive features.
* **Mahdi Al Saleem** - Backend
  * Mahdi handles everything server-side, including user logins with Express.js, authentication with Passport.js, and managing watchlist queries.
* **Hassan Al Maqdoud** – Managing the Database and Deploying it
  * Hassan manages the PostgreSQL database, handling user data, watchlists, and using Neon to host the database for seamless frontend and backend interaction.

## Functionality/Description

* The platform supports User and Admin accounts. Regular users can sign up to manage their watchlist and update profiles. Admins have additional access to edit both user profiles and handle user management.
* We used a PostgreSQL database to store user data (watchlist, account credentials).
* A React-based interface was used to create a responsive experience, with a home page displaying trending and top-rated movies, watchlist, profile page, and a watchlist page. Admins get a dedicated page for managing users. Lastly, there is a movie page that shows the poster, rating, and options to rate and add to the watchlist.
* Passport was used to handle authentication. Mantine was used for the React components. Axios was used to handle fetching more easily.
* The TMDB API is used to supply movie data, providing the platform’s database with up-to-date titles, genres, and cast details.

## Tech Stack:
* **Frontend:** React - Mantine - Vite
* **Backend:** Node/Express.js - Axios - Passport.js
* **Database:** PostgreSQL with Neon
* **API:** TMDB to fetch movie data

## User Story:
The Movies/TV Shows Platform allows users to sign in or sign up, with an option for admin login. Once logged in, users are directed to the homepage, where they can view trending and top-rated movies, along with their watchlist. A search bar lets users find specific movies, and upon selecting a title, they are taken to the movie page, where they can see movie information, rate it, and add it to their watchlist. Users can manage their watchlist and profile through dedicated pages. Admins have the ability to manage users.

## How to Run the Project:

1. Clone the repo.
2. First, I've included a `.env.example` file with all the necessary API keys and DB connection variables. I know that's not the proper way, but it was done for the Grader's convenience.
3. Rename the `.env.example` file to `.env`.
4. Open two terminals.
5. In the first terminal, go to the project root directory, then to the server directory. Run the command: `npm install`.
6. In the same terminal, run: `npm run dev`.
7. Now, in the second terminal, go to the root directory of the project, then to the client2 directory, then to the vite-project directory.
8. Run `npm install`, then run `npm run dev`.
9. You're done! Open the browser and go to `http://localhost:5173`.

10. admin credentials: email: example@me.com --- Password: 123

## If you want to get your own API key:

1. Go to the TMDB API website: https://developer.themoviedb.org/reference/intro/getting-started.
2. Create a new account.
3. You will be granted an API key along with an Access Token (in the API Reference Page).
4. Replace the `API_KEY` and `ACCESS_TOKEN` found in the `.env.example` with your own.
5. Rename the `.env.example` to `.env` and continue normally.
6. **Note:** Due to some problems with the API (not from our side), the API key that you'll be given may not work. If that is the case, just keep the API key found in the `.env.example` file as it is and change the `ACCESS_TOKEN` with your own only.

## If you want to run the database locally instead of using ours:
**This is NOT recommended as it is a hassle.**

1. When installing PostgreSQL, make sure to install PgAdmin with it (there is a checkbox that you'll encounter when installing PostgreSQL to install PgAdmin).
2. Open PgAdmin and set it up.
3. Create a local database.
4. In the project repo, you will find a SQL file in the DB directory.
5. In PgAdmin, right-click on your database, click restore, and select this SQL file.
6. Congrats! Now you have our database structure running locally.
7. Now, in the `.env.example` file, change the following:
  * `PG_USER`: "your username in PgAdmin"
  * `PG_HOST`: "localhost"
  * `PG_DATABASE`: "your DB name"
  * `PG_PASSWORD`: "your pgAdmin password"











# -------------------------------------------------------------


# Final Project

## Due Last day of Class
## First report due Monday Oct 28, 2024

### Build a web app in a team of 4-5

### Requirements:
* Must have user accounts and different user roles (like user/Admin, free/paid, etc)
* Must use a database (you choose)
* Must have interactive UI (of any kind)
* Must use a library or framework not discussed/used in class
* Must use an outside REST API in some way (Outside as in external, like the Reddit API, etc)

* Feel free to build off other projects and frameworks. For example [https://github.com/sahat/hackathon-starter] is a great starter project that you can build on top of. 

### Instructions
Build your team and write a document describing your application to me by Monday Oct 28, 2024. Email this document to me and the TA for this course (Xinhui Chen xic721@lehigh.edu)  I will approve your web application idea. In your paper, include:
* the name of your application
* Name and roles of all your team members
* its functionality (how does it meet each of the requirements listed above - list each requirement along with your will fulfill it)
* user story/use case (what happens when a user visits your application, what can they do, etc)
* technical design (what is your tech stack)


### Final deliverable due end of the semester:
* Codebase in Github Repo
* README describing your project, with all the information outlined above (team members, application name, description, etc). You will also include detailed instructions of how to install and run your application, and what API keys, databases, etc are needed to run your application.
* Final Presentation and Demo
  * You will prepare a 5 minute presentation and demo of your application in class during the last week of classes
