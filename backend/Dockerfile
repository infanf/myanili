FROM webdevops/php-apache:8.2-alpine
ADD . /app
WORKDIR /app
VOLUME [ "/app/users.csv" ]
RUN composer install
