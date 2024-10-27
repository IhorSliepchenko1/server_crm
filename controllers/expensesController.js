const ApiError = require(`../error/ApiError`);
const { Expenses, TypesExpenses, User } = require(`../models/models`);
const uuid = require(`uuid`);
const path = require(`path`);


class ExpensesController {
     async deposit(req, res, next) {
          try {
               const { name, date, sum, typesExpenseId } = req.body;


               let fileName

               if (req.files) {
                    const { img } = req.files
                    fileName = uuid.v4() + ".jpg"
                    img.mv(path.resolve(__dirname, '..', 'static', fileName))
                    console.log(fileName);
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
                    img: fileName
               });

               return res.status(200).json(expenses);
          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async getAll(req, res, next) {
          let { limit, page } = req.query;
          try {
               page = page || 1;
               limit = limit || 20;
               let offset = page * limit - limit;

               const data = await Expenses.findAndCountAll({
                    page,
                    limit,
                    offset,
                    order: [['date', 'DESC']],
               });

               const copyData = { ...data }
               const arrayResult = { count: copyData.count, rows: [] }
               for (let i = 0; i < copyData.rows.length; i++) {
                    const userName = await User.findOne({ where: { id: data.rows[i].userId } });
                    const typeExpenses = await TypesExpenses.findOne({ where: { id: data.rows[i].typesExpenseId } })
                    const login = userName ? userName.login : 'Неизвестный';
                    const type = typeExpenses ? typeExpenses.name : 'Без типа';
                    arrayResult.rows.push({ ...copyData.rows[i].dataValues, userName: login, typeName: type });

               }


               return res.status(200).json(arrayResult);
          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async edit(req, res, next) {

          try {
               const { id } = req.params;
               const { name, date, sum, typesExpenseId } = req.body;

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
                         img: fileName || undefined
                    },
                    { where: { id } }
               );

               return res.status(200).json(expensesUpdate);
          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
     async delete(req, res, next) {
          const { id } = req.params;

          try {
               const delId = await Expenses.findOne({ where: { id } })

               if (!delId) {
                    next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
               }


               await Expenses.destroy({ where: { id } });
               // await deleteId.destroy();

               return res.status(200).json(`id: ${id} удалён `);
          } catch (error) {
               next(ApiError.internal(error.message));
          }
     }
}
module.exports = new ExpensesController();
