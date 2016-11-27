<?php
$data = json_decode(file_get_contents("php://input"));
$subject = $data->subject;
$to = $data->to;
$message = $data->message;
$from = $data->from;
$cc = $data->cc;
$adminAuthToken = $data->adminAuthToken;


// Always set content-type when sending HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

// More headers
$headers .= 'From: '. $from . "\r\n";
$headers .= 'Cc: '. $cc . "\r\n";

if(isValidAndAdminToken($adminAuthToken)){ 
    if(mail($to,$subject,$message,$headers)) {
        $arr = array(
            'msg' => "email sent"
        );
        $jsn = json_encode($arr);
    } else {
        $arr = array(
            'msg' => "email not sent"
        );
        $jsn = json_encode($arr);

    }
    
    print_r($jsn);
} else {
    $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", "Not a valid admin action.", -1);
    print_r($jsn);
}

function isValidAndAdminToken($adminAuthToken)
{
    date_default_timezone_set('Europe/Paris');
    $dbConfFile = file_get_contents("database.conf");
    $dbConf = json_decode($dbConfFile, true);
    $host     = $dbConf['host'];
    $port     = $dbConf['port'];
    $user     = $dbConf['user'];
    $pass     = $dbConf['pass'];
    $database = $dbConf['database'];
    //print_r($host.", ".$user.", ".$pass.", ".$database.", ".$port);
    $db         = mysqli_connect($host, $user, $pass, $database, $port);
    
    if (!$db) {
        handleCommonErr("HTTP/1.1 503 Service Unavailable", "Error connection to MySQL DB", mysqli_connect_error($db));
    }

    $sql = "SELECT * FROM UserToken WHERE token = '".$adminAuthToken."'"
            ." AND endAvailability >= '".date("Y-m-d H:i")."' AND isAdmin = true";
    $result = mysqli_query($db, $sql); 
    return (mysqli_num_rows($result) > 0);
}
?> 

