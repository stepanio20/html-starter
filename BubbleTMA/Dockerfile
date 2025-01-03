FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npm install -g http-server

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000"]