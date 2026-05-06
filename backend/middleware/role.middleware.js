// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = { authorize };
