export default (req, res, next) => {
  if (req.body.admin && req.body.password === process.env.ADMIN_PASS) {
    next();
  } else {
    return res.json(null);
  }
};
