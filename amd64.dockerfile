FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN yarn

# Copy app source
COPY . .

# Run app
CMD [ "yarn", "start" ]
