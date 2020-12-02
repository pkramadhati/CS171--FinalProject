function travelMapProcessData(flightsData, covidData) {
  // console.log(flightsData, covidData);

  // Flights data
  let flightDateParser = d3.timeParse("%b %d, %Y");
  let flightDateFormatter = d3.timeFormat("%Y-%m-%d");
  let locationColumns = flightsData.columns.slice(1);

  let processedTravelMapDates = flightsData.map((d) =>
    flightDateParser(d.Date)
  );
  let flightsSeries = locationColumns.map((location) => ({
    name: location,
    values: flightsData.map((d) => +d[location]),
  }));
  let processedFlightsData = {
    series: flightsSeries,
    dates: processedTravelMapDates,
  };

  // Covid data
  // Only keep the dates that the flights data include
  let allFlightDateStrings = processedTravelMapDates.map(flightDateFormatter);
  covidData = covidData.filter((d) => {
    if (allFlightDateStrings.includes(d.date)) return true;
    return false;
  });
  let allCovidLocations = Array.from(new Set(covidData.map((d) => d.location)));
  let covidSeries = allCovidLocations.map((location) => {
    let values = allFlightDateStrings.map((date) => {
      let found = covidData.find(
        (d) => d.location === location && d.date === date
      );
      if (found) return +found.new_cases_smoothed_per_million;
      return null; // Has no entry for this location/date combination
    });
    return {
      name: location,
      values,
    };
  });
  let processedCovidData = {
    series: covidSeries,
    dates: processedTravelMapDates,
  };

  // console.log({processedTravelMapDates, processedFlightsData, processedCovidData });
  return [processedTravelMapDates, processedFlightsData, processedCovidData];
}
