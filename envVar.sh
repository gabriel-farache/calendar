ENV_BACKEND_URL='https://calendar-pechbusque-db.herokuapp.com/'

ENV_DB_HOST='ds017155.mlab.com'
ENV_DB_PORT='17155'
ENV_DB_USER='pechbusque'
ENV_DB_PASS='Azerty'
ENV_DB_DB='heroku_g164v8r4'
ENV_DB_REPLICASET='rs-ds017155'

while getopts "b:o:p:u:w:d:r:h" opt; do
  case $opt in
    b)
      ENV_BACKEND_URL=$opt;
      ;;
    o)
      ENV_DB_HOST=$opt;
      ;;
    p)
      ENV_DB_PORT=$opt;
      ;;
    u)
      ENV_DB_USER=$opt;
      ;;
    w)
      ENV_DB_PASS=$opt;
      ;;
    d)
      ENV_DB_DB_NAME=$opt;
      ;;
    r)
      ENV_DB_REPLICASET=$opt;
      ;;
    h)
        echo "usage: deploy.sh -b BACKEND_URL -o DB_HOST -p DB_PORT -u DB_USER -w DB_PWD -d DB_DB_NAME -r DB_REPLICASET"
        exit 1
        ;;
    \?)
      echo "Invalid option: -$OPTARG. See -h for help" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument. See -h for help" >&2
      exit 1
      ;;
  esac
done

docker run -e ENV_BACKEND_URL=$ENV_BACKEND_URL -p 9000:9000 -d pechbusque-calendar:frontEnd
docker run -e ENV_DB_HOST=$ENV_DB_HOST -e ENV_DB_PORT=$ENV_DB_PORT -e ENV_DB_USER=$ENV_DB_USER -e ENV_DB_PASS=$ENV_DB_PASS -e ENV_DB_DB_NAME=$ENV_DB_DB_NAME -e ENV_DB_REPLICASET=$ENV_DB_REPLICASET -p 8080:80 -d pechbusque-calendar:backEnd 
