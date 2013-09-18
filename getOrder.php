<?php

include_once('includes/db.inc.php');

//var_dump($_GET);

if(isset($_GET['orderid']) &&  $_GET['orderid'] != "" ){
    getOrder($_GET['orderid']);
} else {
    return false;
    exit;
}



function getOrder($id) {
    $orders = array();
    $parent = array();
    $children = array();
    global $dbconn;
    //connect_db_web($_dbconn);
    $result = mysqli_query($dbconn, "SELECT * FROM orders WHERE order_id = $id");
    while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $orders[] = array(
            'order_id'=>$values['order_id'],
            'parent_id'=>$values['parent_id'],
            'children' => $values['children'],
            'times' => $values['times'],
            'date_entered' => $values['date_entered'],
            'date_modified' => $values['date_modified'],
            'extra_time' => $values['extra_time']
            
        );
}
        // get parent name
        //var_dump($orders[0]['parent_id']);
        $_parentID = $orders[0]['parent_id'];

        $result = mysqli_query($dbconn, "SELECT * FROM parent WHERE id = $_parentID");
            while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                $parent[] = array(
                    'id'=>$values['id'],
                    'name'=>$values['name'],
                    'mobile' => $values['mobile']
                    
                    
                );
        // get parent mobile
            }
        $childrenString = $orders[0]['children'];
        $timesString = $orders[0]['times'];
        
        $childrenArray = explode(",",$childrenString);
        $timesArray = explode(",",$timesString);
        
        // index for number of children
        $count = 0;
        // child details to return
        $childDetails = array();
        foreach ($childrenArray as $child) {
            //var_dump($child);
            $result = mysqli_query($dbconn, "SELECT * FROM child WHERE id = {$child}");
                while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                    $children[] = array(
                        'id'=>$values['id'],
                        'name'=>$values['name']
                    );     
                }
                $count++;
                array_push($childDetails, $children);
        }

    //var_dump($users);
    $obj['orders'] = $orders;
    $obj['parent'] = $parent;
    $obj['children'] = $children;
    $callback = (empty($_GET["callback"])) ? 'callback' : $_GET["callback"];
    
    echo json_encode($obj);

}


?>