<?php
DEFINE("USER_COLLECTION", "User");

function get_bookers($db)
{
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $cursor = $collection->find();
        $err    = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "booker" => utf8_encode($doc["booker"]),
                    "color" => $doc["color"]
                );
            }
            $jsn = json_encode($data);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function get_booker_email($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $booker     = $data->booker;
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $result     = $collection->findOne(array(
            'booker' => $booker
        ));
        
        $err = $db->lastError();
        if (isset($err["err"]) !== TRUE && isset($result) === TRUE) {
            
            $data = array('email' => $result['email']);
            $jsn = json_encode($data);
        } else {
            header("HTTP/1.1 404 Not Found");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
function update_booker($db)
{
    $data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $newBookerName  = $data->newName;
    $newBookerColor = $data->newColor;
    $oldBookerName  = $data->oldName;
    $collection = $db->selectCollection(USER_COLLECTION);
    //update the Room collection
    $err = updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName, $newBookerColor);
    if (is_null($err["err"]) === TRUE) {
        $err = updateBookerIntoBookingCollection($db, $oldBookerName, $newBookerName);
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Booker Updated Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }
    
    print_r($jsn);
}

function update_booker_settings($db)
{
    $data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $booker         = $data->booker;
    $newBooker      = $data->newBooker;
    $email          = $data->email;
    $oldPassword    = $data->password;
    $newPassword    = $data->newPassword;

    $password       = (int)$newPassword == -1 ? $oldPassword : $newPassword;
    $collection     = $db->selectCollection(USER_COLLECTION);
    $err            = $db->lastError();
    $user           = $collection->findOne(array(
        'booker' => $booker,
        'password' => $oldPassword
    ));

    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE && is_null($user) !== TRUE) {
        if (is_null($err["err"]) === TRUE) {
            $updatedBooker = array(
                "booker"    => $newBooker,
                "email"     =>$email,
                "password"  => $password
            );
            $newdata     = array(
                '$set' => $updatedBooker
            );
            $collection->update(array(
                "booker" => $booker,
                "password"  => $oldPassword
            ), $newdata);
            $err = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $err = updateBookerIntoBookingCollection($db, $booker, $newBooker);
                if (is_null($err["err"]) === TRUE) {
                    $arr = array(
                        'msg' => "User seetings Updated Successfully!!!",
                        'error' => ''
                    );
                    $jsn = json_encode($arr);
                } else {
                    header("HTTP/1.1 418 I am a teapot");
                    $arr = array(
                        'msg' => "",
                        'error' => $err
                    );
                    $jsn = json_encode($arr);
                }
            } else {
                header("HTTP/1.1 418 I am a teapot");
                $arr = array(
                    'msg' => "",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array(
                'msg' => "",
                'error' => "Password or username incorrect."
            );
        $jsn = json_encode($arr);
    }
    
    print_r($jsn);
}

function updateBookerIntoBookingCollection($db, $oldBookerName, $newBookerName)
{
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedBooker = array(
            "bookedBy" => $newBookerName
        );
        $newdata     = array(
            '$set' => $updatedBooker
        );
        $collection->update(array(
            "bookedBy" => $oldBookerName
        ), $newdata, array(
            'multiple' => true
        ));
        $err = $db->lastError();
    }
    return $err;
}

function updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName)
{
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedBooker = array(
            "booker" => $newBookerName
        );
        $newdata     = array(
            '$set' => $updatedBooker
        );
        $collection->update(array(
            "booker" => $oldBookerName
        ), $newdata, array(
            'multiple' => true
        ));
        $err = $db->lastError();
    }
    return $err;
}



function delete_booker($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $booker     = $data->booker;
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $collection->remove(array(
            'room' => $roomName
        ));
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Booker Deleted Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }
    
    print_r($jsn);
}
?>