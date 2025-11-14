// -------------------------------
// 1. Initialize Leaflet Map
// -------------------------------
const map = L.map('map').setView([27.7, 85.3], 6); // Nepal region

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;
let chart = null;

// -------------------------------
// 2. Map Click → Fetch Time-Series
// -------------------------------
map.on('click', async function (e) {

    // Add marker
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);

    const lat = e.latlng.lat.toFixed(4);
    const lon = e.latlng.lng.toFixed(4);

    // -------------------------------
    // 3. Call Open-Meteo API
    // -------------------------------
    const apiUrl = `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=${lat}&longitude=${lon}` +
        `&start_date=2010-01-01&end_date=2024-12-31` +
        `&hourly=temperature_2m&timezone=auto`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.hourly) {
        alert("No temperature data available for this location.");
        return;
    }

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;

    // -------------------------------
    // 4. Plot with Chart.js
    // -------------------------------
    const ctx = document.getElementById('tempChart').getContext('2d');

    if (chart) chart.destroy(); // remove previous chart

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
            scales: {
                x: {
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: "°C" }
                }
            }
        }
    });
});
