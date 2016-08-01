#!/bin/bash

conf=`cat app/scripts/config/app.config.js`;
conf=${conf//url: TO_BE_REPLACED/url: \'$ENV_BACKEND_URL\'};
echo $conf > app/scripts/config/app.config.js;
