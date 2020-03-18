var main_zoom = 15;

function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(50.46000699004913, 30.52081012508188),
        zoom: 15,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    var myCenter = new google.maps.LatLng(50.46000699004913, 30.52081012508188);
    var marker = new google.maps.Marker({
        position: myCenter,
        animation: google.maps.Animation.BOUNCE,
        icon: "../images/map.png"
    });
    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function () {
        if (main_zoom === 15) {
            map.setZoom(9);
            main_zoom = 9;
        } else {
            map.setZoom(15);
            main_zoom = 15;
        }

        map.setCenter(marker.getPosition());
    });
}

myMap();