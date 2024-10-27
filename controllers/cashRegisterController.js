const ApiError = require(`../error/ApiError`);
const { CashRegister } = require(`../models/models`);

class CashRegisterController {
  async deposit(req, res, next) {
    const { cash, cashless, date } = req.body;
    const { id } = req.user

    try {
      if (cash < 0 || cashless < 0 || !date) {
        next(ApiError.notFound(`Заполните все поля!`));
      }

      const checkDudleDate = await CashRegister.findOne({ where: { date: `${date}T00:00:00.000Z` } })

      if (checkDudleDate) {
        next(ApiError.badRequest(`За эту дату касса внесена!`));
        return
      }

      const totalCash = +cash + (+cashless - (+cashless / 100) * 1.3);

      const cashRegister = await CashRegister.create({
        cash,
        cashless: (+cashless - (+cashless / 100) * 1.3),
        date,
        totalCash,
        userId: id,
      });

      return res.status(200).json(cashRegister);
    } catch (error) {
      next(ApiError.internal(error.message));
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
      next(ApiError.internal(error.message));
    }
  }

  async edit(req, res, next) {
    const { id } = req.params;
    const { cash, cashless, date } = req.body;

    try {
      const totalCash = +cash + (+cashless - (+cashless / 100) * 1.3);

      const cashRegisterUpdate = await CashRegister.update(
        {
          cash: cash || undefined,
          cashless: cashless || undefined,
          date: date || undefined,
          totalCash: totalCash || undefined,
        },
        { where: { id } }
      );

      return res.status(200).json(cashRegisterUpdate);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
  async delete(req, res, next) {
    const { id } = req.params;



    try {

      const delId = await CashRegister.findOne({ where: { id } })

      if (!delId) {
        return next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
      }

      await CashRegister.destroy({ where: { id } });

      return res.status(200).json(`id: ${id} удалён `);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
}
module.exports = new CashRegisterController();
