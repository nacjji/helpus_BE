# syntax=docker/dockerfile:1
FROM node:16
WORKDIR /helpus
COPY ./ /helpus/
RUN npm install
RUN npm i -g typescript -g prisma
RUN npx prisma generate
RUN npx tsc
ENTRYPOINT [ "npm", "run","dev" ]
EXPOSE 3001