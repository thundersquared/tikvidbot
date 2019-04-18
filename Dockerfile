FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy app source
COPY . .

# Install dependencies
RUN yarn

# Run app
CMD [ "yarn", "start" ]
