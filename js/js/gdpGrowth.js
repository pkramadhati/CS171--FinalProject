let senariovis = this

 senariovis.margin = {top: 10, right: 40, bottom: 60, left: 60};
 senariovis.paddingLeft = 50;
 senariovis.paddingRight = 50;
 senariovis.paddingBottom=120;
 senariovis.parentElement = "scenarioIntroVis";

 senariovis.width =$("#" + senariovis.parentElement).width()- senariovis.margin.left - senariovis.margin.right + senariovis.paddingLeft;
 senariovis.height = $("#" + senariovis.parentElement).height()- senariovis.margin.top - senariovis.margin.bottom+ senariovis.paddingLeft;

// Adds the svg canvas

senariovis.svg = d3.select("#scenarioIntroVis").append("svg")
    .attr("width", senariovis.width + senariovis.margin.left + senariovis.margin.right -senariovis.paddingLeft)
    .attr("height", senariovis.height + senariovis.margin.top + senariovis.margin.bottom+ senariovis.paddingLeft)
    .append("g")
    .attr("transform", "translate(" + senariovis.margin.left + "," + -senariovis.margin.top + ")");


senariovis.parseDate = d3.timeParse("%b %Y");


// Get the data
d3.csv("data/Senario GDP Annual Growth Rate Forecast.csv").then(function(gdpData) {

    gdpData.forEach(function (d,i) {
        d.date = senariovis.parseDate(d.date);
        d.GDP = +d.GDP;
        d.index = +d.index;
    });


    // Set the ranges
    senariovis.x = d3.scaleTime().range([0, senariovis.width-100]);
    senariovis.y = d3.scaleLinear().range([senariovis.height, 100]);

    console.log(gdpData)
    // Scale the range of the data
   x.domain(d3.extent(gdpData, function(d) { return d.date; }));
   y.domain([-25, d3.max(gdpData, function(d) { return d.GDP; })]);

    // Nest the entries by symbol
    // senariovis.dataNest = d3.nest()
    //     .key(function(d) {return d.country;})
    //     .entries(gdpData);
    senariovis.dataNest = d3.group(gdpData, d => d.country)


    console.log(senariovis.dataNest)

    // set the colour scale
    senariovis.color = d3.scaleOrdinal(d3.schemeCategory10);

    senariovis.GDPline = d3.line()
        .x(function(d) { return senariovis.x(d.date); })
        .y(function(d) { return senariovis.y(d.GDP); })
        .curve(d3.curveLinear);

    senariovis.dataNest.forEach(function(d,i) {

        console.log(d)
        senariovis.path = senariovis.svg
            // .append("a")
            // .attr("href", d[0]["Senario"])
            .append("path")
            .attr("class", function(d) {
                return "countryline" + senariovis.color(i).substring(1);
            })

        senariovis.path
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .style("stroke", function () {// Add the colours dynamically
                // console.log(d.values[0]["Senario"]);
                return d.color = senariovis.color(i)
            })
            .style("stroke-dasharray", ("3, 3"))

            .attr("d", function () {
                return senariovis.GDPline(d)
            })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)



        senariovis.svg
            .append("text")
            .attr("class", function(d) {
                return "countrylabel" + senariovis.color(i).substring(1);
            })
            .attr("font-size",10)
            .attr("x",senariovis.width-90)
            .attr("y", () => {console.log(d[0].GDP); return senariovis.y(d[3].GDP)})
            // .append("a")
            // .attr("href", d[0]["Senario"])
            .style("fill","grey")
            .text(i)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);


         // senariovis.svg.append("text")
         //    .attr("class", function(d) {
         //        return "countrysenariolabel" + senariovis.color(i).substring(1);
         //    })
         //    .attr("x",function (){
         //        return d[0]["index"]*90+this.getBBox().width
         //    })
         //    .attr("y",40)
         //    .attr("font-size",15)
         //    // .append("a")
         //    // .attr("href", d[0]["Senario"])
         //    .style("fill", function () {// Add the colours dynamically
         //        // console.log(d);
         //        return d.color = senariovis.color(i)
         //    })
         //    .text(i)
         //    .on("mouseover", handleMouseOver)
         //    .on("mouseout", handleMouseOut);

        // senariovis.bbox = senariovis.countrylabel.node().getBBox()
        // console.log(bbox.width)
        function handleMouseOver() {

            d3.select(".countryline" + senariovis.color(i).substring(1))
                .attr("stroke-width", 7)
                .style("stroke-dasharray", ("1, 0"));
            // console.log(senariovis.color(i).substring(1))
            d3.select(".countrylabel" + senariovis.color(i).substring(1))
                .attr("font-size", 18)
                .style("fill", function () {// Add the colours dynamically
                           // console.log(d);
                           return d.color = senariovis.color(i)
                       });
            // d3.select(".countrysenariolabel" + senariovis.color(i).substring(1))
            //     .attr("font-size", 25);
        }

        function handleMouseOut() {  // Add interactivity
            // Use D3 to select element, change color and size
            d3.select(".countryline" + senariovis.color(i).substring(1))
                .attr("stroke-width", 2)
                .style("stroke-dasharray", ("3, 3"));
            d3.select(".countrylabel" + senariovis.color(i).substring(1))
                .attr("font-size", 10)
                .style;
            // d3.select(".countrysenariolabel" + senariovis.color(i).substring(1))
            //     .attr("font-size", 15);
        }


    });
        // Add the X Axis
        senariovis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + senariovis.height + ")")
            .call(d3.axisBottom(senariovis.x)
            .ticks(3)
            .tickFormat(d3.timeFormat("%b %Y")));

            // .tickValues(senariovis.x.domain().filter((d, i) => d % 10 === 0));

    senariovis.svg.append("g")
        .append("line")
        .attr("class","senario-referenceline")
        .attr("x1",senariovis.width-100)
        .attr("x0",senariovis.width-100)
        .attr("y1",senariovis.y(0) + 0.5)
        .attr("y2",senariovis.y(0) + 0.5)
        .style("stroke-dasharray", ("8,8"))
        .style("stroke","grey")
        .attr("stroke-width", 2)
    ;


        // Add the Y Axis
        senariovis. svg.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(senariovis.y)
                .tickFormat((d) => d + "%")
            )
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", -110)
            .style("text-anchor", "end")
            .text("GDP ANNUAL GROWTH RATE")
            .style("fill", "black");






});
