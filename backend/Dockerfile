FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
# RUN npm ci --only=production

# Bundle app source
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

# Build the app
RUN yarn build

# Install PM2
RUN yarn global add pm2

# Copy PM2 configuration
COPY ./docker/config.js ./config.js

# Create log directory
RUN mkdir -p log && touch log/.keep

# Expose the application port
EXPOSE 8001

# Start the application using PM2
CMD [ "pm2-runtime", "./config.js" ]
