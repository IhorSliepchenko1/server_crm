const ApiError = require(`../error/ApiError`);
const bcrypt = require('bcryptjs');
const jwt = require(`jsonwebtoken`);
const { User } = require(`../models/models`);

const generateJwt = (id, login, role) => {
  return jwt.sign({ id, login, role }, process.env.SECRET_KEY, {
    expiresIn: `24h`,
  });
};

class UserController {
  async registration(req, res, next) {
    try {
      const { login, password, role } = req.body;

      if (!login || !password) {
        next(ApiError.notFound(`Логин и пароль обязательны!`));
      }


      if (password.length < 6) {
        next(ApiError.badRequest(`Пароль должен быть не менее 6 символов`));
      }

      const candidate = await User.findOne({ where: { login } });

      if (candidate) {
        next(ApiError.badRequest(`${login} уже существует`));
      }

      const hashPassword = await bcrypt.hash(password, 12);
      const user = await User.create({ login, password: hashPassword, role: role ? role : "USER" });

      return res.json(user);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async login(req, res, next) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        next(ApiError.notFound(`Логин и пароль обязательны!`));
      }

      const user = await User.findOne({ where: { login } });

      if (!user) {
        next(ApiError.badRequest(`${login} не найден`));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) {
        next(ApiError.unauthorized(`Указан неверный пароль`));
      }

      const token = generateJwt(user.id, user.login, user.role);

      return res.json({ token });
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async getAll(req, res, next) {
    try {
      const data = await User.findAll({

        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json(data);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async updateUser(req, res, next) {
    const { id } = req.params;
    const { login, password, role } = req.body;

    try {

      const user = await User.findOne({ where: { id } });

      if (!user) {
        next(ApiError.badRequest(`${id} не найден`));
      }

      if (password) {
        if (password.length < 6) {
          next(ApiError.badRequest(`Пароль должен быть не менее 6 символов`));
        }
      }

      const hashPassword = await bcrypt.hash(password, 12);

      await User.update(
        {
          login: login || undefined,
          password: hashPassword || undefined,
          role: role || undefined
        },
        { where: { id } }
      )

      return res.status(200).json(user);

    }
    catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;

    try {

      const delId = await User.findOne({ where: { id } })

      if (!delId) {
        return next(ApiError.notFound(`id в базе отсутствует или ранее был удалён!`));
      }

      await User.destroy({ where: { id } });

      return res.status(200).json(`id: ${id} удалён `);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }

  async check(req, res, next) {
    try {
      const token = generateJwt(req.user.id, req.user.login, req.user.role);

      return res.json({ token });
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
}

module.exports = new UserController();
