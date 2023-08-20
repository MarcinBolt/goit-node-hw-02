import passport from 'passport';

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user.token || err) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
        data: 'Unauthorized',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default auth;
