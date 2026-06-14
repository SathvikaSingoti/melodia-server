const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const apiUrlRaw = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
const apiUrl = apiUrlRaw.startsWith('http') ? apiUrlRaw : `https://${apiUrlRaw}`;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${apiUrl}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email: email,
          username: profile.displayName || email.split('@')[0],
          avatarUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          password: 'google-oauth-placeholder' // We need a password field due to schema if it's required, or the schema might not require it.
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
