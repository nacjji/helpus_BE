# syntax=docker/dockerfile:1
FROM node:16
WORKDIR /helpus
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3003
CMD ["npm", "run", "dev"]

# WORKDIR /helpus
# COPY package*.json ./
# COPY . .
# RUN npm ci
# RUN npx prisma generate
# RUN npm install -g typescript
# RUN npm i -g pm2

# EXPOSE 3003
# CMD [ "node", "server.js" ]


