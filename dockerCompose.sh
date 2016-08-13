#!/bin/bash

while getopts "u:p:d:h:s:m:" opt; do
  case $opt in
    u)
      ENV_DB_USER=$OPTARG;
      ;;
    p)
      ENV_DB_PASS=$OPTARG;
      ;;
    d)
      ENV_DB_DB_NAME=$OPTARG;
      ;;
    s)
      BASE64PWD=$OPTARG;
      ;;
    m)
      EMAIL=$OPTARG;
      ;;
    h)
        echo "usage: dockerCompose.sh -u DB_USER -p DB_PWD -d DB_DB_NAME -s BASE64PWD -m EMAIL"
        exit 1
        ;;
    \?)
      echo "Invalid option: -$OPTARG. See -h for help" >&2
      exit 1
      ;;
  esac
done
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

if [ -z "$BASE64PWD" ]
then
    read -p "Base64 password for application's admin user: " BASE64PWD
else 
    echo "Database replicaset: $BASE64PWD"
fi

if [ -z "$EMAIL" ]
then
    read -p "Email for admin contact: " EMAIL
else 
    echo "Database replicaset: $EMAIL"
fi

echo "Starting docker-compose, see compose.out for output"
nohup docker-compose up > compose.out &

sleep 5;

echo "Waiting for docker-compose to install Mongo and elasticsearch..."
WAIT=`docker ps | grep mongo1_1 | cut -c1-12 | wc -l| cut -c8`
while test $WAIT -eq 0
do
  WAIT=`docker ps | grep mongo1_1 | cut -c1-12 | wc -l| cut -c8`
  printf '.'
  sleep 1
done

WAIT=`docker ps | grep elasticsearch_1 | cut -c1-12 | wc -l| cut -c8`
while test $WAIT -eq 0
do
  WAIT=`docker ps | grep elasticsearch_1 | cut -c1-12 | wc -l| cut -c8`
  printf '.'
  sleep 1
done
echo "done..."


echo "Waiting for docker-compose to initialize..."
sleep 5;
WAIT=`docker ps | grep verify_1 | wc -l | cut -c8`;
while test $WAIT -gt 0
do
  WAIT=`docker ps | grep verify_1 | wc -l | cut -c8`;
  printf '.'
  sleep 1
done
echo "docker-compose initialized.."

echo "Configuring mongo..."
echo ""
MONGO_DOCKER=`docker ps | grep mongo1_1 | cut -c1-12`
echo "docker exec -i ${MONGO_DOCKER} bash"
docker exec -i ${MONGO_DOCKER} bash <<EOF
mongo
use ${ENV_DB_DB_NAME};
db.createUser(
  {
    user: "${ENV_DB_USER}",
    pwd: "${ENV_DB_PASS}",
    roles: [ { role: "userAdmin", db: "${ENV_DB_DB_NAME}" } ]
  }
);
db.User.insert( { booker:"${ENV_DB_USER}",password: "${BASE64PWD}",isAdmin: true, color: "#9e9e9e", email:"${EMAIL}"});
    
EOF

echo "Installing Head plugin on elasticsearch..."
echo ""
ES_DOCKER=`docker ps | grep elasticsearch_1 | cut -c1-12`
echo "docker exec -i ${ES_DOCKER} bash"
docker exec -i ${ES_DOCKER} bash <<EOF
/usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head

EOF