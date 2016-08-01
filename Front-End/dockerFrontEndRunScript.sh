#!/bin/bash

#ENV_BACKEND_URL='http://0.0.0.0:8080'


conf=`cat app/scripts/config/app.config.js`;
if [ ! -z "$ENV_BACKEND_URL" ]
then
    conf=${conf//TO_BE_REPLACED/$ENV_BACKEND_URL};
else 
    echo "No ENV_BACKEND_URL";
fi
echo $conf > app/scripts/config/app.config.js;
