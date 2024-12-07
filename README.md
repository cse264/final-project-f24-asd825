# Project Name: IMDB 2.0


## Roles:
* Alexander Docu – Frontend Logic
  * Alex managed the frontend logic, including page serving, routing, and integrating backend data into React components.
*  Turki Alyamani – Also Frontend, with focus on the React interactive UI
  * Turki managed the interactive UI with Vite and React, focusing on responsiveness, maintaining frontend components, and implementing interactive features.
* Mahdi Al Saleem - Backend
  * Mahdi handles everything server-side, including user logins with Express.js, authentication with Passport.js, and managing watchlist queries.
* Hassan Al Maqdoud -- maneging the Database and Deploying it
  * Hassan manages the PostgreSQL database, handling user data, watchlists, and using Neon to host the database for seamless frontend and backend interaction.

## Functionality

* The platform  supports User and Admin accounts. Regular users can sign up to manage their Watchlist, and update profiles. Admins have additional access to edit both user profiles , handling user management.

* We used use a PostgreSQL database to store User Data ( watchlist, account credentials) 

* A React-based interface was used to create a responsive experience, with a Home Page that display trending and top rated movies and watchlist.and a Profile Page and a watchlist page. Admins get dedicated page for managing users. And lastly, a movie page that shows the poster, rating and options to rate and add to the watchlist

* Passport was used to handle authentication. Mantine was used for the React Components. Axios was used to handle fetching more easily

* The TMDB API is used to supply movie data, providing the platform’s database with up-to-date titles, genres, and cast details. 








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
