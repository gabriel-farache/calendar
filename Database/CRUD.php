<?php
$origin=isset($_SERVER['HTTP_ORIGIN'])?$_SERVER['HTTP_ORIGIN']:$_SERVER['HTTP_HOST'];
header('Access-Control-Allow-Origin: '.$origin);        
header('Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT');
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Headers: Authorization, origin, x-requested-with, content-type");
header('P3P: CP="NON DSP LAW CUR ADM DEV TAI PSA PSD HIS OUR DEL IND UNI PUR COM NAV INT DEM CNT STA POL HEA PRE LOC IVD SAM IVA OTC"');
header('Access-Control-Max-Age: 1');

include('databaseConfig.php');
 
/**  Switch Case pour récupérer la l'action demandée par le controleur  Angular **/
switch($_GET['action'])  {
        case 'get_booking' :
                get_booking($GLOBALS['con']);
                break;
        case 'get_week_booking' :
                get_week_booking($GLOBALS['con']);
                break;
        case 'get_all_booking' :
                get_all_booking($GLOBALS['con']);
                break; 
        case 'update_booking' :
                update_booking($GLOBALS['con']);
                break;
        case 'get_bookers' :
                get_bookers($GLOBALS['con']);
                break;
        case 'get_rooms' :
                get_rooms($GLOBALS['con']);
                break;
        case 'get_free_rooms_for_slot' :
                get_free_rooms_for_slot($GLOBALS['con']);
                break;
        case 'register' :
                register($GLOBALS['con']);
                break;
        case 'authenticate' :
                authenticate($GLOBALS['con']);
                break;
        case 'generateAdminToken' :
                    generateAdminToken($GLOBALS['con']);
                    break;
        default:
            $data = json_decode(file_get_contents("php://input"));
            $authToken = $data->authToken;
            if(isTokenValid($con, $authToken)) {
                switch($_GET['action'])  {
                    case 'add_booking' :
                            add_booking($GLOBALS['con']);
                            break; 
                    case 'update_booking' :
                            update_booking($GLOBALS['con']);
                            break;
                	case 'validate_booking' :
                            validate_booking($GLOBALS['con']);
                            break; 
                    case 'delete_booking' :
                            delete_booking($GLOBALS['con']);
                            break;
                    case 'delete_bookings' :
                            delete_bookings($GLOBALS['con']);
                            break;
                }
            } else if(isValidAndAdminToken($con, $authToken)) {
                switch($_GET['action'])  {
                    case 'update_room' :
                            update_room($GLOBALS['con']);
                            break; 
                    case 'delete_room' :
                            delete_room($GLOBALS['con']);
                            break;
                    default:
                        header("HTTP/1.1 401 Unauthorized");
                        $arr = array('errorCode' => "-1", 'error' =>  'Not a valid admin action.');
                        $jsn = json_encode($arr);
                        print_r($jsn);
                }

            } else {
                header("HTTP/1.1 401 Unauthorized");
                $arr = array('errorCode' => "-1", 'error' =>  'The token: "'.$authToken.'" is not valid, please authenticate again.');
                $jsn = json_encode($arr);
                print_r($jsn);
            }
} 
/**  Function qui ajoute le produit en base de données MYSQL  **/

