const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({}).then((cards) => res.send({ data: cards })).catch(() => {
    res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
  });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id }).then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId).then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } },
    { new: true }).then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } },
    { new: true }).then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка.' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
        return;
      } res.status(500).send({ message: 'Ошибка. Что-то пошло не так' });
    });
};
