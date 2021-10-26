FROM node:14 as n

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

from n as a

COPY . .

RUN npm run build

from a as e


EXPOSE 8050
CMD npm run express
