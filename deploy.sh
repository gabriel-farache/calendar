#!/bin/bash

while getopts "c:n:b:o:p:u:w:d:r:h:f:a:" opt; do
  case $opt in
    c)
      FRONTEND_FQDN=$OPTARG;
      ;;
    n)
      BACKEND_FQDN=$OPTARG;
      ;;
    b)
      ENV_BACKEND_URL=$OPTARG;
      ;;
    o)
      ENV_DB_HOST=$OPTARG;
      ;;
    p)
      ENV_DB_PORT=$OPTARG;
      ;;
    u)
      ENV_DB_USER=$OPTARG;
      ;;
    w)
      ENV_DB_PASS=$OPTARG;
      ;;
    d)
      ENV_DB_DB_NAME=$OPTARG;
      ;;
    r)
      ENV_DB_REPLICASET=$OPTARG;
      ;;
    f)
      INSTALL_FRONT_END=$OPTARG;
      ;;
    a)
      INSTALL_BACK_END=$OPTARG;
      ;;
    h)
        echo "usage: deploy.sh -b BACKEND_URL -o DB_HOST -p DB_PORT -u DB_USER -w DB_PWD -d DB_DB_NAME -r DB_REPLICASET"
        exit 1
        ;;
    \?)
      echo "Invalid option: -$OPTARG. See -h for help" >&2
      exit 1
      ;;
  esac
done

if [ -z "$INSTALL_FRONT_END" ]
then
  while true; do
    read -p "Do you want to install front-end? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_FRONT_END=true; break;;
        [Nn]* ) INSTALL_FRONT_END=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
  done
fi

if [ -z "$INSTALL_BACK_END" ]
then
  while true; do
    read -p "Do you want to install back-end? [yn]" yn
    case $yn in
        [Yy]* ) INSTALL_BACK_END=true; break;;
        [Nn]* ) INSTALL_BACK_END=false; break;;
        * ) echo "Please answer yes (y) or no (n).";;
    esac
  done
fi

if [ "$INSTALL_FRONT_END" = true ]
then 
  if [ -z "$FRONTEND_FQDN" ]
  then
    read -p "Front-end FQDN: " FRONTEND_FQDN
  else 
    echo "Front-end FQDN: $FRONTEND_FQDN"
  fi
  if [ -z "$ENV_BACKEND_URL" ]
  then
    read -p "Back end URL: " ENV_BACKEND_URL
  else 
    echo "Back end URL: $ENV_BACKEND_URL"
  fi
  echo "nohup docker run -e ENV_BACKEND_URL=$ENV_BACKEND_URL -p 9000:9000 -d gabrielfarache/calendar-pechbusque:front-end"
  nohup docker run -e ENV_BACKEND_URL=$ENV_BACKEND_URL -e CN=$FRONTEND_FQDN -p 9000:9000 -d gabrielfarache/calendar-pechbusque:front-end
fi

if [ "$INSTALL_BACK_END" = true ]
then
  if [ -z "$BACKEND_FQDN" ]
  then
    read -p "Back-end FQDN: " BACKEND_FQDN
  else 
    echo "Back-end FQDN: $BACKEND_FQDN"
  fi
  if [ -z "$ENV_DB_HOST" ]
    then
      read -p "Database address: " ENV_DB_HOST
  else 
    echo "Database address: $ENV_DB_HOST"
  fi

  if [ -z "$ENV_DB_PORT" ]
  then
      read -p "Database port: " ENV_DB_PORT
  else 
    echo "Database port: $ENV_DB_PORT"
  fi

  if [ -z "$ENV_DB_USER" ]
  then
      read -p "Database user: " ENV_DB_USER
  else 
    echo "Database user: $ENV_DB_USER"    
  fi

  if [ -z "$ENV_DB_PASS" ]
  then
      read -p "Database password: " ENV_DB_PASS
  else 
    echo "Database password: $ENV_DB_PASS"
  fi

  if [ -z "$ENV_DB_DB_NAME" ]
  then
      read -p "Database name: " ENV_DB_DB_NAME
  else 
    echo "Database name: $ENV_DB_DB_NAME"
  fi

  if [ -z "$ENV_DB_REPLICASET" ]
  then
      read -p "Database replicaset: " ENV_DB_REPLICASET
  else 
    echo "Database replicaset: $ENV_DB_REPLICASET"
  fi

  echo "nohup docker run -e ENV_DB_HOST=$ENV_DB_HOST -e ENV_DB_PORT=$ENV_DB_PORT -e ENV_DB_USER=$ENV_DB_USER -e ENV_DB_PASS=$ENV_DB_PASS -e ENV_DB_DB_NAME=$ENV_DB_DB_NAME -e ENV_DB_REPLICASET=$ENV_DB_REPLICASET -p 8080:80 -d gabrielfarache/calendar-pechbusque:back-end" 
  nohup docker run -e ENV_DB_HOST=$ENV_DB_HOST -e CN=$BACKEND_FQDN -e ENV_DB_PORT=$ENV_DB_PORT -e ENV_DB_USER=$ENV_DB_USER -e ENV_DB_PASS=$ENV_DB_PASS -e ENV_DB_DB_NAME=$ENV_DB_DB_NAME -e ENV_DB_REPLICASET=$ENV_DB_REPLICASET -p 8080:80 -p 443:443 -d gabrielfarache/calendar-pechbusque:back-end 
fi



