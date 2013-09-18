<?php
	// header('Content-Type: application/json');
    include_once('includes/db.inc.php');
    // include global functions
    include_once('includes/functions.php');
    
    // minimum time slot
    
    $order = array();
    $childrenArray = array();
    $times = array();

    if(isset($_POST["json"])){
    $json = stripslashes($_POST["json"]);
    $parentObject = json_decode($json);

    // Now you can access your php object like so object name "parentObject" output->json key -> value
    // eg $parentObject->details->name
    // parent name
    $parentName = $parentObject->details->name;
    //parent mobile number
    $parentNumber = $parentObject->details->number;
    // children array of each child
    $children = $parentObject->children;
    
    $parentid = addParent($parentName, $parentNumber);

    if($parentid > 0){
        //echo "added";
        foreach ($children as $child) {

            $_childName = $child->name;
            $duration_id = numberDuration($child->duration);
            $seconds = getTimeLeft($child->duration);
            $child_id = addChild($_childName, $duration_id, $parentid, $seconds);
            /* stuff for orders */
            array_push($childrenArray, $child_id);
            array_push($times, $duration_id);
        }

        /* break free from foreach loop! phew!*/
          $id = addOrder($parentid, "no");
          $arrayName = array('id' => $id );
        //echo "Success order $id added."; 
          print_r(json_encode($arrayName));

    } else {
        echo "sorry no parent";
        return false;
    }
   

  } else {
    echo "sorry, somthing wrong with order"; 
    return false;

  }

    

/* FUNCTION TO ADD PARENT INTO THE DATABASE RETURNING THE PARENT ID */

function addParent($_parentName, $_parentNumber){
    global $dbconn;
    $sql = "INSERT INTO parent (`id`, `name`, `mobile`, `date`) VALUES (NULL, '$_parentName', '$_parentNumber', CURRENT_TIMESTAMP);";

        if ($result = $dbconn->query($sql)) {
           //printf("Success: %s\n", $dbconn->affected_rows);
           return $dbconn->insert_id;   

        } else {
            //printf("Error: %s\n", $dbconn->error);
            return false;
        }

    }


/* FUNCTION TO ADD CHILDREN INTO THE DATABASE RETURNING THE PARENT ID */

function addChild($_childName, $_duration_id, $_parent_id, $seconds){
    global $dbconn;
    

    $sql = "INSERT INTO child (`id`, `name`, `duration`, `parent_id`, `start_time`, `paused_time`, `time_left`,  `entered`, `status`, `code`) VALUES (NULL, '$_childName', '$_duration_id', '$_parent_id', NULL, NULL, '$seconds', CURRENT_TIMESTAMP, '2', NULL);";

        if ($result = $dbconn->query($sql)) {
           //printf("Success: %s\n", $dbconn->affected_rows);
           return $dbconn->insert_id; 

    } else {
        //printf("Error: %s\n", $dbconn->error);
        return false;
    }

}


/*FUNCTION TO ADD ORDER */



function addOrder($parentid, $added){
    global $dbconn, $childrenArray, $times;
    $child_entry = implode(",", $childrenArray);
    $time_entry = implode(",", $times);
    $date = date("Y-m-d");
    // $date = strtotime($date);

    $sql = "INSERT INTO orders (`order_id`, `parent_id`, `children`, `times`, `date_entered`,
        `date_modified`, `extra_time`) VALUES (NULL, '$parentid', '$child_entry', '$time_entry', '$date', CURRENT_TIMESTAMP, '$added')";

    if ($result = $dbconn->query($sql)) {
           //printf(json_encode($dbconn->affected_rows));
           return json_encode($dbconn->insert_id);

    } else {
        //printf("Error: %s\n", $dbconn->error);
        return false;
    }


}


    
?>