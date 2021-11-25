const validator = require('validator');

module.exports.URL = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  } throw new Error('Ошибка валидации URL');
};
