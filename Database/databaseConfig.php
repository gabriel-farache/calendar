<?/****** Database Details *********/
 
    $host      = "localhost";
    $user      = "root";
    $pass      = "root";
    $database  = "calendar";
    $con       = mysqli_connect($host,$user,$pass, $database);
 
    if (mysqli_connect_errno()) {
        header("HTTP/1.1 503 Service Unavailable");
        print_r('Could not connect: ' . mysqli_connect_errno());
    }
 
 $GLOBALS['con'] = $con;
 ?>