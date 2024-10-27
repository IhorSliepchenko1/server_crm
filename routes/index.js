const Router = require(`express`);
const router = new Router();
const userRoutes = require(`./userRoutes.js`);
const cashRegisterRouter = require(`./cashRegisterRouter.js`);
const typeExpensesRoutes = require(`./typeExpensesRoutes.js`);
const expensesRouter = require(`./expensesRouter.js`);
const balanceRouter = require(`./balanceRouter.js`);

router.use(`/user`, userRoutes);
router.use(`/cash-register`, cashRegisterRouter);
router.use(`/balance`, balanceRouter);
router.use(`/type-expenses`, typeExpensesRoutes);
router.use(`/expenses`, expensesRouter);

module.exports = router;
