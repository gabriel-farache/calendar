<?php
function add_booking($db)
{
    $data          = json_decode(file_get_contents("php://input"));
    $room          = $data->room;
    $scheduleStart = $data->scheduleStart;
    $scheduleEnd   = $data->scheduleEnd;
    $day           = $data->day;
    $week          = $data->week;
    $year          = $data->year;
    $bookedBy      = $data->bookedBy;
    
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $newBooking = array(
            "room" => $room,
            "scheduleStart" => (float) $scheduleStart,
            "scheduleEnd" => (float) $scheduleEnd,
            "day" => $day,
            "week" => (int) $week,
            "year" => (int) $year,
            "bookedBy" => $bookedBy,
            "isValidated" => false
        );
        $collection->insert($newBooking);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'id' => $newBooking["_id"]->{'$id'},
                'msg' => "Booking Added Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 424 Method failure");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 424 Method failure");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function get_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $mongo_qry = array(
            '_id' => new MongoId($bookingID)
        );
        $booking   = $collection->findOne($mongo_qry);
        $err       = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array(
                "id" => $booking["_id"]->{'$id'},
                "room" => $booking["room"],
                "scheduleStart" => $booking["scheduleStart"],
                "scheduleEnd" => $booking["scheduleEnd"],
                "day" => $booking["day"],
                "week" => $booking["week"],
                "year" => $booking["year"],
                "bookedBy" => $booking["bookedBy"],
                "isValidated" => $booking["isValidated"]
            );
            $jsn  = json_encode($data);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err["err"]
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err["err"]
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function get_all_booking($db)
{
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $cursor = $collection->find();
        $err    = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "id" => $doc["_id"]->{'$id'},
                    "room" => $doc["room"],
                    "scheduleStart" => $doc["scheduleStart"],
                    "scheduleEnd" => $doc["scheduleEnd"],
                    "day" => $doc["day"],
                    "week" => $doc["week"],
                    "year" => $doc["year"],
                    "bookedBy" => $doc["bookedBy"],
                    "isValidated" => $doc["isValidated"]
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

function get_week_booking($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $week = $data->week;
    $year = $data->year;
    $room = $data->room;
    
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $mongo_qry = array(
            'week' => (int) $week,
            'year' => (int) $year,
            'room' => $room
        );
        $cursor    = $collection->find($mongo_qry);
        $err       = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "id" => $doc["_id"]->{'$id'},
                    "room" => $doc["room"],
                    "scheduleStart" => $doc["scheduleStart"],
                    "scheduleEnd" => $doc["scheduleEnd"],
                    "day" => $doc["day"],
                    "week" => $doc["week"],
                    "year" => $doc["year"],
                    "bookedBy" => $doc["bookedBy"],
                    "isValidated" => $doc["isValidated"]
                );
            }
            $jsn = json_encode($data);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err["err"]
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err["err"]
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
    
}


function delete_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;
    $username   = $data->username;
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $collection->remove(array(
            '_id' => new MongoId($bookingID),
            'bookedBy' => $username
        ));
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Bookings Deleted Successfully!!!",
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

function delete_bookings($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $bookingsIds = $data->bookingsIds;
    $collection  = $db->selectCollection(BOOKING_COLLECTION);
    $err         = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $errors = array();
        foreach ($bookingsIds as $id) {
            $collection->remove(array(
                '_id' => new MongoId($id)
            ));
            $err = $db->lastError();
            if (is_null($err["err"]) !== TRUE) {
                $errors[] = array(
                    'errID' => $id,
                    'error' => $err
                );
            }
        }
        if (count($errors) <= 0) {
            $arr = array(
                'msg' => "Bookings Deleted Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $errors
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

/** Function de mise à jour d'un produit **/

function update_booking($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $id   = $data->id;
    
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedBooking = array(
            "room" => $data->room,
            "scheduleStart" => $data->scheduleStart,
            "scheduleEnd" => $data->scheduleEnd,
            "day" => $data->day,
            "week" => $data->week,
            "year" => $data->year,
            "bookedBy" => $data->bookedBy,
            "isValidated" => $data->isValidated
        );
        $newdata        = array(
            '$set' => $updatedBooking
        );
        $c->update(array(
            "_id" => new MongoId($id)
        ), $newdata);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Booking Updated Successfully!!!",
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

function validate_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $id         = $data->id;
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $newdata = array(
            '$set' => array(
                "isValidated" => $data->isValidated
            )
        );
        $collection->update(array(
            "_id" => new MongoId($id)
        ), $newdata);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Booking Validated Successfully!!!",
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