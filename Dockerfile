FROM node:16-alpine AS builder
WORKDIR /app

COPY . .
COPY prisma ./prisma/

RUN npm install \
 && npm run build

FROM node:16-alpine AS final
WORKDIR /app

COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY package-lock.json .
COPY prisma ./prisma/

RUN npm install --production

EXPOSE 4000
CMD [ "npm", "start" ]
