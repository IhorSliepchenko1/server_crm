# Используем Alpine-версию Node.js для меньшего размера образа
FROM node:current-alpine

# Устанавливаем рабочую директорию
WORKDIR /api

# Копируем package.json и package-lock.json для кэширования зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Создаем директорию для статических файлов
RUN mkdir -p /api/static

# Указываем порт, который будет использовать контейнер
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "run", "dev"]
