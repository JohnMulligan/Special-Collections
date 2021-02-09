import React, { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import * as d3 from "d3";


const NetworkView = (props) => {

    var json = require("../POCdata.json")
    const data = JSON.parse(JSON.stringify(json))


    return(
        <Table>
        </Table>
    )
}

export default NetworkView