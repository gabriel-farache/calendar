<?php
$GLOBALS['errorAlreadyHappened'] = FALSE;
set_error_handler('myErrorHandler');
register_shutdown_function('fatalErrorShutdownHandler');
error_reporting(E_ALL & ~ E_ERROR);

DEFINE("BOOKING_COLLECTION", "Booking");
DEFINE("PERIODIC_BOOKING_COLLECTION", "PeriodicBooking");
DEFINE("USER_COLLECTION", "User");
DEFINE("ROOM_COLLECTION", "Room");
DEFINE("USER_TOKEN_COLLECTION", "UserToken");
DEFINE("ADMIN_TOKEN_COLLECTION", "AdminToken");

function myErrorHandler($code, $message, $file, $line) {
    header("HTTP/1.1 503 Service unavailable");
    if($GLOBALS['errorAlreadyHappened'] == FALSE) {
        $GLOBALS['errorAlreadyHappened'] = TRUE;
        $arr = array(
            'error' => $message." on line: ".$line
        );
        $jsn = json_encode($arr);
        print_r($jsn);
    }
}

function fatalErrorShutdownHandler()
{
  $last_error = error_get_last();
  if ($last_error['type'] === E_ERROR) {
    // fatal error
    myErrorHandler(E_ERROR, $last_error['message'], $last_error['file'], $last_error['line']);
  }
}

try {
    $host     = "localhost";
    $port     = 27017;
    $user     = "root";
    $pass     = "root";
    $database = "calendar";
    
    $connection = new MongoClient("mongodb://" . $host . ":" . $port . "/?replicaSet=rs0");
    $db         = $connection->selectDB($database);
    
    if (mysqli_connect_errno()) {
        header("HTTP/1.1 503 Service Unavailable");
        print_r('Could not connect: ' . mysqli_connect_errno());
    }
    
    $GLOBALS['db'] = $db;
    date_default_timezone_set('Europe/Paris');
    /**  Switch Case pour récupérer la l'action demandée par le controleur  Angular **/
    switch ($_GET['action']) {
        case 'get_booking':
            get_booking($GLOBALS['db']);
            break;
        case 'get_week_booking':
            get_week_booking($GLOBALS['db']);
            break;
        case 'get_all_booking':
            get_all_booking($GLOBALS['db']);
            break;
        case 'get_bookers':
            get_bookers($GLOBALS['db']);
            break;
        case 'get_rooms':
            get_rooms($GLOBALS['db']);
            break;
        case 'get_free_rooms_for_slot':
            get_free_rooms_for_slot($GLOBALS['db']);
            break;
        case 'register':
            register($GLOBALS['db']);
            break;
        case 'authenticate':
            authenticate($GLOBALS['db']);
            break;
        case 'generateAdminToken':
            generateAdminToken($GLOBALS['db']);
            break;
        default:
            $data      = json_decode(file_get_contents("php://input"));
            $authToken = $data->authToken;
            if (isAdminAction($_GET['action']) && isValidAndAdminToken($db, $authToken)) {
                switch ($_GET['action']) {
                    case 'update_room':
                        update_room($GLOBALS['db']);
                        break;
                    case 'add_room':
                        add_room($GLOBALS['db']);
                        break;
                    case 'validate_booking':
                        validate_booking($GLOBALS['db']);
                        break;
                    case 'delete_room':
                        delete_room($GLOBALS['db']);
                        break;
                    case 'delete_booker':
                        delete_booker($GLOBALS['db']);
                        break;
                    case 'update_booker':
                        update_booker($GLOBALS['db']);
                        break;
                    case 'delete_bookings':
                        delete_bookings($GLOBALS['db']);
                        break;
                    case 'validate_periodic_booking':
                        validate_periodic_booking($GLOBALS['db']);
                        break;
                    default:
                        header("HTTP/1.1 401 Unauthorized");
                        $arr = array(
                            'errorCode' => "-1",
                            'error' => 'Not a valid admin action.'
                        );
                        $jsn = json_encode($arr);
                        print_r($jsn);
                        
                }
                
            } else if (isTokenValid($db, $authToken)) {
                switch ($_GET['action']) {
                    case 'add_booking':
                        add_booking($GLOBALS['db']);
                        break;
                    case 'update_booking':
                        update_booking($GLOBALS['db']);
                        break;
                    case 'delete_booking':
                        delete_booking($GLOBALS['db']);
                        break;
                    case 'get_booker_email':
                        get_booker_email($GLOBALS['db']);
                        break;
                    case 'update_booker_settings':
                        update_booker_settings($GLOBALS['db']);
                        break;
                    case 'add_periodic_booking':
                        add_periodic_booking($GLOBALS['db']);
                        break;
                    case 'delete_periodic_booking':
                        delete_periodic_booking($GLOBALS['db']);
                        break;
                    case 'get_periodic_bookings':
                        get_periodic_bookings($GLOBALS['db']);
                        break;
                    
                }
                
            } else {
                header("HTTP/1.1 401 Unauthorized");
                $arr = array(
                    'errorCode' => "-1",
                    'error' => 'The token: "' . $authToken . '" is not valid, please authenticate again.'
                );
                $jsn = json_encode($arr);
                print_r($jsn);
            }
    }
}
catch (Exception $e) {
    header("HTTP/1.1 503 Service unavailable");
    $arr = array(
        'msg' => "",
        'error' => $e->getMessage()
    );
    $jsn = json_encode($arr);
    print_r($jsn);
}



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

