var Timers = [];
var isRemote = true;
var isTesting = false;

var REMOTEURL = "http://cheeky.kandan.com.au/display/";
var TESTINGURL = "http://cheeky.kandan.com.au/display/testing/";
var LOCALURL = "http://michael.local/CheekyDisplay_www/";
var WEBURL;

var closedModal = false;

if (isRemote) {
    WEBURL = REMOTEURL;
    
} else {
    WEBURL = LOCALURL;


    isConnected = true;
    isPhoneGapReady = true;
}

if (isTesting){
    WEBURL = TESTINGURL;
}

    // Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}

function formatTime(time) {
    var min = parseInt(time / 6000, 10),
        sec = parseInt(time / 100, 10) - (min * 60),
        formated_time = ""+ (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
    return formated_time;
}
/* PRINT ORDER FUNCTIONS */

function getOrderDetails(order_id, callback){

    // console.log("order");
    // console.log(WEBURL);
    $.getJSON(""+WEBURL+"getOrder.php?orderid="+ order_id +"",function(result){
                           
                    var orderID = "";
                    var parentName = "";
                    var parentMobile = "";
                    var childName = "";
                    var extraTime = "";

                         $.each(result.orders, function(i, order){

                            orderID = order.order_id;
                            extraTime = (order.times*15);
                                                                                                            
                            });

                         $.each(result.parent, function(i, par){

                            parentName = par.name;
                            parentMobile = par.mobile;
                                                                                                            
                            });

                         $.each(result.children, function(i, child){

                            childName = child.name;
                                                                                                            
                            });
                            //console.log("getResults");
                            // printing docket
                            var printed = printOrder(orderID, parentName, parentMobile, childName, extraTime);

                            //console.log("printed:" + printed);



    })
    .done(function() { console.log( "second success" ); })
    .always(function() { console.log( "complete" );
        getChild(0);
     });

}

window.epos = function(str, callback) {
   // console.log("printing phonegap plugin");
        cordova.exec(callback, function(err) {
                 callback('Nothing to echo.');
                 }, "Epos", "epos", [str]);
        };


function printOrder(order_id, _parentName, _parentMobile, _childNames, _extraTime){
    //console.log("print" + _extraTime);
    // DEFAULTS
    var length_for_childname = 24;
    var cost_per_15_minute = 5;
    var minutes_per_dollar = 3;

    var childTimes = [_extraTime];

    // array details from orders
    var parentName = _parentName;
    var parentMobile = _parentMobile;
    var childnames = [_childNames];
    var childname_length = childnames.length;
    
    // text for child docket;
    
    var now = new Date();
    var orderNumber = "#"+order_id;
    var childRows = "Childs Name             Time           Cost \n_____________________________________________\n";
    var total = 0;
    var totalzero = "";
    var gstzero = "";
    var GST;
    for(var i=0;i<childname_length;i++){
        var blank = "";
        var zero = "";
        gstzero = "";
        totalzero = "";
        GST = "";
        
        total += Number(childTimes[i]);
        var cost = (Number(childTimes[i])/minutes_per_dollar);
        var rowlength = length_for_childname - childnames[i].length;
        if (rowlength > 0){
            for (var r = 0; r < Number(rowlength);r++){
                blank += " ";
            }
        }
        if (cost < 10){
            zero = "0";
        }
        childRows += childnames[i] + blank + childTimes[i]+" mins        $"+zero+cost.toFixed(2)+"\n";
    }

    total = (total/minutes_per_dollar);
    
    GST = (total*0.1);
    if (GST < 10){
        gstzero = "0";
    }
    
    if (total < 10){
        totalzero = "0";
    }
    
    //console.log("total"+ total);
    
    var echoValue = "\nSupervised Play Ticket: Extra Time Added\n";
    echoValue += "_____________________________________________\n\n";
    echoValue += "Date:"+ now + "\n";
    // echoValue += "Order No:"+orderNumber+"\n";
    echoValue += "Parent Name: "+parentName+"                  \n";
    echoValue += "Mobile: "+parentMobile+"                  \n\n";
    echoValue += childRows;
    echoValue += "_____________________________________________\n";
    // echoValue += "GST                                    $"+gstzero+ GST.toFixed(2) +"\n";
    // echoValue += "Total                                  $"+totalzero+total.toFixed(2) +"\n\n";
    echoValue += "Please present this ticket to pay for your\nchild's play time and retain ticket to collect\nyour child.\n\n";
    echoValue += "Please remember you are responsible for your\nchild and must not leave CheekyChinos at\nany time.\n\n";
    echoValue += "Thankyou, Love CheekyChinoss              \n\n\n\n\n\n";
    
    //console.log(echoValue);
    //closedModal = false;
    closeModal();
    //console.log("pressed");
        window.epos(echoValue, function(echoValue) {
            //alert(echoValue == "echome"); // should alert true.
        });

        return true;
}
/* TIMER FUNCTIONS */
 var toHHMMSS = function (_time) {
        var sec_num = parseInt(_time, 10); // don't forget the second parm
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var hr_min = ":";
        if (hours < 10) {hours = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        if (hours === "00"){
            hours = '';
            hr_min = "";
        }
        var time    = hours+hr_min+minutes+':'+seconds;
        return time;
    };


function getChild(id) {
    // check network
    //networkDetection();
     console.log("getChild");
    $("#refresh").addClass("ajax");
    $.getJSON("" + WEBURL + "get.php?childid=" + id + "", function (result) {
        var count = 0;
        $.each(result.users, function (i, user) {
            count++;
            // status 1 = paused;
            // status 2 = standby
            // status 3 = inprogress
            // status 4 = finished
            // status 5 = completed (remove from register display)

            var pause_resume_text = "Pause";
            var start_resume_text = "Start";
            var input = '';
            var hideTimeClass = "";
            var hideStart = "";

            if (user.status == 2) {

                input = '<input placeholder="' + user.name + '" name="codeName' + user.id + '" id="code-' + user.id + '" value="" />';
                hideTimeClass = "hide";

            } else {

                hideStart = "hide";
            }
            // icon guide
            // eg <i class="icon-envelope icon-white"></i>
            // <i class="icon-envelope icon-white"></i>
            // complete icon-eject
            //pause  icon-pause
            // resume  icon-step-backward
            // end  icon-stop
            // start  icon-add

            var child_status_class = "";
            var timeLeft = "";
            var status = user.status;
            var refcode = user.code;
            var pausedTime = formatTime(user.time_left);
            switch (status) {
                case "1":
                    child_status_class = "paused";
                    pausedTime =  toHHMMSS(user.time_left/100);
                    break;
                case "2":
                    child_status_class = "standby";
                    break;
                case "3":
                    child_status_class = "inprogress";
                    var end = user.end_time;
                    //console.log("end:" + end);
                    var now = Math.round(new Date()/1000);
                    timeLeft = toHHMMSS(end - now);
                    //console.log("timeleft: " + toHHMMSS(timeLeft));
                    break;
                case "4":
                    child_status_class = "finished";
                    refcode = user.code+"";
                    refcode = refcode.substring(0,5);
                    break;
            }

            // reformat time left to time mm:ss:mm
            
            var enteredTime = user.entered.split(" ");
            var time = enteredTime[1].split(":");
            enteredTime = time[0] + ":" + time[1];
            
            var childString = '<div data-toggle="popover" data-placement="bottom" title="" data-original-title="Message Sent" id="child' + user.id + '" data-name="' + user.name + '" data-status="' + user.status + '" data-code="' + user.code + '" data-timeLeft="' + user.time_left + '" data-endTime="' + user.end_time + '" data-id="' + user.id + '" class="well ' + user.id + ' child ' + child_status_class + '">' + input + '<div class="timer ' + hideTimeClass + '" ><h5 class="child-name">' + user.name + '</h5><h6 id="timer' + user.id + '">'+ timeLeft +'</h6><h6 id="pausedTime' + user.id + '" class="pausedtime">' + pausedTime + '</h6><h6 class="finishedTime">Ended:' + enteredTime + '<br>Ref:' + refcode + '</h6></div>';
            // BUTTONS IN THEIR OWN WRAPPER
            childString += '<div class="button-wrapper">';
            // resume button
            childString += '<p class="resume  clearfix btn btn-danger ' + hideTimeClass + '" onclick="resume(' + user.id + ')" ><i class="icon-chevron-left icon-white"></i></p>';
            // PAUSE button
            childString += '<p class=" clearfix btn pause" onclick="pause(' + user.id + ')" ><i class="icon-pause icon-white"></i></p>';
            // START button
            childString += '<p class=" clearfix btn start ' + hideStart + '" onclick="start(' + user.id + ')" ><i class="icon-play icon-white"></i></p>';
            // FINISH button
            childString += '<p class=" clearfix btn finish" onclick="finished_popUp(' + user.id + ')" ><i class="icon-stop icon-white"></i></p>';
            // COMPLETE button
            childString += '<p class="clearfix btn complete" onclick="getChildInfo(' + user.id + ', true)" ><i class="icon-eject icon-white"></i></p>';

            childString += '<p class="clearfix btn add" onclick="addTime_popUp(' + user.id + ')" ><i class="icon-plus icon-white"></i></p>';
            // SMS button
            childString += '<p class="clearfix btn notify ' + hideTimeClass + '" onclick="sms_popUp(' + user.id + ')" ><i class="icon-envelope icon-white"></i></p>';
            // INFO button
            childString += '<p class="info clearfix btn btn-info  " onclick="getChildInfo(' + user.id + ', false)"><i class="icon-envelope icon-white"></i></p>';
            // CLOSE BUTTON WRAPPER
            
            childString += '</div>';

            childString += '</div>';


            if ($("#paused").children().hasClass(user.id) || $("#standby").children().hasClass(user.id) || $("#inprogress").children().hasClass(user.id) || $("#finished").children().hasClass(user.id)) {

                if (user.status == 1) {

                    $('#paused').remove('.' + user.id);
                }

                if (user.status == 2) {

                    $('#paused').remove('.' + user.id);
                }

            } else {
                if (user.status == 1) {


                }

                if (user.status == 2 || user.status == 1) {
                    $("#standby").prepend(childString);

                }

                if (user.status == 3) {
                    $("#inprogress").prepend(childString);
                    //createTimer(user.id, user.time_left, true);
                }

                if (user.status == 4) {
                    $("#finished").prepend(childString);
                }

            }
        });
    });
$("#refresh").removeClass("ajax");
}


function pause(_id) {

    var currentTime = "null";
    
    currentTime = $("#pausedTime"+_id).html();
    console.log("currentTime: "+ currentTime);

    var id = _id;

    var pauseObject = {
        action: "pause",
        currentTime: currentTime,
        id: id
    };

    $('div').remove('.' + id);

    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: pauseObject,
        // dataType: "json",
        success: function (data) {
            console.log("Success pause " + data + _id);
            getChild(_id);
        },
        error: function (errMsg) {
            console.log("Error pause " + errMsg);

        }
    });

}


