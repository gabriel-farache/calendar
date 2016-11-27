<?php
header("Access-Control-Allow-Origin: *");

$GLOBALS['errorAlreadyHappened'] = FALSE;
set_error_handler('myErrorHandler');
register_shutdown_function('fatalErrorShutdownHandler');
error_reporting(E_ALL & ~ E_ERROR);

DEFINE("USER_TOKEN_COLLECTION", "UserToken");
DEFINE("ADMIN_TOKEN_COLLECTION", "AdminToken");

function myErrorHandler($code, $message, $file, $line) {
    header("HTTP/1.1 503 Service unavailable");
    if($GLOBALS['errorAlreadyHappened'] == FALSE) {
        $GLOBALS['errorAlreadyHappened'] = TRUE;
        $jsn = handleCommonErr("HTTP/1.1 503 Service unavailable", "Unexpected error", $message." on line: ".$line." in file: ".$file);
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

    
    include('room_mysql.inc.php');
    include('booker_mysql.inc.php');
    include('booking_mysql.inc.php');
    include('freeSlot_mysql.inc.php');
    include('authenticate_mysql.inc.php');
    include('register_mysql.inc.php');
    include('periodicBooking_mysql.inc.php');

    $dbConfFile = file_get_contents("database.conf");
    $dbConf = json_decode($dbConfFile, true);
    $host     = $dbConf['host'];
    $port     = $dbConf['port'];
    $user     = $dbConf['user'];
    $pass     = $dbConf['pass'];
    $database = $dbConf['database'];
    //print_r($host.", ".$user.", ".$pass.", ".$database.", ".$port);
    $db         = mysqli_connect($host, $user, $pass, $database, $port);
    
    if (!$db) {
        handleCommonErr("HTTP/1.1 503 Service Unavailable", "Error connection to MySQL DB", mysqli_connect_error($db));
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
        case 'get_day_bookings':
            get_day_bookings($GLOBALS['db']);
            break;
        case 'get_conflicted_bookings':
            get_conflicted_bookings($GLOBALS['db']);
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
            if (isAdminAction($_GET['action'])) {
                if(isValidAndAdminToken($db, $authToken)) {
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
                        case 'get_available_years_for_metrics':
                            get_available_years_for_metrics($GLOBALS['db']);
                            break;
                        case 'get_year_month_available' : 
                            get_year_month_available($GLOBALS['db']);
                            break;
                        case 'compute_metrics':
                            compute_metrics($GLOBALS['db']);
                            break;
                        default:
                            $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", "Unauthorized", 'Not a valid admin action.');
                            print_r($jsn);
                        
                    }
                } else {
                    $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", "Unauthorized", 'Admin token not valid');
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
                    case 'get_periodic_booking':
                        get_periodic_booking($GLOBALS['db']);
                        break;
                    case 'delete_periodic_booking':
                        delete_periodic_booking($GLOBALS['db']);
                        break;
                    case 'get_periodic_bookings':
                        get_periodic_bookings($GLOBALS['db']);
                        break;
                    
                }
                
            } else {
                $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", "Unauthorized", 'The token: "' . $authToken . '" is not valid, please authenticate again.');
                print_r($jsn);
            }
    }
}
catch (Exception $e) {
    $jsn = handleCommonErr("HTTP/1.1 503 Service unavailable", "Unexpected error", $e->getMessage());
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
        $sql = "INSERT INTO ".ADMIN_TOKEN_COLLECTION." (adminToken, adminTokenEndTime)"
                ." VALUES ('".$adminToken."','".$adminTokenEndTime."')";
        $result = mysqli_query($db, $sql); 
        
        if($result) {
            $arr = array(
                'adminToken' => $adminToken,
                'adminTokenEndTime' => $adminTokenEndTime,
                'msg' => "Admin token generated Successfully!!!",
                'error' => ''
            );
            $jsn = json_encode($arr);
        } else {
            $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", 'Error when inserting token: ' . $adminToken . ' adminTokenEndTime: ' . $adminTokenEndTime . '<br>' . $qryToken . '<br>', mysqli_error($db));
        }
    } else {
        $jsn = handleCommonErr("HTTP/1.1 401 Unauthorized", "Unauthorized", 'You are not an administrator');
    }
    print_r($jsn);
}

function isTokenValid($db, $authToken)
{
    $sql = "SELECT * FROM ".USER_TOKEN_COLLECTION." WHERE token = '".$authToken."'"
            ." AND endAvailability >= '".date("Y-m-d H:i")."'";
    $result = mysqli_query($db, $sql); 

    return (mysqli_num_rows($result) > 0);
}

function isValidAndAdminToken($db, $adminAuthToken)
{
    $sql = "SELECT * FROM ".USER_TOKEN_COLLECTION." WHERE token = '".$adminAuthToken."'"
            ." AND endAvailability >= '".date("Y-m-d H:i")."' AND isAdmin = true";
    $result = mysqli_query($db, $sql); 
    return (mysqli_num_rows($result) > 0);
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
      $action == 'get_available_years_for_metrics' ||
      $action == 'compute_metrics' ||
      $action == 'get_year_month_available' ||
      $action == 'validate_periodic_booking');
}


function handleMongoErr($header, $msg, $err) {
    header($header);
    $arr = array(
        'msg' => $msg,
        'error' => $err,
        'hasError' => true
    );
    return json_encode($arr);
}

function handleCommonErr($header, $msg, $err) {
    header($header);
    $arr = array(
        'msg' => $msg,
        'error' => $err,
        'hasError' => true
    );
    return json_encode($arr);
}

function getRoomID($db, $roomName) {
    $room_sql = "SELECT roomID FROM ".ROOM_COLLECTION." WHERE room = '".$roomName."'";
    $result = mysqli_query($db, $room_sql); 
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row["roomID"];
    } else {
        return NULL;
    }
}

function getRoomName($db, $roomID) {
    $room_sql = "SELECT room FROM ".ROOM_COLLECTION." WHERE roomID = ".$roomID;
    $result = mysqli_query($db, $room_sql); 
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row["room"];
    } else {
        return NULL;
    }
}

function getBookerID($db, $bookerName) {
    $bookedBy_sql = "SELECT bookerID FROM ".USER_COLLECTION." WHERE booker = '".$bookerName."'";
    $result = mysqli_query($db, $bookedBy_sql); 
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row["bookerID"];
    } else {
        return NULL;
    }
}

function getBookerName($db, $bookerID) {
    $bookedBy_sql = "SELECT booker FROM ".USER_COLLECTION." WHERE bookerID = ".$bookerID;
    $result = mysqli_query($db, $bookedBy_sql); 
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row["booker"];
    } else {
        return NULL;
    }
}

?>

