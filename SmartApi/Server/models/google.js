const fetch = require('node-fetch');

const Google = () => { };
Google.getGoogleCoordinates = async (nomeLuogo) => {
    let latitudine = null;
    let longitudine = null;
    let messaggio = null;
    let coordsURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${nomeLuogo}&key=${process.env.API_GOOGLE}`;
    try {
        let result = await fetch(coordsURL)
            .then(res => res.json());
        if (result.status = 'OK') {
            latitudine = result.results[0].geometry.location.lat;
            longitudine = result.results[0].geometry.location.lng;
        } else {
            messaggio = result.status;
        }
    } catch (err) {
        messaggio = err.message;
    }
    return { lat: latitudine, lng: longitudine, err: messaggio }
};


Google.getNearbyPlaces = async (lat, lng, typePlace, radius, fascia) => {
    let token = null;
    let risultati = null;
    let messaggio = null;
    let nearbySearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${typePlace}&sensor=true&key=${process.env.API_GOOGLE}`;
    let res = null;
    try {
        res = await fetch(nearbySearchURL)
            .then(res => res.json())
        // risultati raccoglierà un array di object
        risultati = res.results;
        //console.log(`La prima richiesta restituisce ${risultati.length} risultati per il tipo ${typePlace}`);
        token = res.next_page_token;
        let iter = fascia.type;
        while (token != undefined && iter > 1) {
            res = await getNextNearbyPlaces(lat, lng, typePlace, radius, token);
            token = res.nextToken;
            risultati = risultati.concat(res.results);
            iter--;
        }
    } catch (err) {
        messaggio = err.message;
    }
    return { places: risultati, err: messaggio };
};

Google.getNextNearbyPlaces = async (lat, lng, typePlace, radius, token) => {
    let nearbySearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${typePlace}&sensor=true&key=${API_GOOGLE}&pagetoken=${process.env.API_GOOGLE}`;
    let res = null;
    let messaggio = null;
    let status = 'INVALID';
    while (status != 'OK') {
        try {
            res = await fetch(nearbySearchURL)
                .then(res => res.json())
            status = res.status;

        } catch (err) {
            messaggio = err.message;
        }
    }
    return { nextToken: res.next_page_token, results: res.results, err: messaggio };
};

module.exports = Google;