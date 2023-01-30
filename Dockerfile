# syntax=docker/dockerfile:1
FROM node:16
WORKDIR /helpus
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm install -g typescript
RUN npm i -g pm2
RUN npx tsc
CMD [ "npm", "start" ]
EXPOSE 3003