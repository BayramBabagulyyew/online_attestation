module.exports = (req, res, next) => {
  if (req.session.isUser) {
    return next();
  }
  res.redirect("/test/login");
};