/*
 id = child id
 start_time = now();
 duration is Duration id
 */
function start(_id) {
    // min length for code entered on ticket
    var CODE_LENGTH = 5;
    var childToStart = $("." + _id);
    var status = childToStart.data("status");
    console.log(status);
    //var childCode = childToStart.data("code");
    var childCode_input = $("#code-" + _id).val();
    if (status == 2) {

        // get length of code
        var codeLength = childCode_input.length;

        if (childCode_input == "") {

        navigator.notification.alert(
            'Please insert your reciept number',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );
            
            return false;
        }

        if (codeLength < CODE_LENGTH) {
            
        navigator.notification.alert(
            'Sorry, your code is not quite long enough.',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );

            return false;
        }

        if (status == 5) {
        navigator.notification.alert(
            'Do you want to add more time?',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );
            return false;
        }
    }

    var id = _id;

    var timeleft = $('#child' + id).data("timeleft");

    console.log("started: timeleft:" + timeleft);
   // createTimer(id, timeleft, true);

    var startObject = {
        action: "start",
        id: id,
        code: childCode_input,
        time_left: timeleft
    };

    $('div').remove('.' + id);

    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: startObject,
        // dataType: "json",
        success: function (data) {
            console.log("Success start " + data);
            getChild(_id);
        },
        error: function (data) {
            console.log("Error start " + data);
        }
    });
}

