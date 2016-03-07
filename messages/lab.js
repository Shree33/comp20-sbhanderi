
function parse() {
    var request = new XMLHttpRequest()
    elem = document.getElementById("messages");
    request.open('GET', 'data.json', true);

    request.onreadystatechange = function () {

        if (request.readyState == 4 && request.status == 200) {
            data = request.responseText;
            parsed = JSON.parse(data);

            for (count = 0; count < parsed.length; count++) {
                elem.innerHTML += "<p>" +  parsed[count]["content"] + " " + parsed[count]["username"] + "</p>";
            }
        }
    }

    request.send(null)

}