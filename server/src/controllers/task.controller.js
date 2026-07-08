const { readDB, writeDB } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.create = (req, res) => {
  const { userId, userName, title, description, status, createdAt } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  const db = readDB();
  const task = {
    id: uuidv4(),
    userId: String(userId),
    userName: userName || 'Desconocido',
    title: title.trim(),
    description: (description || '').trim(),
    status: status || 'Pendiente',
    createdAt: createdAt || new Date().toLocaleString('es-CO')
  };
  db.tasks.push(task);
  writeDB(db);
  res.status(201).json(task);
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
  const { title, description, status } = req.body;
  const db = readDB();
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Tarea no encontrada' });

  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ message: 'El título no puede estar vacío' });
    db.tasks[idx].title = title.trim();
  }
  if (description !== undefined) {
    db.tasks[idx].description = description.trim();
  }
  if (status !== undefined) {
    db.tasks[idx].status = status;
  }
  writeDB(db);
  res.json(db.tasks[idx]);
};

exports.remove = (req, res) => {
  const db = readDB();
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Tarea no encontrada' });
  db.tasks.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Tarea eliminada correctamente' });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'El estado es obligatorio' });
  const db = readDB();
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Tarea no encontrada' });
  db.tasks[idx].status = status;
  writeDB(db);
  res.json(db.tasks[idx]);
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
  const { status, userId, dateFrom, dateTo } = req.query;
  let { tasks } = readDB();

  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (userId) {
    tasks = tasks.filter(t => {
      if (Array.isArray(t.userIds)) return t.userIds.includes(userId);
      return String(t.userId) === String(userId);
    });
  }
  if (dateFrom) {
    const from = new Date(dateFrom);
    tasks = tasks.filter(t => new Date(t.createdAt) >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    tasks = tasks.filter(t => new Date(t.createdAt) <= to);
  }

  res.json(tasks);
};

exports.getDashboard = (req, res) => {
  const { tasks, users } = readDB();

  const total = tasks.length;
  const completadas = tasks.filter(t => t.status === 'Completada').length;
  const pendientes = tasks.filter(t => t.status === 'Pendiente').length;
  const enProgreso = tasks.filter(t => t.status === 'En progreso').length;

  const porStatus = [
    { status: 'Pendiente', count: pendientes },
    { status: 'En progreso', count: enProgreso },
    { status: 'Completada', count: completadas }
  ];

  const userMap = {};
  tasks.forEach(t => {
    const uid = String(t.userId);
    const uname = t.userName || 'Desconocido';
    if (!userMap[uid]) {
      userMap[uid] = { userId: uid, userName: uname, count: 0 };
    }
    userMap[uid].count++;
  });
  const porUsuario = Object.values(userMap);

  res.json({
    total,
    completadas,
    pendientes,
    enProgreso,
    porStatus,
    porUsuario,
    totalUsuarios: users.length
  });
};
