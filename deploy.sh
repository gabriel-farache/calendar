#!/bin/bash
git clone -b deploy --single-branch https://github.com/gabriel-farache/calendar.git --depth 1

while true; do    
    read -p "Do you want to install front-end? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_FRONT_END=true; break;;
        [Nn]* ) INSTALL_FRONT_END=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done
while true; do
    read -p "Do you want to install back-end? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_BACK_END=true; break;;
        [Nn]* ) INSTALL_BACK_END=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
done
WORKING_DIRECTORY=$(pwd)
if [ "$INSTALL_FRONT_END" = false ]
then

    mkdir --parents /opt/pechbusque-calendar/front-end; mv Front-End/* $_
    cd /opt/pechbusque-calendar/front-end
    sudo chmod +x /opt/pechbusque-calendar/front-end/deploy_fe.sh
    sh deploy_fe.sh
    cd $WORKING_DIRECTORY
fi

if [ "$INSTALL_BACK_END" = false ]
then
    mkdir --parents /opt/pechbusque-calendar/back-end; mv Back-End/* $_
    cd /opt/pechbusque-calendar/back-end
    sudo chmod +x /opt/pechbusque-calendar/back-end/deploy_be.sh
    sh deploy_be.sh
    cd $WORKING_DIRECTORY
fi


