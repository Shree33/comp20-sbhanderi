
function parse() {
    var request = new XMLHttpRequest()
    var url = 'https://defense-in-derpth.herokuapp.com/sendLocation'
    var params = "login=LINDA_BRITT&lat=myLat&lng=myLong"
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
    elem = document.getElementById("");
    request.open('POST', url , true);

    request.onreadystatechange = function () {
    }

    request.send(null)

}