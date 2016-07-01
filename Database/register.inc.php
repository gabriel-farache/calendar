<?php
function register($db)
{
    date_default_timezone_set('Europe/Paris');
    $data                = json_decode(file_get_contents("php://input"));
    $email               = $data->email;
    $username            = $data->username;
    $encodedPassword     = $data->encodedPassword;
    $generatedAdminToken = $data->adminToken;
    
    $collection = $db->selectCollection(ADMIN_TOKEN_COLLECTION);
    $mongoDate  = new MongoDate(strtotime(date("Y-m-d h:i")));
    $result     = $collection->findOne(array(
        'adminToken' => $generatedAdminToken,
        'adminTokenEndTime' => array(
            '$gte' => $mongoDate
        )
    ));
    
    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE && is_null($result) !== TRUE) {
        $collection = $db->selectCollection(USER_COLLECTION);
        $result     = $collection->findOne(array(
            'booker' => $username
        ));
        $err        = $db->lastError();
        if (is_null($err["err"]) === TRUE && is_null($result) === TRUE) {
            $newUser = array(
                'booker'    => $username,
                'password'  => $encodedPassword,
                'email'     => $email,
                'color'     => '#FFFFFF'
            );
            $collection->insert($newUser);
            $err = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $qryDeleteAdminToken = 'Delete FROM adminToken WHERE adminToken = "' . $generatedAdminToken . '"';
                $collection          = $db->selectCollection(ADMIN_TOKEN_COLLECTION);
                $collection->remove(array(
                    'adminToken' => $generatedAdminToken
                ));
                $arr = array(
                    'id' => $newUser["_id"]->{'$id'},
                    'msg' => "User Added Successfully!!!",
                    'error' => ''
                );
                $jsn = json_encode($arr);
            } else {
                header("HTTP/1.1 401 Unauthorized");
                $arr = array(
                    'msg' => "",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
            
        } else {
            if (is_null($result) !== TRUE) {
                header("HTTP/1.1 409 Conflict");
                $arr = array(
                    'msg' => "",
                    'error' => "The user '" . $username . "' already exists"
                );
                $jsn = json_encode($arr);
            } else {
                header("HTTP/1.1 409 Conflict");
                $arr = array(
                    'msg' => "",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
        }
        
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array(
            'error' => 'The admin token is not good: ' . $generatedAdminToken
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
?>