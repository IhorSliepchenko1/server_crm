const Router = require(`express`);
const router = new Router();
const balanceController = require(`../controllers/balanceController`);

router.get(`/`, balanceController.getBalance);
router.delete(`/:id`, balanceController.delete);
router.put(`/`, balanceController.edit);
router.put(`/transfer`, balanceController.transferBalance);

module.exports = router;
