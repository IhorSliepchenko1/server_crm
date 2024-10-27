const Router = require(`express`);
const router = new Router();
const expensesController = require(`../controllers/expensesController.js`);
const authMiddleware = require(`../middleware/authMiddleware`);
const checkRoleMiddleware = require(`../middleware/checkRoleMiddleware`);

router.post(`/deposit`, authMiddleware, expensesController.deposit);
router.get(`/`, expensesController.getAll);
// +
router.put(`/:id`, authMiddleware, expensesController.edit);
router.delete(`/:id`, checkRoleMiddleware(`ADMIN`), expensesController.delete);

module.exports = router;

