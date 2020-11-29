
/*
 * Traveltimeline - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the timeline should use
 */

class TravelTimeline {

	// constructor method to initialize Traveltimeline object
	constructor(parentElement, data){
		this._parentElement = parentElement;
		this._data = data;

		// No data wrangling, no update sequence
		this._displayData = data;
	}

	// create initVis method for Traveltimeline class
	initVis() {

		// store keyword this which refers to the object it belongs to in variable vis
		let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 70};

		vis.width =  800- vis.margin.left - vis.margin.right;
		vis.height = 100- vis.margin.top - vis.margin.bottom;

		console.log(vis.width)

		// SVG drawing area
		vis.svg = d3.select("#" + vis._parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// Scales and axes
		vis.x = d3.scaleTime()
			.range([0, vis.width])
			.domain(d3.extent(vis._displayData, function(d) { return d.Year; }));

		vis.y = d3.scaleLinear()
			.range([vis.height, 0])
			.domain([0, d3.max(vis._displayData, function(d) { return d.Expenditures; })]);

		vis.xAxis = d3.axisBottom()
			.scale(vis.x);

		// SVG area path generator
		vis.area = d3.area()
			.x(function(d) { return vis.x(d.Year); })
			.y0(vis.height)
			.y1(function(d) { return vis.y(d.Expenditures); });

		// Draw area by using the path generator
		vis.svg.append("path")
			.datum(vis._displayData)
			.attr("fill", "#929292")
			.attr("d", vis.area);

		// Initialize brush component
		vis.brush = d3.brushX()
			.extent([[0, 0], [vis.width, vis.height]])
			.on("brush", brushed);

		// Append brush component here
		vis.svg.append("g")
			.attr("class", "x brush")
			.call(vis.brush)
			.selectAll("rect")
			.attr("y", -6)
			.attr("height", vis.height + 7);


		// Append x-axis
		vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")")
			.call(vis.xAxis)
			.append("line")
			.attr("class", "referenceLine rl1")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', '#dab600')
			.attr("x1",vis.width-380)
			.attr("y1",vis.height/2)
			.attr("x2", vis.width-380)
			.attr("y2", -vis.height);

		// 2015 reference point
		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf1")
			.text("Financial Crisis 6.8% drop")
			.style("font-size", "10px")
			.attr("x",10)
			.attr("y",-(vis.width-390))
			.attr("transform", "rotate(90)");


		vis.svg.append("g")
			.append("line")
			.attr("class", "referenceLine rl2")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', '#dab600')
			.attr("x1",370)
			.attr("y1",150)
			.attr("x2",370)
			.attr("y2", -200);

		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf3")
			.text("Zika Virus")
			.style("font-size", "10px")
			.attr("x",40)
			.attr("y",-360)
			.attr("transform", "rotate(90)");


		// 2020 reference point
		vis.svg.append("g")
			.append("line")
			.attr("class", "referenceLine rl3")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', '#dab600')
			.attr("x1",478)
			.attr("y1",150)
			.attr("x2",478)
			.attr("y2", -200);

		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf3")
			.text("COVID-19")
			.style("font-size", "10px")
			.attr("x",40)
			.attr("y",-468)
			.attr("transform", "rotate(90)");
	}
}