const sequilize = require(`../db.js`);
const { DataTypes } = require(`sequelize`);

// User
const User = sequilize.define(`user`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: `USER` },
});

// CashRegister
const CashRegister = sequilize.define(`cash_register`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cash: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cashless: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  totalCash: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
});

// TypesExpenses
const TypesExpenses = sequilize.define(`types_expenses`, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

const Expenses = sequilize.define(`expenses`, {
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


module.exports = {
  User,
  CashRegister,
  TypesExpenses,
  Expenses,
};
