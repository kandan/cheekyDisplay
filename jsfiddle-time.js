var start = document.getElementById("start").value;
var end = document.getElementById("end").value;
var durationtime = document.getElementById("durationTime").value;

function diff(start, end) {
    start = start.split(":");
    end = end.split(":");
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    var seconds = Math.floor(diff / 1000 / 60 / 60 / 60 / 60);
    //diff -= seconds * 1000 * 60 * 60;
    //var minutes = Math.floor(diff / 1000 / 60);
    
   
    
    //return diff/1000;
    return startDate;
}


function end2(start, duration) {
    var startDate = new Date();
     var enddate = addMinutes(startDate, duration);
    return enddate;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

document.getElementById("diff").value = diff(start, end);
document.getElementById("duration").value = "Now plus " + durationtime + "mins:  " + end2(start, durationtime);