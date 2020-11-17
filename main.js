const map = new mapboxgl.Map({
    container: 'map',
    style: carto.basemaps.voyager,
    center: [10, 51],
    zoom: 5
});
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

carto.setDefaultAuth({
    username: 'cartovl',
    apiKey: 'default_public'
});

// GLOBAL AGGREGATIONS + VIEWPORT AGGRS.
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz(`
    color: rgba(200, 54, 54, 0.5);
    width: sqrt(clusterSum($pop_max) /1000) + 5
    resolution: 16
`);
const layer = new carto.Layer('cities', source, viz);
layer.addTo(map);

// Display 3 variables with global aggregation functions
function displayGlobalValues() {
    console.log(`
        Maximum: ${viz.variables.g_max.value}
        Average: ${viz.variables.g_avg.value.toFixed(0)}
        95th percentile: ${viz.variables.g_p95.value}
    `);
}
layer.on('loaded', displayGlobalValues);

// Display viewport-derived values
function displayViewportValues() {
    // In the console
    console.log(`
        Viewport Sum: ${viz.variables.v_sum.value}
        Viewport Max: ${viz.variables.v_max.value}
        Viewport Min: ${viz.variables.v_min.value}
    `);

    // In the panel
    const sum = numeral(viz.variables.v_sum.value).format('0.0a');
    const highest = numeral(viz.variables.v_max.value).format('0.0a');
    const lowest = numeral(viz.variables.v_min.value).format('0.0a');
    const html = `
        <h2>${sum}</h2>
        <p>The city with less population in the map has <strong>${lowest}</strong>
            and the biggest has <strong style='color:red;'>${highest}</strong> people</p>
    `;
    const panelContent = document.getElementById("population");
    panelContent.innerHTML = viz.variables.v_sum.value > 0 ? html : 'There are no cities here!';
}
layer.on('updated', displayViewportValues);

// Deactivate after removing viewport variables from viz
 layer.off('loaded', displayGlobalValues)
layer.off('updated', displayViewportValues);