const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.post('/',          userController.create);
router.get('/',           userController.getAll);
router.get('/:id',        userController.getById);
router.put('/:id',        userController.update);
router.delete('/:id',     userController.remove);
router.patch('/:id/status', userController.toggleStatus);

// Importar el controlador de tareas para poder buscar sus tareas asignadas
const taskController = require('../controllers/task.controller');

// Consultar las tareas de un usuario específico -> GET /api/users/{userId}/tasks
router.get('/:userId/tasks', (req, res, next) => {
  req.query.userId = req.params.userId;
  next();
}, taskController.filter);