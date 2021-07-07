FROM node:16-alpine3.11
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 3333

CMD [ "node", "server.js", "/config/config.yml" ]
