<?php
DEFINE("PERIODIC_BOOKING_COLLECTION", "PeriodicBooking");

function get_periodic_bookings($db) {
    $data        = json_decode(file_get_contents("php://input"));
    $booker = $data->booker;

    $bookerID = getBookerID($db, $booker);

    if (!is_null($bookerID))  {
        $sql = "SELECT * FROM ".PERIODIC_BOOKING_COLLECTION." WHERE bookedBy = ".$bookerID;
        $result = mysqli_query($db, $sql); 

        if (mysqli_num_rows($result) > 0) {
            $data = array();
            while($row = mysqli_fetch_assoc($result)) {
                $room = getRoomName($db, $row["room"]);

                if (!is_null($room))  {   
                    $data[] = array(
                        "id" => $row["periodicBookingID"],
                        "periodicBookingScheduleStart" => $row["periodicBookingScheduleStart"],
                        "periodicBookingScheduleEnd" => $row["periodicBookingScheduleEnd"],
                        "periodicBookingWeeksDuration" => $row["periodicBookingWeeksDuration"],
                        "periodicBookingStartingDay" => $row["periodicBookingStartingDay"],
                        "periodicBookingStartingMonth" => $row["periodicBookingStartingMonth"],
                        "periodicBookingStartingYear" => $row["periodicBookingStartingYear"],
                        "room"  => $room,
                        "isValidated" => $row["isValidated"] == 1,
                        "bookedBy" => $booker,
                    );
                }
            }
            $jsn  = json_encode($data);
        }  else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
            } else {
                $data = array();
                $jsn = json_encode($data);
            }        
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Booker not found", mysqli_error($db));
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

    $sql = "SELECT * FROM ".PERIODIC_BOOKING_COLLECTION." WHERE periodicBookingID = ".$periodicBookingID;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = array();
        $row = mysqli_fetch_assoc($result); 
        $room = getRoomName($db, $row["room"]);
        $booker = getBookerName($db, $row["bookedBy"]);

        if (!is_null($room) && !is_null($booker))  {   
            $data = array(
                "id" => $row["periodicBookingID"],
                "periodicBookingScheduleStart" => $row["periodicBookingScheduleStart"],
                "periodicBookingScheduleEnd" => $row["periodicBookingScheduleEnd"],
                "periodicBookingWeeksDuration" => $row["periodicBookingWeeksDuration"],
                "periodicBookingStartingDay" => $row["periodicBookingStartingDay"],
                "periodicBookingStartingMonth" => $row["periodicBookingStartingMonth"],
                "periodicBookingStartingYear" => $row["periodicBookingStartingYear"],
                "room"  => $room,
                "isValidated" => $row["isValidated"],
                "bookedBy" => $booker,
            );
        }
        $jsn  = json_encode($data);
    }  else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }

    return $jsn;
}


