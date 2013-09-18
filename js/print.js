
function getOrderDetails(order_id){

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
                            printOrder(orderID, parentName, parentMobile, childName, extraTime);



    });

}

window.epos = function(str, callback) {
    console.log("printing phonegap plugin");
        cordova.exec(callback, function(err) {
                 callback('Nothing to echo.');
                 }, "Epos", "epos", [str]);
        };


function printOrder(order_id, _parentName, _parentMobile, _childNames, _extraTime){
	console.log("print" + _extraTime);
    // DEFAULTS
    var length_for_childname = 24;
    var cost_per_15_minute = 5;
    var minutes_per_dollar = 3;

    var childTimes = [_extraTime];

    // array details from orders
    var parentName = _parentName;
    var parentMobile = _parentMobile;
    var childnames = [_childNames];
    childname_length = childnames.length;
    
    // text for child docket;
    
    var now = new Date();
    var orderNumber = "#"+order_id;
    var childRows = "Childs Name             Time           Cost \n_____________________________________________\n";
    var total = 0;
    
    for(i=0;i<childname_length;i++){
        var blank = "";
        var zero = "";
        var gstzero = "";
        var totalzero = "";
        var GST;
        
        total += Number(childTimes[i]);
        var cost = (Number(childTimes[i])/minutes_per_dollar);
        var rowlength = length_for_childname - childnames[i].length;
        if (rowlength > 0){
            for (r = 0; r < Number(rowlength);r++){
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
    
    console.log("total"+ total);
    
    echoValue = "\nSupervised Play Ticket: Extra Time Added\n";
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
    echoValue += "Please remember you are responsible for your\nchild and must not leave CheekyChinos at\nany time.\n\n"
    echoValue += "Thankyou, Love CheekyChinoss              \n\n\n\n\n\n";
    
    //console.log(echoValue);
    closeModal();
        window.epos(echoValue, function(echoValue) {
            //alert(echoValue == "echome"); // should alert true.
        });

        
}