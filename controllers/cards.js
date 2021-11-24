const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({}).then((cards) => res.send({ data: cards })).catch(() => {
    const err = new Error('Ошибка. Что-то пошло не так');
    err.statusCode = 500;
    next(err);
  });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id }).then((card) => res.send({ data: card }))
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при создании карточки');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId).orFail(new Error('Not found')).then((card) => {
    const cardOwner = JSON.stringify(card.owner);
    const userId = req.user._id;
    if (cardOwner.includes(userId)) {
      Card.findByIdAndRemove(cardId).then((deletingCard) => res.send({ data: deletingCard }));
      return;
    } throw new Error('No permission');
  })
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Запрашиваемая карточка не найдена');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.message === 'No permission') {
        const err = new Error('Вы не можете удалить чужую карточку');
        err.statusCode = 403;
        next(err);
        return;
      }
      if (e.name === 'CastError') {
        const err = new Error('Переданы некорректные данные при удалении карточки');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } },
    { new: true }).orFail(new Error('Not found')).then((card) => res.send({ data: card }))
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Запрашиваемая карточка не найдена');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.name === 'CastError') {
        const err = new Error('Переданы некорректные данные для постановки лайка на карточке');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } },
    { new: true }).orFail(new Error('Not found')).then((card) => res.send({ data: card }))
    .catch((e) => {
      if (e.message === 'Not found') {
        const err = new Error('Запрашиваемая карточка не найдена');
        err.statusCode = 404;
        next(err);
        return;
      }
      if (e.name === 'CastError') {
        const err = new Error('Переданы некорректные данные для снятия лайка на карточке');
        err.statusCode = 400;
        next(err);
        return;
      }
      const err = new Error('Ошибка. Что-то пошло не так');
      err.statusCode = 500;
      next(err);
    });
};