function add_periodic_booking($db) {
    $data        = json_decode(file_get_contents("php://input"));
    
    $periodicBookingScheduleStart = $data->periodicBookingScheduleStart;
    $periodicBookingScheduleEnd = $data->periodicBookingScheduleEnd;
    $periodicBookingWeeksDuration = $data->periodicBookingWeeksDuration;
    $periodicBookingStartingDay = $data->periodicBookingStartingDay;
    $periodicBookingStartingMonth = $data->periodicBookingStartingMonth;
    $periodicBookingStartingYear = $data->periodicBookingStartingYear;
    
    $room = $data->room;
    $booker = $data->booker;

    $roomID = getRoomID($db, $room);
    $bookerID = getBookerID($db, $booker);

    if (!is_null($roomID) && !is_null($bookerID))  {

        $sql = "INSERT INTO ".PERIODIC_BOOKING_COLLECTION." (room, periodicBookingScheduleStart,"
            ." periodicBookingStartingMonth, periodicBookingStartingYear, periodicBookingScheduleEnd,"
            ." periodicBookingWeeksDuration, periodicBookingStartingDay, isValidated, bookedBy)"
            ." VALUES (".$roomID.",".(float) $periodicBookingScheduleStart.","
            .(int) $periodicBookingStartingMonth.", ".(int) $periodicBookingStartingYear.", "
            .(float) $periodicBookingScheduleEnd.",".(int) $periodicBookingWeeksDuration.", '"
            .$periodicBookingStartingDay."', false, ".$bookerID." )";
        $result = mysqli_query($db, $sql); 

        if ($result) {
            $arr = array(
                'id' => mysqli_insert_id($db),
                'msg' => "Periodic Booking Added Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
            
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room or Booker not found", mysqli_error($db));
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

    $isValidated = check_periodic_booking_validation($db, $periodicBookingID);

    $jsn = delete_periodic_booking_entry($db, $periodicBookingID, $username);
    if($jsn === 1 && $isValidated){
        $jsn = delete_booking_booked_for_periodic_booking($db, json_decode($periodicBooking),
                     (int)$currentWeek, $dayStr, $leftWeekDuration);
    }
    print_r($jsn);
}

function check_periodic_booking_validation($db, $periodicBookingID) {
    $sql = "SELECT periodicBookingID FROM ".PERIODIC_BOOKING_COLLECTION." WHERE periodicBookingID = ".$periodicBookingID
    ." AND isValidated = ".true;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        return true;
    } else {
        return false;
    }
}

function delete_periodic_booking_entry($db, $periodicBookingID, $username) {

    $jsn = 0;
    $bookerID = getBookerID($db, $username);

    if (!is_null($bookerID))  {

        $sql = "DELETE FROM ".PERIODIC_BOOKING_COLLECTION." WHERE periodicBookingID = ".$periodicBookingID
        ." AND bookedBy = '". $bookerID."'";
        $result = mysqli_query($db, $sql); 

        if ($result) {
            $jsn = 1;
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Booker not found", mysqli_error($db));
    } 

    return $jsn;
}


function delete_booking_booked_for_periodic_booking($db, $periodicBooking, $currentWeek, $dayStr, $leftWeekDuration){
    if((bool)$periodicBooking->isValidated){

        $roomID = getRoomID($db, $periodicBooking->room);
        $bookerID = getBookerID($db, $periodicBooking->bookedBy);
        if (!is_null($roomID) && !is_null($bookerID))  {

            $sql = "DELETE FROM ".BOOKING_COLLECTION." WHERE room = ".$roomID
                ." AND isPeriodic = TRUE AND year = ". $periodicBooking->periodicBookingStartingYear
                ." AND week > ".$currentWeek. " AND week <= ".($currentWeek+$leftWeekDuration)
                ." AND scheduleStart = ".$periodicBooking->periodicBookingScheduleStart
                ." AND scheduleEnd = ".$periodicBooking->periodicBookingScheduleEnd
                ." AND bookedBy = ".$bookerID." AND day LIKE '%".$dayStr."%'";
            $result = mysqli_query($db, $sql); 
            if ($result) {
                $sql = "DELETE FROM ".BOOKING_COLLECTION." WHERE room = ".$roomID
                    ." AND isPeriodic = TRUE AND year = ". $periodicBooking->periodicBookingStartingYear
                    ." AND week > ".$periodicBooking->periodicBookingStartingYear
                    ." AND week <= ".(($currentWeek+(int)$leftWeekDuration)%52)
                    ." AND scheduleStart = ".$periodicBooking->periodicBookingScheduleStart
                    ." AND scheduleEnd = ".$periodicBooking->periodicBookingScheduleEnd
                    ." AND bookedBy = ".$bookerID." AND day LIKE '%".$dayStr."%'";
                $result = mysqli_query($db, $sql); 
                if ($result) {
                    $arr = array(
                    'msg' => "Periodic booking and dependencies Successfully removed!",
                    'error' => ""
                    );
                    $jsn = json_encode($arr);
                } else {
                    $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error when executing part 2", mysqli_error($db));
                }

            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error when executing part 1", mysqli_error($db));
            }
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room or Booker not found", mysqli_error($db));
        } 
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "The periodic Booking ID is not set or the booking is not validated", $periodicBooking);
    }

    return $jsn;
}

function validate_periodic_booking($db) {
    $data       = json_decode(file_get_contents("php://input"));
    $periodicBookingID = $data->periodicBookingID;

    $sql = "UPDATE ".PERIODIC_BOOKING_COLLECTION." SET isValidated = ".$data->isValidated
    ." WHERE periodicBookingID = ". $periodicBookingID;
    $result = mysqli_query($db, $sql); 
    if ($result) {
        $arr = array(
            'msg' => "Periodic Booking Validated Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }

    print_r($jsn);
}

?>