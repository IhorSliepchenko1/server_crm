const Router = require(`express`);
const router = new Router();
const typeExpensesController = require(`../controllers/typeExpensesController`);
const authMiddleware = require(`../middleware/authMiddleware`);
const checkRoleMiddleware = require(`../middleware/checkRoleMiddleware`);

router.post(`/`, authMiddleware, typeExpensesController.create);
router.get(`/`, typeExpensesController.getAll);
// +
router.put(`/:id`, authMiddleware, typeExpensesController.edit);
router.delete(`/:id`, checkRoleMiddleware(`ADMIN`), typeExpensesController.delete);

module.exports = router;
