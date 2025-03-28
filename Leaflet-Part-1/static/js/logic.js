// Access the USGS API by using D3

// Store USFS GeoJSON API endpoint as queryUrl for significant earthquakes within the past week
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

// use D3 to fetch earthquake data to the queryUrl
d3.json(queryUrl).then(
    (data)=>{
        
      // Data from the 'features' key passes to the createFeatures function
        createFeatures(data.features);
    }
);

// Return color based on earthquake depth -- (for marker fill)
function getColor(depth) {
  return depth > 90 ? "#d73027" :
         depth > 70 ? "#fc8d59" :
         depth > 50 ? "#fee08b" :
         depth > 30 ? "#d9ef8b" :
         depth > 10 ? "#91cf60" :
                      "#1a9850";
}

// Return radius based on earthquake magnitude (for marker size)
function getRadius(magnitude) {
  return magnitude ? magnitude * 8 : 1;
}

// function that processes the data from the features key
function createFeatures(earthquakeData) {
    // console.log data to make sure it gets into this function
    console.log(earthquakeData);

    // calls the function and binds the popups to all markers on the layer
    function onEachFeature(feature, layer) {
      layer.bindPopup(`
        <strong>Location:</strong> ${feature.properties.place}<br>
        <strong>Magnitude:</strong> ${feature.properties.mag}<br>
        <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km
      `);
    }
    // Create the circle markers with size and depth based on magnitude and depth
    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: onEachFeature
    });
    // pass the earthquake data layer to the createMap function
    createMap(earthquakes);
  }
    
// function that creates the map using the geoJSON from createFeatures
function createMap(earthquakes)
{
    console.log(earthquakes);

    // make the base tile layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
    
      let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    // Create a basemaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };

    // make the overlay for earthquakes
    let overlayMaps = {
        Earthquakes: earthquakes
      };

    // make the map and provide the defaults
    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
      });
    // make the control and reference the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // set up the legend
    let legend = L.control({position: "bottomright"});

    legend.onAdd = function(){
      // .create() to make a 'div' that is going to hold the map
      let div = L.DomUtil.create("div", "info legend");
      let depths = [-10, 10, 30, 50, 70, 90];
      let colors = [
      "#1a9850",
      "#91cf60",
      "#d9ef8b",
      "#fee08b",
      "#fc8d59",
      "#d73027"
  ];

// Add colored squares + depth range labels
for (let i = 0; i < depths.length; i++) {
  div.innerHTML +=
    `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i>` +
    `${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : '+'}<br>`;
}
    
// return the updated div
  return div;
};
             
// take the legend with the updated div and add to the map
legend.addTo(myMap);
}
