#!/bin/bash

INSTALL_SAME_HOST=true;
ENV_BACKEND_URL='localhost/'
ENV_BACKEND_ROOTFILE='CRUD.php'
ENV_BACKEND_ROOTFOLDER='mysql/'

echo "=== Configuring back-end ==="
while true; do
    read -p "Are the front-end and the back-end installed on the same host? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_SAME_HOST=true; break;;
        [Nn]* ) INSTALL_SAME_HOST=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done

if [ $INSTALL_SAME_HOST = false ]
then
    read -p "Back-end host: " ENV_BACKEND_URL
    read -p "Back-end path for entrypoint: " ENV_BACKEND_ROOTFOLDER
    read -p "Back-end file for entrypoint: " ENV_BACKEND_ROOTFILE
fi

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
