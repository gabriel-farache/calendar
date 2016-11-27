<?php
DEFINE("USER_COLLECTION", "User");

function get_bookers($db)
{
    $sql = "SELECT booker, color FROM ".USER_COLLECTION;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            $data[] = array(
                "booker" => utf8_encode($row["booker"]),
                "color" => $row["color"]
            );
        }
        $jsn = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No booker found", mysqli_error($db));
        }
    }

    print_r($jsn);
}

function get_booker_email($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $booker     = $data->booker;

    $sql = "SELECT email FROM ".USER_COLLECTION." WHERE booker = '".$booker."'";
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            $data[] = array(
                "email" => $row["email"]
            );
        }
        $jsn = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) !== 0) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 404 Not found", "", "");
        }
    }

    print_r($jsn);
}
function update_booker($db)
{
    $data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $newBookerName  = $data->newName;
    $newBookerColor = $data->newColor;
    $oldBookerName  = $data->oldName;
    
    //update the Room collection
    $err = updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName, $newBookerColor);
    if (is_null($err["err"]) === TRUE) {
        $arr = array(
            'msg' => "Booker Updated Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", $err);
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

    $sql = "SELECT booker FROM ".USER_COLLECTION." WHERE booker = '".$booker. "'' AND password = '".$oldPassword."'";
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $sql = "UPDATE ".USER_COLLECTION." SET booker = '". $newBooker ."', email = '".$email."',"
            ." password = '".$password ."' WHERE booker = '". $booker."' AND password = '".$oldPassword."'";
        $result = mysqli_query($db, $sql); 

        if ($result) {
            $arr = array(
                'msg' => "User seetings Updated Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }
    
    print_r($jsn);
}

function updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName, $newBookerColor)
{
    $sql = "UPDATE ".USER_COLLECTION." SET booker = '". $newBookerName ."', color = '".$newBookerColor."'"
                ." WHERE booker = '". $oldBookerName."'";
    $result = mysqli_query($db, $sql); 

    if ($result) {
        return NULL;
    } else {
        return (mysqli_error($db));
    }
}

function delete_booker($db)
{
    $$data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $bookerName  = $data->name;

    $sql = "DELETE FROM ".USER_COLLECTION." WHERE booker = '". $bookerName."'";
    $result = mysqli_query($db, $sql); 

    if ($result) {
        $arr = array(
                'msg' => "Booker Deleted Successfully!!!",
                'error' => ''
            );
        $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }
    
    print_r($jsn);
}
?>