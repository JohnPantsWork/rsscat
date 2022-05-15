
# Base image
FROM node:latest

RUN apt update
RUN apt install build-essential

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# for server
CMD ["node","app.js"]

# for worker
# CMD ["node","auto/worker.js"]

# for worker_center
#CMD ["node","auto/worker_center.js"]