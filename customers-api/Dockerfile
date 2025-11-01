FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate
ENV DATABASE_URL=""

RUN npm run build


FROM node:22-alpine AS production

WORKDIR /usr/src/app

RUN apk add --no-cache bash mysql-client


COPY package.json package-lock.json ./


RUN npm ci --omit=dev


COPY --from=builder /usr/src/app/dist ./dist


COPY --from=builder /usr/src/app/prisma ./prisma


COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma


COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001


CMD ["docker-entrypoint.sh"]