#!/bin/bash

ES=`ping -c 1 elasticsearch | head -1  | cut -d "(" -f 2 | cut -d ")" -f 1`


echo "Waiting for Elasticsearch to start."
until curl ${ES}:9200/_cluster/health?pretty 2>&1 | grep status | egrep "(green|yellow)"; do
  printf '.'
  sleep 1
done
echo "Elasticsearch started."


echo SETUPELASTICSEARCH.sh time now: `date +"%T" `

echo "Installing Head plugin"
/usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head 


echo "Puting index v1"
curl -XPUT ${ES}:9200/${ALIAS_NAME}_v1

echo "Puting alias"
curl -XPUT ${ES}:9200/${ALIAS_NAME}_v1/_alias/${DATABASE_NAME_ALIAS}

echo "Puting index v2 with mappings"
curl -XPUT ${ES}:9200/${ALIAS_NAME}_v2 -d '{
      "mappings":{
         "booking":{
            "properties":{
               "bookedBy":{
                  "type":"string"
               },
               "day":{
                  "type":"string",
                  "index":  "not_analyzed"
               },
               "timeDay":{
                  "type":"boolean"
                                 },
               "isValidated":{
                  "type":"boolean"
               },
               "room":{
                  "type":"string"
               },
               "scheduleEnd":{
                  "type":"double"
               },
               "scheduleStart":{
                  "type":"double"
               },
               "week":{
                  "type":"long"
               },
               "year":{
                  "type":"long"
               }
            }
         }
     }
}'

echo "Reindexing"
curl -XPOST ${ES}:9200/_reindex -d '{
     "source" : {
      "index" : "${ALIAS_NAME}_v1"
     },
     "dest" : {
      "index" : "${ALIAS_NAME}_v2",
      "version_type": "external"
     }
    }'

echo "Updating aliases"
curl -XPOST ${ES}:9200/_aliases -d '
{
    "actions": [
        { "remove": {
            "index": "${ALIAS_NAME}_v1",
            "alias": "${DATABASE_NAME_ALIAS}"
        }},
        { "add": {
            "index": "${ALIAS_NAME}_v2",
            "alias": "${DATABASE_NAME_ALIAS}"
        }}
    ]
}
'
echo "Removing old v1 index"
curl -XDELETE ${ES}:9200/${ALIAS_NAME}_v1