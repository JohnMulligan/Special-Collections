import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";


const NetworkView = (props) => {
    const height = 600;
    const width = 1000;

    const d3Container = useRef(null);

    // Get dummy data
    var json = require("../POCdata.json")
    console.log("Length")
    console.log(json.length)
    const data = JSON.parse(JSON.stringify(json));
    console.log(data.length)
    console.log(data);
    
    useEffect(() => {
        const svg = d3.select(d3Container.current);


        const simulation = d3.forceSimulation()
            .nodes(data)
            .force("charge_force", d3.forceManyBody())
            .force("center_force", d3.forceCenter(width / 2, height / 2));
        
        

        const g =  svg.append("g");
        const radius = 12;
        const node = g
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", radius)
            .on("click", function (d, i) {
                console.log(d)
                console.log(i)
                console.log(this)
                d3.select(this).style("fill", "#ffd1dc")
            })
            .attr("fill", "#05a0fa");

        const textElements = g
            .selectAll('text')
            .data(data)
            .enter().append('text')
              .text(node => node["o:title"])
              .attr('font-size', 12)
              .attr("font-family", "Nunito")
              .attr("fill", "#555")
              .attr('dx', 10)
              .attr('dy', 4);
        
        const tickActions = () => {
            node
                .attr("cx", d => Math.max(radius, Math.min(width - radius, d.x)))
                .attr("cy", d => Math.max(radius, Math.min(height - radius, d.y)));

            textElements
                .attr("x", d => Math.max(radius, Math.min(width - radius, d.x)))
                .attr("y", d => Math.max(radius, Math.min(height - radius, d.y)));
        };

        simulation.on("tick", tickActions );

        svg.call(d3.zoom().extent([[0, 0], [2*width, 2*height]])
                .scaleExtent([1, 8])
                .on("zoom", (e) => g.attr("transform", e.transform)));

    //     svg.call(d3.zoom()
    //   .extent([[0, 0], [width, height]])
    //   .scaleExtent([-10, 80])
    //   .on("zoom", zoomed));

    //   function zoomed() {
    //     let e = d3.event
        
    //     // if(e.transform.k > 2 && lastK != e.transform.k){
    //     //   lastK = e.transform.k;
    //     //   console.log("zoomed");
    //     //   zoomLvl = Math.log2(e.transform.k);
    //     //   g.append("g").attr("stroke-width", 1.5/zoomLvl );
    //     //   link.attr("stroke-width",  d => Math.sqrt(d.value)/(zoomLvl));
    //     //   textElements.attr('font-size', 10/zoomLvl);
    //     //   textElements.attr('dx',10/zoomLvl);
    //     //   textElements.attr('dy',5/zoomLvl);
    //     // }
       
    //     g.attr("transform", e.transform);
    //   }


    }, [data]);

    return(
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
        />
    );
}

export default NetworkView