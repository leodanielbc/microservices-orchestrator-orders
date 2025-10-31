FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --omit=dev


COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/src/generated ./src/generated

EXPOSE 3002

CMD [ "npm", "start" ]