/*MODAL FUNCTIONS*/
// message for when printer does its thing.
function openConfirmModal(msg){
            var modelString = '<div><h1>'+msg+'</h1></div>';
            $.modal(modelString);
}

function closeModal(){
// close modal after 3 seconds
    
    closedModal = setTimeout (function(){
        $.modal.close();
       
    }, 4000);
    
    return closedModal;
}


/* get parent details from child id,
 type = type of message
 auto is if the message is sent without asking confirmation from user!
 */

function notifyParent(_id, _type, _auto) {
    //get id of child
    var child_id = _id;
    var type = _type;
    var auto = _auto;
    var sms = {
        id: _id,
        type: type

    };


    if (auto){

    $.ajax({
        type: "post",
        url: "" + WEBURL + "sendSMS.php",
        data: sms,
        // dataType: "json",
        success: function (data) {
            console.log("Success resume " + data);
            var options = {
                content:data,
                trigger:'manual'
            }

            $('#child'+_id).popover(options);
            $('#child'+_id).popover('show');
            var start = setTimeout(
                function() {
                    hidePopover(child_id);
                }, 3000);

            
        },
        error: function (errMsg) {

            console.log("Error resume " + errMsg);
            
            var error = {
                content: 'Oops, there was an error sending the sms :( ' + errMsg,
                trigger:'manual'
            }

            $('#child'+_id).popover("Oops, there was an error sending the sms :( " + error);
            $('#child'+_id).popover('show');
            var errorStart = setTimeout(function() {
                hidePopover(child_id)
            }, 3000);

        },

        
        });

    } else {
        
        console.log("auto:"+auto);
    }

}


