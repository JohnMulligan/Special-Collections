import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Button, Modal, Descriptions } from "antd";
import AddNoteButton from "./AddNoteButton";
import { useCookies } from "react-cookie";
import { fetch, fetchOne, fetchResourceTemplates } from "../utils/OmekaS";
import { connect } from "react-redux";
import { svg, text } from "d3";
import { Slider, Grid, Typography, makeStyles } from "@material-ui/core";
import * as d3Legend from "d3-svg-legend";

const NetworkView = () => {
  const [cookies] = useCookies(["userInfo"]);

  const height = 1000;
  const width = 1500;

  let onNodeKeys = [];

  const d3Container = useRef(null);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const [resourceTemplateProperties, setResourceTemplateProperties] = useState(
    {}
  );

  const [simulation, setSimulation] = useState(null);
  const [nodeData, setNodeData] = useState([]);
  const [linkData, setLinkData] = useState([]);
  const [textElements, setTextElements] = useState([]);

  const [g, setG] = useState(null);
  const [node, setNode] = useState(null);
  const [link, setLink] = useState(null);

  // Initialize simulation
  useEffect(() => {
    console.log("Initializing simulation");

    const svg = d3.select(d3Container.current);
    setG(svg.append("g"));

    setSimulation(d3.forceSimulation());


    const tickActions = () => {
      if (node !== null) {
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        if (textElements !== null) {
          textElements
            .attr("x", (node) => node["x"] + 10)
            .attr("y", (node) => node["y"] + 4);
        }
      }

      if (link !== null) {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      }
    };

    if (nodeData.length > 0) {
      simulation
      .nodes(nodeData)
      .force(
        "link",
        d3.forceLink(linkData).id((d) => d["o:id"])
      )
      .force("center_force", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", tickActions);
    }
  }, [node]);

  // Update nodes and links
  useEffect(() => {
    if (simulation === null) {
      return;
    }
    console.log("Updating states");

    setLink(
      g
        .attr("class", "links")
        .selectAll("line")
        .data(linkData)
        .enter()
        .append("line")
        .style("visibility", "visible")
        .attr("stroke-width", 1)
        .attr("stroke", "#999")
        .attr("stroke-opacity", 1)

    );

    setNode(
      g
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodeData)
        .enter()
        .append("circle")
        .attr("r", (d) => 10)
        .attr("fill", (d) => color(d["@type"][1]))
        // .on("mouseover", function (d, i) {
        //   link
        //     .filter(
        //       (item) =>
        //         i["o:id"] != item.source["o:id"] && i["o:id"] != item.target["o:id"]
        //     )
        //     .style("visibility", "hidden");
        //   var connectedLinks = link
        //     .filter(
        //       (item) =>
        //         i["o:id"] === item.source["o:id"] ||
        //         i["o:id"] === item.target["o:id"]
        //     )
        //     ["_groups"][0].map((item) => [
        //       item["__data__"].source["o:id"],
        //       item["__data__"].target["o:id"],
        //     ])
        //     .flat()
        //   if(node !== null) {
        //   node
        //     .filter(
        //       (item) =>
        //         connectedLinks.indexOf(item["o:id"]) === -1 &&
        //         item["o:id"] !== i["o:id"]
        //     )
        //     .style("visibility", "hidden");
        // } 
        //  }) 
        .on("dblclick", function (d, i) {
          // if shifting select the node, else display modal
          console.log(i);
          let [r, g, b, _opacity] = d3.select(this).style("fill").split(", ");
          r = r.substring(r.indexOf("(") + 1);
          if (b[b.length - 1] === ")") {
            b = b.substring(0, b.length - 1);
          }

          if (onNodeKeys.includes(i.key)) {
            onNodeKeys = onNodeKeys.filter((node) => node !== i.key);
            d3.select(this).style(
              "fill",
              "rgba(" + r + ", " + g + ", " + b + ", 1)"
            );
          } else {
            onNodeKeys.push(i.key);
            d3.select(this).style(
              "fill",
              "rgba(" + r + ", " + g + ", " + b + ", 0.4)"
            );
          }
        })
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
    );

    setTextElements(
      g
        .selectAll("text")
        .data(nodeData)
        .enter()
        .append("text")
        .text((node) =>
          node["o:title"]
            ? node["o:title"].length > 20
              ? node["o:title"].substring(0, 20) + "..."
              : node["o:title"]
            : ""
        )
        .attr("font-size", 12)
        .attr("font-family", "Nunito")
        .attr("fill", "#555")
        .attr("x", (node) => node.x + 40 + 3 * node.r)
        .attr("y", (node) => node.y + 10 + node.r)
        .style("opacity", 1)
    );

    function dragstarted() {
      simulation.tick();
      d3.select(this).raise();
      d3.select(this).attr("stroke", "black");
      g.attr("cursor", "grabbing");
    }

    function dragged(event, d) {
      simulation.restart();
      d3.select(this)
        .attr("cx", (d.x = event.x))
        .attr("cy", (d.y = event.y));
    }

    function dragended() {
      d3.select(this).attr("stroke", null);
      g.attr("cursor", null);
    }


  }, [linkData]);



  // get full data and resource templates (should run once)
  useEffect(() => {
    console.log("fetching...");

    const getResourceTemplateProperties = async () => {
      const templates = await fetchResourceTemplates(cookies.userInfo.host);
      const template2properties = await Promise.all(
        templates.map(async (template) => {
          const properties = await Promise.all(
            template["o:resource_template_property"].map(
              async (property) =>
                await fetchOne(
                  cookies.userInfo.host,
                  "properties",
                  property["o:property"]["o:id"]
                )
            )
          );

          return [template["o:id"], properties];
        })
      );

      setResourceTemplateProperties(Object.fromEntries(template2properties));
    };

    const getData = async () => {
      const res = await fetch(cookies.userInfo.host, "items", -1, {}, 0, 200);
      setNodeData(res);
    };

    getResourceTemplateProperties();
    getData();
  }, [cookies]);

  useEffect(() => {
    if (nodeData.length === 0) return;
    const ids = nodeData.map((item) => item["o:id"]);
    console.log("Links created");

    setLinkData(nodeData.flatMap((node) => {
      const isPartOf = node["dcterms:isPartOf"] ?? [];
      const hasPart = node["dcterms:hasPart"] ?? [];
      const isReferencedBy = node["dcterms:isReferencedBy"] ?? [];
      const references = node["dcterms:references"] ?? [];

      return isPartOf
        .concat(
          hasPart.map((item) => ({
            source: node["o:id"],
            target: item["value_resource_id"],
          }))
        )
        .concat(
          isReferencedBy.map((item) => ({
            source: node["o:id"],
            target: item["value_resource_id"],
          }))
        )
        .concat(
          references.map((item) => ({
            source: node["o:id"],
            target: item["value_resource_id"],
          }))
        )
        .filter(
          (pair) => ids.includes(pair.source) && ids.includes(pair.target)
        );
    }));
  }, [nodeData]);

  const resetNodes = () => {};
  //const onNodeKeys = () => {};

  return (
    <div>
      <Button onClick={resetNodes}>Reset Nodes</Button>
      <AddNoteButton targets={onNodeKeys} />
      <svg
        className="d3-component"
        width={width}
        height={height}
        style={{ backgroundColor: "white" }}
        ref={d3Container}
      ></svg>
    </div>
  );
};

export default NetworkView;