function get_bookers($db)
{
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $cursor = $collection->find();
        $err    = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $data = array();
            foreach ($cursor as $doc) {
                $data[] = array(
                    "booker" => utf8_encode($doc["booker"]),
                    "color" => $doc["color"]
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

function get_booker_email($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $booker     = $data->booker;
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $result     = $collection->findOne(array(
            'booker' => $booker
        ));
        
        $err = $db->lastError();
        if (isset($err["err"]) !== TRUE && isset($result) === TRUE) {
            
            $data = array('email' => $result['email']);
            $jsn = json_encode($data);
        } else {
            header("HTTP/1.1 404 Not Found");
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
function update_booker($db)
{
    $data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $newBookerName  = $data->newName;
    $newBookerColor = $data->newColor;
    $oldBookerName  = $data->oldName;
    $collection = $db->selectCollection(USER_COLLECTION);
    //update the Room collection
    $err         = updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName, $newBookerColor);
    if (is_null($err["err"]) === TRUE) {
        $err = updateBookerIntoBookingCollection($db, $oldBookerName, $newBookerName);
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

function update_booker_settings($db)
{
    $data           = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $booker         = $data->booker;
    $newBooker      = $data->newBooker;
    $email          = $data->email;
    $oldPassword    = $data->password;
    $newPassword    = $data->newPassword;

    $password       = (int)$newPassword == -1 ? $oldPassword : $newPassword;
    $collection     = $db->selectCollection(USER_COLLECTION);
    $err            = $db->lastError();
    $user           = $collection->findOne(array(
        'booker' => $booker,
        'password' => $oldPassword
    ));

    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE && is_null($user) !== TRUE) {
        if (is_null($err["err"]) === TRUE) {
            $updatedBooker = array(
                "booker"    => $newBooker,
                "email"     =>$email,
                "password"  => $password
            );
            $newdata     = array(
                '$set' => $updatedBooker
            );
            $collection->update(array(
                "booker" => $booker,
                "password"  => $oldPassword
            ), $newdata);
            $err = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $err = updateBookerIntoBookingCollection($db, $booker, $newBooker);
                if (is_null($err["err"]) === TRUE) {
                    $arr = array(
                        'msg' => "User seetings Updated Successfully!!!",
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
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array(
                'msg' => "",
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array(
                'msg' => "",
                'error' => "Password or username incorrect."
            );
        $jsn = json_encode($arr);
    }
    
    print_r($jsn);
}

function updateBookerIntoBookingCollection($db, $oldBookerName, $newBookerName)
{
    $collection = $db->selectCollection(BOOKING_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedBooker = array(
            "bookedBy" => $newBookerName
        );
        $newdata     = array(
            '$set' => $updatedBooker
        );
        $collection->update(array(
            "bookedBy" => $oldBookerName
        ), $newdata, array(
            'multiple' => true
        ));
        $err = $db->lastError();
    }
    return $err;
}

function updateBookerIntoBookerCollection($db, $oldBookerName, $newBookerName)
{
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $updatedBooker = array(
            "booker" => $newBookerName
        );
        $newdata     = array(
            '$set' => $updatedBooker
        );
        $collection->update(array(
            "booker" => $oldBookerName
        ), $newdata, array(
            'multiple' => true
        ));
        $err = $db->lastError();
    }
    return $err;
}



function delete_booker($db)
{
    $data       = json_decode(file_get_contents("php://input"));
    $booker     = $data->booker;
    $collection = $db->selectCollection(USER_COLLECTION);
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $collection->remove(array(
            'room' => $roomName
        ));
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'msg' => "Booker Deleted Successfully!!!",
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
function register($db)
{
    date_default_timezone_set('Europe/Paris');
    $data                = json_decode(file_get_contents("php://input"));
    $email               = $data->email;
    $username            = $data->username;
    $encodedPassword     = $data->encodedPassword;
    $generatedAdminToken = $data->adminToken;
    
    $collection = $db->selectCollection(ADMIN_TOKEN_COLLECTION);
    $mongoDate  = new MongoDate(strtotime(date("Y-m-d h:i")));
    $result     = $collection->findOne(array(
        'adminToken' => $generatedAdminToken,
        'adminTokenEndTime' => array(
            '$gte' => $mongoDate
        )
    ));
    
    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE && is_null($result) !== TRUE) {
        $collection = $db->selectCollection(USER_COLLECTION);
        $result     = $collection->findOne(array(
            'booker' => $username
        ));
        $err        = $db->lastError();
        if (is_null($err["err"]) === TRUE && is_null($result) === TRUE) {
            $newUser = array(
                'booker'    => $username,
                'password'  => $encodedPassword,
                'email'     => $email,
                'color'     => '#FFFFFF'
            );
            $collection->insert($newUser);
            $err = $db->lastError();
            if (is_null($err["err"]) === TRUE) {
                $qryDeleteAdminToken = 'Delete FROM adminToken WHERE adminToken = "' . $generatedAdminToken . '"';
                $collection          = $db->selectCollection(ADMIN_TOKEN_COLLECTION);
                $collection->remove(array(
                    'adminToken' => $generatedAdminToken
                ));
                $arr = array(
                    'id' => $newUser["_id"]->{'$id'},
                    'msg' => "User Added Successfully!!!",
                    'error' => ''
                );
                $jsn = json_encode($arr);
            } else {
                header("HTTP/1.1 401 Unauthorized");
                $arr = array(
                    'msg' => "",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
            
        } else {
            if (is_null($result) !== TRUE) {
                header("HTTP/1.1 409 Conflict");
                $arr = array(
                    'msg' => "",
                    'error' => "The user '" . $username . "' already exists"
                );
                $jsn = json_encode($arr);
            } else {
                header("HTTP/1.1 409 Conflict");
                $arr = array(
                    'msg' => "",
                    'error' => $err
                );
                $jsn = json_encode($arr);
            }
        }
        
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array(
            'error' => 'The admin token is not good: ' . $generatedAdminToken
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
function authenticate($db)
{
    $data            = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $username        = $data->username;
    $encodedPassword = $data->encodedPassword;
    
    $collection = $db->selectCollection(USER_COLLECTION);
    $user       = $collection->findOne(array(
        'booker' => $username,
        'password' => $encodedPassword
    ));

    $err        = $db->lastError();

    if (is_null($err["err"]) === TRUE && is_null($user) !== TRUE) {
        $isAdmin = $user['isAdmin'];
        return (createAuthenticationToken($db, $isAdmin));
    } else {
        header("HTTP/1.1 401 Unauthorized");
        if (is_null($user) === TRUE) {
            $arr = array(
                'error' => "Le compte '" . utf8_encode($username) . "' n'exite pas."
            );
            $jsn = json_encode($arr);
        } else {
            $arr = array(
                'error' => $err
            );
            $jsn = json_encode($arr);
        }
    }
    print_r($jsn);
    
}

function createAuthenticationToken($db, $isAdmin)
{
    date_default_timezone_set('Europe/Paris');
    $endAvailability = date("Y-m-d h:i", strtotime('+2 hours'));
    $token           = md5(uniqid(rand(), true));
    $collection      = $db->selectCollection(USER_TOKEN_COLLECTION);
    $newAuthToken    = array(
        'token' => $token,
        'endAvailability' => new MongoDate(strtotime($endAvailability)),
        'isAdmin' => $isAdmin
    );
    $collection->insert($newAuthToken);
    $err = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        $arr = array(
            'token' => $token,
            'endAvailability' => $endAvailability,
            'isAdmin' => $isAdmin,
            'msg' => "User Logged Successfully!!!",
            'error' => ''
        );
        $jsn = json_encode($arr);
    } else {
        //header("HTTP/1.1 401 Unauthorized");
        $arr = array(
            'msg' => "",
            'error' => 'Error when inserting token: ' . $token . ' endAvailability: ' . $endAvailability . '<br>' . $qryToken . '<br>' . $err
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function generateAdminToken($db)
{
    $data = json_decode(file_get_contents("php://input"));
    date_default_timezone_set('Europe/Paris');
    $adminTokenEndTime = date("Y-m-d h:i", strtotime('+1 day'));
    $adminToken        = md5(uniqid(rand(), true));
    $adminAuthToken    = $data->adminAuthToken;
    
    if (isValidAndAdminToken($db, $adminAuthToken)) {
        $collection    = $db->selectCollection(ADMIN_TOKEN_COLLECTION);
        $newAdminToken = array(
            'adminToken' => $adminToken,
            'adminTokenEndTime' => new MongoDate(strtotime($adminTokenEndTime))
        );
        $collection->insert($newAdminToken);
        $err = $db->lastError();
        if (is_null($err["err"]) === TRUE) {
            $arr = array(
                'adminToken' => $adminToken,
                'adminTokenEndTime' => $adminTokenEndTime,
                'msg' => "Admin token generated Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 401 Unauthorized");
            $arr = array(
                'msg' => "",
                'error' => 'Error when inserting token: ' . $adminToken . ' adminTokenEndTime: ' . $adminTokenEndTime . '<br>' . $qryToken . '<br>' . $err
            );
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array(
            'error' => "Vous n'êtes pas administrateur."
        );
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function isTokenValid($db, $authToken)
{
    $collection = $db->selectCollection(USER_TOKEN_COLLECTION);
    $result     = $collection->findOne(array(
        'token' => $authToken
    ));
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        return (is_null($result) !== TRUE);
    } else {
        print_r($err);
        return false;
    }
}

function isValidAndAdminToken($db, $adminAuthToken)
{
    $collection = $db->selectCollection(USER_TOKEN_COLLECTION);
    $result     = $collection->findOne(array(
        'token' => $adminAuthToken,
        'isAdmin' => true
    ));
    $err        = $db->lastError();
    if (is_null($err["err"]) === TRUE) {
        return (is_null($result) !== TRUE);
    } else {
        print_r($err);
        return false;
    }
}

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
                    "periodicBookingWeeksDuration" => $doc["bookingWeeksDuration"],
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

function isAdminAction($action)
{
    return ($action == 'update_room' ||
     $action == 'validate_booking' ||
      $action == 'delete_room' || 
      $action == 'delete_booker' || 
      $action == 'update_booker' || 
      $action == 'add_room' ||
      $action == 'delete_bookings' ||
      $action == 'validate_periodic_booking');
}


?>

