const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');

const { JWT_SECRET = 'dev-key' } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({}).then((users) => res.send({ users })).catch(() => {
    const err = new Error('Ошибка. Что-то пошло не так');
    err.statusCode = 500;
    next(err);
  });
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  if (userId === 'me') {
    User.findById(req.user._id).then((user) => res.send({ data: user }))
      .catch(() => {
        const err = new Error('Ошибка. Что-то пошло не так');
        err.statusCode = 500;
        next(err);
      });
    return;
  }
  User.findById(userId).orFail(new Error('Not found')).then((user) => res.send({ data: user }))
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Запрашиваемый пользователь не найден');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.name === 'CastError') {
        const err = new Error('Переданы некорректные данные для поиска пользователя');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    if (validator.isEmail(email)) {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.send({
          data: {
            name: user.name, about: user.about, avatar: user.avatar, email: user.email,
          },
        }))
        .catch((e) => {
          if (e.name === 'ValidationError') {
            const err = new Error('Переданы некорректные данные для создания профиля');
            err.statusCode = 400;
            next(err);
            return;
          }
          if (e.name === 'MongoServerError') {
            const err = new Error('Указанный email уже использован');
            err.statusCode = 409;
            next(err);
            return;
          }
          const err = new Error('Ошибка. Что-то пошло не так');
          err.statusCode = 500;
          next(err);
        });
      return;
    } throw new Error('EmailError');
  }).catch(() => {
    const err = new Error('Передан некорректный email');
    err.statusCode = 400;
    next(err);
  });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  }).orFail(new Error('Not found')).then((user) => res.send({ data: user }))
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при обновлении профиля');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  }).orFail(new Error('Not found')).then((user) => res.send({ data: user }))
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при обновлении аватара');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, { httpOnly: true }).send({ message: 'Логин выполнен успешно' });
    })
    .catch((e) => {
      const err = new Error(`${e.message}`);
      err.statusCode = 401;
      next(err);
    });
};
