<?php
DEFINE("ROOM_COLLECTION", "Room");

function get_rooms($db)
{
    $sql = "SELECT * FROM ".ROOM_COLLECTION;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            $data[] = array(
                "room" => $row["room"],
                "building" => $row["building"]
            );
        }
        $jsn = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error when inserting", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
        }
    }
    
    print_r($jsn);
}

function update_room($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $newRoomName = $data->newName;
    $oldRoomName = $data->oldName;
    $buildingName = $data->buildingName;
    $oldBuildingName = $data->oldBuildingName;
    //update the Room collection
    $err         = updateRoomIntoRoomCollection($db, $oldRoomName, $newRoomName, $buildingName, $oldBuildingName);
    if (is_null($err["err"]) === TRUE) {
        $arr = array(
            'msg' => "Room Updated Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);    
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }
    
    print_r($jsn);
}

function add_room($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $newRoomName = $data->newName;
    $buildingName = $data->buildingName;
    $sql = "INSERT INTO ".ROOM_COLLECTION." (room, building) VALUES ('".$newRoomName."', '".$buildingName."')";
    $result = mysqli_query($db, $sql); 
    if($result) {
        $arr = array(
            'msg' => "Room Added Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", $err);
    }
    
    print_r($jsn);
}

function updateRoomIntoRoomCollection($db, $oldRoomName, $newRoomName, $buildingName, $oldBuildingName)
{
    $sql = "UPDATE ".ROOM_COLLECTION." SET room = '". $newRoomName ."', building = '".$buildingName."'"
                ." WHERE room = '". $oldRoomName."' AND building = '".$oldBuildingName."'";
    $result = mysqli_query($db, $sql); 

    if ($result) {
        return NULL;
    } else {
        return (mysqli_error($db));
    }
}

function delete_room($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $roomName   = $data->roomName;
    $sql = "DELETE FROM ".ROOM_COLLECTION." WHERE room = '". $roomName."'";
    $result = mysqli_query($db, $sql); 

    if ($result) {
            $arr = array(
                'msg' => "Room Deleted Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }
    
    print_r($jsn);
}
?>