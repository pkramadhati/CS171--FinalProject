class TravelMapMapVis {
  constructor(_parentElement, _data, _geoData) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.geoData = _geoData;

    // format date method
    this.formatDate = d3.timeFormat("%b %d, %Y");

    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = { top: 15, right: 0, bottom: 50, left: 0 };
    vis.width =
      $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height =
      $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

    // color scale
    vis.colorScale = d3
      .scaleLinear()
      .domain([
        0,
        100, // Because of outliers, we use a predefined max
        // d3.max(
        //   vis.data.series,
        //   (d) => d3.max(d.values)
        // ),
      ])
      .range(["#ffffff", "#b2182b"])
      .clamp(true);

    // features
    vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries);
    // remove Antarctica to maximize space
    vis.world.features = vis.world.features.filter(
      (d) => d.properties.name !== "Antarctica"
    );
    vis.world.features.find(
      (d) => d.properties.name === "United States of America"
    ).properties.name = "United States"; // Adjust US name to match the covid data name
    vis.countries = vis.world.features;

    // projection
    vis.projection = d3
      .geoNaturalEarth1()
      .fitSize([vis.width, vis.height], vis.world);
    vis.path = d3.geoPath().projection(vis.projection);

    // init tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // current date
    vis.currentDate = vis.svg
      .append("text")
      .attr("fill", "#707070")
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .attr("x", vis.width / 2);

    // country paths
    vis.map = vis.svg
      .append("g")
      .selectAll(".country-path")
      .data(vis.countries)
      .enter()
      .append("path")
      .attr("class", "country-path")
      .attr("stroke", "#D2CAC9")
      .attr("fill", "#ffffff")
      .attr("d", vis.path)
      .on("mouseenter", vis.entered.bind(vis))
      .on("mouseout", vis.left.bind(vis));

    // legend
    vis.legend = vis.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${vis.width - 300},${vis.height + 20})`);
    vis.legendLinearGradient = vis.legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "traveMapMapChartLinearGradient")
      .selectAll("stop")
      .data(vis.colorScale.range())
      .join("stop")
      .attr("offset", function (d, i) {
        return i / (vis.colorScale.range().length - 1);
      })
      .attr("stop-color", function (d) {
        return d;
      });
    vis.legendScale = d3
      .scaleLinear()
      .domain(vis.colorScale.domain())
      .range([0, 260]);
    vis.legendAxis = d3
      .axisBottom(vis.legendScale)
      .ticks(5)
      .tickFormat((d) => (d === vis.colorScale.domain()[1] ? d + "+" : d));
    vis.legend.append("g").attr("class", "axis").call(vis.legendAxis);
    vis.legend
      .append("rect")
      .attr("y", -11)
      .attr("width", 260)
      .attr("height", 12)
      .style("fill", "url(#traveMapMapChartLinearGradient)");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // update current date
    vis.currentDate.text(vis.formatDate(vis.data.dates[vis.dateIndex]));

    // update map color
    vis.map.attr("fill", (d) => {
      let location = vis.data.series.find((e) => e.name === d.properties.name);
      if (location) {
        return vis.colorScale(location.values[vis.dateIndex]);
      } else {
        return "#ffffff";
      }
    });

    // update tooltip value
    vis.tooltip
      .select(".current-date")
      .text(vis.formatDate(vis.data.dates[vis.dateIndex]));
    vis.tooltip
      .select(".current-value")
      .text((location) => (location ? location.values[vis.dateIndex] : "NA"));
  }

  entered(event, d) {
    let vis = this;
    d3.select(event.target).attr("stroke", "currentColor").raise();
    let location = vis.data.series.find((e) => e.name === d.properties.name);
    let value = location ? location.values[vis.dateIndex] : "NA";
    // show tooltip
    vis.tooltip
      .style("opacity", 1)
      .style("left", event.pageX + 5 + "px")
      .style("top", event.pageY + "px")
      .datum(location).html(`
            <h4 class="current-date">${vis.formatDate(
              vis.data.dates[vis.dateIndex]
            )}</h4>
            <h3>${d.properties.name}<h3>
            <h3 class="current-value">${value}</h3>
            <h4>new cases per million</h4>
            `);
  }

  left(event) {
    let vis = this;
    d3.select(event.target).attr("stroke", "#D2CAC9");
    vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
  }

  onDateIndexChange(dateIndex) {
    let vis = this;
    vis.dateIndex = dateIndex;
    vis.wrangleData();
  }
}
