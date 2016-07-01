<?php
function get_rooms($db)
{
    $collection = $db->selectCollection(ROOM_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $cursor = $collection->find();
        $err    = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "room" => $doc["room"]
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

function update_room($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $newRoomName = $data->newName;
    $oldRoomName = $data->oldName;
    //update the Room collection
    $err         = updateRoomIntoRoomCollection($db, $oldRoomName, $newRoomName);
    if (is_null($err["err"]) === TRUE) {
        //Updtae the rooms inside the Booking collection
        $err = updateRoomIntoBookingCollection($db, $oldRoomName, $newRoomName);
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Room Updated Successfully!!!",
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

function add_room($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $newRoomName = $data->newName;
    //update the Room collection
    $collection = $db->selectCollection(ROOM_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $newRoom = array(
            "room" => $newRoomName
        );
        $collection->insert($newRoom);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Room Added Successfully!!!",
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

function updateRoomIntoRoomCollection($db, $oldRoomName, $newRoomName)
{
    $collection = $db->selectCollection(ROOM_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedRoom = array(
            "room" => $newRoomName
        );
        $newdata     = array(
            '$set' => $updatedRoom
        );
        $collection->update(array(
            "room" => $oldRoomName
        ), $newdata);
        $err = $db->lastError();
    }
    return $err;
}

function updateRoomIntoBookingCollection($db, $oldRoomName, $newRoomName)
{
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedRoom = array(
            "room" => $newRoomName
        );
        $newdata     = array(
            '$set' => $updatedRoom
        );
        $collection->update(array(
            "room" => $oldRoomName
        ), $newdata, array(
            'multiple' => true
        ));
        $err = $db->lastError();
    }
    return $err;
}


function delete_room($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $roomName   = $data->roomName;
    $collection = $db->selectCollection(ROOM_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $collection->remove(array(
            'room' => $roomName
        ));
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Room Deleted Successfully!!!",
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