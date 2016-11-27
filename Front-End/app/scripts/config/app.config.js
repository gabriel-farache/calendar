/*
angular.module('calendarApp').constant('WS_CONF', { 
                            url: 'ENV_BACKEND_URL',
                            root_File: 'ENV_BACKEND_ROOTFILE',
                            rootFolder: 'ENV_BACKEND_ROOTFOLDER' });
*/
//angular.module('calendarApp').constant('WS_ADDR', { url: 'http://ec2-52-59-246-193.eu-central-1.compute.amazonaws.com:8080/' });
angular.module('calendarApp').constant('WS_CONF', {
                                 url: 'http://localhost:8081/',
                                 rootFile: 'CRUD_mysql.php',
                                 rootFolder: 'mysql/' });
//angular.module('calendarApp').constant('WS_ADDR', { url: 'https://calendar-pechbusque-db.herokuapp.com/' });