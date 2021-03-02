mapboxgl.accessToken = 'pk.eyJ1IjoibGF6ZmlzaGluZyIsImEiOiJja2wzY2xoODgxaWoyMnJwbHdraXkzdjRhIn0.0dz4Ra_uLwB7SM1LAIDebw';

var options = {
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.9560, 40.7128],
  zoom: 9.8
}

var map = new mapboxgl.Map(options);
map.scrollZoom.disable();

map.on('style.load',function() {
  map.addSource('black-carbon', {
      type: 'geojson',
      data: 'data/black-carbon.geojson'
  });

  map.addLayer({
    'id':'Mean',
    'type': 'fill',
    'source': 'black-carbon',
    'layout': {'visibility': 'none'},
    'paint': {
      'fill-color':
        ['interpolate',
        ['linear'],
        ['get', 'mean'],
        0,'#EED322',
        0.2,'#E6B71E',
        0.4,'#DA9C20',
        0.6,'#CA8323',
        0.8,'#B86B25',
        1.0,'#A25626',
        1.2,'#8B4225',
        1.4,'#723122'
        ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.7
    }
  })

  map.addLayer({
    'id':'90th Percentile',
    'type': 'fill',
    'source': 'black-carbon',
    'layout': {'visibility': 'none'},
    'paint': {
      'fill-color':
        ['interpolate',
        ['linear'],
        ['get', 'percentile90'],
        0,'#EED322',
        0.2,'#E6B71E',
        0.4,'#DA9C20',
        0.6,'#CA8323',
        0.8,'#B86B25',
        1.0,'#A25626',
        1.2,'#8B4225',
        1.4,'#723122'
        ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.7
    }
  })

  map.addLayer({
    'id':'10th Percentile',
    'type': 'fill',
    'source': 'black-carbon',
    'layout': {'visibility': 'none'},
    'paint': {
      'fill-color':
        ['interpolate',
        ['linear'],
        ['get', 'percentile10'],
        0,'#EED322',
        0.2,'#E6B71E',
        0.4,'#DA9C20',
        0.6,'#CA8323',
        0.8,'#B86B25',
        1.0,'#A25626',
        1.2,'#8B4225',
        1.4,'#723122'
        ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.7
    }
  })

  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer({
    id: 'highlight-line',
    type: 'fill',
    source: 'highlight-feature',
    paint: {
      'fill-color': '#ccc',
      'fill-opacity': 0.7,
      'fill-outline-color': 'white'
    }
  });

})

var toggleableLayerIds = ['Mean', '90th Percentile', '10th Percentile'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        for (var j = 0; j < toggleableLayerIds.length; j++) {
          if (clickedLayer === toggleableLayerIds[j]) {
            layers.children[j].className = 'active';
            map.setLayoutProperty(toggleableLayerIds[j], 'visibility', 'visible');
          }
          else {
            layers.children[j].className = '';
            map.setLayoutProperty(toggleableLayerIds[j], 'visibility', 'none');
          }
  }

    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('mousemove', function (e) {

  var features = map.queryRenderedFeatures(e.point, {
      layers: ['Mean', '90th Percentile', '10th Percentile'],
  });

  if (features.length > 0) {

    var hoveredFeature = features[0];
    var name = hoveredFeature.properties.cdname;
    var mean = hoveredFeature.properties.mean;
    var percentile10 = hoveredFeature.properties.percentile10;
    var percentile90 = hoveredFeature.properties.percentile90;

    var popupContent = `
      <div>
        ${name}<br/>
        <b>Black Carbon Levels</b><br/>
        Mean: ${mean}<br/>
        10th Percentile: ${percentile10}<br/>
        90th Percentile: ${percentile90}
      </div>
    `

    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
    map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    map.getCanvas().style.cursor = 'pointer';
  } else {
    popup.remove();
    map.getCanvas().style.cursor = '';
    map.getSource('highlight-feature').setData({
          "type": "FeatureCollection",
          "features": []
      });
  }

})
