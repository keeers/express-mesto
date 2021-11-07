const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({}).then((users) => res.send({ users })).catch(() => {
    res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
  });
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar }).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  }).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
        return;
      } if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  }).then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
        return;
      } if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};
