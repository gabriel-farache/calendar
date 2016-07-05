<?php
DEFINE("PERIODIC_BOOKING_COLLECTION", "PeriodicBooking");

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
                    "room"  => $doc["room"],
                    "isValidated" => $doc["isValidated"],
                    "bookedBy" => $doc["bookedBy"],
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

function get_periodic_booking($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $periodicBookingID  = $data->periodicBookingID;
    print_r(getPeriodicBooking($db, $periodicBookingID));
}

function getPeriodicBooking($db, $periodicBookingID)
{
    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $mongo_qry = array(
            '_id' => new MongoId($periodicBookingID)
        );
        $periodicBooking   = $collection->findOne($mongo_qry);
        $err       = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array(
                "id" => $periodicBooking["_id"]->{'$id'},
                "periodicBookingScheduleStart" => $periodicBooking["periodicBookingScheduleStart"],
                "periodicBookingScheduleEnd" => $periodicBooking["periodicBookingScheduleEnd"],
                "periodicBookingWeeksDuration" => $periodicBooking["periodicBookingWeeksDuration"],
                "periodicBookingStartingDay" => $periodicBooking["periodicBookingStartingDay"],
                "periodicBookingStartingMonth" => $periodicBooking["periodicBookingStartingMonth"],
                "periodicBookingStartingYear" => $periodicBooking["periodicBookingStartingYear"],
                "bookedBy" => $periodicBooking["bookedBy"],
                "isValidated" => $periodicBooking["isValidated"],
                "room"  => $periodicBooking["room"]
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
    return $jsn;
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
    $periodicBookingID  = $data->periodicBookingID;
    $username   = $data->username;
    $currentWeek   = $data->currentWeek;
    $dayStr = $data->dayStr;
    $leftWeekDuration = (int)$data->leftWeekDuration;
    $periodicBooking = getPeriodicBooking($db, $periodicBookingID);
    $collection = $db->selectCollection(PERIODIC_BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $jsn = delete_periodic_booking_entry($db, $collection, $periodicBookingID, $username);
        if($jsn === TRUE){
            $jsn = delete_booking_booked_for_periodic_booking($db, json_decode($periodicBooking),
                         (int)$currentWeek, $dayStr, $leftWeekDuration);
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

function delete_periodic_booking_entry($db, $collection, $periodicBookingID, $username) {
    $jsn = TRUE;
    $collection->remove(array(
        '_id' => new MongoId($periodicBookingID),
        'bookedBy' => $username
    ));
    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE) {

    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array(
            'msg' => "",
            'error' => $err
        );
        $jsn = json_encode($arr);
    }

    return $jsn;
}


function delete_booking_booked_for_periodic_booking($db, $periodicBooking, $currentWeek, $dayStr, $leftWeekDuration){
    if((bool)$periodicBooking->isValidated){
        $collection  = $db->selectCollection(BOOKING_COLLECTION);
        $err        = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $regex = new MongoRegex("/^".$dayStr."/m");
            $mongo_qry_p1 = array(
                'isPeriodic' => true,
                'year'  => $periodicBooking->periodicBookingStartingYear,
                'week' => array('$gt'=> $currentWeek,
                                 '$lte'=> (($currentWeek+$leftWeekDuration))),
                'scheduleStart' => $periodicBooking->periodicBookingScheduleStart,
                'scheduleEnd'   => $periodicBooking->periodicBookingScheduleEnd,
                'bookedBy'      => $periodicBooking->bookedBy,
                'day'           => $regex,
                'room'          => $periodicBooking->room
            );  
            print_r($mongo_qry_p1);     
            $collection->remove($mongo_qry_p1);
            $err        = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $mongo_qry_p2 = array(
                    'isPeriodic' => true,
                    'week' => array('$gt'  => $periodicBooking->periodicBookingStartingYear,
                                     '$lte'=> (($currentWeek+(int)$leftWeekDuration)%52)),
                    'scheduleStart' => $periodicBooking->periodicBookingScheduleStart,
                    'scheduleEnd'   => $periodicBooking->periodicBookingScheduleEnd,
                    'bookedBy'      => $periodicBooking->bookedBy,
                    'day'           => $regex,
                    'room'          => $periodicBooking->room
                );
                $collection->remove($mongo_qry_p2);
                $err        = $db->lastError();
                if (is_null($err["err"]) === TRUE) {
                    $arr = array(
                    'msg' => "Periodic booking and dependencies Successfully removed!",
                    'error' => ""
                    );
                    $jsn = json_encode($arr);
                } else {
                    header("HTTP/1.1 418 I am a teapot");
                    $arr = array(
                        'msg' => "Error when executing part 2",
                        'error' => $err
                    );
                    $jsn = json_encode($arr);
                } 
            } else {
                header("HTTP/1.1 418 I am a teapot");
                $arr = array(
                    'msg' => "Error when executing part 1",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
        } else {
            $arr = array(
                'msg' => "Error when getting the collection",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }

    } else {
        $arr = array(
            'msg' => "The periodic Booking ID is not set or the booking is not validated",
            'error' => $periodicBooking
        );
        $jsn = json_encode($arr);
    }

    return $jsn;
}

function validate_periodic_booking($db) {
    $data       = json_decode(file_get_contents("php://input"));
    $periodicBookingID = $data->periodicBookingID;
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