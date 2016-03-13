
function parse() {
    var request = new XMLHttpRequest()
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
    elem = document.getElementById("map_canvas");
    request.open('POST', 'https://defense-in-derpth.herokuapp.com/sendLocation', true);

    request.onreadystatechange = function () {
    }

    request.send(null)

}