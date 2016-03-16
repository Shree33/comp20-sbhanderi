var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var loc = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 15, 
    center: loc,
    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
var map;
var marker;
var infowindow = new google.maps.InfoWindow();
                        
function init() {
    map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
    getLocation();
}
                        
function getLocation() {
    if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            var request = senddata();


        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var parsed = JSON.parse(request.responseText);
                var closemark = new google.maps.Marker({position: loc});

                pmarkers(parsed);
                closemark = lmarkers(parsed);

                renderMap(closemark);
            }
        };

        });
    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}

function renderMap(closemark) {
    loc = new google.maps.LatLng(myLat, myLng);
                                
    map.panTo(loc);

    var flightPath = flight_path(closemark);

    make_my_loc(flightPath, closemark);

}

function make_my_loc(flightPath, closemark) {
    var personal_img = 'http://www.langside-pri.glasgow.sch.uk/Images/PersonIcon16.gif'
    marker = new google.maps.Marker({
        position: loc,
        title: "My Location",
        icon: personal_img,
        content: closemark.content
    });

    marker.setMap(map);

    // Open info window on click of marker
    google.maps.event.addListener(marker, 'click', function() {
        flightPath.setMap(map);
        infowindow.setContent('<h3>' + this.title + '</h3>' + '<h5> Distance to closest landmark: ' + this.content + '</h5>');
        infowindow.open(map, marker);
    });
}

function flight_path(closemark) {

    var flightPlanCoordinates = [
        {lat: myLat, lng: myLng},
        {lat: closemark.position.lat(), lng: closemark.position.lng()},
    ];

    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    return flightPath;
}

function senddata() {
    var request = new XMLHttpRequest();
    var url = 'https://defense-in-derpth.herokuapp.com/sendLocation';
    var params = "login=LINDA_BRITT&lat=" + myLat + "&lng="+ myLng;

    request.open('POST', url , true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 

    request.send(params);

    return request;
}

function pmarkers(parsed) {
    var person_img = 'http://uxrepo.com/static/icon-sets/ionicons/png32/16/000000/person-16-000000.png';
    for (var i = 0; i < parsed.people.length; i++) {
        if( parsed.people[i].login == "LINDA_BRITT") continue;
            marker = new google.maps.Marker({
                title: parsed.people[i].login,
                position: new google.maps.LatLng(parsed.people[i].lat, parsed.people[i].lng),
                map: map,
                icon: person_img,
                content: findDistance(parsed.people[i].lat, parsed.people[i].lng).toString()
            });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent ('<h3>Landmark: ' + this.title + '</h3>' + '<h5> Distance: ' + this.content + ' miles</h5>');
            infowindow.open(map, this);
        });
    }

}

function lmarkers(parsed) {
    var closemark = new google.maps.Marker({position: loc, content: 1});
    var land_img ='http://findicons.com/files/icons/2564/max_mini_icon/16/flag_red.png'

    for (var i = 0; i < parsed.landmarks.length; i++) {
        marker = new google.maps.Marker({
            title: parsed.landmarks[i].properties.Location_Name,
            position: new google.maps.LatLng(parsed.landmarks[i].geometry.coordinates[1], parsed.landmarks[i].geometry.coordinates[0]),
            map: map,
            icon: land_img,
            content: findDistance(parsed.landmarks[i].geometry.coordinates[1], parsed.landmarks[i].geometry.coordinates[0]).toString()
        });

        if (marker.content < closemark.content) {closemark = marker;}

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent ('<h3> Login: ' + this.title + '</h3>' + '<h5> Distance: ' + this.content + ' miles </h5>');
            infowindow.open(map, this);
        });
    }

    return closemark;
}



function findDistance(lat, lng) {
    var R = 3959; // miles 

    var x1 = lat-myLat;
    var dLat = toRadians(x1);  
    var x2 = lng-myLng;
    var dLon = toRadians(x2);  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRadians(lat)) * Math.cos(toRadians(myLat)) * Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var dist = R * c;

    return dist;
}

function toRadians(deg) {
        return deg * (Math.PI/180);
}