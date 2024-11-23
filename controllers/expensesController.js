const ApiError = require(`../error/ApiError`);
const { Expenses, TypesExpenses, User, Payment, Balance } = require(`../models/models`);
const uuid = require(`uuid`);
const path = require(`path`);


class ExpensesController {
     async deposit(req, res, next) {
          try {
               const { name, date, sum, typesExpenseId, paymentId } = req.body;
               const paymentName = await Payment.findOne({ where: { id: paymentId } })

               let fileName

               if (req.files) {
                    const { img } = req.files
                    fileName = uuid.v4() + ".jpg"
                    img.mv(path.resolve(__dirname, '..', 'static', fileName))
               } else {
                    fileName = null;
               }

               if (!name || !date || !sum) {
                    next(ApiError.notFound(`Заполните все поля!`));
               }

               const userId = req.user.id;

               const expenses = await Expenses.create({
                    name,
                    date,
                    sum,
                    typesExpenseId,
                    userId,
                    paymentId,
                    img: fileName
               });


               const balance = await Balance.findAll()
               if (balance.length === 0) {
                    await Balance.create({
                         cash: 0,
                         cashless: 0,
                         totalCash: 0,
                    })
               }

               if (paymentName.name === `наличка`) {
                    await Balance.update({
                         cash: parseFloat(balance[0].cash) - parseFloat(sum),
                         totalCash: parseFloat(balance[0].totalCash) - parseFloat(sum),
                    }, { where: { id: balance[0].id } })
               }

               if (paymentName.name === `безнал`) {
                    await Balance.update({
                         cashless: parseFloat(balance[0].cashless) - parseFloat(sum),
                         totalCash: parseFloat(balance[0].totalCash) - parseFloat(sum),
                    }, { where: { id: balance[0].id } })
               }

               return res.status(200).json(expenses);
          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
     async getAll(req, res, next) {
          let { limit, page } = req.query;
          try {
               page = page || 1;
               limit = limit || 20;
               let offset = page * limit - limit;

               const data = await Expenses.findAndCountAll({
                    limit,
                    offset,
                    order: [['date', 'DESC']],
                    include: [
                         { model: User, as: 'user', attributes: ['login'] },
                         { model: TypesExpenses, as: 'typeExpense', attributes: ['name'] },
                         { model: Payment, as: 'paymentsName', attributes: ['name'] }
                    ]
               });

               const arrayResult = {
                    count: data.count,
                    rows: data.rows.map(expense => ({
                         ...expense.dataValues,
                         userName: expense.user ? expense.user.login : 'Неизвестный',
                         typeName: expense.typeExpense ? expense.typeExpense.name : 'Без типа',
                         paymentName: expense.paymentsName ? expense.paymentsName.name : 'Без типа оплаты'
                    }))
               };


               return res.status(200).json(arrayResult);
          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }

     async downloadFile(req, res, next) {
          try {
               const data = await Expenses.findAll({
                    order: [['date', 'DESC']],
               });


               return res.status(200).json(data);

          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }


     async edit(req, res, next) {

          try {
               const { id } = req.params;
               const { name, date, sum, typesExpenseId, paymentId } = req.body;
               const expenses = await Expenses.findOne({ where: { id } })
               const payment = await Payment.findOne({ where: { id: expenses.paymentId } })

               let fileName

               if (req.files) {
                    const { img } = req.files
                    fileName = uuid.v4() + ".jpg"
                    img.mv(path.resolve(__dirname, '..', 'static', fileName))
                    console.log(fileName);
               } else {
                    fileName = null;
               }


               const userId = req.user.id;

               const expensesUpdate = await Expenses.update(
                    {
                         name: name || undefined,
                         date: date || undefined,
                         sum: sum || undefined,
                         typesExpenseId: typesExpenseId === `0` ? undefined : typesExpenseId,
                         userId: userId || undefined,
                         img: fileName || undefined,
                         paymentId: paymentId === `0` ? undefined : paymentId
                    },
                    { where: { id } }
               );


               const balance = await Balance.findAll()
               if (balance.length === 0) {
                    await Balance.create({
                         cash: 0,
                         cashless: 0,
                         totalCash: 0,
                    })
               }

               // когда меняется только сумма
               if (paymentId === `0` && payment.name === `наличка` && parseFloat(sum) !== parseFloat(expenses.sum)) {

                    const difference = parseFloat(sum) - parseFloat(expenses.sum)

                    await Balance.update({
                         cash: parseFloat(balance[0].cash) - difference,
                         totalCash: parseFloat(balance[0].totalCash) - difference,
                    }, { where: { id: balance[0].id } })
               }

               if (paymentId === `0` && payment.name === `безнал` && parseFloat(sum) !== parseFloat(expenses.sum)) {

                    const difference = parseFloat(sum) - parseFloat(expenses.sum)

                    await Balance.update({
                         cashless: parseFloat(balance[0].cashless) - difference,
                         totalCash: parseFloat(balance[0].totalCash) - difference,
                    }, { where: { id: balance[0].id } })
               }

               const newPayment = await Payment.findOne({ where: { id: paymentId } })
               // когда меняется тип оплаты
               if (paymentId !== `0` && payment.id !== paymentId && newPayment.name === `наличка`) {
                    const difference = parseFloat(sum) - parseFloat(expenses.sum)

                    await Balance.update({
                         cash: parseFloat(balance[0].cash) + parseFloat(expenses.sum) - difference,
                         cashless: parseFloat(balance[0].cashless) - parseFloat(expenses.sum),
                         totalCash: parseFloat(balance[0].totalCash) - difference,
                    }, { where: { id: balance[0].id } })
               }

               if (paymentId !== `0` && payment.id !== paymentId && newPayment.name === `безнал`) {
                    const difference = parseFloat(sum) - parseFloat(expenses.sum)

                    await Balance.update({
                         cash: parseFloat(balance[0].cash) - parseFloat(expenses.sum),
                         cashless: parseFloat(balance[0].cashless) + parseFloat(expenses.sum) - difference,
                         totalCash: parseFloat(balance[0].totalCash) - difference,
                    }, { where: { id: balance[0].id } })
               }


               return res.status(200).json(expensesUpdate);
          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
     async delete(req, res, next) {
          const { id } = req.params;

          try {
               const delId = await Expenses.findOne({ where: { id } })
               const { sum, paymentId } = await Expenses.findOne({ where: { id } })
               const { name } = await Payment.findOne({ where: { id: paymentId } })

               if (!delId) {
                    next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
               }


               await Expenses.destroy({ where: { id } });

               const balance = await Balance.findAll()
               if (balance.length === 0) {
                    await Balance.create({
                         cash: 0,
                         cashless: 0,
                         totalCash: 0,
                    })
               }

               if (name === `наличка`) {
                    await Balance.update({
                         cash: parseFloat(balance[0].cash) + parseFloat(sum),
                         totalCash: parseFloat(balance[0].totalCash) + parseFloat(sum),
                    }, { where: { id: balance[0].id } })
               }

               if (name === `безнал`) {
                    await Balance.update({
                         cashless: parseFloat(balance[0].cashless) + parseFloat(sum),
                         totalCash: parseFloat(balance[0].totalCash) + parseFloat(sum),
                    }, { where: { id: balance[0].id } })
               }

               return res.status(200).json(`id: ${id} удалён `);
          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
}
module.exports = new ExpensesController();
