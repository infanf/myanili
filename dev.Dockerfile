FROM webdevops/php-apache:8.5
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash - 
RUN apt-get install -yqq nodejs 
RUN npm i --location=global npm @angular/cli
RUN mkdir -p /dbs && chmod 777 /dbs
VOLUME [ "/dbs" ]
