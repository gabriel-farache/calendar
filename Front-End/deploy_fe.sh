#!/bin/bash

INSTALL_SAME_HOST=true;
ENV_BACKEND_URL=''
ENV_BACKEND_ROOTFILE='CRUD.php'
ENV_BACKEND_ROOTFOLDER='mysql/'

echo "=== Configuring back-end ==="
read -p "Back-end host (do not use localhost or 127.0.0.1): " ENV_BACKEND_URL
    

conf=`cat app/scripts/config/app.config.js`;
conf=${conf//ENV_BACKEND_URL/$ENV_BACKEND_URL};
conf=${conf//ENV_BACKEND_ROOTFILE/$ENV_BACKEND_ROOTFILE};
conf=${conf//ENV_BACKEND_ROOTFOLDER/$ENV_BACKEND_ROOTFOLDER};
echo $conf > app/scripts/config/app.config.js;

echo "=== Utilities installation..."
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential 
sudo apt-get update -qq
sudo apt-get install -y git-core ruby-dev rubygems
sudo gem install compass
echo "=== Dependencies installation..."
npm install -g bower 
npm install -g grunt-cli
npm install 
bower install --allow-root
echo "Launching application..."
nohup grunt serve:dist &
