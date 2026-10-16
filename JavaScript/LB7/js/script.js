// Координати коледжу та карта
let ourCoords = { latitude: 48.94321, longitude: 24.73380 };
let watchId = null;
let map = L.map("map").setView([ourCoords.latitude, ourCoords.longitude], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
document.addEventListener("DOMContentLoaded", getMyLocation);

// Отримання координат та обробники кнопок
function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation, displayError);
        let watchButton = document.getElementById("watch");
        watchButton.onclick = watchLocation;
        let clearWatchButton = document.getElementById("clearWatch");
        clearWatchButton.onclick = clearWatch;
    } else {
        alert("Oops, no geolocation support");
    }
    let destinationButton = document.getElementById("goToDestination");
    destinationButton.onclick = goToDestination;
}

// Відображення координат, точності, відстані та маркера
function displayLocation(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let div = document.getElementById("location");
    div.innerHTML = `You are at Latitude: ${latitude}, Longitude: ${longitude}`;
    div.innerHTML += ` (with ${position.coords.accuracy} meters accuracy)`;
    let km = computeDistance(position.coords, ourCoords);
    let distance = document.getElementById("distance");
    distance.innerHTML = `You are ${km} km from the College`;
    map.setView([latitude, longitude], 15);
    let time = new Date(position.timestamp).toLocaleString("uk-UA");
    L.marker([latitude, longitude]).addTo(map).bindPopup(
        `Широта: ${latitude}, Довгота: ${longitude}<br>Час: ${time}`
    );
}

// Обробка помилок геолокації
function displayError(error) {
    const errorTypes = {
        0: "Unknown error",
        1: "Permission denied by user",
        2: "Position is not available",
        3: "Request timed out"
    };
    let errorMessage = errorTypes[error.code];
    if (error.code == 0 || error.code == 2) {
        errorMessage = errorMessage + " " + error.message;
    }
    let div = document.getElementById("location");
    div.innerHTML = errorMessage;
}

// Розрахунок відстані між двома координатами
function computeDistance(startCoords, destCoords) {
    let startLatRads = degreesToRadians(startCoords.latitude);
    let startLongRads = degreesToRadians(startCoords.longitude);
    let destLatRads = degreesToRadians(destCoords.latitude);
    let destLongRads = degreesToRadians(destCoords.longitude);
    let Radius = 6371;
    let distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
        Math.cos(startLatRads) * Math.cos(destLatRads) *
        Math.cos(startLongRads - destLongRads)) * Radius;
    return distance;
}
function degreesToRadians(degrees) {
    let radians = (degrees * Math.PI) / 180;
    return radians;
}

// Початок та зупинка відстеження місцезнаходження
function watchLocation() {
    if (watchId == null) {
        watchId = navigator.geolocation.watchPosition(displayLocation, displayError);
    }
}
function clearWatch() {
    if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// Перехід карти до введених координат
function goToDestination() {
    let latitudeInput = document.getElementById("destLat");
    let longitudeInput = document.getElementById("destLon");
    if (latitudeInput.value === "" || longitudeInput.value === "") {
        alert("Введіть широту та довготу пункту призначення");
        return;
    }
    let latitude = Number(latitudeInput.value);
    let longitude = Number(longitudeInput.value);
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        alert("Введіть правильні координати");
        return;
    }
    map.setView([latitude, longitude], 15);
}