import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";



const NetworkView = (props) => {
    const height = 1000;
    const width = 1500;

    const d3Container = useRef(null);

    // Get dummy data
    var data_json = require("../POCdata.json")

    const data = JSON.parse(JSON.stringify(data_json));
    // console.log(data);
    
    useEffect(() => {
        // create links
        const links = data.flatMap(node => {
            const isPartOf = node["dcterms:isPartOf"] ?? [];
            const hasPart = node["dcterms:hasPart"] ?? [];

            return isPartOf.concat(hasPart)
                .map(item => ({source: node["o:id"], target: item["value_resource_id"]}));
        });

        const svg = d3.select(d3Container.current);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const simulation = d3.forceSimulation()
            .nodes(data)
            .force("charge_force", d3.forceManyBody())
            .force("links", d3.forceLink(links).id( d => d["o:id"]))
            .force("center_force", d3.forceCenter(width / 2, height / 2 ))
            .on("tick", tickActions);

        const g =  svg.append("g");
        const radius = 5;
        const node = g
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", radius)
            .on("dblclick", function (d, i) {
                //d3.select(this).style("fill", "#ffd1dc");
                console.log(d)
                console.log(i)
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .attr("fill", d => color(d["@type"][1]));

        const link = g
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1);

        const textElements = g
            .selectAll('text')
            .data(data)
            .enter().append('text')
              .text(node => node["o:title"])
              .attr('font-size', 12)
              .attr("font-family", "Nunito")
              .attr("fill", "#555")
              .attr("x", node => node.x + 40)
              .attr("y", node => node.y + 10)
              .on("click", function(d, i) {
                console.log(d);
                console.log(i);
            });
            //   .attr('dx', 10)
            //   .attr('dy', 4);
            
              
        
        function tickActions() {
            
            console.log("ticked")

            node
                .attr("cx", d => Math.max(radius, Math.min(width - radius, d.x)))
                .attr("cy", d => Math.max(radius, Math.min(height - radius, d.y)));

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            textElements
                // .attr("x", d => Math.max(radius, Math.min(width - radius, d.x)))
                // .attr("y", d => Math.max(radius, Math.min(height - radius, d.y)));
                .attr("x", node => node["x"] + 10)
                .attr("y", node => node["y"] + 4)
                
        };

        function dragstarted() {
            simulation.tick()
            d3.select(this).raise();
            d3.select(this).attr("stroke", "black")
            g.attr("cursor", "grabbing");
        }

        function dragged(event, d) {
            simulation.restart()
            d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y)
        }

        function dragended() {
            d3.select(this).attr("stroke", null)
            g.attr("cursor", null)
        }

        svg.call(d3.zoom().extent([[0, 0], [2*width, 2*height]])
                .scaleExtent([1, 8])
                .on("zoom", (e) => g.attr("transform", e.transform)))


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