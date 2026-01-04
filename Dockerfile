FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Prisma client
RUN npx prisma generate

# 🔥 ВАЖНО: билд Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]