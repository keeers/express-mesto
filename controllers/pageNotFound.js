module.exports.pageNotFound = (req, res) => {
  if ((req.params !== 'users') || (req.params !== 'cards')) {
    res.status(404).send({ message: 'Ресурс не найден' });
  }
};
