// server/src/controllers/task.controller.js
const { readDB, writeDB } = require('../models'); 
// Nota: Si writeDB no existe en '../models', asegúrate de que se llame así o importarla correctamente.

exports.create = (req, res) => {
  try {
    const db = readDB();
    const { title, description, assignedUsers } = req.body; 
    // assignedUsers debe venir como un array de objetos desde el frontend: [{id, name}, ...]

    const newTask = {
      id: Math.random().toString(36).substr(2, 9), // Generador simple de ID si no usas librerías
      title,
      description: description || "",
      status: "Pendiente",
      createdAt: new Date().toLocaleString('es-CO'), // Fecha legible
      assignedUsers: assignedUsers || []
    };

    db.tasks.push(newTask);
    writeDB(db);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la tarea', error: error.message });
  }
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
  try {
    const db = readDB();
    const { id } = req.params;
    const taskIndex = db.tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) return res.status(404).json({ message: 'Tarea no encontrada' });

    // Combinamos los datos antiguos con los nuevos del req.body
    db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
    writeDB(db);

    res.json(db.tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error: error.message });
  }
};

exports.remove = (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    const taskExists = db.tasks.some(t => t.id === id);

    if (!taskExists) return res.status(404).json({ message: 'Tarea no encontrada' });

    db.tasks = db.tasks.filter(t => t.id !== id);
    writeDB(db);

    res.json({ message: 'Tarea eliminada con éxito', id });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar', error: error.message });
  }
};

// POST /api/tasks/:taskId/assign (Adaptado de tu assignUsers)
exports.assignUsers = (req, res) => {
  try {
    const db = readDB();
    const { taskId } = req.params;
    const { id, name } = req.body; // Recibe el objeto usuario { id, name }

    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    if (!task.assignedUsers) task.assignedUsers = [];

    const userExists = task.assignedUsers.some(u => u.id === id);
    if (userExists) return res.status(400).json({ message: 'El usuario ya está asignado' });

    task.assignedUsers.push({ id, name });
    writeDB(db);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/tasks/:taskId/users (Adaptado de tu getAssignedUsers)
exports.getAssignedUsers = (req, res) => {
  const { tasks } = readDB();
  const task = tasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  res.json(task.assignedUsers || []);
};

// DELETE /api/tasks/:taskId/users/:userId (Adaptado de tu removeUserAssignment)
exports.removeUserAssignment = (req, res) => {
  try {
    const db = readDB();
    const { taskId, userId } = req.params;
    const task = db.tasks.find(t => t.id === taskId);

    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    if (task.assignedUsers) {
      task.assignedUsers = task.assignedUsers.filter(u => u.id !== userId);
      writeDB(db);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/tasks/:id/status (Adaptado de tu updateStatus)
exports.updateStatus = (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pendiente', 'En progreso', 'Completada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    task.status = status;
    writeDB(db);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users/:userId/tasks (Implementado dentro de filter o como ruta dedicada)
exports.filter = (req, res) => {
  const { tasks } = readDB();
  const { status, priority, userId, dateFrom, dateTo } = req.query;
  
  let filteredTasks = tasks;

  // Filtrar por ID de usuario asignado en el array multiusuario
  if (userId) {
    filteredTasks = filteredTasks.filter(task => 
      task.assignedUsers && task.assignedUsers.some(u => u.id === userId)
    );
  }

  // Filtrar por estado
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }

  res.json(filteredTasks);
};