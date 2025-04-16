FROM webdevops/php-apache:8.4
ADD . /app
WORKDIR /app
VOLUME [ "/app/users.csv" ]
RUN composer install
