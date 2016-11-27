#!/bin/bash

#ENV_BACKEND_URL='http://0.0.0.0:8080'


conf=`cat app/scripts/config/app.config.js`;
if [ ! -z "$ENV_BACKEND_URL" ]
then
    conf=${conf//ENV_BACKEND_URL/$ENV_BACKEND_URL};
else 
    echo "No ENV_BACKEND_URL";
fi
if [ ! -z "$ENV_BACKEND_ROOTFILE" ]
then
    conf=${conf//ENV_BACKEND_ROOTFILE/$ENV_BACKEND_ROOTFILE};
else 
    echo "No ENV_BACKEND_ROOTFILE";
fi
if [ ! -z "$ENV_BACKEND_ROOTFOLDER" ]
then
    conf=${conf//ENV_BACKEND_ROOTFOLDER/$ENV_BACKEND_ROOTFOLDER};
else 
    echo "No ENV_BACKEND_ROOTFOLDER";
fi
echo $conf > app/scripts/config/app.config.js;
