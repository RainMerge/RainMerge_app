//-----------------------------------------
//  DRAGGABLE SPLIT VIEW (MAP + CHART)
//-----------------------------------------

const mapDiv = document.getElementById("map");
const divider = document.getElementById("divider");
const chartDiv = document.getElementById("chart-container");

let dragging = false;

divider.addEventListener("mousedown", () => dragging = true);
document.addEventListener("mouseup", () => dragging = false);

document.addEventListener("mousemove", function (e) {
    if (!dragging) return;

    const newMapHeight = e.clientY;

    // prevent collapsing
    if (newMapHeight < 100) return;
    if (newMapHeight > window.innerHeight - 200) return;

    mapDiv.style.height = newMapHeight + "px";
    chartDiv.style.height = (window.innerHeight - newMapHeight - 8 - 40) + "px"; 
});

//-----------------------------------------
//     YOUR ORIGINAL MAP + CHART CODE
//-----------------------------------------

// 1. Initialize Leaflet map
const map = L.map('map').setView([27.7, 85.3], 6); // Nepal region

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;
let chart = null;

map.on('click', async function (e) {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);

    const lat = e.latlng.lat.toFixed(4);
    const lon = e.latlng.lng.toFixed(4);

    const apiUrl =
        'https://archive-api.open-meteo.com/v1/archive'
        + `?latitude=${lat}`
        + `&longitude=${lon}`
        + '&start_date=2010-01-01'
        + '&end_date=2024-12-31'
        + '&hourly=temperature_2m'
        + '&timezone=auto';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.hourly) {
            alert('No data found for this location.');
            return;
        }

        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;

        const ctx = document.getElementById('tempChart').getContext('2d');

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: `Temperature at ${lat}, ${lon}`,
                    data: temps,
                    borderColor: 'red',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { title: { display: true, text: '°C' } }
                }
            }
        });

    } catch (error) {
        console.error(error);
        alert("Error fetching temperature data");
    }
});
