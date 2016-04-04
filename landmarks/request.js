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
                        
// Creates and fills map with markers                        
function init() {
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    renderMap();
}

// Sends and retrieves data, renders map with markers                        
function renderMap() {
    if (navigator.geolocation) { // if the navigator.geolocation is supported
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            var request = sendData(); // Returns data about other markers


            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {



                    var parsed = JSON.parse(request.responseText);
                    var closemark = new google.maps.Marker({position: loc});

                    renderUsers(parsed); 
                    closemark = renderLandmarks(parsed); 
                    renderSelf(closemark);
                }
            };

        });
    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}

// Renders self marker, centers map on self
function renderSelf(closemark) {
    loc = new google.maps.LatLng(myLat, myLng);
                                
    map.panTo(loc);

    var flightPath = create_path(closemark);

    makeMyLoc(flightPath, closemark);

}

// Makes self marker with infowindow containing information and line to nearest
// landmark
function makeMyLoc(flightPath, closemark) {
    var personal_img = 'http://www.langside-pri.glasgow.sch.uk/Images/PersonIcon16.gif'
    marker = new google.maps.Marker({
        position: loc,
        title: "LINDA_BRITT",
        icon: personal_img,
    });

    marker.setMap(map);

    // Open info window on click of marker
    google.maps.event.addListener(marker, 'click', function() {
        flightPath.setMap(map);
        infowindow.setContent('<h3> My Location </h3>' + '<h4>' + this.title + '</h4>' +'<h5> Closest landmark: ' + closemark.title + '</h5>' + '<h5> Distance away: ' + closemark.zIndex + '</h5>');
        infowindow.open(map, marker);
    });
}

// Creates flightpath information from self to closest landmark
// Returns landmark
function create_path(closemark) {

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

// Sends location to server, returns response to request
function sendData() {
    var request = new XMLHttpRequest();
    var url = 'https://defense-in-derpth.herokuapp.com/sendLocation';
    var params = "login=LINDA_BRITT&lat=" + myLat + "&lng=" + myLng;

    request.open('POST', url , true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 

    request.send(params);

    return request;
}

// Renders users onto map with infowindow and custom marker
function renderUsers(parsed) {
    var person_img = 'http://uxrepo.com/static/icon-sets/ionicons/png32/16/000000/person-16-000000.png';
    for (var i = 0; i < parsed.people.length; i++) {
        if(parsed.people[i].login == "LINDA_BRITT") continue; //ignore self
            marker = new google.maps.Marker({
                title: parsed.people[i].login,
                position: new google.maps.LatLng(parsed.people[i].lat, parsed.people[i].lng),
                map: map,
                icon: person_img,
                content: findDist(parsed.people[i].lat, parsed.people[i].lng).toString()
            });

        // Add infowindow
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent ('<h3>Login: ' + this.title + '</h3>' + '<h5> Distance: ' + this.content + ' miles</h5>');
            infowindow.open(map, this);
        });
    }

}

// Renders landmarks onto map with infowindow and custom marker
// Returns marker object of closest landmark
function renderLandmarks(parsed) {
    var closemark = new google.maps.Marker({position: loc, zIndex: 1});
    var land_img ='http://findicons.com/files/icons/2564/max_mini_icon/16/flag_red.png'

    for (var i = 0; i < parsed.landmarks.length; i++) {
        marker = new google.maps.Marker({
            title: parsed.landmarks[i].properties.Location_Name,
            position: new google.maps.LatLng(parsed.landmarks[i].geometry.coordinates[1], parsed.landmarks[i].geometry.coordinates[0]),
            map: map,
            icon: land_img,
            content: parsed.landmarks[i].properties.Details,
            zIndex: findDist(parsed.landmarks[i].geometry.coordinates[1], parsed.landmarks[i].geometry.coordinates[0])
        });

        // Add infowindow
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent ('<h3> Landmark: ' + this.title + '</h3>' + this.content);
            infowindow.open(map, this);
        });

        if (marker.zIndex < closemark.zIndex) { //find closest marker
            closemark = marker;
        }
    }

    return closemark;
}


// Finds the distance between self and given point
// Returns distance in miles
function findDist(lat, lng) {
    var R = 3959; // miles 

    var x1 = lat - myLat;
    var dLat = toRadians(x1);  
    var x2 = lng - myLng;
    var dLon = toRadians(x2);  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRadians(lat)) * Math.cos(toRadians(myLat)) * Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var dist = R * c;

    return dist;
}

// Converts Degrees to Radians
// Returns number in radians
function toRadians(deg) {
        return deg * (Math.PI/180);
}