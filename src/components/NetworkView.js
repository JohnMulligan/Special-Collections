import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Button } from "antd";
import AddNoteButton from "./AddNoteButton";



const NetworkView = (props) => {
    const height = 1000;
    const width = 1500;

    const d3Container = useRef(null);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Get dummy data
    var data_json = require("../POCdata.json")

    const data = JSON.parse(JSON.stringify(data_json));

    const linksToBeAdded = [];
    var onNodes = [];
    useEffect(() => {
        // create links

        var links = data.flatMap(node => {
            const isPartOf = node["dcterms:isPartOf"] ?? [];
            const hasPart = node["dcterms:hasPart"] ?? [];

            return isPartOf.concat(hasPart)
                .map(item => ({source: node["o:id"], target: item["value_resource_id"]}));
        });

        // console.log("links")
        // console.log(links)
        // console.log(linksToBeAdded)

        if( linksToBeAdded !== undefined && linksToBeAdded.length > 1) {
            for(link in linksToBeAdded){
                links.push({source: link[0]["o:id"], target: link[1]["o:id"]})
            }
            console.log(links)
        }

        const svg = d3.select(d3Container.current);
        

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
                var [r,g,b,opacity] = d3.select(this).style("fill").split(", ")
                r = r.substring(r.indexOf("(") + 1)
                if (b[b.length-1] === ")"){
                    b = b.substring(0, b.length-1)
                }

                if(!opacity || opacity === 1){
                    onNodes.push(i)
                    d3.select(this).style("fill", "rgba(" + r + ", " + g + ", " + b + ", 0.4)")

                } else {
                    onNodes.splice(i, 1)
                    d3.select(this).style("fill", "rgba(" + r + ", " + g + ", " + b + ", 1)")
                    
            }})
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .attr("fill", d => color(d["@type"][1]));
            // .each(function(d, i) {
            //     var [r,g,b] = d3.select(this).style("fill").split(", ")
            //     r = r.substring(r.indexOf("(") + 1)
            //     if (b[b.length-1] === ")"){
            //         b = b.substring(0, b.length-1)
            //     }
            //     d3.select(this).style("fill", "rgba("+r+", " + g + ", "  + b + ", 0.4)")
            // })
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
              .text(node => node["o:title"] ? (node["o:title"].length > 20 ? node["o:title"].substring(0, 20) + "..." : node["o:title"]) : "")
              .attr('font-size', 12)
              .attr("font-family", "Nunito")
              .attr("fill", "#555")
              .attr("x", node => node.x + 40)
              .attr("y", node => node.y + 10)
              .on("click", function(d, i) {
            });     
        
        function tickActions() {
            node
                .attr("cx", d => Math.max(radius, Math.min(width - radius, d.x)))
                .attr("cy", d => Math.max(radius, Math.min(height - radius, d.y)));

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            textElements
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
                .on("dblclick.zoom", null);


    }, [data, linksToBeAdded]);

    const onNoteAdd = () => {
        console.log(data)
        // let win = window.open(
        //   PATH_PREFIX + "/note/" + JSON.stringify(data),
        //   "_blank"
        // );
        // win.focus();
    
        for(var i = 0; i < onNodes.length-1; i++){
          for(var j = i+1; j < onNodes.length; j++){
            linksToBeAdded.push([data[i],data[j]])
          }
        }
    
        console.log(linksToBeAdded)
      };

    const resetNodes = () => {
        const svg = d3.select(d3Container.current);
        let selection = svg.selectAll("circle").style("fill", d => color(d["@type"][1]))
        onNodes = []
    }

    return(
        <div>
            <Button onClick = {onNoteAdd} >Add Links</Button>
            <Button onClick = {resetNodes}>Reset Nodes</Button>
            <AddNoteButton targets = {onNodes} />
            <svg
                className="d3-component"
                width={width}
                height={height}
                style={{"background-color": "white"}}
                ref={d3Container}
                >
            </svg>
        </div>
        );
}

export default NetworkView