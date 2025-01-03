FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install --only=dev

EXPOSE 3000

CMD ["npm", "run", "dev"]
