// Modified from https://observablehq.com/@d3/multi-line-chart?collection=@d3/d3-shape
class TravelMapLineVis {
  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    // format date method
    this.formatDate = d3.timeFormat("%b %d, %Y");

    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = {
      top: 10,
      right: 100,
      bottom: 30,
      left: 40,
    };
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
      .on("mousemove", vis.moved.bind(vis))
      .on("mouseenter", vis.entered.bind(vis))
      .on("mouseleave", vis.left.bind(vis))
      .append("g")
      .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

    // init tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // scales
    vis.xScale = d3
      .scaleTime()
      .domain([vis.data.dates[0], vis.data.dates[vis.data.dates.length - 1]])
      .range([0, vis.width]);
    vis.yScale = d3
      .scaleLinear()
      .domain([
        d3.min(vis.data.series, (d) => d3.min(d.values)),
        d3.max(vis.data.series, (d) => d3.max(d.values)),
      ])
      .range([vis.height, 0])
      .nice();

    // line path generator
    vis.line = d3
      .line()
      .defined((d) => !isNaN(d))
      .x((d, i) => vis.xScale(vis.data.dates[i]))
      .y((d) => vis.yScale(d));

    // clip path for different line colors
    vis.svg
      .append("clipPath")
      .attr("id", "travelMapLinePositive")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", vis.width)
      .attr("height", vis.yScale(0));
    vis.svg
      .append("clipPath")
      .attr("id", "travelMapLineNegative")
      .append("rect")
      .attr("x", 0)
      .attr("y", vis.yScale(0))
      .attr("width", vis.width)
      .attr("height", vis.height - vis.yScale(0));

    // axises
    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .tickFormat(d3.timeFormat("%b"))
      .tickSizeOuter(0);
    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .ticks(5)
      .tickFormat((d) => d + "%");

    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${vis.height})`)
      .call(vis.xAxis);
    vis.svg.append("g").attr("class", "y-axis").call(vis.yAxis);

    // zero base line
    vis.svg
      .append("line")
      .attr("class", "base-line")
      .attr("x2", vis.width)
      .attr("y1", vis.yScale(0) + 0.5)
      .attr("y2", vis.yScale(0) + 0.5);

    // location
    vis.location = vis.svg
      .append("g")
      .selectAll(".location-g")
      .data(vis.data.series)
      .join("g")
      .attr("class", "location-g");

    vis.location
      .append("path")
      .attr("class", "location-line")
      .attr("clip-path", "url(#travelMapLinePositive)")
      .attr("fill", "none")
      .attr("stroke", "#2166ac")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", (d) => vis.line(d.values));

    vis.location
      .append("path")
      .attr("class", "location-line")
      .attr("clip-path", "url(#travelMapLineNegative)")
      .attr("fill", "none")
      .attr("stroke", "#b2182b")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", (d) => vis.line(d.values));

    vis.location
      .append("text")
      .attr("class", "location-line-label")
      .attr("dy", "0.32em")
      .attr("x", vis.width + 5)
      .attr("y", (d) => vis.yScale(d.values[d.values.length - 1]))
      .text((d) => d.name);

    vis.locationCircle = vis.location
      .append("circle")
      .attr("class", "location-line-circle")
      .attr("r", 2.5);

    // for tooltip focus
    vis.dot = vis.svg
      .append("circle")
      .attr("class", "focus-circle")
      .attr("r", 2.5)
      .style("display", "none");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // update location line circle
    vis.locationCircle
      .attr("cx", vis.xScale(vis.data.dates[vis.dateIndex]))
      .attr("cy", (d) => vis.yScale(d.values[vis.dateIndex]))
      .attr("fill", (d) =>
        d.values[vis.dateIndex] >= 0 ? "#2166ac" : "#b2182b"
      );
  }

  moved(event) {
    let vis = this;
    const pointer = d3.pointer(event, vis.svg.node());
    const xm = vis.xScale.invert(pointer[0]);
    const ym = vis.yScale.invert(pointer[1]);
    const i = d3.bisectCenter(vis.data.dates, xm);
    const s = d3.least(vis.data.series, (d) => Math.abs(d.values[i] - ym));
    vis.location
      .classed("muted", (d) => d !== s)
      .filter((d) => d === s)
      .raise();
    vis.dot.attr(
      "transform",
      `translate(${vis.xScale(vis.data.dates[i])},${vis.yScale(s.values[i])})`
    );
    let dotRect = vis.dot.node().getBoundingClientRect();
    vis.tooltip
      .style("left", dotRect.x + dotRect.width + window.scrollX + 5 + "px")
      .style("top", dotRect.y + dotRect.height + window.scrollY + "px").html(`
        <h4 class="current-date">${vis.formatDate(vis.data.dates[i])}</h4>
        <h3>${s.name}<h3>
        <h3 class="current-value">${s.values[i] + "%"}</h3>
        `);
  }

  entered() {
    let vis = this;
    vis.tooltip.style("opacity", 1);
    vis.dot.style("display", null);
  }

  left() {
    let vis = this;
    vis.location.classed("muted", false);
    vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
    vis.dot.style("display", "none");
  }

  onDateIndexChange(dateIndex) {
    let vis = this;
    vis.dateIndex = dateIndex;
    vis.wrangleData();
  }
}
