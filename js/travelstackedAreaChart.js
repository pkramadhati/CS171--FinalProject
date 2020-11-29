
/*
 * TravelstackedAreaChart - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the that's provided initially
 * @param  displayData      -- the data that will be used finally (which might vary based on the selection)
 *
 * @param  focus            -- a switch that indicates the current mode (focus or stacked overview)
 * @param  selectedIndex    -- a global 'variable' inside the class that keeps track of the index of the selected area
 */

class TravelstackedAreaChart {

	// constructor method to initialize TravelstackedAreaChart object
	constructor(parentElement, data) {
		this.parentElement = parentElement;
		this.data = data;
		this.displayData = [];

		this.focus = false;
		this.selectedIndex = 0

		let colors = ['#e9d700','#dab600'];

		// grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
		this.dataCategories = Object.keys(this.data[0]).filter(d=>d != "Year")

		// prepare colors for range
		let colorArray = this.dataCategories.map( (d,i) => {
			return colors[i%10]
		})
		// Set ordinal color scale
		this.colorScale = d3.scaleOrdinal()
			.domain(this.dataCategories)
			.range(colorArray);
	}

	/*
	 * Method that initializes the visualization (static content, e.g. SVG area or axes)
 	*/
	initVis(){
		let vis = this;

		vis.margin = {top: 40, right: 40, bottom: 60, left: 70};

		vis.width = $("#" +  vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $("#" +  vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

var stackedAreaChartwidth = vis.width
		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// // Overlay with path clipping
		// vis.svg.append("defs").append("clipPath")
		// 	.attr("id", "clip")
		// 	.append("rect")
		// 	.attr("width", vis.width)
		// 	.attr("height", vis.height);

		// Scales and axes
		vis.x = d3.scaleTime()
			.range([0, vis.width])
			.domain(d3.extent(vis.data, d=> d.Year))
			// .tickValues([2000, 2001, 2002, 2003, 2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019]);
console.log(vis.data)

		vis.y = d3.scaleLinear()
			.range([vis.height, 0]);
			// .domain(d3.extent(vis.data, d=> d.Expenditures));


		vis.xAxis = d3.axisBottom()
			.scale(vis.x)
			// .tickFormat(d3.timeFormat("%Y"))
			.ticks(20)
		    // .tickValues([2000, 2001, 2002, 2003, 2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019]);

		//

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")");

		vis.svg.append("g")
			.attr("class", "y-axis axis");


		// Stack data
		vis.stackedData = d3.stack().keys(vis.dataCategories)(vis.data);

		console.log('stacked', vis.stackedData)

		// Stacked area layout
		vis.area = d3.area()
			// .curve(d3.curveNatural)
			.x(function(d)  { return vis.x(d.data.Year); })
			.y0(function(d) { return vis.y(d[0]); })
			.y1(function(d) { return vis.y(d[1]); });

		// Basic area layout
		vis.basicArea = d3.area()
			.x(function(d) { return vis.x(d.data.Year); })
			.y0(vis.height)
			.y1(function(d) { return vis.y(d[1]-d[0]); });


		// Tooltip placeholder
		vis.tooltip = vis.svg.append("text")
			.attr("class", "focus")
			.attr("x", 50)
			.attr("y", 0)
			.attr("dy", ".35em");



// 2008 reference point

		vis.svg.append("g")
			.append("line")
			.attr("class", "referenceLine rl1")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', 'grey')
			.attr("x1",vis.width/2.35)
			.attr("y1",vis.height)
			.attr("x2", vis.width/2.35)
			.attr("y2", 0);

		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf1")
			.text("-6.8% - Financial Crisis")
			.style("font-size", "12px")
			.attr("x",0)
			.attr("y",-(vis.width/2.25))
			.attr("transform", "rotate(90)");

// 2015 reference point
		vis.svg.append("g")
			.append("line")
			.attr("class", "referenceLine rl2")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', 'grey')
			.attr("x1",vis.width/1.35)
			.attr("y1",vis.height)
			.attr("x2",vis.width/1.35)
			.attr("y2", 0);

		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf3")
			.text("-4% - Zika Virus")
			.style("font-size", "12px")
			.attr("x",0)
			.attr("y",-(vis.width/1.33))
			.attr("transform", "rotate(90)");


		// 2020 reference point
		vis.svg.append("g")
			.append("line")
			.attr("class", "referenceLine rl3")
			.style("stroke-dasharray", ("10,3"))
			.style("stroke-width", 2)
			.attr('stroke', 'grey')
			.attr("x1",(vis.width-20))
			.attr("y1",vis.height)
			.attr("x2",(vis.width-20))
			.attr("y2", 0);

		vis.svg.append("g")
			.append("text")
			.attr("class","referenceText rf3")
			.text(" -57.9% -COVID-19")
			.style("font-size", "12px")
			.attr("fill", "#e75f5b")
			.attr("x",0)
			.attr("y",-((vis.width-10)))
			.attr("transform", "rotate(90)");

		// x axis label

		vis.svg.append("g")
			.append("text")
			.attr("class","Spending Axis Label")
			.text("Billion USD")
			.style("font-size", "12px")
			.attr("x",0)
			.attr("y",-10)
			.attr("transform", "rotate(90)");

		// (Filter, aggregate, modify data)
		vis.wrangleData();
	}

	/*
 	* Data wrangling
 	*/
	wrangleData(){
		let vis = this;

		// if vis.focus is an empty string
		if(vis.focus) {

			console.log("Applying filter " + vis.filter + " at " + vis.filter);
			vis.displayData = [vis.stackedData[vis.selectedIndex]];
		} else {
			vis.displayData = vis.stackedData;
		}

		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/
	updateVis() {
		let vis = this;

		// Update domain
		vis.y.domain([0, d3.max(vis.displayData, function (d) {
			return d3.max(d, function (e) {
				if (vis.focus) {
					return e[1] - e[0];
				} else {
					return e[1];
				}
			});
		})
		]);


		// Draw the layers
		let Travelcategories = vis.svg.selectAll(".area")
			.data(vis.displayData);

		Travelcategories.enter().append("path")
			.attr("class", "area")
			.merge(Travelcategories)
			.style("fill", d => {
				return vis.colorScale(d)
			})
			.attr("d", d => {
				if (vis.focus) {
					return vis.basicArea(d)
				} else {
					return vis.area(d)
				}
			})

			.on("click", function (event, d) {

				// set filter
				vis.filter = vis.dataCategories[d.index]

				// updating focus
				vis.focus ? vis.focus = false : vis.focus = true

				// lastly, call wangleData
				vis.wrangleData();
			})
			.on("mouseover", function (event, d) {
				// always
				vis.selectedIndex = d.index
				// update tooltip text
				vis.tooltip.text(vis.dataCategories[d.index]);
			})
			.on("mouseout", function (d) {
				// empty tooltip
				vis.tooltip.text("");
			});

		Travelcategories.exit().remove();

		// Call axis functions with the new domain
		vis.svg.select(".x-axis").call(vis.xAxis)
		vis.svg.select(".y-axis").call(vis.yAxis)



	}
}