function add_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $room			= $data->room;
    $scheduleStart	= $data->scheduleStart;
    $scheduleEnd    = $data->scheduleEnd;
    $day  			= $data->day;
    $week           = $data->week;
    $year  			= $data->year;
    $bookedBy  		= $data->bookedBy;
 
    $qry = 'INSERT INTO Booking (room, scheduleStart, scheduleEnd, day, week, year, bookedBy) values ("' . $room . '",' . $scheduleStart . ',' .$scheduleEnd . ',"'.$day.'",'.$week.','.$year.',"'.$bookedBy.'")';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('id' =>  mysqli_insert_id($con), 'msg' => "Booking Added Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    }
    else {
        header("HTTP/1.1 424 Method failure");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function get_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $bookingID = $data->id;
    $qry = mysqli_query($con,'SELECT * FROM Booking WHERE id = '.$bookingID);
    if($qry === FALSE) { 
        header("HTTP/1.1 418 I am a teapot");
        die($conn->error); // TODO: better error handling
    }

    $data = array();
    while($rows = mysqli_fetch_array($qry))
    {
        $data[] = array(
                    "id"            => $rows["id"],
                    "room"          => $rows["room"],
                    "scheduleStart" => $rows["scheduleStart"],
                    "scheduleEnd"   => $rows["scheduleEnd"],
                    "day"           => $rows["day"],
                    "week"          => $rows["week"],
                    "year"          => $rows["year"],
                    "bookedBy"      => $rows["bookedBy"],
                    "isValidated"   => $rows["isValidated"]
                    );
    }
    print_r(json_encode($data));
}
 
function get_all_booking($con) {
    $qry = mysqli_query($con,'SELECT * FROM Booking');
    if($qry === FALSE) { 
        header("HTTP/1.1 418 I am a teapot");
        die($conn->error); // TODO: better error handling
    }
    $data = array();
    while($rows = mysqli_fetch_array($qry))
    {
        $data[] = array(
                    "id"            => $rows["id"],
                    "room"			=> $rows["room"],
				    "scheduleStart"	=> $rows["scheduleStart"],
				    "scheduleEnd"	=> $rows["scheduleEnd"],
				    "day"  			=> $rows["day"],
                    "week"          => $rows["week"],
				    "year"  		=> $rows["year"],
				    "bookedBy"  	=> $rows["bookedBy"],
				    "isValidated"  	=> $rows["isValidated"]
                    );
    }
    print_r(json_encode($data));
}

function get_week_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $week = $data->week;
    $year = $data->year;
    $room = $data->room;
    $qry = 'SELECT * FROM Booking WHERE week = '.$week.
        ' and year = '.$year.
        ' and room = "'.$room.'"';
    $qry_res = mysqli_query($con,$qry);
    //print_r($qry);
    //print_r('SELECT * FROM Booking WHERE week = '.$week.' and year = '.$year);
    if($qry_res === FALSE) { 
        header("HTTP/1.1 418 I am a teapot");
        print_r($conn->error); // TODO: better error handling
    } else {
        $data = array();
        while($rows = mysqli_fetch_array($qry_res))
        {
            $data[] = array(
                        "id"            => $rows["id"],
                        "room"          => $rows["room"],
                        "scheduleStart" => $rows["scheduleStart"],
                        "scheduleEnd"   => $rows["scheduleEnd"],
                        "day"           => $rows["day"],
                        "week"          => $rows["week"],
                        "year"          => $rows["year"],
                        "bookedBy"      => $rows["bookedBy"],
                        "isValidated"   => $rows["isValidated"]
                        );
        }
        print_r(json_encode($data));
    }
}
 
/**  Function qui supprime un produit en base de donnée mysql  **/
 