window.hidePopover = function(child_id){
    console.log('hide');
            $("#child"+child_id).popover('hide');
        }

function hidepopover(){
    console.log("hide pop over");
    $('#child'+_id).popover('hide');
}

function finish(_id) {

    var CODE_LENGTH = 5;
    var childToStart = $("." + _id);
    var status = childToStart.data("status");
    console.log(status);
    // var childCode = childToStart.data("code");
    var childCode_input = $("#code-" + _id).val();
    if (status === 2) {
        var codeLength = childCode_input.length;
        if (childCode_input === "") {
            navigator.notification.alert(
            'Please insert your reciept number',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );
           
            return false;
        }

        if (codeLength < CODE_LENGTH) {
            navigator.notification.alert(
            'Sorry, your code is not quite long enough.',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );
            
            return false;
        }
    }


    var id = _id;

    var finishObject = {
        action: "finish",
        id: id
    };
        $('div').remove('.' + id);
    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: finishObject,
        
        success: function (data) {
            console.log("Success finish " + data);
            // notify parent and dont send auto
            //notifyParent(_id, 2, true);
            getChild(_id);
        },
        error: function (errMsg) {

            console.log("Error finish " + errMsg);

        }
    });


}

function complete(_id) {

    var id = _id;
    var completeObject = {
        action: "complete",
        id: id
    };
    //$('div').remove('.' + id);

    $('.' + id).fadeOut('500', function(){
        $(this).remove();
    });

    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: completeObject,
        // dataType: "json",
        success: function (data) {
            console.log("Success complete " + data);
        },
        error: function (errMsg) {
            console.log("Error complete " + errMsg);
        }
    });


}

