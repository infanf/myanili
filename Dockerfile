FROM webdevops/php-apache-dev:7.4
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt install -yqq nodejs \
    && npm i -g @angular/cli