const ApiError = require(`../error/ApiError`);
const { CashRegister, Balance } = require(`../models/models`);

class CashRegisterController {
  async deposit(req, res, next) {
    const { cash, cashless, date } = req.body;
    const { id } = req.user

    try {
      if (cash < 0 || cashless < 0) {
        return next(ApiError.notFound(`Значения не могу быть меньше нуля!`));
      }

      if (!cash || !cashless || !date) {
        return next(ApiError.notFound(`Заполние все поля!`));
      }


      const checkDudleDate = await CashRegister.findOne({ where: { date } })

      if (checkDudleDate) {
        return next(ApiError.badRequest(`За эту дату касса внесена!`));
      }

      const totalCash = parseFloat(cash) + (parseFloat(cashless) - (parseFloat(cashless) / 100) * 1.3);
      const cashlessAct = (parseFloat(cashless) - (parseFloat(cashless) / 100) * 1.3)
      // СОЗДАНИЕ БАЛАНСА

      const cashRegister = await CashRegister.create({
        cash,
        cashless: cashlessAct,
        date,
        totalCash,
        userId: id,
      });

      const balance = await Balance.findAll()
      if (balance.length === 0) {
        await Balance.create({
          cash: 0,
          cashless: 0,
          totalCash: 0,
        })
      }

      const newBalanceCash = parseFloat(balance[0].cash) + parseFloat(cash)
      const newBalanceCashless = parseFloat(balance[0].cashless) + parseFloat(cashlessAct)
      const newBalanceTotalCash = newBalanceCash + newBalanceCashless

      await Balance.update({
        cash: newBalanceCash,
        cashless: newBalanceCashless,
        totalCash: newBalanceTotalCash,
      }, { where: { id: balance[0].id } })

      return res.status(200).json(cashRegister);
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }
  async getAllPagination(req, res, next) {
    let { limit, page } = req.query;

    try {
      page = page || 1;
      limit = limit || 20;
      let offset = page * limit - limit;

      const data = await CashRegister.findAndCountAll({
        page,
        limit,
        offset,
        order: [['date', 'DESC']],
      });

      return res.status(200).json(data);
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }

  async downloadFile(req, res, next) {
    try {
      const data = await CashRegister.findAll({
        order: [['date', 'DESC']],
      });
      return res.status(200).json(data);

    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }

  async edit(req, res, next) {
    const { id } = req.params;
    const { cash, cashless, date } = req.body;

    try {
      const cashRegister = await CashRegister.findOne({ where: { id } })

      if (!cashRegister) {
        return next(ApiError.notFound(`Этой кассы не существует!`));
      }
      const actCashless = (parseFloat(cashless) - (parseFloat(cashless) / 100) * 1.3)
      const totalCash = parseFloat(cash) + actCashless

      const cashRegisterUpdate = await CashRegister.update(
        {
          cash: cash || undefined,
          cashless: actCashless || undefined,
          date: date || undefined,
          totalCash: totalCash || undefined,
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

      const differenceCash = cash ? parseFloat(cash) - parseFloat(cashRegister.cash) : 0
      const differenceCashless = cashless ? parseFloat(actCashless) - parseFloat(cashRegister.cashless) : 0

      const newBalanceCash = parseFloat(balance[0].cash) + differenceCash
      const newBalanceCashless = parseFloat(balance[0].cashless) + differenceCashless
      const newBalanceTotalCash = newBalanceCash + newBalanceCashless

      await Balance.update({
        cash: newBalanceCash,
        cashless: newBalanceCashless,
        totalCash: newBalanceTotalCash,
      }, { where: { id: balance[0].id } })

      return res.status(200).json(cashRegisterUpdate);
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }
  async delete(req, res, next) {
    const { id } = req.params;

    try {

      const delId = await CashRegister.findOne({ where: { id } })
      if (!delId) {
        return next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
      }

      const cashRegister = await CashRegister.findOne({ where: { id } })

      const balance = await Balance.findAll()
      if (balance.length === 0) {
        await Balance.create({
          cash: 0,
          cashless: 0,
          totalCash: 0,
        })
      }

      const { cash, cashless } = cashRegister

      const newBalanceCash = parseFloat(balance[0].cash) - parseFloat(cash)
      const newBalanceCashless = parseFloat(balance[0].cashless) - parseFloat(cashless)
      const newBalanceTotalCash = newBalanceCash + newBalanceCashless

      await Balance.update({
        cash: newBalanceCash,
        cashless: newBalanceCashless,
        totalCash: newBalanceTotalCash,
      }, { where: { id: balance[0].id } })

      await CashRegister.destroy({ where: { id } });

      return res.status(200).json(`id: ${id} удалён `);
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }
}
module.exports = new CashRegisterController();