function addTime_popUp(id) {

    var name = $("." + id + " .child-name").text();
    //console.log("name:" + name);

    var modelString = '<div><h1>Add Time</h1><h3>Add more time for <strong>' + name + '</strong> </h3>';
    modelString += '<p class="btn simplemodal-close time-15" onclick="addTime(' + id + ',15)" >15 mins<br>$5</p>';
    modelString += '<p class="btn simplemodal-close time-30" onclick="addTime(' + id + ',30)" >30 mins<br>$10</p>';
    modelString += '<p class="btn simplemodal-close time-45" onclick="addTime(' + id + ',45)" >45 mins<br>$15</p>';
    modelString += '</div>';

    
    
    $.modal(modelString);

}


function addTime(_id, minutes) {

    var time_left = $("#child" + _id).data("timeleft");
    $('.' + _id).remove();
    console.log("removed"+_id);
    
    //console.log("time_left: " + time_left);
    var to_seconds = (minutes * 6000);
    var new_time = time_left + to_seconds;
    //console.log("new_time: " + new_time);

    var id = _id;
    var addTimeObject = {
        action: "addTime",
        seconds: new_time,
        id: id,
        minutes: minutes
    };

  

    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: addTimeObject,
        // dataType: "json",
        success: function (data) {
            console.log("Success addTime " + data);
            
            var order = JSON.parse(data);
            console.log("JSONDATA:" + order.id);
            getOrderDetails(order.id, function(){
                    
            });
            openPrintModal("Printing<br> Please Wait!");

            //printEpos(order.id);


            
        },
        error: function (errMsg) {

            console.log("Error addTime " + errMsg);

        }, 
         complete:function (data){
            console.log(data);
                //getChild(id);
         }
    });


}



function resume(_id) {

    var id = _id;
    var timeleft = $('.' + id).data("timeleft");
    if (timeleft < 1) {
         navigator.notification.alert(
            'Please add more time.',    // message
            test,                                     // callback
            'CheekyChinos',                         // title
            'Ok'                                    // buttonName
        );
       
        return;
    }
    console.log("timeleft:" + timeleft);
    //createTimer(id, timeleft, true);

    var resume = {
        action: "resume",
        id: id,
        time_left: timeleft
    };

    $('div').remove('.' + id);

    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: resume,
        // dataType: "json",
        success: function (data) {
            console.log("Success resume " + data);
            getChild(_id);
        },
        error: function (errMsg) {

            console.log("Error resume " + errMsg);

        }
    });

}

function sms_popUp(id) {

    var name = $("." + id + " .child-name").text();
    console.log("sms:" + name);


    // parentName, number, childName, type, ref
    var smsModelString = '<div><h1>Send Message</h1><h3>SMS Parent for ' + name + ' </h3>';

    // smsModelString += '<p class="btn simplemodal-close" onclick="notifyParent(' + id + ',1,false)" >Ready<br></p>';
    smsModelString += '<p class="btn simplemodal-close" onclick="notifyParent(' + id + ',2,true)" >Finished</p>';
    smsModelString += '<p class="btn simplemodal-close" onclick="notifyParent(' + id + ',3,true)" >Urgent</p>';
    smsModelString += '</div>';

    
    $.modal(smsModelString);

}

function finished_popUp(id) {

    var name = $("." + id + " .child-name").text();
    console.log("sms:" + name);


    // parentName, number, childName, type, ref
    var smsModelString = '<div><h1>Send Message</h1><h3>SMS Parent for ' + name + ' </h3>';

    // smsModelString += '<p class="btn simplemodal-close" onclick="notifyParent(' + id + ',1,false)" >Ready<br></p>';
    smsModelString += '<p class="btn simplemodal-close" onclick="dontNotifyAddClass('+id+', true)">Notify Parent</p>';
    smsModelString += '<p id="finish_btn" class="btn simplemodal-close " onclick="dontNotifyAddClass('+id+', false)" >No Thanks</p>';
    smsModelString += '</div>';

     
             

    $.modal(smsModelString, {onClose: function (dialog) {         
               
                finish(id);
               
                $.modal.close(); // must call this!
    }});

    var finito = closeModal();
    console.log("finito:" = finito);


}

