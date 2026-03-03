FROM webdevops/php-apache:8.5
ADD . /app
WORKDIR /app
RUN mkdir -p /dbs && chmod 777 /dbs
VOLUME [ "/app/users.csv", "/dbs" ]
RUN composer install
