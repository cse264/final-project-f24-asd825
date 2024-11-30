// config/passport.js
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { query } from '../db/connectPostgres.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const res = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = res.rows[0];
      if (!user) {
        console.log('Incorrect email.' )
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Incorrect password.' )
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log("done")
      return done(null, user);
    } catch (err) {
        console.log("err")
      return done(err);
    }
  }
));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwtPayload, done) => {
    try {
      const res = await query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
      const user = res.rows[0];
      console.log("wtf", user?true:false, user)
      if (user) {
        console.log("11212")
        return done(null, user);
      } else {
        console.log("2")
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  }
));

export default passport;
