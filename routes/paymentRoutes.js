const Router = require(`express`);
const router = new Router();
const paymentController = require(`../controllers/paymentController`);
const authMiddleware = require(`../middleware/authMiddleware`);
const checkRoleMiddleware = require(`../middleware/checkRoleMiddleware`);

router.post(`/`, paymentController.create);
router.get(`/`, paymentController.getAll);
// +
router.put(`/:id`, paymentController.edit);
router.delete(`/:id`, paymentController.delete);

module.exports = router;
