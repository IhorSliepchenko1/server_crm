const Router = require(`express`);
const router = new Router();
const userController = require(`../controllers/userController`);
const authMiddleware = require(`../middleware/authMiddleware`);
const checkRoleMiddleware = require(`../middleware/checkRoleMiddleware`);

// +
router.post(`/registration`, userController.registration);
router.post(`/login`, userController.login);
router.get(`/check`, authMiddleware, userController.check);
router.get(`/`, authMiddleware, userController.getAll);
router.put(`/:id`, authMiddleware, userController.updateUser);
router.delete(`/:id`, checkRoleMiddleware(`ADMIN`), userController.delete);

module.exports = router;
