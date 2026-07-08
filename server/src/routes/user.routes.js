const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.post('/',          userController.create);
router.get('/',           userController.getAll);
router.get('/:userId/tasks', userController.getUserTasks);
router.get('/:id',        userController.getById);
router.put('/:id',        userController.update);
router.delete('/:id',     userController.remove);
router.patch('/:id/status', userController.toggleStatus);

module.exports = router;
