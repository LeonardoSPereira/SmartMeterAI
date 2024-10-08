FROM node:20 AS dependencies

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

FROM dependencies AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN npm run build
RUN npm prune --prod

FROM node:20-alpine3.20 AS deploy

WORKDIR /usr/src/app

RUN npm install prisma

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./package.json
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/uploads ./uploads

RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "start"]