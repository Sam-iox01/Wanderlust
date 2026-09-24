
if (!Array.isArray(geometryCoordinates) || geometryCoordinates.length !== 2) {
    console.error("Map coordinates are missing or invalid.");
} else {
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: geometryCoordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 11 // starting zoom
    });
// console.log("geometryCoordinates:", geometryCoordinates);

    const marker = new mapboxgl.Marker({color : "red"})
        .setLngLat(geometryCoordinates)
        .setPopup(
            new mapboxgl.Popup({offset: 25, className: "my-popup"})
                .setHTML(`<h4>${listingLocation}</h4><p>Exact location provided after booking</p>`)
        )
        .addTo(map);
    }
 