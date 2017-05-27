#!/bin/bash
INSTALL_SAME_HOST=true
USE_MONGO=false
ENV_DB_HOST='localhost'
ENV_DB_PORT=3306
ENV_DB_USER='root'
ENV_DB_PASS='root'
ENV_DB_DB_NME='calendar_pechbusque'
ENV_DB_REPLICASET=''

while true; do    
    read -p "Do you want to use mongo [yn]" yn
    case $yn in
        [Yy]* ) USE_MONGO=true; break;;
        [Nn]* ) USE_MONGO=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done

echo "=== Configuring database ==="
while true; do
    read -p "Is the database to be installed on this host? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_SAME_HOST=true; break;;
        [Nn]* ) INSTALL_SAME_HOST=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done

if [ $INSTALL_SAME_HOST = false ]
then
    read -p "Database host: " ENV_DB_HOST
    read -p "Database port: " ENV_DB_PORT
    read -p "Database name:  " ENV_DB_DB_NAME
    if [ $USE_MONGO = true ]
    then
        read -p "Database replicaset " ENV_DB_REPLICASET
    fi
fi

read -p "Database user: " ENV_DB_USER
read -p "Database password: " ENV_DB_PASS

conf=`cat conf/database.conf`;
conf=${conf//DB_HOST/\"$ENV_DB_HOST\"};
conf=${conf//DB_PORT/\"$ENV_DB_PORT\"};
conf=${conf//DB_USER/\"$ENV_DB_USER\"};
conf=${conf//DB_PASSWORD/\"$ENV_DB_PASS\"};
conf=${conf//DB_DB_NAME/\"$ENV_DB_DB_NAME\"};
conf=${conf//DB_REPLICASET/\"$ENV_DB_REPLICASET\"};
echo $conf > conf/database.conf;

echo "=== Configuring Email ==="

read -p "Email SMTP mailhub host: " ENV_SMTP_MAILHUB
read -p "Email SMTP root address: " ENV_SMTP_ROOT
read -p "Email SMTP TLS: " ENV_SMTP_TLS
read -p "Email user: " ENV_SMTP_USER
read -p "Email password:  " ENV_SMTP_PASS
read -p "Email rewrite domain:  " ENV_SMTP_DOMAIN
read -p "Email override:  " ENV_SMTP_OVERRIDE
read -p "Email hostname:  " ENV_SMTP_HOSTNAME

echo "=== Installing & configuring back-end utilities ==="
sudo apt-get purge `dpkg -l | grep php| awk '{print $2}' |tr "\n" " "`
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update
sudo apt-get install -y --allow-unauthenticated apache2 php5.6 libssl-dev openssl ssmtp rsyslog
sudo apt-get purge -y --auto-remove libssl-dev 
a2enmod rewrite
a2enmod headers
a2enmod ssl
export APACHE_RUN_USER=www-data
export APACHE_RUN_GROUP=www-data
export APACHE_LOG_DIR=/var/log/apache2
export APACHE_LOCK_DIR=/var/lock/apache2
export APACHE_PID_FILE=/var/run/apache2.pid
cp conf/httpd.conf /etc/apache2/sites-enabled/000-default.conf
service apache2 restart
echo sendmail_path=/usr/sbin/ssmtp -t >> /usr/local/etc/php/php.ini
sudo service rsyslog restart

echo "root=$ENV_SMTP_ROOT
mailhub=$ENV_SMTP_MAILHUB
UseSTARTTLS=$ENV_SMTP_TLS
AuthUser=$ENV_SMTP_USER
AuthPass=$ENV_SMTP_PASS
rewriteDomain=$ENV_SMTP_DOMAIN
FromLineOverride=$ENV_SMTP_OVERRIDE
hostname=$ENV_SMTP_HOSTNAME" > /etc/ssmtp/ssmtp.conf;
echo "root:$ENV_SMTP_ROOT:$ENV_SMTP_MAILHUB" > /etc/ssmtp/revaliases


if [ $INSTALL_SAME_HOST = true ]
then
    echo "=== Installing database ==="
    if [ $USE_MONGO = true ]
    then
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
        echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org mongodb-org-server
        sudo apt-get install -y php-pear php5-mongo
        pecl install mongo
        sudo echo "extension=mongo.so" >> /etc/php5/apache2/php.ini
    else 

        sudo echo "mysql-server-5.7 mysql-server/"+$ENV_DB_PASS+" password root" | sudo debconf-set-selections
        sudo echo "mysql-server-5.7 mysql-server/"+$ENV_DB_PASS+" password root" | sudo debconf-set-selections
        sudo apt-get install -y --allow-unauthenticated  mysql-server-5.7 php5.6-mysql
        mysql -u root --password="$ENV_DB_PASS" -h $ENV_DB_HOST -e "CREATE USER '"+$ENV_DB_USER+"'@'%' IDENTIFIED BY '"+$ENV_DB_PASS+"';"
        mysql -u root --password="$ENV_DB_PASS" -h $ENV_DB_HOST -e "GRANT ALL PRIVILEGES ON *.* TO '"+$ENV_DB_USER+"'@'%' WITH GRANT OPTION;"
        mysql -u root --password="$ENV_DB_PASS" -h $ENV_DB_HOST -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '"+$ENV_DB_PASS+"';"
        mysql -u $ENV_DB_USER --password="$ENV_DB_PASS" -h $ENV_DB_HOST -e "CREATE DATABASE "+$ENV_DB_DB_NAME+";"
        mysql -u $ENV_DB_USER --password="$ENV_DB_PASS" $ENV_DB_DB_NAME < SQL_Queries/tables_mysql.sql
        mysql -u $ENV_DB_USER --password="$ENV_DB_PASS" $ENV_DB_DB_NAME < SQL_Queries/poupulateDB_mysql.sql

    fi
fi


