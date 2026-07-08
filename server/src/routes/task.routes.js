const router = require('express').Router();
const taskController = require('../controllers/task.controller');

router.post('/',                    taskController.create);
router.get('/',                     taskController.getAll);
router.get('/filter',               taskController.filter);
router.get('/:id',                  taskController.getById);
router.put('/:id',                  taskController.update);
router.patch('/:id/status',         taskController.updateStatus);
router.patch('/:id',                taskController.update);
router.delete('/:id',               taskController.remove);
router.post('/:taskId/assign',      taskController.assignUsers);
router.get('/:taskId/users',        taskController.getAssignedUsers);
router.delete('/:taskId/users/:userId', taskController.removeUserAssignment);

module.exports = router;
