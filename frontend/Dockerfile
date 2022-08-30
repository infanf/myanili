FROM node:16 as builder
ADD --chown=node . /app
RUN npm i -g @angular/cli
USER node
WORKDIR /app
RUN npm run build

FROM httpd
COPY --from=builder /app/dist/frontend /usr/local/apache2/htdocs/