let main_zoom = 15;

function myMap() {
    let mapProp = {
        center: new google.maps.LatLng(50.46000699004913, 30.52081012508188),
        zoom: 15,
    };
    let map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    let myCenter = new google.maps.LatLng(50.46000699004913, 30.52081012508188);
    let marker = new google.maps.Marker({
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

function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: 50.46000699004913, lng: 30.52081012508188},
        zoom: 13
    });
    new AutocompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'DRIVING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);

    var originInput = document.getElementById('address_from');
    var destinationInput = document.getElementById('address_to');
    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    originAutocomplete.setFields(['place_id']);

    var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    destinationAutocomplete.setFields(['place_id']);

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
}

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route(
        {
            origin: {'placeId': this.originPlaceId},
            destination: {'placeId': this.destinationPlaceId},
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
                me.directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
};

//not use
//autocomplete one filed with map
// function initAutocomplete() {
//     var map = new google.maps.Map(document.getElementById('map'), {
//         mapTypeControl: false,
//         center: {lat: 50.46000699004913, lng: 30.52081012508188},
//         zoom: 13
//     });
//     var input_from = document.getElementById('address_from');
//     var auto_from = new google.maps.places.Autocomplete(input_from);
//     auto_from.bindTo('bounds', map);
//     auto_from.setFields(['address_components', 'geometry', 'icon', 'name']);
//
//     var input_to = document.getElementById('address_from');
//     var auto_to = new google.maps.places.Autocomplete(input_to);
//     auto_to.bindTo('bounds', map);
//     auto_to.setFields(['address_components', 'geometry', 'icon', 'name']);
//
//     var marker_from = new google.maps.Marker({
//         map: map,
//         anchorPoint: new google.maps.Point(0, -29)
//     });
//     auto_from.addListener('place_changed', function () {
//         marker_from.setVisible(false);
//         var place = auto_from.getPlace();
//         if (place.geometry.viewport) {
//             map.fitBounds(place.geometry.viewport);
//         } else {
//             map.setCenter(place.geometry.location);
//             map.setZoom(17);
//         }
//         marker_from.setPosition(place.geometry.location);
//         marker_from.setVisible(true);
//
//     });
//     auto_from.setOptions(false);
//     auto_to.setOptions(false);
// }