function delete_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $bookingID  = $data->id;
    $username   = $data->username;
    //print_r($data)   ;
    $qry = 'DELETE FROM Booking WHERE id = '.$bookingID.' and bookedBy = "'.$username.'"';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Bookings Deleted Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function delete_bookings($con) {
    $data = json_decode(file_get_contents("php://input"));
    $bookingsIds = $data->bookingsIds;
    $qry = 'DELETE FROM Booking WHERE id in ('.$bookingsIds.')';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Bookings Deleted Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
 
/** Function de mise à jour d'un produit **/
 
function update_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $id             = $data->id;
    $room           = $data->room;
    $scheduleStart  = $data->scheduleStart;
    $scheduleEnd    = $data->scheduleEnd;
    $day            = $data->day;
    $week           = $data->week;
    $year           = $data->year;
    $bookedBy       = $data->bookedBy;
    $isValidated    = $data->isValidated;
   // print_r($data);
 
    $qry = "UPDATE Booking set room='".$room."' , scheduleStart=".$scheduleStart.",scheduleEnd=".$scheduleEnd.",day='".$day."',week=".$week.",year=".$year.",bookedBy='".$bookedBy."',isValidated=".$isValidated." WHERE id=".$id;
 
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Booking Updated Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function validate_booking($con) {
    $data = json_decode(file_get_contents("php://input"));
    $id         = $data->id;
    $authToken  = $data->authToken;
    $isValidated  = $data->isValidated;
    $qry = "UPDATE Booking set isValidated=".$isValidated." WHERE id=".$id;
 
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Booking Validated Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function get_bookers($con) {
    $qry = mysqli_query($con,'SELECT username as booker, color FROM User order by username');
    if($qry === FALSE) { 
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
        print_r($jsn);
    } else {
        $data = array();
        while($rows = mysqli_fetch_array($qry))
        {

            $data[] = array(
                        "booker"  => utf8_encode($rows["booker"]),
                        "color"   => $rows["color"]
                        );
        }
        print_r(json_encode($data));
    }
}

function get_rooms($con) {
    $qry = mysqli_query($con,'SELECT room FROM Room order by room');
    if($qry === FALSE) {
        header("HTTP/1.1 418 I am a teapot"); 
        die($conn->error); // TODO: better error handling
    }
    $data = array();
    while($rows = mysqli_fetch_array($qry))
    {
        $data[] = array(
                    "room"  => $rows["room"]
                        );
    }
    print_r(json_encode($data));
}

function update_room($con) {
    $data = json_decode(file_get_contents("php://input"));
    $newRoomName = $data->newName;
    $oldRoomName = $data->oldName;
    $qry = 'UPDATE room SET room = "'.$newRoomName.'" WHERE room = "'.$oldRoomName.'"';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Room Updated Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function delete_room($con) {
    $data = json_decode(file_get_contents("php://input"));
    $roomName = $data->roomName;
    $qry = 'DELETE FROM room WHERE room = "'.$roomName.'"';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res) {
        $arr = array('msg' => "Room Deleted Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        header("HTTP/1.1 418 I am a teapot");
        $arr = array('msg' => "", 'error' =>  mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
function register($con) {
    date_default_timezone_set('Europe/Paris');
    $data = json_decode(file_get_contents("php://input"));
    $email                  = $data->email;
    $username               = $data->username;
    $encodedPassword        = $data->encodedPassword;
    $generatedAdminToken    = $data->generatedAdminToken;
    
    $qryAdminToken = 'SELECT adminToken FROM AdminToken WHERE adminToken = "'.$generatedAdminToken.'" and adminTokenEndTime > "'.date("Y-m-d h:i").'"';
    $qryAdminToken_res = mysqli_query($con,$qryAdminToken);
    if ($qryAdminToken_res && mysqli_num_rows($qryAdminToken_res) > 0) {
        $qry = 'INSERT INTO User (username, encodedPassword) values ("' . $username . '","' . $encodedPassword.'")';
        $qry_res = mysqli_query($con,$qry);
        if ($qry_res) {
            $qryDeleteAdminToken = 'Delete FROM adminToken WHERE adminToken = "'.$generatedAdminToken.'"';
            $arr = array('id' =>  mysqli_insert_id($con), 'msg' => "User Added Successfully!!!", 'error' => '');
            $jsn = json_encode($arr);
            mysqli_query($con,$qryDeleteAdminToken);
        }
        else {
            header("HTTP/1.1 401 Unauthorized");
            $arr = array('msg' => "",  mysqli_error($con));
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array('error' => 'The admin token is not good: '.$adminToken);
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}
function authenticate($con) {
    $data = json_decode(mb_convert_encoding(file_get_contents("php://input"), 'HTML-ENTITIES', "UTF-8"));
    $username           = $data->username;
    $encodedPassword    = $data->encodedPassword;
    
    //print_r($data);
    $qry = 'SELECT username, isAdmin FROM User WHERE username = "'.$username.'"and encodedPassword = "' . $encodedPassword.'"';
    $qry_res = mysqli_query($con,$qry);
    if ($qry_res && mysqli_num_rows($qry_res) > 0) {
        $isAdmin =  mysqli_fetch_array($qry_res)['isAdmin'];
        return (createAuthenticationToken($con, $isAdmin));
    }
    else {
        header("HTTP/1.1 401 Unauthorized");
        if(mysqli_num_rows($qry_res) <= 0) {
            $arr = array('error' =>  "Le compte '".utf8_encode($username)."' n'exite pas.");
            $jsn = json_encode($arr);
        } else {
            $arr = array('error' =>  mysqli_error($con).'\n'.$qry);
            $jsn = json_encode($arr);
        }        
    }
    print_r($jsn);

}

function createAuthenticationToken($con, $isAdmin) {
    date_default_timezone_set('Europe/Paris');
    $endAvailability = date("Y-m-d h:i", strtotime('+2 hours'));
    $token = md5(uniqid(rand(), true));
    $qryToken = 'INSERT INTO UserToken (token, endAvailability, isAdmin) values ("' .$token . '","' . $endAvailability.'", '.$isAdmin.')';
    $qryToken_res = mysqli_query($con,$qryToken);
    if ($qryToken_res) {
        $arr = array('token' =>  $token, 'endAvailability' => $endAvailability, 'isAdmin' => $isAdmin,
            'msg' => "User Logged Successfully!!!", 'error' => '');
        $jsn = json_encode($arr);
    } else {
        //header("HTTP/1.1 401 Unauthorized");
        $arr = array('msg' => "",
         'error' => 'Error when inserting token: '.$token.' endAvailability: '.$endAvailability.'\n'.$qryToken.'\n'.mysqli_error($con));
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function generateAdminToken($con) {
    $data = json_decode(file_get_contents("php://input"));
    date_default_timezone_set('Europe/Paris');
    $adminTokenEndTime = date("Y-m-d h:i", strtotime('+1 day'));
    $adminToken = md5(uniqid(rand(), true));
    $adminAuthToken = $data->adminAuthToken;

    if (isValidAndAdminToken($con, $adminAuthToken)) {
        $qryToken = 'INSERT INTO adminToken (adminToken, adminTokenEndTime) values ("' . $adminToken . '","' . $adminTokenEndTime.'")';
        $qryToken_res = mysqli_query($con,$qryToken);
        if ($qryToken_res) {
            $arr = array('adminToken' =>  $adminToken, 'adminTokenEndTime' => $adminTokenEndTime,
                'msg' => "Admin token generated Successfully!!!", 'error' => '');
            $jsn = json_encode($arr);
        } else {
            header("HTTP/1.1 401 Unauthorized");
            $arr = array('msg' => "",
                'error' => 'Error when inserting token: '.$adminToken.' adminTokenEndTime: '.$adminTokenEndTime.'\n'.$qryToken.'\n'.mysqli_error($con));
            $jsn = json_encode($arr);
        }
    } else {
        header("HTTP/1.1 401 Unauthorized");
        $arr = array('error' =>  "Vous n'êtes pas administrateur.");
        $jsn = json_encode($arr);
    }
    print_r($jsn);
}

function isTokenValid($con, $authToken) {
    $qry = 'SELECT token FROM UserToken WHERE token = "'.$authToken.'"';
    $qry_res = mysqli_query($con,$qry);
    if($qry_res) {
        $nbRows = mysqli_num_rows($qry_res);
        return (mysqli_num_rows($qry_res) > 0);
    } else {
        print_r($qry."  ".mysqli_error($con));
        return false;
    }
}

function isValidAndAdminToken($con, $adminAuthToken) {
    $qry = 'SELECT token FROM UserToken WHERE token = "'.$adminAuthToken.'" and isAdmin = True';
    $qry_res = mysqli_query($con,$qry);
    if($qry_res) {
        $nbRows = mysqli_num_rows($qry_res);
        return (mysqli_num_rows($qry_res) > 0);
    } else {
        print_r($qry."  ".mysqli_error($con));
        return false;
    }
    
}

function get_free_rooms_for_slot($con){
    $data = json_decode(file_get_contents("php://input"));
    $day                = $data->day;
    $scheduleStart      = $data->scheduleStart;
    $scheduleEnd        = $data->scheduleEnd;

    $qry = 'SELECT r.room as freeRoom FROM room r where NOT EXISTS(SELECT * FROM Booking b WHERE b.day = "'.$day.'" and b.room = r.room and b.scheduleStart = '.$scheduleStart.' and b.scheduleEnd = '.$scheduleEnd.')';
    $qry_res = mysqli_query($con,$qry);
    if($qry_res) {
        $data = array();
        while($rows = mysqli_fetch_array($qry_res))
            {
                $data[] = array(
                            "freeRoom"  => utf8_encode($rows["freeRoom"])
                            );
            }
            $jsn = json_encode($data);
        } else {
            header("HTTP/1.1 418 I am a teapot");
            $arr = array('msg' => "", 'error' =>  mysqli_error($con));
            $jsn = json_encode($arr);
        }
        print_r($jsn);
}
?>