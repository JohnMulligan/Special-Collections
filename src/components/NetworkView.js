import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Button, Modal, Descriptions } from "antd";
import AddNoteButton from "./AddNoteButton";
import { useCookies } from "react-cookie";
import {fetch, fetchOne, fetchResourceTemplates} from "../utils/OmekaS"
import { connect } from "react-redux";
import { svg, text } from "d3";
import { Slider, Grid, Typography, makeStyles } from "@material-ui/core";
import * as d3Legend from "d3-svg-legend";




const NetworkView = () => {
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
    const [resourceTemplateProperties, setResourceTemplateProperties] = useState({});
    let onNodeKeys = [];

    const forceProperties = {
        center: {
            x: 0.5,
            y: 0.5
        },
        charge: {
            enabled: true,
            strength: -30,
            distanceMin: 1,
            distanceMax: 2000
        },
        collide: {
            enabled: true,
            strength: .7,
            iterations: 1,
            radius: 5
        },
        forceX: {
            enabled: false,
            strength: .1,
            x: .5
        },
        forceY: {
            enabled: false,
            strength: .1,
            y: .5
        },
        link: {
            enabled: true,
            distance: 30,
            iterations: 1
        }
    }

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
            setData(res);

            console.log(res.filter(r => r["o:resource_template"]))

            const templates = await fetchResourceTemplates(cookies.userInfo.host);
            const template2properties = await Promise.all(
                templates.map(
                    async (template) => {
                        const properties = await Promise.all(
                            template["o:resource_template_property"].map(
                                async (property) => await fetchOne(cookies.userInfo.host, "properties", property["o:property"]["o:id"])
                            )
                        )

                        return [template["o:id"], properties];
                    }
                )
            );

            setResourceTemplateProperties(Object.fromEntries(template2properties));
        };

        fetchInitial();
    }, [cookies]);

        const ids = data.map(item => item["o:id"])

        // create links
        const links = data.flatMap(node => {
            const isPartOf = node["dcterms:isPartOf"] ?? [];
            const hasPart = node["dcterms:hasPart"] ?? [];
            const isReferencedBy = node["dcterms:isReferencedBy"] ?? [];
            const references = node["dcterms:references"] ?? [];

            return isPartOf.concat(hasPart)
                .map(item => ({source: node["o:id"], target: item["value_resource_id"]}))
                .concat(isReferencedBy.map(item => ({source: node["o:id"], target: item["value_resource_id"]})))
                .concat(references.map(item => ({source: node["o:id"], target: item["value_resource_id"]})))
                .filter(pair => ids.includes(pair.source) && ids.includes(pair.target));

        });
        
        const radiusFactor = 2;
        const radii = Object.fromEntries(
            data.map(d => [d["o:id"], (links.filter(link => link.source === d["o:id"]).length + 1) * radiusFactor])
        );

        const svg = d3.select(d3Container.current);

        // const simulation = d3.forceSimulation()
        //     .nodes(data)
        //     .force("charge_force", d3.forceManyBody().strength(simulationForce))
        //     .force("links", d3.forceLink(links).id( d => d["o:id"]))
        //     .force("center_force", d3.forceCenter(width / 2, height / 2 ))
        //     .on("tick", tickActions);
        
        const simulation = d3.forceSimulation()
        const g =  svg.append("g");
        const minRadiusForLabel = 4;

        //initializeDisplay();
        initializeSimulation();
        
        function initializeSimulation() {
            simulation 
                .nodes(data)
                .on("tick", tickActions)
            initializeForces()
        }

        function initializeForces() {
            simulation 
                .force("charge_force", d3.forceManyBody().strength(forceProperties.charge.strength))
                .force("links", d3.forceLink(links).id( d => d["o:id"]))
                .force("center_force", d3.forceCenter(width / 2, height / 2))
                .force("collide", d3.forceCollide())
            updateForces();
        }

        function updateForces() {
            simulation.force("center_force")
                .x(width * forceProperties.center.x)
                .y(height * forceProperties.center.y)
            simulation.force("charge_force")
                .strength(forceProperties.charge.strength)
                .distanceMin(forceProperties.charge.distanceMin)
                .distanceMax(forceProperties.charge.distanceMax)
            simulation.force("links")
                .id(function(d) {return d.id;})
                .distance(forceProperties.link.distance)
                .iterations(forceProperties.link.iterations)
            simulation.force("collide")
                .strength(forceProperties.collide.strength)
                .radius(forceProperties.collide.radius)
                .iterations(forceProperties.collide.iterations)

            simulation.alpha(1).restart()

        }

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
                // if shifting select the node, else display modal
                if (d.shiftKey) {
                    let [r,g,b,_opacity] = d3.select(this).style("fill").split(", ")
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
                } else {
                    console.log(i);

                    const spawn_modal = async () => {
                        let thumbnailUrl = "";
                        if (i["o:media"].length !== 0) {
                            const media = await fetchOne(
                                cookies.userInfo.host,
                                "media",
                                i["o:media"][0]["o:id"]
                            );

                            thumbnailUrl = media["o:thumbnail_urls"].square;
                        }

                        const properties = i["o:resource_template"] ? resourceTemplateProperties[i["o:resource_template"]["o:id"]] : [];
                        console.log(properties);
                        console.log(properties.map(
                            property => 
                                <Descriptions.Item label={property["o:local_name"]}>
                                    {i[property["o:term"]]}
                                </Descriptions.Item>
                        ))

                        Modal.info({
                            title: i["o:title"],
                            content: (
                            <div>
                                {thumbnailUrl ? <img alt="example" src={thumbnailUrl} /> : null}
                                <Descriptions column={1} bordered>
                                    {
                                        properties.map(
                                            property => {
                                                const value = i[property["o:term"]] ? i[property["o:term"]][0] ? i[property["o:term"]][0]["@value"] : "" : "";
                                                return value ? 
                                                    <Descriptions.Item label={property["o:local_name"]}>
                                                    {value}
                                                    </Descriptions.Item>
                                                    : null;
                                            }
                                        )
                                    }
                                </Descriptions>
                            </div>
                            ),
                            onOk() {},
                        });
                    };

                    spawn_modal();

                }
                    
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .attr("fill", d => color(d["@type"][1]));
            
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
              
            svg.append("g")
                .attr("class", "legendOrdinal")
                .attr("transform", "translate(20,20)");
            
            const legendOrdinal = d3Legend.legendColor()
                .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
                .shapePadding(10)
                .cellFilter(function(d){ return d.label !== "e"})
                .scale(color)

            svg.select(".legendOrdinal")
                .call(legendOrdinal)


        

                
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


    const resetNodes = () => {
        const svg = d3.select(d3Container.current);
        let selection = svg.selectAll("circle").style("fill", d => color(d["@type"][1]))
        onNodeKeys = [];

    }

    const changeCharge = (d, i) => {
        // d3.select("svg").remove();
        // setSimulationForce(newValue);
        d3.select('#charge_StrengthSliderOutput').text('(' + i + ')')
        forceProperties.charge.strength = -1*i
        updateForces();
    }

    const changeLinkDistance = (d, i) => {
        d3.select('#link_DistanceSliderOutput').text('(' + i + ')')
        forceProperties.link.distance = -1*i
        updateForces();
    }

    return(
        <div>
            <Button onClick = {resetNodes}>Reset Nodes</Button>
            <AddNoteButton targets = {onNodeKeys} />
            <div className = {classes.root} >
            <label title = "Negative strength Repels nodes. Positive Strength attracts nodes" >
                Repulsion
                <output id="charge_StrengthSliderOutput">({-1*forceProperties.charge.strength})</output>
                <Slider 
                    defaultValue = {-1*forceProperties.charge.strength} 
                    onChange = {changeCharge}
                    aria-labelledby = "continuous-slider"
                    min = {0}
                    max = {100}  /> 
            </label>
            <label title = "Set link length">
                Attraction
                <output id="link_DistanceSliderOutput">(30)</output>
                <Slider 
                    defaultValue = {-1*forceProperties.link.distance}
                    onChange = {changeLinkDistance}
                    aria-labelledby = "continuous slider"
                    min = {-50}
                    max = {50} />
            </label>
            </div>

            <svg
                className="d3-component"
                width={width}
                height={height}
                style={{"backgroundColor": "white"}}
                ref={d3Container}
                >
            </svg>
        </div>
        );
}

export default NetworkView