const Router = require(`express`);
const router = new Router();
const cashRegisterController = require(`../controllers/cashRegisterController`);
const authMiddleware = require(`../middleware/authMiddleware`);
const checkRoleMiddleware = require(`../middleware/checkRoleMiddleware`);

router.post(`/deposit`, authMiddleware, cashRegisterController.deposit);
router.get(`/`, cashRegisterController.getAllPagination);
router.get(`/download-all`, cashRegisterController.downloadFile);
// +
router.put(`/:id`, authMiddleware, cashRegisterController.edit);
router.delete(`/:id`, checkRoleMiddleware(`ADMIN`), cashRegisterController.delete);

module.exports = router;
