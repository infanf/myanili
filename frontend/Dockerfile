FROM node:18 as builder
ARG BUILD_ENV=production
ADD --chown=node . /app
RUN npm i -g @angular/cli
USER node
WORKDIR /app
RUN npm run build:${BUILD_ENV}

FROM httpd
COPY --from=builder /app/dist/frontend /usr/local/apache2/htdocs/