<?php

include_once 'includes/db.inc.php';

// include global functions

include_once('includes/functions.php');

$data = json_encode( $_POST );

if ( $data ) {

    collectData( $data );
} else {

    return false;
}

function collectData( $data ) {
    global $dbconn;
    $data = json_decode( $data );


    if ( isset( $data->name ) ) {
        addUser( $data->name, $data->user_id );

    }

    if ( isset( $data->action ) ) {
        //echo $data->action;
        switch ( $data->action ) {
        case 'addTime':
            //
            addTime( $data->id, $data->seconds, $data->minutes );
            break;
        case 'pause':
            //print_r($data);
            //pauseChild($data->id, $data->currentTime);
            pauseChild( $data->id, $data->currentTime );
            break;
        case 'start':
            startChild( $data->id, $data->code, $data->time_left);
            break;
        case 'finish':
            finishChild( $data->id );
            break;
        case 'resume':
            resumeChild( $data->id, $data->time_left );
            break;
        case 'complete':
            completeChild( $data->id );
            break;
        case 'getChildDetails':
            getChildDetails( $data->id );
            break;

        }

    }


}

/*
*
*
* pause function edit child row to give a status of  1 (see status below)
// status 1 = paused;
// status 2 = standby
// status 3 = inprogress
// status 4 = finished
*
*/


function pauseChild( $id, $currentTime ) {
    // function pauseChild($id, $currentTime) {

    //database connection variable
    global $dbconn;
    $now = time();
    $currentTime = (intval($currentTime)*100);
    echo "time_left: " . $currentTime;
    $pausedtime = gmdate( 'r', $now );
    $end_time = $currentTime;
    echo "end_time:" . $end_time;
    echo "paused time hunareadable format: ". $pausedtime;

    $sql = "UPDATE child SET  status =  1, paused_time = '$pausedtime', time_left = '$currentTime', end_time = '$end_time' WHERE  child.id = $id";

    if ( $result = $dbconn->query( $sql ) ) {

    } else {
        echo "sorrypal";
        printf( "pauseChild Error: %s\n", $dbconn->error );
    }

}


function startChild( $id, $code, $timeleft ) {
    global $dbconn;
    $code = strtoupper( $code );
    $start_time = time();
    // convert time left to the seconds
    $seconds = (intval($timeleft)/100);
    // add it on the time of being started.
    $end_time = time() + $seconds;

    echo "\n$id start_time: $start_time, endtime: $end_time timeleft: $timeleft seconds: $seconds ";
    $sql = "UPDATE child SET status = 3, code = '$code', start_time = '$start_time', end_time = '$end_time' WHERE  child.id = $id";
    // print_r($sql);
    if ( $result = $dbconn->query( $sql ) ) {

    } else {
        echo "sorrypal";
        printf( "startChild Error: %s\n", $dbconn->error );
    }


}

function finishChild( $id ) {

    global $dbconn;


    $sql = "UPDATE child SET time_left = 0, entered = CURRENT_TIMESTAMP,  status = 4 WHERE  child.id = $id";

    if ( $result = $dbconn->query( $sql ) ) {

    } else {
        echo "sorrypal";
        printf( "finishChild Error: %s\n", $dbconn->error );
    }


}

function completeChild( $id ) {

    global $dbconn;


    $sql = "UPDATE child SET  status = 5 WHERE  child.id = $id";

    if ( $result = $dbconn->query( $sql ) ) {

    } else {
        echo "sorrypal";
        printf( "completeChild Error: %s\n", $dbconn->error );
    }


}

function resumeChild( $id, $timeleft ) {

    global $dbconn;

    $seconds = (intval($timeleft)/100);
    // add it on the time of being started.
    $end_time = time() + $seconds;

    $sql = "UPDATE child SET status = 3, time_left = '$timeleft', end_time = '$end_time'  WHERE  child.id = $id";

    // print_r($sql);
    if ( $result = $dbconn->query( $sql ) ) {

    } else {
        echo "sorrypal";
        printf( "startChild Error: %s\n", $dbconn->error );
    }

}

function addCode( $id, $code ) {


}

function addTime( $id, $seconds, $minutes ) {

    global $dbconn;
    // convert to integer for db
    $_seconds = intval( $seconds );
    $end_time = time() + intval($_seconds/100);
    $sql = "UPDATE child SET time_left = '$_seconds', end_time = '$end_time'  WHERE  child.id = $id";

    if ( $result = $dbconn->query( $sql ) ) {
        // get parent id
        $get_parent_id_sql = "SELECT parent_id FROM child WHERE  child.id = $id";

        $result2 = $dbconn->query($get_parent_id_sql);
        //var_dump($result);
            if($result2){
                while ($row = $result2->fetch_row()){
                    $parentid = $row;
                    //var_dump($parentid);
                }
            }
            if ($parentid){
                $order_id = addTimeOrder($parentid, "yes", $id, $minutes);
            }
        
        if (!$order_id){
             print_r("Error adding order add time");
        } else {
            $arrayName = array('id' => $order_id );
                //echo "Success order $id added.";
            print_r(json_encode($arrayName));
        }

    } else {

        printf( "addTime Error: %s\n", $dbconn->error );
    }


}

function getChildDetails($_childid){
    global $dbconn;
    $childDetails = array();

    $sql = "SELECT child.id, child.name AS childname, child.code, parent.name AS parentName, parent.mobile AS mobilenumber FROM child, parent WHERE child.parent_id = parent.id AND child.id = {$_childid}";
    $result = mysqli_query($dbconn, $sql);
    while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $childDetails[] = array(
            'parentname'=>$values['parentName'],
            'mobile' => $values['mobilenumber'],
            'childname' => $values['childname'],
            'code' => $values['code'],
            
        );
    }

    $obj['childDetails'] = $childDetails;
    //echo json_encode($obj);
    echo json_encode($obj);

    }

function addTimeOrder( $_parent_id, $added, $child_id, $minutes ) {

    global $dbconn;
    // convert to integer for db
    $time_entry = numberDuration($minutes);
    $_parentid = intval($_parent_id[0]);
    $child_entry = $child_id;
    $date = date("Y-m-d");
 //var_dump($date);
        $sql = "INSERT INTO orders (`parent_id`, `children`, `times`, `date_entered`,`date_modified`, `extra_time`) VALUES (
            $_parentid,
            '$child_entry',
            '$time_entry',
            '$date',
            CURRENT_TIMESTAMP, 
            '$added')";
        //var_dump($sql);
    if ( $result = $dbconn->query( $sql ) ) {
        return json_encode($dbconn->insert_id);
    } else {
        //printf( "addTime Error: %s\n", $dbconn->error );
        return false;
    }


}

?>
