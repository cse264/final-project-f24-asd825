import e from 'express';
import  scrapeMovieRatings  from '../features/scrapeMovieRating.js';
import { query } from '../db/connectPostgres.js';

const apiRoutes = (app) => {
    app.get('/films/:username', async(req, res, next) => {
        try {
            const filmID = req.params.username
            const data = await scrapeMovieRatings(filmID)
            res.json(data)
        } catch (err) {
          next(err);
        }
      });


      app.get('/', async(req, res, next) => {
        try {
     
            let qs = `
            SELECT * FROM users`;
          const result = await query(qs);
      
          // send json of result
          res.status(200).json(result.rows);
        } catch (err) {
          next(err);
        }
      });
}
export default apiRoutes
