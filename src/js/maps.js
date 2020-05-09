//autocomplete maps for order taxi and price calculator page
function initAutocomplete() {
    //init map
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: 50.46000699004913, lng: 30.52081012508188},
        zoom: 13
    });
    //set autocomplete
    new AutocompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
    //set parameters
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'DRIVING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);

    //set inputs which need autocompletion
    var originInput = document.getElementById('address_from');
    var destinationInput = document.getElementById('address_to');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    originAutocomplete.setComponentRestrictions({'country': ['ua']});
    originAutocomplete.setFields(['place_id']);

    var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    destinationAutocomplete.setComponentRestrictions({'country': ['ua']});
    destinationAutocomplete.setFields(['place_id']);

    //set listener for autocompletion
    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
}

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (mode === 'ORIG') me.originPlaceId = place.place_id;
        else me.destinationPlaceId = place.place_id;
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
            // on change places
            if (status === 'OK') {
                //change map
                me.directionsRenderer.setDirections(response);
                var d = response.routes[0].legs[0].distance.text;
                sessionStorage.setItem("distance", d);
                //calc prise
                calcPrice();
            } else window.alert('Directions request failed due to ' + status);
        });
};

//zoom value for contact map
let main_zoom = 15;

//map methods for contact page
function myMap() {
    let mapProp = {
        center: new google.maps.LatLng(50.46000699004913, 30.52081012508188),
        zoom: 15,
        mapTypeControl: false,
        draggable: false,
        scaleControl: false
    };
    let map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    //set center and special marker for it
    let myCenter = new google.maps.LatLng(50.46000699004913, 30.52081012508188);
    let marker = new google.maps.Marker({
        position: myCenter,
        animation: google.maps.Animation.BOUNCE,
        icon: "../images/map.png"
    });
    marker.setMap(map);
    //zoom changing on marker click
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