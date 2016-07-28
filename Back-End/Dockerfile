FROM httpd:latest

MAINTAINER gabriel.farache@gmail.com

RUN mkdir -p /pechbusque-calendar/front-end
WORKDIR /pechbusque-calendar/front-end
# Copy this repo into place.
ADD . /pechbusque-calendar/back-end


RUN apt-get update && apt-get install -y php5 php5-cli libapache2-mod-php5 php5-mongo

# Enable apache mods.
RUN a2enmod php5
RUN a2enmod rewrite
RUN a2enmod headers

# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

# Expose apache.
EXPOSE 80

ADD ./httpd.conf /etc/apache2/sites-enabled/000-default.conf
#ADD . /var/www/html/

# By default start up apache in the foreground, override with /bin/bash for interative.
CMD ["apache2","-DFOREGROUND"]