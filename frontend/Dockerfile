FROM node:22 AS builder
ARG BUILD_ENV=production
ADD . /app
WORKDIR /app
RUN npm run build:${BUILD_ENV}

FROM httpd
COPY --from=builder /app/dist/frontend/browser /usr/local/apache2/htdocs/
