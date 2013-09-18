function notConnected_popUp() {
    var modelString = '<div><h1>Sorry, your internet connecting dosnt seem to be working.</h3>';
    modelString += '<h2 class="connection-alert" >Please connect and try again.</h2>';
    modelString += '</div>';
    $.modal(modelString);
}


function networkDetection() {
		if (isPhoneGapReady) {

			
			//window.addEventListener('load', scrollLoad, false);
			// as long as the connection type is not none,
			// the device should have Internet access
			if (navigator.network.connection.type != 'unknown' &&  navigator.network.connection.type != Connection.NONE)
			
				{
					isConnected = true;
					console.log("Connected"+ navigator.network.connection.type);
					return true;
				}

			else
                
				{
					notConnected_popUp();
					isConnected = false;
					console.log("not connected" + navigator.network.connection.type);
					return false;
				}
		}

		else {

			console.log("not ready buddy");
			return false;
		}
}

function test(){}