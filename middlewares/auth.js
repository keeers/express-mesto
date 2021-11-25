const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'dev-key' } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    const err = new Error('Что-то не так с токеном авторизации');
    err.statusCode = 401;
    next(err);
    return;
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    const err = new Error('Необходима авторизация');
    err.statusCode = 403;
    next(err);
  }
  req.user = payload;
  next();
};
