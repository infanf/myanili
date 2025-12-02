FROM webdevops/php-apache:8.4
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash - 
RUN apt-get install -yqq nodejs 
RUN npm i --location=global npm @angular/cli
