<?php
DEFINE("BOOKING_COLLECTION", "Booking");

function add_booking($db)
{
    $json = file_get_contents("php://input");
    $data          = json_decode(utf8_encode($json));
    $room          = $data->room;
    $scheduleStart = $data->scheduleStart;
    $scheduleEnd   = $data->scheduleEnd;
    $day           = $data->day;
    $week          = $data->week;
    $year          = $data->year;
    $bookedBy      = $data->bookedBy;
    if($data->isValidated === TRUE) {
        $isValidated   = 1;
    } else {
        $isValidated   = 0;
    }

    if($data->isPeriodic === TRUE) {
        $isPeriodic   = 1;
    } else {
        $isPeriodic   = 0;
    }

    $roomID = getRoomID($db, $room);
    $bookerID = getBookerID($db, $bookedBy);

    if (!is_null($roomID) && !is_null($bookerID))  {

        $sql = "INSERT INTO ".BOOKING_COLLECTION." (room, scheduleStart, scheduleEnd, day, week, year, bookedBy, isValidated, isPeriodic)"
            ." VALUES (".$roomID.",".(float) $scheduleStart.",".(float) $scheduleEnd.", '".$day."', "
            .(int) $week.",".(int) $year.", ".$bookerID.", ".$isValidated.", ".$isPeriodic." )";
        $result = mysqli_query($db, $sql); 

        if ($result) {
            $arr = array(
                'id' => mysqli_insert_id($db),
                'msg' => "Booking Added Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
            
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error when inserting: ".$sql, mysqli_error($db));
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room or Booker not found", mysqli_error($db));
    }  
    print_r($jsn);
}

function get_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;

    $sql = "SELECT * FROM ".BOOKING_COLLECTION." WHERE bookingID = ".$bookingID;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = "";
        while($row = mysqli_fetch_assoc($result)) {
            $room = getRoomName($db, $row["room"]);
            $booker = getBookerName($db, $row["bookedBy"]);

            if (!is_null($room) && !is_null($booker))  {      
                $data = array(
                    "id" => $row["bookingID"],
                    "room" => $room,
                    "scheduleStart" => $row["scheduleStart"],
                    "scheduleEnd" => $row["scheduleEnd"],
                    "day" => $row["day"],
                    "week" => $row["week"],
                    "year" => $row["year"],
                    "bookedBy" => $booker,
                    "isValidated" => $row["isValidated"] == 1,
                    "isPeriodic"    => $row["isPeriodic"] == 1
                );
                $jsn  = json_encode($data); 
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room  or Booker not found", mysqli_error($db));
            }  
        } 
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
        }
    }
    print_r($jsn);
}

function get_day_bookings($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $day  = $data->day;
    $room  = $data->room;

    $roomID = getRoomID($db, $room);
    if (!is_null($roomID))  { 
        $sql = "SELECT * FROM ".BOOKING_COLLECTION." WHERE day = '".$day."' AND room = ".$roomID;
        $result = mysqli_query($db, $sql); 

        if (mysqli_num_rows($result) > 0) {
            $data = array();
            while($row = mysqli_fetch_assoc($result)) {
                $booker = getBookerName($db, $row["bookedBy"]);

                if (!is_null($booker))  { 
                    $data[] = array(
                        "id" => $row["bookingID"],
                        "room" => $room,
                        "scheduleStart" => $row["scheduleStart"],
                        "scheduleEnd" => $row["scheduleEnd"],
                        "day" => $row["day"],
                        "week" => $row["week"],
                        "year" => $row["year"],
                        "bookedBy" => $booker,
                        "isValidated" => $row["isValidated"]== 1,
                        "isPeriodic"    => $row["isPeriodic"]== 1
                    );
                }
            }
            $jsn  = json_encode($data);
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room not found", mysqli_error($db));
    }
    print_r($jsn);
}

function get_all_booking($db)
{
    $sql = "SELECT * FROM ".BOOKING_COLLECTION;
    $result = mysqli_query($db, $sql); 

    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            $room = getRoomName($db, $row["room"]);
            $booker = getBookerName($db, $row["bookedBy"]);

            if (!is_null($room) && !is_null($booker))  { 
                $data[] = array(
                    "id" => $row["bookingID"],
                    "room" => $room,
                    "scheduleStart" => $row["scheduleStart"],
                    "scheduleEnd" => $row["scheduleEnd"],
                    "day" => $row["day"],
                    "week" => $row["week"],
                    "year" => $row["year"],
                    "bookedBy" => $booker,
                    "isValidated" => $row["isValidated"]== 1,
                    "isPeriodic"    => $row["isPeriodic"]== 1
                );
            }
        }
        $jsn  = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No booking found", mysqli_error($db));
        }
    }
    print_r($jsn);
    
}

