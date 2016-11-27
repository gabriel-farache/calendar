<?php
function get_free_rooms_for_slot($db)
{
    $data          = json_decode(file_get_contents("php://input"));
    $day           = $data->day;
    $scheduleStart = $data->scheduleStart;
    $scheduleEnd   = $data->scheduleEnd;

    $occupiedRooms_sql = "SELECT DISTINCT room FROM ".BOOKING_COLLECTION." WHERE day = '".$day."' AND".
                    "((scheduleStart >= ".$scheduleStart." AND scheduleStart < ".$scheduleEnd.")".
                    "OR (scheduleEnd > ".$scheduleStart." AND scheduleEnd <= ".$scheduleEnd."))";

    $sql = "SELECT * FROM ".ROOM_COLLECTION." WHERE roomID NOT IN (".$occupiedRooms_sql.")";
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $freeRooms = array();
        while($row = mysqli_fetch_assoc($result)) {
            $freeRooms[] = array(
                "freeRoom" => $row["room"]
            );
        }
        
        $jsn = json_encode($freeRooms);

    } else {
        if (mysqli_affected_rows($db) !== 0) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        }
    }

    print_r($jsn);
}
?>