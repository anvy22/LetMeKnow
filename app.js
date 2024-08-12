document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([10.15255, 76.366], 11);
    var mapLink = "<a href='http://openstreetmap.org'>OpenStreetMap</a>";
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Leaflet &copy; ' + mapLink + ', contribution',
        maxZoom: 18
    }).addTo(map);

    var marker;
    let count = 0;
    var destinationMarker;
    var destinationCoords;
    var alarmDistance = 0; // Distance in meters
    var alarmSound = document.getElementById('alarmSound'); // Reference to the audio element
    var notification = document.getElementById('notification'); // Reference to the notification element
    var stopAlarmButton = document.getElementById('stopAlarmButton'); // Reference to the stop alarm button

    // Initialize the device location marker
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (!marker) {
                    var taxiIcon = L.icon({
                        iconUrl: 'img/red.png',
                        iconSize: [50, 50],
                        iconAnchor: [25, 50], // Position the anchor point
                        popupAnchor: [0, -50]
                    });

                    marker = L.marker([latitude, longitude], { icon: taxiIcon }).addTo(map);
                    map.setView([latitude, longitude], 11); // Center map on the initial location
                } else {
                    marker.setLatLng([latitude, longitude]); // Update the position of the marker
                }

                // Trigger distance check every time location updates
                checkDistance([latitude, longitude]);
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }

    // Geocode function to get coordinates from place name
    function geocodePlace(place, callback) {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    callback([data[0].lat, data[0].lon]);
                } else {
                    console.error('No results found');
                }
            })
            .catch(error => console.error('Error geocoding place:', error));
    }

    document.getElementById('routeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var destinationPlace = document.getElementById('destinationPlace').value;
        alarmDistance = parseFloat(document.getElementById('distanceInput').value);

        if (marker) {
            var startCoords = marker.getLatLng(); // Use the device location as the start point

            geocodePlace(destinationPlace, function (endCoords) {
                // Create a blue marker for the destination
                var destIcon = L.icon({
                    iconUrl: 'img/blue.png',
                    iconSize: [50, 50],
                    iconAnchor: [25, 50], // Position the anchor point
                    popupAnchor: [0, -50]
                });

                if (destinationMarker) {
                    map.removeLayer(destinationMarker); // Remove previous destination marker
                }

                destinationMarker = L.marker([endCoords[0], endCoords[1]], { icon: destIcon }).addTo(map);
                destinationCoords = [endCoords[0], endCoords[1]]; // Store destination coordinates

                // Set up routing
                L.Routing.control({
                    waypoints: [
                        L.latLng(startCoords.lat, startCoords.lng),
                        L.latLng(endCoords[0], endCoords[1])
                    ],
                    createMarker: function () { return null; } // Prevent default markers
                }).on('routesfound', function (e) {
                    var routes = e.routes;
                    console.log(routes);
                }).addTo(map);
            });
        } else {
            console.error('Device location marker not available.');
        }
    });

    // Function to check the distance to the destination
    function checkDistance(currentCoords) {
        if (destinationCoords) {
            var distance = map.distance(currentCoords, destinationCoords);
            console.log('Current Distance:', distance, 'Alarm Distance:', alarmDistance);

            if (distance <= alarmDistance && alarmDistance > 0) {
                showNotification(); // Show the custom notification
            }
        }
    }

    // Function to show the custom notification
    function showNotification() {
        count++;
        if(count<2){
        notification.style.display = 'block';
        alarmSound.play(); // Play the alarm sound
        }
    }

    // Function to stop the alarm
    stopAlarmButton.addEventListener('click', function () {
        alarmSound.pause(); // Pause the alarm sound
        alarmSound.currentTime = 0;
        destinationPlace.value = ''; // Clear the destination input
        distanceInput.value = ''; // Clear the distance input // Reset the sound to the beginning
        notification.style.display = 'none'; // Hide the notification
    });
});
