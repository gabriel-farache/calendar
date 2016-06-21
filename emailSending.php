<?php
$data = json_decode(file_get_contents("php://input"));
$subject = $data->subject;
$to = $data->email;
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
    mail($to,$subject,$message,$headers);
    $arr = array(
        'msg' => "email sent";
    );
    $jsn = json_encode($arr);
    print_r($jsn);
} else {
    header("HTTP/1.1 401 Unauthorized");
    $arr = array(
        'errorCode' => "-1",
        'error' => 'Not a valid admin action.'
    );
    $jsn = json_encode($arr);
    print_r($jsn);
}

function isValidAndAdminToken($adminAuthToken)
{
    $host     = "localhost";
    $port     = 27017;
    $user     = "root";
    $pass     = "root";
    $database = "calendar";
    
    $connection = new MongoClient("mongodb://" . $host . ":" . $port . "/?replicaSet=rs0");
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

