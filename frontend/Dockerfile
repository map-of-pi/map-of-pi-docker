FROM node:18 as builder

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

RUN NODE_PATH=./src npm run build

# Remove JS source maps for production
RUN rm -rf ./build/static/js/*.map

FROM nginx:alpine

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/entrypoint.sh /var/entrypoint.sh
RUN chmod +x /var/entrypoint.sh

RUN mkdir -p /var/www/webapp

COPY --from=builder /app/.next /var/www/webapp

# Configure Nginx for better performance
RUN sed -i  "s/worker_processes/#worker_processes/" /etc/nginx/nginx.conf && \
    echo "worker_processes auto;" >> /etc/nginx/nginx.conf && \
    echo "worker_rlimit_nofile 16384;" >> /etc/nginx/nginx.conf

# Run the entrypoint script
CMD ["/var/entrypoint.sh"]
