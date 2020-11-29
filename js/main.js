new fullpage("#fullpage", {
  navigation: true,
  navigationPosition: "right",
  anchors: ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8']
});

// (1) Load data with promises
let promises = [
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.csv("data/weekly-flights-change-percentage.csv"),
  d3.csv("data/owid-covid-data.csv"),
];

Promise.all(promises)
  .then(function (data) {
    createVis(data);
  })
  .catch(function (err) {
    console.log(err);
  });

function createVis([
  // Deconstruct the data:
  // 1. Make sure the data name prefixed with the section ID to avoid overwriting others data
  // 2. Make sure the order of data loading and the order of deconstructing match each other
  travelMapWorld,
  travelMapFlightsData,
  travelMapCovidData,
]) {
  // (2) Make our data look nicer and more useful
  // Put the data processing function into its own file to avoid overcrowding this page
  let [
    processedTravelMapDates,
    processedTravelMapFlightsData,
    processedTravelMapCovidData,
  ] = travelMapProcessData(travelMapFlightsData, travelMapCovidData);

  // (3) Create event handler
  let MyEventHandler = {};

  // (4) Create visualization instances
  // Prefix each chart class with its section ID
  // Travel Map
  let myTravelMapDateSlider = new TravelMapDateSlider(
    "travelMapDateSlider",
    processedTravelMapDates,
    MyEventHandler
  );
  let myTravelMapMapVis = new TravelMapMapVis(
    "travelMapMapVis",
    processedTravelMapCovidData,
    travelMapWorld
  );
  let myTravelMapLineVis = new TravelMapLineVis(
    "travelMapLineVis",
    processedTravelMapFlightsData
  );

  // (5) Bind event handler
  // Prefix each section's events' name with section ID
  // Travel Map
  $(MyEventHandler).bind("travelMapDateIndexChange", function (
    event,
    dateIndex
  ) {
    myTravelMapMapVis.onDateIndexChange(dateIndex);
    myTravelMapLineVis.onDateIndexChange(dateIndex);
  });
}


let myDataTable, myBarVis;

let selectedTimeRange = [];

// (1) Load data with promises
let promises_measure = [
  d3.json("data/measure_cleaned.json")
];

Promise.all(promises_measure)
    .then( function(data){ createVisMeasure(data)})
    .catch( function (err){console.log(err)} );


function createVisMeasure(data){
  let measureData = data[0];
  // log data
  console.log('check out the data', measureData);
  // init visualizations
  myDataTable = new DataTable('tableDiv', measureData);
  myBarVis = new BarVis('barvis',measureData);
}

//Enable category selection via bootstrap select
let selected_region = $('#regionSelector').val();
let selected_category = $('#categorySelector').val();
let selected_country = $('#countrySelector').val();
let selected_stage = $('#stageSelector').val();

function categoryChange() {
  selected_category = $('#categorySelector').val();
  selected_region = $('#regionSelector').val();
  selected_country = $('#countrySelector').val();
  selected_stage = $('#stageSelector').val();

  myBarVis.wrangleData();
  myDataTable.wrangleData();
}