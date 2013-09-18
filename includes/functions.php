<?php
// minimum time slot
$MIN_TIME_SLOT = 15;

/* FUNCTION TO RETURN INTEGER FOR DURATION DATABASE 
@Return $duration_id of time/15 mins which is defined as constant at top of page  
    PLEASE NOTE this formular needs to change if times change on form.

*/
function numberDuration($_duration){
            global $MIN_TIME_SLOT;     
            $duration_id = $_duration/$MIN_TIME_SLOT;
            return $duration_id;
    }

//convert minutes to seconds for time left in child table
function getTimeLeft($minutes){
    $time_in_seconds = $minutes*6000;
    return $time_in_seconds;
}

?>