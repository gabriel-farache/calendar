#!/bin/sh

if [ ! -e "./cert.pem" ] || [ ! -e "./key.pem" ]
then
  echo ">> generating self signed cert"
  openssl req -x509 -newkey rsa:4086 \
  -subj "/C=XX/ST=XXXX/L=XXXX/O=XXXX/CN=${CN}" \
  -keyout "./key.pem" \
  -out "./cert.pem" \
  -days 3650 -nodes -sha256
fi