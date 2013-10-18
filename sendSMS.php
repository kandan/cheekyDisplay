<?php

include_once('includes/db.inc.php');


    if(isset($_POST)){
    
     
     $json = json_encode($_POST);

     $smsObject = json_decode($json);

     //print_r($smsObject);

     $id = $smsObject->id;
     $type = $smsObject->type;
     getParentDetails($id, $dbconn, $type);


    } else {

        echo "sorry there is no post for this. <br><a href='display.html'>return to display</a>"; 
        exit;
    }

    

    function getParentDetails($_childid, $_dbconn, $_type){

    $smsDetails = array();

    $sql = "SELECT child.id, child.name AS childname, child.code, parent.name AS parentName, parent.mobile AS mobilenumber FROM child, parent WHERE child.parent_id = parent.id AND child.id = {$_childid}";
    $result = mysqli_query($_dbconn, $sql);
    while ($values = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $smsDetails[] = array(
            'parentname'=>$values['parentName'],
            'mobile' => $values['mobilenumber'],
            'childname' => $values['childname'],
            'code' => $values['code'],
            'type' => $_type
        );
    }

    $obj['smsDetails'] = $smsDetails;
    //echo json_encode($obj);

    $content = collectData($smsDetails[0]['mobile'], $smsDetails[0]['parentname'],$smsDetails[0]['code'],$smsDetails[0]['childname'], $smsDetails[0]['type']);

    $response = send($content);

    echo $response;

    }
                
    /// send type of message
    // 1. 2 mins remaining
    // 2. finished
    // 3. urgent
    
    //$parentNumber
    //$ref_number


    function collectData($mobile_number, $parentName, $ref, $childName, $type){

        // 1
        switch ($type){
            case 3;
            $_message ="Hello " .$parentName.  ", please come to the play area immediately as ". $childName ." needs you. Love CheekyChinos.";
            break;
            case 2:
            $_message = "Hi " .$parentName.  ", your child " . $childName . "'s play time has finished, please come to the play area to collect your little one. Love CheekyChinos.";
            break;
            case 1:
            $_message = "Hi " .$parentName.  ", your child " . $childName . " has 2 minutes of play time remaining. Please collect your little one or purchase more play time. Love CheekyChinos.";
            break;
        }

        $username = 'CheekyChinos';
        $password = 'Luzern01';
        $title = 'CheekySMS';
        $message = $_message;
        // testing
        //$mobile_number ='0424982575';

        $content =  'username='.rawurlencode($username).
                    '&password='.rawurlencode($password).
                    '&to='.rawurlencode($mobile_number).
                    '&from='.rawurlencode($title).
                    '&message='.rawurlencode($message).
                    '&ref='.rawurlencode($ref);
                    return $content;
    }


     function sendSMS($content) {
      
        $ch = curl_init('https://www.smsbroadcast.com.au/api-adv.php');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close ($ch);
        return $output; 
     
    }


    function send($_content){


        // disable when live in production
        //$smsbroadcast_response = "sms send disabled in development"

        $smsbroadcast_response = sendSMS($_content);
        
        $response_lines = explode("\n", $smsbroadcast_response);
        foreach($response_lines as $data_line){
                $message_data = "";
                $message_data = explode(':',$data_line);
            if($message_data[0] == "OK"){
                $response = "The message to ".$message_data[1]." was successful, with reference ".$message_data[2]."\n";
            }elseif( $message_data[0] == "BAD" ){
                $response = "The message to ".$message_data[1]." was NOT successful. Reason: ".$message_data[2]."\n";
            }elseif( $message_data[0] == "ERROR" ){
                $response = "There was an error with this request. Reason: ".$message_data[1]."\n";
            }
        }

        return $response;

    } 
?>