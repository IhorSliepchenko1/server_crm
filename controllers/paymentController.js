const { Payment } = require(`../models/models`)
const ApiError = require(`../error/ApiError`);


class PaymentController {
     async create(req, res, next) {
          const { name } = req.body;

          try {
               if (!name) {
                    next(ApiError.notFound(`Заполните все поля!`));
               }

               const payment = await Payment.create({ name });
               return res.json(payment);
          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
     async getAll(req, res, next) {
          try {
               const payment = await Payment.findAll();
               res.json(payment);
          }
          catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
     async edit(req, res, next) {

          try {
               const { id } = req.params;
               const { name } = req.body;

               await Payment.update({ name: name || undefined }, { where: { id } })

               return res.status(200).json(`Вы сменили название`);

          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
     async delete(req, res, next) {
          try {
               const { id } = req.params;

               const delId = await Payment.findOne({ where: { id } })

               if (!delId) {
                    return next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
               }


               await Payment.destroy({ where: { id } })

               return res.status(200).json(`Категория удалена`);

          } catch (error) {
               return next(ApiError.internal(error.message));
          }
     }
}

module.exports = new PaymentController();