function get_week_booking($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $week = $data->week;
    $year = $data->year;
    $room = $data->room;
    
    $roomID = getRoomID($db, $room);
    if (!is_null($roomID))  { 
        $sql = "SELECT * FROM ".BOOKING_COLLECTION." WHERE week = ".$week." AND year = ".$year." AND room = ".$roomID;
        $result = mysqli_query($db, $sql); 

        if (mysqli_num_rows($result) > 0) {
            $data = array();
            while($row = mysqli_fetch_assoc($result)) {
                $booker = getBookerName($db, $row["bookedBy"]);

                if (!is_null($room) && !is_null($booker))  { 
                    //print_r($row);
                    $data[] = array(
                        "id" => $row["bookingID"],
                        "room" => $room,
                        "scheduleStart" => $row["scheduleStart"],
                        "scheduleEnd" => $row["scheduleEnd"],
                        "day" => $row["day"],
                        "week" => $row["week"],
                        "year" => $row["year"],
                        "bookedBy" => $booker,
                        "isValidated" => $row["isValidated"] == 1,
                        "isPeriodic"    => $row["isPeriodic"] == 1
                    );
                }  
            }
            $jsn  = json_encode($data);
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room not found", mysqli_error($db));
    }
    print_r($jsn);
    
}


function get_conflicted_bookings($db){
    $data       = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;
    $bookingDay  = $data->day;
    $bookingYear  = (int)$data->year;
    $bookingWeek = (int)$data->week;

    $bookingScheduleStart = (float)$data->scheduleStart;
    $bookingScheduleEnd  = (float)$data->scheduleEnd;
    $bookingRoom = $data->room;

    $roomID = getRoomID($db, $bookingRoom);

    if (!is_null($roomID))  {

        if($bookingID === null){
            $sql = "SELECT * FROM ".BOOKING_COLLECTION
            ." WHERE day = '".$bookingDay."' AND year = ".$bookingYear." AND room = ".$roomID." AND week = ".$bookingWeek
            ." AND ((scheduleStart BETWEEN ".$bookingScheduleStart." AND ".$bookingScheduleEnd.")"
            ." OR (scheduleEnd BETWEEN ".$bookingScheduleStart." AND ".$bookingScheduleEnd.")"
            ." OR (scheduleStart <= ".$bookingScheduleStart." AND scheduleEnd >= ".$bookingScheduleEnd."))";
        } else {
            $sql = "SELECT * FROM ".BOOKING_COLLECTION
            ." WHERE day = '".$bookingDay."' AND year = ".$bookingYear." AND room = ".$roomID." AND week = ".$bookingWeek
            ." AND bookingID = ".$bookingID
            ." AND ((scheduleStart BETWEEN ".$bookingScheduleStart." AND ".$bookingScheduleEnd.")"
            ." OR (scheduleEnd BETWEEN ".$bookingScheduleStart." AND ".$bookingScheduleEnd.")"
            ." OR (scheduleStart <= ".$bookingScheduleStart." AND scheduleEnd >= ".$bookingScheduleEnd."))";


        }

        $result = mysqli_query($db, $sql); 

        if (mysqli_num_rows($result) > 0) {
            $data = array();
            while($row = mysqli_fetch_assoc($result)) {
                $room = getRoomName($db, $row["room"]);
                $booker = getBookerName($db, $row["bookedBy"]);

                if (!is_null($room) && !is_null($booker))  { 
                    $data[] = array(
                        "id" => $row["bookingID"],
                        "room" => $room,
                        "scheduleStart" => $row["scheduleStart"],
                        "scheduleEnd" => $row["scheduleEnd"],
                        "day" => $row["day"],
                        "week" => $row["week"],
                        "year" => $row["year"],
                        "bookedBy" => $booker,
                        "isValidated" => $row["isValidated"]== 1,
                        "isPeriodic"    => $row["isPeriodic"]== 1
                    );
                }    
            }
            $jsn  = json_encode($data);
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
            } else {
                $jsn = json_encode(array());
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Room not found", mysqli_error($db));
    }  

    print_r($jsn);
}

function delete_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;
    $username   = $data->username;

    $bookerID = getBookerID($db, $username);

    if (!is_null($bookerID))  {

        $sql = "DELETE FROM ".BOOKING_COLLECTION." WHERE bookingID = ".$bookingID." AND bookedBy = '". $bookerID."'";
        $result = mysqli_query($db, $sql); 

        if ($result) {
            $arr = array(
                    'msg' => "Booking Deleted Successfully!!!",
                    'error' => ''
                );
            $jsn = json_encode($arr);
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Deletion failure", mysqli_error($db));
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Booker not found", mysqli_error($db));
    } 

    print_r($jsn);
}

function delete_bookings($db)
{
    $data        = json_decode(file_get_contents("php://input"));
    $bookingsIds = $data->bookingsIds;
    $errors = array();

    foreach ($bookingsIds as $id) {
        $sql = "DELETE FROM ".BOOKING_COLLECTION." WHERE bookingID = ".$id;
        $result = mysqli_query($db, $sql); 

        if (!$result) {
            $errors[] = array(
                'errID' => $id,
                'error' => mysqli_error($db)
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
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "", mysqli_error($db));
    }
    
    print_r($jsn);
}

/** Function de mise à jour d'un produit **/

function update_booking($db)
{
    $data = json_decode(file_get_contents("php://input"));
    $id   = $data->id;
    
    $bookerID = getBookerID($db, $data->bookedBy);
    $roomID = getRoomID($db, $data->room);
    if (!is_null($bookerID) && !is_null($roomID))  {
        $sql = "UPDATE ".BOOKING_COLLECTION." SET room = ". $roomID .", scheduleStart = ".$data->scheduleStart.","
                ." scheduleEnd = ".$data->scheduleEnd .", day = '".$data->day."', week = ".$data->week.","
                ." year = ".$data->year.", bookedBy = '".$bookerID."', isValidated = ".$data->isValidated
                .", isPeriodic = ".$data->isPeriodic ." WHERE bookingID = '". $id;
                
        $result = mysqli_query($db, $sql); 
        
        if ($result) {
            $arr = array(
                'msg' => "Booking Updated Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            if(mysqli_affected_rows($db) === -1) {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Update failure", mysqli_error($db));
            } else {
                $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
            }
        }
    } else {
        $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Booker not found", mysqli_error($db));
    } 

    print_r($jsn);
}

function validate_booking($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $id         = $data->id;
    
    $sql = "UPDATE ".BOOKING_COLLECTION." SET isValidated = ".$data->isValidated." WHERE bookingID = ". $id;
    $result = mysqli_query($db, $sql);
    if ($result) {
        $arr = array(
            'msg' => "Booking Validated Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Update Validation failure", mysqli_error($db));
        } else {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "No result found", $sql);
        }
    }

    print_r($jsn);
}

