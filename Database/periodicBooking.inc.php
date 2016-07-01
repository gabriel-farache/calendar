<?php
function get_periodic_bookings($db) {
    $data        = json_decode(file_get_contents("php://input"));
    $booker = $data->booker;

    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $cursor = $collection->find(array(
            'bookedBy' => $booker
        ));
        $err    = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "id" => $doc["_id"]->{'$id'},
                    "periodicBookingScheduleStart" => $doc["periodicBookingScheduleStart"],
                    "periodicBookingScheduleEnd" => $doc["periodicBookingScheduleEnd"],
                    "periodicBookingWeeksDuration" => $doc["periodicBookingWeeksDuration"],
                    "periodicBookingStartingDay" => $doc["periodicBookingStartingDay"],
                    "periodicBookingStartingMonth" => $doc["periodicBookingStartingMonth"],
                    "periodicBookingStartingYear" => $doc["periodicBookingStartingYear"],
                    "room"  => $doc["room"]
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

function add_periodic_booking($db) {
    $data        = json_decode(file_get_contents("php://input"));
    $booker = $data->booker;
    $periodicBookingScheduleStart = $data->periodicBookingScheduleStart;
    $periodicBookingScheduleEnd = $data->periodicBookingScheduleEnd;
    $periodicBookingWeeksDuration = $data->periodicBookingWeeksDuration;
    $periodicBookingStartingDay = $data->periodicBookingStartingDay;
    $periodicBookingStartingMonth = $data->periodicBookingStartingMonth;
    $periodicBookingStartingYear = $data->periodicBookingStartingYear;

    
    $room = $data->room;

    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $newPeriodicBooking = array(
            "room" => $room,
            "periodicBookingScheduleStart" => (float) $periodicBookingScheduleStart,
            "periodicBookingStartingMonth" => (int) $periodicBookingStartingMonth,
            "periodicBookingStartingYear" => (int) $periodicBookingStartingYear,
            "periodicBookingScheduleEnd" => (float) $periodicBookingScheduleEnd,
            "periodicBookingWeeksDuration" => (int) $periodicBookingWeeksDuration,
            "periodicBookingStartingDay" => $periodicBookingStartingDay,
            "bookedBy" => $booker,
            "isValidated" => false
        );
        $collection->insert($newPeriodicBooking);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'id' => $newPeriodicBooking["_id"]->{'$id'},
                'msg' => "Periodic Booking Added Successfully!!!",
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

function delete_periodic_booking($db) {
    $data       = json_decode(file_get_contents("php://input"));
    $periodicBookingID  = $data->id;
    $username   = $data->username;
    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $collection->remove(array(
            '_id' => new MongoId($periodicBookingID),
            'bookedBy' => $username
        ));
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Periodic Booking Deleted Successfully!!!",
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

function validate_periodic_booking($db) {
    $data       = json_decode(file_get_contents("php://input"));
    $periodicBookingID = $data->id;
    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $newdata = array(
            '$set' => array(
                "isValidated" => $data->isValidated
            )
        );
        $collection->update(array(
            "_id" => new MongoId($periodicBookingID)
        ), $newdata);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Periodic Booking Validated Successfully!!!",
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