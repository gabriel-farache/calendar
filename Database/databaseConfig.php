<?/****** Database Details *********/
 $origin=isset($_SERVER['HTTP_ORIGIN'])?$_SERVER['HTTP_ORIGIN']:$_SERVER['HTTP_HOST'];
header('Access-Control-Allow-Origin: '.$origin);        
header('Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT');
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Headers: Authorization, origin, x-requested-with, content-type");
header('P3P: CP="NON DSP LAW CUR ADM DEV TAI PSA PSD HIS OUR DEL IND UNI PUR COM NAV INT DEM CNT STA POL HEA PRE LOC IVD SAM IVA OTC"');
header('Access-Control-Max-Age: 1');
    $host      = "localhost";
    $port	   = 27017;
    $user      = "root";
    $pass      = "root";
    $database  = "calendar";
    $con       = mysqli_connect($host,$user,$pass, $database);

    $connection = new MongoClient("mongodb://".$host.":".$port); 
    $db = $connection.selectDB($database);
 
    if (mysqli_connect_errno()) {
        header("HTTP/1.1 503 Service Unavailable");
        print_r('Could not connect: ' . mysqli_connect_errno());
    }
 
 $GLOBALS['con'] = $con;
 $GLOBALS['db'] = $db;
 ?>