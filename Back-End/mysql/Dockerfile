FROM php:5.5-apache

MAINTAINER gabriel.farache@gmail.com

RUN mkdir -p /pechbusque-calendar/back-end
WORKDIR /pechbusque-calendar/back-end
# Copy this repo into place.
ADD . /pechbusque-calendar/back-end

RUN apt-get update -y && apt-get install -y libssl-dev openssl ssmtp rsyslog && \
    pecl install mongo && \
    apt-get purge -y --auto-remove libssl-dev && \
    echo sendmail_path=/usr/sbin/ssmtp -t >> /usr/local/etc/php/php.ini &&\
    service rsyslog restart

# Enable apache mods.
RUN a2enmod rewrite
RUN a2enmod headers
RUN a2enmod ssl


# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

RUN chmod a+x generateCertificates.sh

# Expose apache.
EXPOSE 443
EXPOSE 80

ADD ./httpd.conf /etc/apache2/sites-enabled/000-default.conf



# By default start up apache in the foreground, override with /bin/bash for interative.
CMD ./generateCertificates.sh && ./dockerBackEndRunScript.sh && apache2 -D FOREGROUND