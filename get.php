<?php

include_once('includes/db.inc.php');

if(isset($_GET['childid']) &&  $_GET['childid'] != "" ){
    
    getUser($_GET['childid']);
} else {

    getUser(0);
    return false;
    exit;
}



function getUser($id) {
    global $dbconn;
    $users = array();

    $yesterday = date('Y-m-d') . ' 00:00:00';

    if ($id != 0 ){
        $sql = "SELECT * FROM child WHERE id = $id";
    } else {
        $sql = "SELECT * FROM child WHERE entered > '$yesterday'";
        //echo $midnight;
    }
    //connect_db_web($_dbconn);
    $result = mysqli_query($dbconn, $sql);
    while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $users[] = array(
            'id'=>$values['id'],
            'name'=>$values['name'],
            'duration' => $values['duration'],
            'parent_id' => $values['parent_id'],
            'start_time' => $values['start_time'],
            'paused_time' => $values['paused_time'],
            'time_left' => $values['time_left'],
            'end_time' => $values['end_time'],
            'entered' => $values['entered'],
            'status' => $values['status'],
            'code' => $values['code']
        );
    }

    //var_dump($users);
    $obj['users'] = $users;

    $callback = (empty($_GET["callback"])) ? 'callback' : $_GET["callback"];
    
    echo json_encode($obj);

       // echo '<pre>' ;
       //echo print_r($midnight);
       // echo '</pre>';

}


?>