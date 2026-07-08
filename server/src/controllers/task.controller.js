const { readDB } = require('../models');

exports.create = (req, res) => {
  const data = req.body;
  res.status(201).json({ message: 'Pendiente de implementar', data });
};

exports.getAll = (req, res) => {
  const { tasks } = readDB();
  res.json(tasks);
};

exports.getById = (req, res) => {
  const { tasks } = readDB();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.json(task);
};

exports.update = (req, res) => {
  const data = req.body;
  res.json({ message: 'Pendiente de implementar', id: req.params.id, data });
};

exports.remove = (req, res) => {
  res.json({ message: 'Pendiente de implementar', id: req.params.id });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  res.json({ message: 'Pendiente de implementar', id: req.params.id, status });
};

exports.assignUsers = (req, res) => {
  const { userIds } = req.body;
  res.json({ message: 'Pendiente de implementar', taskId: req.params.taskId, userIds });
};

exports.getAssignedUsers = (req, res) => {
  res.json({ message: 'Pendiente de implementar', taskId: req.params.taskId });
};

exports.removeUserAssignment = (req, res) => {
  res.json({ message: 'Pendiente de implementar', taskId: req.params.taskId, userId: req.params.userId });
};

exports.filter = (req, res) => {
  const { status, priority, userId, dateFrom, dateTo } = req.query;
  res.json({ message: 'Pendiente de implementar', filters: { status, priority, userId, dateFrom, dateTo } });
};
