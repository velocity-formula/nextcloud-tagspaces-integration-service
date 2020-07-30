FROM node:14.5.0-alpine3.12

WORKDIR /usr/src/ncts-service

COPY ./src/ .

RUN npm install
RUN npm ci --only=production

EXPOSE 6080

CMD [ "node", "/usr/src/ncts-service/app.js" ]