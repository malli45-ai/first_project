FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --omit=dev


COPY . .

EXPOSE 3000
CMD ["npm", "start"]




