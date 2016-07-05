<?php
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

    include('freeSlot.inc.php');
    include('authenticate.inc.php');
    include('register.inc.php');
    include('periodicBooking.inc.php');
    include('room.inc.php');
    include('booker.inc.php');
    include('booking.inc.php');

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

