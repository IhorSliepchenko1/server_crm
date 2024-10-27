require(`dotenv`).config();

const express = require(`express`);
const sequilize = require(`./db.js`);
require(`./models/models.js`);
const cors = require(`cors`);
const bodyParser = require(`body-parser`);
const fileUpload = require(`express-fileupload`);
const router = require(`./routes/index.js`);
const path = require(`path`);
const fs = require(`fs`);
const ApiError = require(`./error/ApiError.js`);

const PORT = process.env.PORT || 5000;
const app = express();
const staticDir = path.resolve(__dirname, `static`)

if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir);
}

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(staticDir));
app.use(fileUpload({}));
app.use(`/api`, router);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Что-то пошло не так' });
});

const start = async () => {
  try {
    await sequilize.authenticate();
    await sequilize.sync();

    app.listen(PORT, () => {
      console.log(`**сервер запущен на порту ${PORT}**`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
