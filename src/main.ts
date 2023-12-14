import './style.css'
import * as d3 from "d3"

const margin = {top: 20, right: 50, bottom: 90, left: 50};
const w = 800;
const h = 430;

interface OrigDataInterface {
  Time: string;
  Place: number;
  Seconds: number;
  Name: string;
  Year: number;
  Nationality: string;
  Doping: string;
  URL: string;
}

interface DataInterface {
  Time: Date;
  Place: number;
  Seconds: number;
  Name: string;
  Year: Date;
  Nationality: string;
  Doping: string;
  URL: string;
}

fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then((response) => response.json())
  .then(data => {
    const dataset: DataInterface[] = data.map((d: OrigDataInterface) => {
      return {...d, Time: new Date("1970-01-01T00:" + d.Time), Year: new Date(d.Year.toString())};

    })

    /*const datasetYears: Date[] = dataset.map((d: DataInterface) => new Date(d.Year.toString()))
    const minYear: Date = d3.min(datasetYears)!;
    const maxYear: Date = d3.max(datasetYears)!;

    const datasetTime: Date[] = dataset.map((d: DataInterface) => new Date("1970-01-01T00:" + d.Time.toString()));
    const minTime: Date = d3.min(datasetTime)!;
    const maxTime: Date = d3.max(datasetTime)!;*/

    //console.log(minTime);

    const svg = d3.select("#chart")
                  .attr("width", w + margin.left + margin.right)
                  .attr("height", h + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);
                  
    const xScale = d3.scaleTime()
                      .domain([new Date("1993-01-01"),
                                new Date("2016-01-01")])
                      .range([0, w]);
    const yScale = d3.scaleTime()
                      .domain([d3.min(dataset, (d: DataInterface) => d.Time)!,
                                d3.max(dataset, (d: DataInterface) => d.Time)!])
                      .range([0, h]);

    const xAxis = d3.axisBottom<Date>(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft<Date>(yScale).tickFormat(d3.timeFormat("%M:%S"));
    //Appending axises
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${h})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", (d:DataInterface) => `dot ${d.Doping ? "doping" : "no-doping"}`)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Time))
        .attr("r", 5)
        .attr("data-xvalue", d => d.Year.toISOString())
        .attr("data-yvalue", d => d.Time.toISOString())
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

        const tooltip = d3.select("#tooltip");
        function showTooltip(event: MouseEvent, d : DataInterface) {
          tooltip.style("display", "block")
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 30) + "px")
                  .attr("data-year", d.Year.toISOString())
                  .html(`<div>${d.Name}: ${d.Nationality}
                        <br>Year: ${d.Year.getFullYear()}, Time: ${d3.timeFormat("%M:%S")(d.Time)}</div>
                        ${d.Doping ? "<div class='doping-desc'>" + d.Doping + "</div>": ""}`)
        }
        function hideTooltip() {
          tooltip.style("display", "none")
        }
        // Legend
        svg.append("rect").attr("x", w - 180).attr("y", h/2 - 45).attr("width", 200).attr("height", 60).style("fill", "rgba(0, 0, 0, 0)").attr("id", "legend");
        svg.append("circle").attr("cx",w).attr("cy", h/2).attr("r", 6).style("fill", "rgb(255, 127, 14)")
        svg.append("circle").attr("cx",w).attr("cy", h/2 - 30).attr("r", 6).style("fill", "rgb(31, 119, 180)")
        svg.append("text").attr("x", w - 15).attr("y", h/2).text("No doping allegations").style("font-size", "0.7em").attr("text-anchor", "end").attr("alignment-baseline","middle")
        svg.append("text").attr("x", w - 15).attr("y", h/2 - 30).text("Riders with doping allegations").style("font-size", "0.7em").attr("text-anchor", "end").attr("alignment-baseline","middle")
  })
  .catch(error => console.error(error));