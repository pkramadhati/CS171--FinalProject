// Modified from https://observablehq.com/@mbostock/scrubber
class TravelMapDateSlider {
  constructor(_parentElement, _dates, _myEventHandler) {
    this.parentElement = _parentElement;
    this.dates = _dates;
    this.myEventHandler = _myEventHandler;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.interval = null;
    vis.delay = 500;

    vis.row = d3
      .select("#" + vis.parentElement)
      .append("div")
      .attr("class", "row mx-0")
      .style("position", "relative");

    // Play/pause button
    vis.icons = {
      play:
        "M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z",
      pause:
        "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z",
    };
    vis.button = vis.row
      .append("div")
      .attr("class", "col-auto px-0")
      .append("button")
      .attr("class", "btn btn-primary btn-sm mr-3")
      .on("click", () => {
        if (vis.running()) return vis.stop();
        vis.start();
      });
    vis.buttonIcon = vis.button
      .append("svg")
      .attr("width", "1em")
      .attr("height", "1em")
      .attr("viewBox", "0 0 16 16")
      .attr("fill", "currentColor")
      .append("path")
      .attr("d", vis.icons.play);

    // Slider
    vis.col = vis.row.append("div").attr("class", "col px-0");

    // Slider input
    vis.slider = vis.col
      .append("input")
      .attr("type", "range")
      .style("display", "block")
      .attr("class", "custom-range")
      .attr("min", 0)
      .attr("max", vis.dates.length - 1)
      .attr("step", 1)
      .on("input", () => {
        if (vis.running()) vis.stop();
        $(vis.myEventHandler).trigger(
          "travelMapDateIndexChange",
          vis.slider.node().valueAsNumber
        );
      });

    // Slider ticks
    vis.margin = { top: 0, right: 0, bottom: 20, left: 0 };
    vis.width = $(vis.col.node()).width() - vis.margin.left - vis.margin.right;
    vis.height = 20 - vis.margin.top - vis.margin.bottom;

    vis.svg = vis.col
      .append("svg")
      .style("display", "block")
      .style("position", "absolute")
      .style("top", "20px")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + vis.margin.left + "," + vis.margin.top + ")"
      );

    // Scales and axes
    vis.x = d3
      .scaleTime()
      .domain([vis.dates[0], vis.dates[vis.dates.length - 1]])
      .range([0, vis.width]);

    vis.xAxis = d3.axisBottom().scale(vis.x).tickFormat(d3.timeFormat("%b"));

    vis.svg
      .append("g")
      .attr("class", "x-axis axis")
      .call(vis.xAxis)
      .call((g) => g.select(".domain").remove());

    // Initialization
    $(document).ready(() => {
      vis.slider.node().valueAsNumber = vis.dates.length - 1;
      $(vis.myEventHandler).trigger(
        "travelMapDateIndexChange",
        vis.slider.node().valueAsNumber
      );
    });
  }

  start() {
    const vis = this;
    vis.buttonIcon.attr("d", vis.icons.pause);
    vis.interval = setInterval(vis.tick.bind(vis), vis.delay);
  }

  stop() {
    const vis = this;
    vis.buttonIcon.attr("d", vis.icons.play);
    if (vis.interval !== null)
      clearInterval(vis.interval), (vis.interval = null);
  }

  running() {
    const vis = this;
    return vis.interval !== null;
  }

  tick() {
    const vis = this;
    if (vis.slider.node().valueAsNumber === vis.dates.length - 1)
      vis.slider.node().valueAsNumber = 0;
    vis.step();
  }

  step() {
    const vis = this;
    vis.slider.node().valueAsNumber += 1;
    $(vis.myEventHandler).trigger(
      "travelMapDateIndexChange",
      vis.slider.node().valueAsNumber
    );
  }
}
