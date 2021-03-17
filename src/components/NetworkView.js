import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Button } from "antd";
import AddNoteButton from "./AddNoteButton";
import { useCookies } from "react-cookie";
import {fetch} from "../utils/OmekaS"
import { connect } from "react-redux";
import { svg, text } from "d3";
import { Slider, Grid, Typography, makeStyles } from "@material-ui/core";




const NetworkView = (props) => {
    const [cookies] = useCookies(["userInfo"]);

    const useStyles = makeStyles({
        root: {
          width: 200,
        },
      });

    const classes = useStyles();
    
    const height = 1000;
    const width = 1500;

    const d3Container = useRef(null);
    const color = d3.scaleOrdinal(d3.schemeCategory10);


    // Get dummy data
    // var data = require("../POCdata.json");
    const [data, setData] = useState([]);
    const [simulationForce, setSimulationForce] = useState(-30)
    let onNodeKeys = [];

    useEffect(() => {
        const fetchInitial = async () => {
            const res = await fetch(
                cookies.userInfo.host,
                "items",
                -1,
                {},
                0,
                200
            )
            console.log(res);
            setData(res);
        };

        fetchInitial();
    }, [cookies]);

    useEffect(() => {
        // create links
        const links = data.flatMap(node => {
            const isPartOf = node["dcterms:isPartOf"] ?? [];
            const hasPart = node["dcterms:hasPart"] ?? [];
            const isReferencedBy = node["dcterms:isReferencedBy"] ?? [];

            return isPartOf.concat(hasPart)
                .map(item => ({source: node["o:id"], target: item["value_resource_id"]}))
                .concat(isReferencedBy.map(item => ({source: node["o:id"], target: item["value_resource_id"]})));
        });

        console.log("here")
        console.log(simulationForce)
        

        const radiusFactor = 2;
        const radii = Object.fromEntries(
            data.map(d => [d["o:id"], (links.filter(link => link.source === d["o:id"]).length + 1) * radiusFactor])
        );

        const svg = d3.select(d3Container.current);

        const simulation = d3.forceSimulation()
            .nodes(data)
            .force("charge_force", d3.forceManyBody().strength(simulationForce))
            .force("links", d3.forceLink(links).id( d => d["o:id"]))
            .force("center_force", d3.forceCenter(width / 2, height / 2 ))
            .on("tick", tickActions);

        const g =  svg.append("g");

        const link = g
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .style("visibility", "visible")
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1);

        const node = g
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", d => radii[d["o:id"]])
            .on("mouseover", function(d, i) {
               link.filter(item => i["o:id"] != item.source["o:id"] && i["o:id"] != item.target["o:id"]).style("visibility", "hidden")
               var connectedLinks = link.filter(item => i["o:id"] === item.source["o:id"] || i["o:id"] === item.target["o:id"])["_groups"][0]
                                    .map(item => [item["__data__"].source["o:id"], item["__data__"].target["o:id"]]).flat()
                node.filter(item => connectedLinks.indexOf(item["o:id"]) === -1 && item["o:id"] !== i["o:id"]).style("visibility", "hidden")
                textElements.filter(node => connectedLinks.indexOf(node["o:id"]) === -1 && node["o:id"] !== i["o:id"]).style("visibility", "hidden")
                

            })
            .on("mouseout", function(d) {
                link.style("visibility", "visible")
                node.style("visibility", "visible")
                textElements.style("visibility", "visible")
            })
            .on("dblclick", function (d, i) {
                // console.log(i)
                var [r,g,b,_opacity] = d3.select(this).style("fill").split(", ")
                r = r.substring(r.indexOf("(") + 1)
                if (b[b.length-1] === ")"){
                    b = b.substring(0, b.length-1)
                }

                if (onNodeKeys.includes(i.key)) {
                    onNodeKeys = onNodeKeys.filter(node => node !== i.key);
                    d3.select(this).style("fill", "rgba(" + r + ", " + g + ", " + b + ", 1)");
                } else {
                    onNodeKeys.push(i.key);
                    d3.select(this).style("fill", "rgba(" + r + ", " + g + ", " + b + ", 0.4)")
                }
                    
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .attr("fill", d => color(d["@type"][1]));

        const minRadiusForLabel = 4;
        
        const textElements = g
            .selectAll('text')
            .data(data)
            .enter().append('text')
              .text(node => node["o:title"] ? (node["o:title"].length > 20 ? node["o:title"].substring(0, 20) + "..." : node["o:title"]) : "")
              .attr('font-size', 12)
              .attr("font-family", "Nunito")
              .attr("fill", "#555")
              .attr("x", node => node.x + 40 + 3*node.r)
              .attr("y", node => node.y + 10 + node.r)
              .style("opacity", node => radii[node["o:id"]] > minRadiusForLabel ? 1 : 0);     

        
        function tickActions() {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

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
                .on("zoom", (e) => {
                    g.attr("transform", e.transform);
                    g.selectAll('text')
                        .data(data)
                        .style("opacity", (d) => {
                            // console.log(e.transform.k * radii[d["o:id"]]);
                            return e.transform.k * radii[d["o:id"]] > minRadiusForLabel ? 1 : 0;
                        })
                }))
                .on("dblclick.zoom", null);

        console.log(svg)


    }, [data, simulationForce]);

    const resetNodes = () => {
        const svg = d3.select(d3Container.current);
        let selection = svg.selectAll("circle").style("fill", d => color(d["@type"][1]))
        onNodeKeys.length = 0

    }

    const handleNewForce = (e, newValue) => {
        // const svg = d3.select("svg")
        // svg.selectAll("*").remove();
        // d3.selectAll("svg > *").remove();

        setSimulationForce(newValue)
    }

    return(
        <div>
            <Button onClick = {resetNodes}>Reset Nodes</Button>
            <AddNoteButton targets = {onNodeKeys} />
            <div className = {classes.root} >
                <Typography id = "discrete-slider-small-steps">
                    Node separation
                </Typography>
                <Grid item xs>
                    <Typography>
                        Farther apart
                    </Typography>

                    <Slider 
                    value = {simulationForce} 
                    onChange = {handleNewForce} 
                    aria-labelledby="discrete-slider-small-steps"
                    step = {10}
                    marks
                    min = {-60}
                    max = {-20} />
                    <Typography>
                        Closer together
                    </Typography>
                </Grid>
            </div>
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