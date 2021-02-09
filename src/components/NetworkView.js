import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";


const NetworkView = (props) => {
    const height = 200;
    const width = 400;

    const d3Container = useRef(null);

    // Get dummy data
    var json = require("../POCdata.json")
    const data = JSON.parse(JSON.stringify(json));
    console.log(data);
    
    useEffect(() => {
        const svg = d3.select(d3Container.current);


        const simulation = d3.forceSimulation()
            .nodes(data)
            .force("charge_force", d3.forceManyBody())
            .force("center_force", d3.forceCenter(width / 2, height / 2));

        const radius = 5;
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", radius)
            .attr("fill", "blue");
        
        const tickActions = () => {
            node
                .attr("cx", d => Math.max(radius, Math.min(width - radius, d.x)))
                .attr("cy", d => Math.max(radius, Math.min(height - radius, d.y)));
        };

        simulation.on("tick", tickActions );


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