<?php
function authenticate($db)
{
    $data            = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $username        = $data->username;
    $encodedPassword = $data->encodedPassword;
    
    $collection = $db->selectCollection(USER_COLLECTION);
    $user       = $collection->findOne(array(
        'booker' => $username,
        'password' => $encodedPassword
    ));

    $err        = $db->lastError();

    if (is_null($err["err"]) === TRUE && is_null($user) !== TRUE) {
        $isAdmin = $user['isAdmin'];
        return (createAuthenticationToken($db, $isAdmin));
    } else {
        header("HTTP/1.1 401 Unauthorized");
        if (is_null($user) === TRUE) {
            $arr = array(
                'error' => "Le compte '" . utf8_encode($username) . "' n'exite pas."
            );
            $jsn = json_encode($arr);
        } else {
            $arr = array(
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    }
    print_r($jsn);
    
}

function createAuthenticationToken($db, $isAdmin)
{
    date_default_timezone_set('Europe/Paris');
    $endAvailability = date("Y-m-d h:i", strtotime('+2 hours'));
    $token           = md5(uniqid(rand(), true));
    $collection      = $db->selectCollection(USER_TOKEN_COLLECTION);
    $newAuthToken    = array(
        'token' => $token,
        'endAvailability' => new MongoDate(strtotime($endAvailability)),
        'isAdmin' => $isAdmin
    );
    $collection->insert($newAuthToken);
    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $arr = array(
            'token' => $token,
            'endAvailability' => $endAvailability,
            'isAdmin' => $isAdmin,
            'msg' => "User Logged Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        //header("HTTP/1.1 401 Unauthorized");
        $arr = array(
            'msg' => "",
            'error' => 'Error when inserting token: ' . $token . ' endAvailability: ' . $endAvailability . '<br>' . $qryToken . '<br>' . $err
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
?>