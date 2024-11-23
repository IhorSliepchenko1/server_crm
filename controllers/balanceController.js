const ApiError = require(`../error/ApiError`);
const { CashRegister, Expenses, Balance } = require(`../models/models`);


class BalanceController {


     async getBalance(req, res, next) {
          try {
               const balance = await Balance.findAll()
               const allExpenses = await Expenses.findAll();

               const { cash, cashless, totalCash } = balance[0]


               let totalExpenses = 0

               if (allExpenses.length > 0) {
                    totalExpenses = allExpenses.map((item) => {
                         return parseFloat(item.sum)
                    }).reduce((acc, item) => acc + item)
               }
               return res.status(200).json({ cash, cashless, totalCash, totalExpenses });
          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }

     async delete(req, res, next) {
          const { id } = req.params;
          try {
               await Balance.destroy({ where: { id } });

               return res.status(200).json(`id: ${id} удалён `);
          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }

     async edit(req, res, next) {
          const balance = await Balance.findAll()
          const { id } = balance[0]
          const { cash, cashless, totalCash } = req.body;

          try {
               if (!cash || !cashless) {
                    return next(ApiError.notFound(`Заполние все поля!`));
               }

               // const totalCash = parseFloat(cash) + parseFloat(cashless)

               const balanceUpdate = await Balance.update(
                    {
                         cash: cash || undefined,
                         cashless: cashless || undefined,
                         totalCash: totalCash || undefined,
                    },
                    { where: { id } }
               );
               return res.status(200).json(balanceUpdate);
          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }

     async transferBalance(req, res, next) {
          const { sum, name } = req.body;
          const balance = await Balance.findAll()
          const { id, cash, cashless } = balance[0]

          try {
               if (!sum || !name) {
                    return next(ApiError.notFound(`Заполние все поля!`));
               }

               //  если НАЛИЧКА то прибавляем к безналичке
               if (name === `наличка`) {

                    if ((parseFloat(cash) - parseFloat(sum)) < 0) {
                         return next(ApiError.badRequest(`Невозможно выполнить перевод измените сумму!`));
                    }

                    const balanceUpdate = await Balance.update(
                         {
                              cash: parseFloat(cash) - parseFloat(sum),
                              cashless: parseFloat(cashless) + parseFloat(sum)
                         },
                         { where: { id } }
                    );
                    return res.status(200).json(balanceUpdate);
               }

               //  если БЕЗНАЛ то прибавляем к НАЛИЧКЕ
               if (name === `безнал`) {

                    if ((parseFloat(cashless) - parseFloat(sum)) < 0) {
                         return next(ApiError.badRequest(`Невозможно выполнить перевод измените сумму!`));
                    }

                    const balanceUpdate = await Balance.update(
                         {
                              cash: parseFloat(cash) + parseFloat(sum),
                              cashless: parseFloat(cashless) - parseFloat(sum)
                         },
                         { where: { id } }
                    );
                    return res.status(200).json(balanceUpdate);
               }

          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }


}

module.exports = new BalanceController();
