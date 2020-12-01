class BarVis {

    constructor (_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    console.log("raw data for BARCHART:", this.data);

    this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

initVis(){
    let vis = this;

    vis.margin = { top: 20, right: 0, bottom: 200, left: 140 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height =400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.2);

    vis.y = d3.scaleLinear()
        .range([vis.height,0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g")
        .attr("id", "xgrid");

    vis.svg.append("g")
        .attr("id", "ygrid");

    vis.svg.append("text")
        .attr("id","axis_label")
        .attr("x", -70)
        .attr("y", -11)
        .text("Number of Measures");

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

/*
 * Data wrangling
 */

wrangleData(){
	let vis = this;

	let filteredData = [];

    // if there is a region selected
    if (selectedTimeRange.length !== 0){
        //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )

        // iterate over all rows the csv (dataFill)
        vis.data.forEach( row => {
            // and push rows with proper dates into filteredData
            if (selectedTimeRange[0].getTime() <= vis.parseDate(row['DATE_IMPLEMENTED']).getTime() && vis.parseDate(row['DATE_IMPLEMENTED']).getTime() <= selectedTimeRange[1].getTime() ){
                filteredData.push(row);
            }
        });
    } else {
        filteredData = vis.data;
        console.log('filtered data',filteredData)
    }

    //filter data based on multiple conditions
    let condition = {};
    let filter=(condition,data)=>{
        return data.filter( item => {
            return Object.keys( condition ).every( key => {
                return String( item[ key ] ).toLowerCase().includes(
                    String( condition[ key ] ).trim().toLowerCase() )
            } )
        } )
    }

    //generate condition
    // if (selected_region != 'select'){condition['REGION'] = selected_region;}
    if (selected_country != 'select'){condition['COUNTRY'] = selected_country;}
    if (selected_category != 'select'){condition['CATEGORY'] = selected_category;}
    if (selected_stage != 'select'){condition['LOG_TYPE'] = selected_stage;}

    let selectedData = filter(condition,filteredData)
    console.log('selected data',selectedData)


    // prepare covid data by grouping all rows by category
    if (condition.length !=0 ){
        vis.dataByMeasure = Array.from(d3.group(selectedData, d =>d['MEASURE']), ([measure, value]) => ({measure, value}))
    }else{
        vis.dataByMeasure = Array.from(d3.group(filteredData, d =>d['MEASURE']), ([measure, value]) => ({measure, value}))
    }

    vis.measureCount = vis.dataByMeasure.length;

	// Create a sequence of values from 0 - length
	vis.countsPerMeasure = d3.range(0, vis.measureCount).map(function() {
        return 0;
    });

    vis.measureGroup = [];
    //populate final data structure
    vis.dataByMeasure.forEach(function(i){
        vis.measureGroup.push(
            {
                'measure': i['measure'],
                'count':i['value'].length
            }
        )
    })

    //sort data
    function compare(prop){
        return function(a,b){
            let value1 = a[prop];
            let value2 = b[prop];
            return value2 - value1;
        }
    }
    vis.measureGroup.sort(compare('count'));

    //check the final data structure(top15)
	vis.displayData = vis.measureGroup.slice(0,15);
    console.log('barChart-displayData:',vis.displayData);

	// Update the visualization
	vis.updateVis();
}

/*
 * The drawing function
 */

updateVis(){
	let vis = this;

    // Update domains
    vis.x.domain(vis.displayData.map(d=>d['measure']))
    vis.y.domain([0, vis.displayData[0]['count']]).nice();



    // gridlines function
    function make_x_gridlines() {
        return d3.axisBottom(vis.x);
    }

    function make_y_gridlines() {
        return d3.axisRight(vis.y);
    }

    // add the X gridlines
    let xgrid =  vis.svg.select("#xgrid")
        .attr("id", "xgrid")
        .attr("transform", "translate("+ vis.x.bandwidth()/2 +"," + vis.height + ")")
        .call(make_x_gridlines()
            .tickSize(-vis.height)
            .tickFormat("")
        )

    // add the Y gridlines
    let ygrid =  vis.svg.select("#ygrid")
        .attr("id", "ygrid")
        .call(make_y_gridlines()
            .tickSize(vis.width-5)
            .tickFormat("")
        )

    //draw bars
    let bars = vis.svg.selectAll(".bar")
        .data(vis.displayData)

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .transition()
        .attr("width", vis.x.bandwidth()-10)
        .attr("height", (d,i) => vis.height - vis.y(vis.displayData[i]['count']))
        .attr("x", (d, i) => vis.x(vis.displayData[i]['measure']))
        .attr("y", (d, i) => vis.y(vis.displayData[i]['count']))

        bars.on('mouseover', function(event, d) {
            let measure_detail = {
                'Additional health or other document requirements upon arrival': 'Authorities upon arrival to a country may request a health declaration format or doctor\'s certifications to allow entry.',
                'Border checks':'Authorities may travel and identification document checks in land and sea entry points in a country.',
                'Border closure':'A country may close the land or sea border with the neighbouring countries. Only nationals and residents are allowed through.',
                'Complete border closure':'A country has completely closed the borders for all - including nationals.',
                'Checkpoints within the country':'Authorities may have installed check points within the country on regional borders or main road to a) conduct health checks and b) stop the internal movement of people.',
                'International Flights suspension':'International and/or internal flights may be suspended by government authorities.',
                'Domestic travel restrictions':'Authorities are limiting the movement of people within a country.',
                'Visa restrictions':'Authorities are limiting specific nationalities from entering the country or they are adding visa restrictions that did not exist before.',
                'Curfews':'Introducing curfews in some regions or in the whole country.',
                'Surveillance and monitoring':'Authorities may conduct electronic surveillance via mobile phones or other ways to do case tracing or to monitor the movement of people.',
                'Awareness campaigns':'Authorities are conducting awareness campaigns on media, social media, public spaces, or elsewhere around hygiene methods, social distancing, of other measures.',
                'Introduction of isolation and quarantine policies':'1. People have to self-quarantine or to be put in isolation units upon arrival to a country. 2. People with symptoms have to self-quarantine or to be put in isolation unit. 3. People who have been in touch with confirmed COVID-19 cases have to self- quarantine.',
                'General recommendations':'The government has made general recommendations to people to be careful or given some general hygiene guidelines. This usually implies a weak response where other measures are not really taken.',
                'Health screenings in airports and border crossings':'Health screening and body temperature controls are conducted by authorities in airports and border crossings.',
                'Obligatory medical tests not related to COVID-19':'There are reports of governments having forced people to take health checks for conditions not related to COVID-19 (such as HIV).',
                'Psychological assistance and medical social work':'Authorities have implemented measures for the phycological assistance of the patients, their families, as well as people in quarantine or lockdown.',
                'Mass population testing':'Authorities are screening all the population of a country or of a region within a country.',
                'Strengthening the public health system':'Authorities put in place measures to strengthen the health system. These could be: 1. hiring more doctors or other medical personnel. 2. building new hospitals and medical centres or expanding current ones. 3. Other',
                'Testing policy':'Conducting tests to identify infected people.',
                'Requirement to wear protective gear in public':'Masks/ gloves etc when required by law.',
                'Other public health measures enforced':'I.E. sanitation of transports, additional health regulations not falling under other categories',
                'Amendments to funeral and burial regulations':'Changes in burial regulation for example in order to limit the number of people who can attend or change the way the burial is conducted.',
                'Economic measures':'Authorities have taken economic measures in order to mitigate the impact of the other restrictions to the economy and the society.',
                'Emergency administrative structures activated or established':'Authorities have put in place emergency administrative structures such as Emergency Response committees etc. in order to coordinate the response and/or decide on measures and/or monitor the implementation.',
                'Limit product imports/exports':'Authorities are limiting the import or export of either food or health items.',
                'State of emergency declared':'Authorities have declared a state of emergency. Usually this measure is used to be able to implement other measures that are not allowed by constitutions in a regular situation. This may also include state of necessity, exceptional state, state of public health emergency.',
                'Military deployment':'The military has been deployed to support the medical operations and ensure compliance with the measures.',
                'Limit public gatherings':'Cancelation of public events. Limit to the number of people that can meet in public and private spaces.',
                'Closures of businesses and public services':'Businesses, public services and facilities are closing access to the public. In some countries, services are available online.',
                'Changes in prison-related policies':'Change in policies around prisons to mitigate the spread of the disease. This may include early release but also suspension of day-release programs, suspension of visits etc.',
                'Schools closure':'Authorities have closed schools.',
                'Partial lockdown':'Partial lockdown includes: 1. The population cannot leave their houses apart for specific reasons that they have to communicate to the authorities. 2. All stores that are not related to alimentation or pharmacies are not open.',
                'Full lockdown':'Full lockdown includes: 1. The population cannot leave their houses apart for specific reasons that they have to communicate to the authorities. 2. All non-essential services closed and production stops.',
                'Lockdown of refugee/idp camps or other minorities':'Limitations to the population living in camps and/or camp like conditions.',
                'International flights suspension':'Suspension on international flights from high-risk areas.',
                'Closure of businesses and public services':'Local business and public service shut down.',
                'Isolation and quarantine policies':'In-home quarantine for high-risk virus transmitters.'};

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`<div style="max-width: 200px; overflow-wrap: break-word">
                            <h3>${d['measure']}</h3>
                            <h4>${d['count']}</h4>
                            <h6 style="font-weight: normal; color: #707070">${measure_detail[d['measure']]}</h6>
                        </div>`)
        })
        .on('mouseout', function(event, d){
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        });

    // Call axis function with the new domain
    vis.svg.select(".y-axis").call(vis.yAxis)
        .attr("transform","translate(-1,0)");

    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .data(vis.displayData)
        .enter()
        .text( d=> d['measure'])
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("text-anchor", "start")
        .attr("transform", "rotate(45)");

    bars.exit().remove();
    xgrid.exit().remove();
    ygrid.exit().remove();


}


onSelectionChange (selectionStart, selectionEnd){
	let vis = this;

	// Filter data depending on selected time period (brush)
    vis.filteredData = vis.data.filter(function(d){
        return d['time']> selectionStart && d['time']<selectionEnd;
    })

	vis.wrangleData();
}
}
