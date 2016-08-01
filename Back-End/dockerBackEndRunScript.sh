#!/bin/bash

conf=`cat database.conf`;
conf=${conf//host : DB_HOST/host : \'$ENV_DB_HOST\'};
conf=${conf//port : DB_PORT/port : $ENV_DB_PORT};
conf=${conf//user : DB_USER/user : \'$ENV_DB_USER\'};
conf=${conf//pass : DB_PASS/pass : \'$ENV_DB_PASS\'};
conf=${conf//database : DB_DB_NAME/database : \'$ENV_DB_DB_NAME\'};
conf=${conf//replicaSet : DB_REPLICASET/replicaSet : \'$ENV_DB_REPLICASET\'};

echo $conf > database.conf;
