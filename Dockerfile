FROM webdevops/php-apache-dev:8.1
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - 
RUN apt-get install -yqq nodejs 
RUN npm i -g npm
RUN npm i -g @angular/cli@next