function dontNotifyAddClass(id, notify){

        //console.log("dontNotifyAddClass" + $("#finish_btn").text() + " end of....");

        if (notify){

            $("#finish_btn").removeClass("dontNotify");

        } else {
            $("#finish_btn").addClass("dontNotify");
        }


         if ($("#finish_btn").hasClass('dontNotify')) {

                    console.log("dont");

                    notifyParent(id,2,false);
            } else {

                    console.log("do");
                    notifyParent(id,2,true);
            }
        }



function showChildDetails(_childsName, _ParentsName, _ParentsMobile, _Ref, _isFinished, _id) {

    var childsName = _childsName;
    var ParentsName = _ParentsName;
    var ParentsMobile = _ParentsMobile;
    // var RefNumber = _Ref;
    var popUpHeading = '';
    var confirmDiv = '';
    var thechildname = '';
    var childID = _id;

    if (_isFinished) {


        popUpHeading = childsName + ' is Leaving';

        confirmDiv = '<div><p class="simplemodal-close finish-button">Cancel</p><p class="simplemodal-close finish-button" onclick="complete(' + childID + ')">OK</p></div>';
    } else {
        popUpHeading = "Details";
        thechildname = '<h3>Childs Name: <strong>' + _childsName + '</strong></h3>';

    }

    var modelString = '<div><h1>' + popUpHeading + '</h1>';
    modelString += thechildname;
    modelString += '<h3 class="" >Parents Name: ' + ParentsName + '</h3>';
    modelString += '<h3 class="" >Parents Mobile: ' + ParentsMobile + '</h3>';
    modelString += '<h3 class="" >Code: ' + _Ref + '</h3>';
    modelString += confirmDiv;
    modelString += '</div>';
    
    $.modal(modelString);
}

function getChildInfo(_id, _finished) {
    console.log("getINfo");
    var id = _id;
    var getChildDetails = {
        action: "getChildDetails",
        id: id
    };

    // chek if child is fnishing for message
    var isFinished = _finished;


    $.ajax({
        type: "post",
        url: "" + WEBURL + "post.php",
        data: getChildDetails,
        // dataType: "json",
        success: function (data) {
            console.log("Success getChildInfo " + data);
            var JSONDATA = JSON.parse(data);
            console.log("JSONDATA:" + JSONDATA.childDetails[0].parentname);
            var details = JSONDATA.childDetails[0];
            // insert values for child pop up

            showChildDetails(details.childname, details.parentname, details.mobile, details.code, isFinished, _id);
        },
        error: function (errMsg) {

            console.log("Error resume " + errMsg);
            alert("Oops, there was an error sending the sms :( " + errMsg);

        }
    });

}
    var getTimer = setInterval (function(){
          var childrenPaused = $(".child.inprogress");
          var ref = "";
        $.each(childrenPaused, function (i, kid) {
            var id = $(kid).data("id");
            var end = $(kid).data("endtime");
            var now = Math.round(new Date()/1000);
            var timeLeft = end - now;
            ref = String($(kid).data("code"));
            if (timeLeft === 120 ){
                notifyParent(id, 1, true);
            }

            if (timeLeft < 0 ){
                notifyParent(id, 1, true);
                finish(id);
            
            } else {
                $("#timer"+id).html(toHHMMSS(timeLeft) + "<br><span class='code'>Code:"+ ref.substring(0,5) + "</span>");
                $("#pausedTime"+id).html(timeLeft);
            }
        });

    }, 1000);

    function openPrintModal(msg){
            var modelString = '<div><h1>'+msg+'</h1></div>';
            var modaloptions = {
        onClose: function(){
            console.log("close time add window");
            $.modal.close();
            clearTimeout(closedModal);
            
            console.log("closedModal" + closedModal);
        }

    }
            $.modal(modelString, modaloptions);
    }

    
//     function closeModal(){
//         console.log('test');
// // close modal after 4 seconds
// if (closedModal){
//     closeTimer = setTimeout (function(){
//         console.log("closed");
//         $.modal.close();
//     }, 4000);
//     }
// }

var hideAllPopovers = function() {
       $('.popup-marker').each(function() {
            $(this).popover('hide');
        });  
    };

   