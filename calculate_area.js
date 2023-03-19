function initMap(map) {
  // Load solar farm data
  fetch("solar_farms_data.json")
    .then((response) => response.json())
    .then((data) => {
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

        document.getElementById("totalArea").innerText = `Total Surface Area: ${totalArea.toFixed(2)} square meters`;

        // Convert to MW or GW and format the string
        let capacityString;
        if (totalCapacity < 1000) {
          capacityString = `${totalCapacity.toFixed(2)} kW`;
        } else {
          totalCapacity /= 1000;
          capacityString = `${totalCapacity.toFixed(2)} MW`;
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
