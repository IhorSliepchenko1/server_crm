const { TypesExpenses } = require(`../models/models`)
const ApiError = require(`../error/ApiError`);


class TypesExpensesController {
     async create(req, res, next) {
          const { name } = req.body;

          try {
               if (!name) {
                    next(ApiError.notFound(`Заполните все поля!`));
               }

               const typeExpense = await TypesExpenses.create({ name });
               return res.json(typeExpense);
          }
          catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async getAll(req, res, next) {
          try {
               const typesExpenses = await TypesExpenses.findAll();
               res.json(typesExpenses);
          }
          catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async edit(req, res, next) {

          try {
               const { id } = req.params;
               const { name } = req.body;

               await TypesExpenses.update({ name: name || undefined }, { where: { id } })

               return res.status(200).json(`Вы сменили название категории расходов`);

          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async delete(req, res, next) {
          try {
               const { id } = req.params;

               const delId = await TypesExpenses.findOne({ where: { id } })

               if (!delId) {
                    next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
               }


               await TypesExpenses.destroy({ where: { id } })

               return res.status(200).json(`Категория удалена`);

          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
}

module.exports = new TypesExpensesController();