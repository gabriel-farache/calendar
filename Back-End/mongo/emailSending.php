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
    $dbConfFile = file_get_contents("database.conf");
    $dbConf = json_decode($dbConfFile, true);
    $host     = $dbConf['host'];
    $port     = $dbConf['port'];
    $user     = $dbConf['user'];
    $pass     = $dbConf['pass'];
    $database = $dbConf['database'];
    $replicaSet = $dbConf['replicaSet'];
    $connectionString = "mongodb://" . $user . ":" .$pass . "@" . $host . ":" . $port . "/" . $database;// . "?replicaSet=" . $replicaSet;
    
    
    $connection = new MongoClient($connectionString);
    $db         = $connection->selectDB($database);
    $collection = $db->UserToken;
    $result     = $collection->findOne(array(
        'token' => $adminAuthToken,
        'isAdmin' => true
    ));
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        return (is_null($result) !== TRUE);
    } else {
        print_r($err);
        return false;
    }
}
?> 

