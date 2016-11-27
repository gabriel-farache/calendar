<?php
function authenticate($db)
{
    $data            = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $username        = $data->username;
    $encodedPassword = $data->encodedPassword;

    $sql = "SELECT * FROM ".USER_COLLECTION." WHERE booker = '".$username."' AND password = '".$encodedPassword."'";
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        while($row = mysqli_fetch_assoc($result)) {
            $isAdmin = $row['isAdmin'];
            $userEmail = $row['email'];
            return (createAuthenticationToken($db, $isAdmin, $userEmail));
        }
        
    } else {
        if(mysqli_affected_rows($db) === 0) {
            $jsn = handleMongoErr("HTTP/1.1 401 Unauthorized", "The user ".$username." does not exist or wrong password", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 401 Unauthorized", "", mysqli_error($db));
        }
    }
    print_r($jsn);
    
}

function createAuthenticationToken($db, $isAdmin, $userEmail)
{
    date_default_timezone_set('Europe/Paris');
    $endAvailability = date("Y-m-d H:i", strtotime('+4 hours'));
    $token           = md5(uniqid(rand(), true));

    $sql = "INSERT INTO ".USER_TOKEN_COLLECTION." (token, endAvailability, isAdmin)"
                ." VALUES ('".$token."','".$endAvailability."',".$isAdmin.")";
    $result = mysqli_query($db, $sql); 

    if ($result) {
        $arr = array(
            'token' => $token,
            'endAvailability' => $endAvailability,
            'isAdmin' => $isAdmin == 1,  
            'userEmail' => $userEmail,
            'msg' => "User Logged Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 401 Unauthorized",
         "Error when inserting token: '" . $token . "' endAvailability: '" . $endAvailability . "'<br>" . $sql,
          mysqli_error($db));

    }
    print_r($jsn);
}
?>