const sequelize = require(`../db.js`);
const { DataTypes } = require(`sequelize`);

// User
const User = sequelize.define(`user`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: `USER` },
});

// CashRegister
const CashRegister = sequelize.define(`cash_register`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cash: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cashless: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  totalCash: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
});

const Balance = sequelize.define(`balance`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cash: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  cashless: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  totalCash: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
});

// TypesExpenses
const TypesExpenses = sequelize.define(`types_expenses`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

const Payment = sequelize.define(`payment`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

const Expenses = sequelize.define(`expenses`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  sum: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  img: { type: DataTypes.STRING, allowNull: true },
});

User.hasMany(CashRegister);
CashRegister.belongsTo(User);

User.hasMany(Expenses, { foreignKey: 'userId' });
Expenses.belongsTo(User, { as: 'user', foreignKey: 'userId' });

TypesExpenses.hasMany(Expenses, { foreignKey: 'typesExpenseId' });
Expenses.belongsTo(TypesExpenses, { as: 'typeExpense', foreignKey: 'typesExpenseId' });

Payment.hasMany(Expenses, { foreignKey: 'paymentId' });
Expenses.belongsTo(Payment, { as: 'paymentsName', foreignKey: 'paymentId' });


module.exports = {
  User,
  CashRegister,
  TypesExpenses,
  Expenses,
  Balance,
  Payment
};
