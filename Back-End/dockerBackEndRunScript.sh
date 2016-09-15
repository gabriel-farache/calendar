#!/bin/bash

conf=`cat database.conf`;
if [ ! -z "$ENV_DB_HOST" ]
then
    conf=${conf//DB_HOST/\"$ENV_DB_HOST\"};
else
    echo "No ENV_DB_HOST";
fi
if [ ! -z "$ENV_DB_PORT" ]
then
    conf=${conf//DB_PORT/\"$ENV_DB_PORT\"};
else
    echo "No ENV_DB_PORT";
fi
if [ ! -z "$ENV_DB_USER" ]
then
    conf=${conf//DB_USER/\"$ENV_DB_USER\"};
else
    echo "No ENV_DB_USER";
fi
if [ ! -z "$ENV_DB_PASS" ]
then
    conf=${conf//DB_PASSWORD/\"$ENV_DB_PASS\"};
else
    echo "No ENV_DB_PASS";
fi
if [ ! -z "$ENV_DB_DB_NAME" ]
then
    conf=${conf//DB_DB_NAME/\"$ENV_DB_DB_NAME\"};
else
    echo "No ENV_DB_DB_NAME";
fi
if [ ! -z "$ENV_DB_REPLICASET" ]
then
    conf=${conf//DB_REPLICASET/\"$ENV_DB_REPLICASET\"};
else
    echo "No ENV_DB_REPLICASET";
fi

echo $conf > database.conf;

echo "root=$SMTP_ROOT
mailhub=$SMTP_MAILHUB
UseSTARTTLS=$SMTP_TLS
AuthUser=$SMTP_USER
AuthPass=$SMTP_PASS
rewriteDomain=$SMTP_DOMAIN
FromLineOverride=$SMTP_OVERRIDE
hostname=$SMTP_HOSTNAME" > /etc/ssmtp/ssmtp.conf;

echo "root:$ENV_SMTP_ROOT:$ENV_SMTP_MAILHUB" > /etc/ssmtp/revaliases
