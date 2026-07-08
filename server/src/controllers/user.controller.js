const { readDB } = require('../models');

exports.create = (req, res) => {
  const data = req.body;
  res.status(201).json({ message: 'Pendiente de implementar', data });
};

exports.getAll = (req, res) => {
  const { users } = readDB();
  res.json(users);
};

exports.getById = (req, res) => {
  const { users } = readDB();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

exports.update = (req, res) => {
  const data = req.body;
  res.json({ message: 'Pendiente de implementar', id: req.params.id, data });
};

exports.remove = (req, res) => {
  res.json({ message: 'Pendiente de implementar', id: req.params.id });
};

exports.toggleStatus = (req, res) => {
  const { active } = req.body;
  res.json({ message: 'Pendiente de implementar', id: req.params.id, active });
};
