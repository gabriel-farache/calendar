#!/bin/bash

MONGODB1=`ping -c 1 mongo1 | head -1  | cut -d "(" -f 2 | cut -d ")" -f 1`
#MONGODB2=`ping -c 1 mongo2 | head -1  | cut -d "(" -f 2 | cut -d ")" -f 1`
#MONGODB3=`ping -c 1 mongo3 | head -1  | cut -d "(" -f 2 | cut -d ")" -f 1`


echo "Waiting for Mongo startup.."
until curl http://${MONGODB1}:28017/serverStatus\?text\=1 2>&1 | grep uptime | head -1; do
  printf '.'
  sleep 1
done

echo curl http://${MONGODB1}:28017/serverStatus\?text\=1 2>&1 | grep uptime | head -1
echo "Mongo Started.."


echo SETUPMONGO.sh time now: `date +"%T" `
mongo --host ${MONGODB1}:27017 <<EOF
   var cfg = {
        "_id": "rs0",
        "version": 1,
        "members": [
            {
                "_id": 0,
                "host": "${MONGODB1}:27017",
                "priority": 2
            }
        ]
    };
    rs.initiate(cfg, { force: true });
    rs.reconfig(cfg, { force: true });
EOF
mongo --host ${MONGODB1}:27017 <<EOF
    use $DATABASE_NAME;
    db.createUser(
      {
        user: "$USER",
        pwd: "$PASSWORD",
        roles: [ { role: "userAdmin", db: "$DATABASE_NAME" } ]
      }
    );
    db.User.insert( { booker:"$USER",password: "$BASE64PWD",isAdmin: true, color: "#9e9e9e", email:"$EMAIL"});
EOF



