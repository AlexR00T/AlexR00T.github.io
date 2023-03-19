window.initMap = function(map) {
  // Load solar farm data
  fetch("solar_farms_data.json")
    .then((response) => response.json())
    .then((data) => {
      // Create marker cluster group
      const markerClusterGroup = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const markers = cluster.getAllChildMarkers();
          let totalCapacity = 0;

          markers.forEach(marker => {
            totalCapacity += marker.options.capacity;
          });

          // Convert to MW or GW and format the string
          let capacityString;
          if (totalCapacity < 1000) {
            capacityString = `${totalCapacity.toFixed(0)} kW`;
          } else {
            totalCapacity /= 1000;
            capacityString = `${totalCapacity.toFixed(1)} MW`;
            if (totalCapacity >= 1000) {
              totalCapacity /= 1000;
              capacityString = `${totalCapacity.toFixed(2)} GW`;
            }
          }

          return L.divIcon({
            html: `<div class="cluster-capacity">${capacityString}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(20, 20)
          });
        }
      });

      // Add markers to the cluster group
      data.forEach((solarFarm) => {
        const latLng = new L.LatLng(solarFarm[0][0], solarFarm[0][1]);
        const capacity = solarFarm[1] * 0.15; // 150 watts per square meter converted to kW
        const marker = L.marker(latLng, { capacity: capacity });
        markerClusterGroup.addLayer(marker);
      });

      // Add the cluster group to the map
      map.addLayer(markerClusterGroup);

      // Function to calculate the total solar farm area within the map view
      function calculateTotalArea() {
        const bounds = map.getBounds();
        let totalArea = 0;
        let totalCapacity = 0;

        data.forEach((solarFarm) => {
          const latLng = new L.LatLng(solarFarm[0][0], solarFarm[0][1]);
          if (bounds.contains(latLng)) {
            totalArea += solarFarm[1];
            totalCapacity += solarFarm[1] * 0.15; // 150 watts per square meter converted to kW
          }
        });

        function formatNumber(number) {
          return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        document.getElementById("totalArea").innerText = `Total PV Area:${formatNumber(totalArea.toFixed(0))} m2`;

        // Convert to MW or GW and format the string
        let capacityString;
        if (totalCapacity < 1000) {
          capacityString = `${totalCapacity.toFixed(0)} kW`;
        } else {
          totalCapacity /= 1000;
          capacityString = `${totalCapacity.toFixed(1)} MW`;
          if (totalCapacity >= 1000) {
            totalCapacity /= 1000;
            capacityString = `${totalCapacity.toFixed(2)} GW`;
          }
        }
        document.getElementById("installedCapacity").innerText = `Installed Capacity: ${capacityString}`;
      }

      // Update the total solar farm area and capacity whenever the map view changes
      map.on("moveend", calculateTotalArea);

      // Calculate the total solar farm area and capacity for the initial map view
      calculateTotalArea();
    });
}
