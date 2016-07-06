<?php
function get_free_rooms_for_slot($db)
{
    $data          = json_decode(file_get_contents("php://input"));
    $day           = $data->day;
    $scheduleStart = $data->scheduleStart;
    $scheduleEnd   = $data->scheduleEnd;
    $collection    = $db->selectCollection(BOOKING_COLLECTION);
    $err           = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $mongo_qry = array(
            'day' => $day,
            '$or' => array(
                array(
                    'scheduleStart' => array(
                        '$gte' => (float) $scheduleStart,
                        '$lt' => (float) $scheduleEnd
                    )
                ),
                array(
                    'scheduleEnd' => array(
                        '$gt' => (float) $scheduleStart,
                        '$lte' => (float) $scheduleEnd
                    )
                )
            )
        );
        $cursor    = $collection->distinct("room", $mongo_qry);
        $err       = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $occupiedRooms = array();
            if ($cursor) {
                foreach ($cursor as $doc) {
                    array_push($occupiedRooms, $doc);
                    
                }
            }
            $collection = $db->selectCollection(ROOM_COLLECTION);
            $cursor     = $collection->find(array(
                'room' => array(
                    '$nin' => $occupiedRooms
                )
            ));
            $err        = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $freeRooms = array();
                foreach ($cursor as $doc) {
                    $freeRooms[] = array(
                        "freeRoom" => $doc["room"]
                    );
                }
                
                $jsn = json_encode($freeRooms);
                
            } else {
                $jsn = handleMongoErr("HTTP/1.1 418 I am a teapot", "", $err);
            }
            
        } else {
            $jsn = handleMongoErr("HTTP/1.1 418 I am a teapot", "", $err);
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 418 I am a teapot", "", $err);
    }
    print_r($jsn);
}
?>