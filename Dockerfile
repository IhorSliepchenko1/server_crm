# Используем образ линукс Alpine с версией node 14
FROM node:20.15.0-alpine

# Указываем нашу рабочую дерикторию
WORKDIR /app

# Скопировать package.json и package-lock.json внутрь контейнера
COPY package*.json ./

#Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Открыть порт в нашем контейнере
EXPOSE 3000

# Запускаем наш сервер
CMD ["npm", "start"]