function get_available_years_for_metrics($db)
{
    $sql = "SELECT DISTINCT year FROM ".BOOKING_COLLECTION." WHERE isValidated = true";
    $result = mysqli_query($db, $sql);
    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            array_push($data, $row["year"]); 
        }
        $jsn  = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
        } else {
            $jsn = json_encode(array());
        }
    }
    print_r($jsn);
}

function get_year_month_available($db) {
    $data       = json_decode(file_get_contents("php://input"));
    $year       = $data->year;

    $sql = "SELECT DISTINCT month(str_to_date(SUBSTR(day,6), '%d-%m-%Y')) AS month FROM ".BOOKING_COLLECTION
    ." WHERE isValidated = true AND year = ".$year;

    $result = mysqli_query($db, $sql);
    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            array_push($data, $row["month"]); 
        }
        $jsn  = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
        } else {
            $jsn = json_encode(array());
        }
    }
    print_r($jsn);

}

function compute_metrics($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $year         = $data->metricYear;
    $month         = $data->metricMonth;
    $sql = "SELECT SUM(B.scheduleEnd - B.scheduleStart) AS bookingTotalTime, Bk.booker "
    ." FROM ".BOOKING_COLLECTION." B, ".USER_COLLECTION." Bk"
    ." WHERE B.isValidated = true AND B.bookedBy = Bk.bookerID"
    ." AND month(str_to_date(SUBSTR(day,6), '%d-%m-%Y')) = ".$month
    ." AND year = ".$year
    ." GROUP BY Bk.booker";

    $result = mysqli_query($db, $sql);
    if (mysqli_num_rows($result) > 0) {
        $data = array();
        while($row = mysqli_fetch_assoc($result)) {
            $data[] = array(
                "booker" => $row["booker"],
                "bookingTotalTime" => $row["bookingTotalTime"]
            ); 
        }
        $jsn  = json_encode($data);
    } else {
        if(mysqli_affected_rows($db) === -1) {
            $jsn = handleMongoErr("HTTP/1.1 500 Internal Server Error", "Error", mysqli_error($db));
        } else {
            $jsn = json_encode(array());
        }
    }
    print_r($jsn);
}

?>