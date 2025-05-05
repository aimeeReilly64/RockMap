if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
  
  let mineralSites = [];
  const proximityThreshold = 100; // meters
  
  const map = L.map('map').setView([50, -85], 5); // Center on Ontario
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Helper: Haversine distance
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  
  // Logging functions
  function logSiteVisit(site) {
    const logs = JSON.parse(localStorage.getItem('rockhoundLogs') || '[]');
    const timestamp = new Date().toISOString();
    const notes = prompt(`Add any notes for ${site.properties.name}:`, "");
  
    logs.push({
      id: site.properties.id || site.properties.name,
      name: site.properties.name,
      mineral: site.properties.commodity,
      timestamp,
      notes
    });
  
    localStorage.setItem('rockhoundLogs', JSON.stringify(logs));
    alert(`✅ Logged visit to ${site.properties.name}`);
  }
  
  function logSiteVisitFromPopup(name) {
    const site = mineralSites.find(s => s.properties.name === name);
    if (site) logSiteVisit(site);
  }
  
  // Load mineral data
  fetch('raw.geojson')
    .then(res => res.json())
    .then(data => {
      mineralSites = data.features.map(f => ({
        ...f,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      }));
  
      L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          layer.bindPopup(`
            
            <strong>${p.name}</strong><br/>
            Township: ${p.township}<br/>
            Mineral: ${p.commodity}<br/>
            Status: ${p.status}<br/>
            <button onclick='logSiteVisitFromPopup("${p.name}")'>Log This Site</button>
          `);
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#FF5733",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      }).addTo(map);
    });
  
  // GPS logic
  map.locate({ setView: true, maxZoom: 14 });
  
  map.on('locationfound', function (e) {
    const radius = e.accuracy / 2;
    const userLat = e.latitude;
    const userLon = e.longitude;
  
    L.marker(e.latlng).addTo(map)
      .bindPopup(`You are within ${Math.round(radius)} meters`).openPopup();
    L.circle(e.latlng, radius).addTo(map);
  
    mineralSites.forEach(site => {
      const d = getDistance(userLat, userLon, site.lat, site.lon);
      if (d <= proximityThreshold) {
        console.log(`🔔 You're within ${Math.round(d)}m of ${site.properties.name}`);
        L.popup()
          .setLatLng([site.lat, site.lon])
          .setContent(`<strong>Nearby:</strong> ${site.properties.name}<br/>Mineral: ${site.properties.commodity}`)
          .openOn(map);
      }
    });
  });
  
  map.on('locationerror', function () {
    alert("Could not access GPS.");
  });
  