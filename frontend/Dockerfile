FROM node:18-alpine

EXPOSE 80

ARG ENVIRONMENT=$ENVIRONMENT

RUN mkdir /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm install

# Copy the resources needed to build the app
COPY ./src /app/src
COPY ./messages /app/messages
COPY ./public /app/public
COPY ./tsconfig.json /app/tsconfig.json
COPY ./next.config.mjs /app/next.config.mjs
COPY ./postcss.config.mjs /app/postcss.config.mjs
COPY ./tailwind.config.ts /app/tailwind.config.ts
COPY ./sentry.client.config.mjs /app/sentry.client.config.mjs
COPY ./logger.config.mjs /app/logger.config.mjs
COPY ./context /app/context
COPY ./.env.$ENVIRONMENT /app/.env

RUN NODE_PATH=./src npm run build

# Remove JS source maps for production
RUN rm -rf ./build/static/js/*.map

CMD ["npm", "run", "start"]
