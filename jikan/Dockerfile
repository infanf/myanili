FROM php:8.0-apache-buster

ENV	COMPOSER_ALLOW_SUPERUSER 1

RUN	apt-get update && apt-get install -y \
	openssl \
	git \
	unzip \
	&& curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
	&& composer --version \
	&& pecl install mongodb \
	&& cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini \
	&& echo "extension=mongodb.so" >> /usr/local/etc/php/php.ini	

RUN	git clone https://github.com/infanf/jikan-rest.git . \
    && composer require 'composer/package-versions-deprecated' \
	&& composer install --prefer-dist --no-progress --classmap-authoritative  --no-interaction \
	&& composer update jikan-me/jikan

ADD	.env /run-jikan.sh ./

ENTRYPOINT ["./run-jikan.sh"]
