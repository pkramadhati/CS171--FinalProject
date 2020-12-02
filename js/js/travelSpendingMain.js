// make, what will later be visualization instances global variables
let TravelareaChart, Traveltimeline;

// load data
d3.json("data/Travel-Spending.json").then(jsonData => {

	// prepare data
	let Traveldata = prepareData(jsonData)


	// instantiate visualization objects
	TravelareaChart = new TravelSpendingstackedAreaChart("travel-stacked-area-chart", Traveldata.layers);
	Traveltimeline = new TravelSpendingTimeline("travel-timeline", Traveldata.years);

	// init visualizations
	Traveltimeline.initVis()
	TravelareaChart.initVis()
})

// React to 'brushed' event and update domain (x-scale; stacked area chart) if selection is not empty
function brushed() {
	let selection = d3.brushSelection(d3.select(".brush").node());
	TravelareaChart.x.domain(selection.map(Traveltimeline.x.invert));
	TravelareaChart.wrangleData();
}

// helper function
function prepareData(Traveldata){

	let TravelparseDate = d3.timeParse("%Y");

	let TravelpreparedData = {};

	// Convert Pence Sterling (GBX) to USD and years to date objects
	TravelpreparedData.layers = Traveldata.layers.map( d => {
		for (let column in d) {
			if (d.hasOwnProperty(column) && column !== "Year") {
				d[column] = d[column];
			} else if(d.hasOwnProperty(column) && column === "Year") {
				d[column] = TravelparseDate(d[column].toString());
			}
		}
	});

	//
	Traveldata.years.forEach(function(d){
		// d.Expenditures = parseFloat(d.Expenditures) * 1.481105 / 100;
		d.Year = TravelparseDate(d.Year.toString());
	});

	return Traveldata
}
