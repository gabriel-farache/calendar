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

smtp=`cat ssmtp.conf`;

if [ ! -z "$ENV_SMTP_ROOT" ]
then
    smtp=${smtp//SMTP_ROOT/$ENV_SMTP_ROOT};
else
    echo "No ENV_SMTP_ROOT";
fi
if [ ! -z "$ENV_SMTP_MAILHUB" ]
then
    smtp=${smtp//SMTP_MAILHUB/$ENV_SMTP_MAILHUB};
else
    echo "No ENV_SMTP_MAILHUB";
fi
if [ ! -z "$ENV_SMTP_TLS" ]
then
    smtp=${smtp//SMTP_TLS/$ENV_SMTP_TLS};
else
    echo "No ENV_SMTP_TLS";
fi
if [ ! -z "$ENV_SMTP_USER" ]
then
    smtp=${smtp//SMTP_USER/$ENV_SMTP_USER};
else
    echo "No ENV_SMTP_USER";
fi
if [ ! -z "$ENV_SMTP_PASS" ]
then
    smtp=${smtp//SMTP_PASSWORD/$ENV_SMTP_PASS};
else
    echo "No ENV_SMTP_PASS";
fi
if [ ! -z "$ENV_SMTP_DOMAIN" ]
then
    smtp=${smtp//SMTP_DOMAIN/$ENV_SMTP_DOMAIN};
else
    echo "No ENV_SMTP_DOMAIN";
fi
if [ ! -z "$ENV_SMTP_OVERRIDE" ]
then
    smtp=${smtp//SMTP_OVERRIDE/$ENV_SMTP_OVERRIDE};
else
    echo "No ENV_SMTP_OVERRIDE";
fi
if [ ! -z "$ENV_SMTP_HOSTNAME" ]
then
    smtp=${smtp//SMTP_HOSTNAME/$ENV_SMTP_HOSTNAME};
else
    echo "No ENV_SMTP_HOSTNAME";
fi

echo $smtp > /etc/ssmtp/ssmtp.conf;
echo "root:$ENV_SMTP_ROOT:$ENV_SMTP_MAILHUB" > /etc/ssmtp/revaliases
