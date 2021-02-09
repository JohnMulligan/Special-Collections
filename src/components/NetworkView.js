import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Space } from "antd";
import * as d3 from "d3";


const NetworkView = (props) => {
    const d3Container = useRef(null);

    // Get dummy data
    var json = require("../POCdata.json")
    // const data = JSON.parse(JSON.stringify(json));
    const data = [12, 5, 6, 6, 9, 10];

    console.log(data);
    
    useEffect(() => {
        const svg = d3.select(d3Container.current);

    const h = 200;

    const update = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => h - 10 * d)
      .attr("width", 65)
      .attr("height", (d, i) => d * 10)
      .attr("fill", "green");
    }, [data]);

    return(
        <svg
            className="d3-component"
            width={400}
            height={200}
            ref={d3Container}
        />
    );
}

export default NetworkView