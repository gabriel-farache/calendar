<?php
function register($db)
{
    date_default_timezone_set('Europe/Paris');
    $data                = json_decode(file_get_contents("php://input"));
    $email               = $data->email;
    $username            = $data->username;
    $encodedPassword     = $data->encodedPassword;
    $generatedAdminToken = $data->adminToken;

    $sql = "SELECT * FROM ".ADMIN_TOKEN_COLLECTION." WHERE adminToken = '".$generatedAdminToken."'"
            ." AND adminTokenEndTime >= '".date("Y-m-d H:i")."'";
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $sql = "SELECT * FROM ".USER_COLLECTION." WHERE booker = '".$username."'";
        $result = mysqli_query($db, $sql); 

        if (mysqli_num_rows($result) > 0) {
            $jsn = handleMongoErr("HTTP/1.1 409 Conflict",
                    "The user '" . $username . "' already exists", "");
        } else {
            if(mysqli_affected_rows($db) === 0) {
                $sql = "INSERT INTO ".USER_COLLECTION." (booker, password, email, color)"
                    ." VALUES ('".$username."','".$encodedPassword."','".$email."', '#FFFFFF')";
                $result = mysqli_query($db, $sql); 
                if($result) {
                    $arr = array(
                        'id' => mysqli_insert_id($db),
                        'msg' => "User Added Successfully!!!",
                        'error' => ''
                    );
                    $qryDeleteAdminToken = "DELETE FROM ".ADMIN_TOKEN_COLLECTION
                                    ." WHERE adminToken = '" . $generatedAdminToken . "'";
                    $result = mysqli_query($db, $sql);
                }
            } else {
                $jsn = handleMongoErr("HTTP/1.1 409 Conflict", "", mysqli_error($db));
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 401 Unauthorized", "The admin token is not good: " . $generatedAdminToken, mysqli_error($db));
    }
    
    print_r($jsn);
}
?>