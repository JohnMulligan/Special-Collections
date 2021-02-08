import React, { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import { useCookies } from "react-cookie";

const NetworkView = (props) => {
    const [cookies] = useCookies(["userInfo"]);

    return(
        <Table>
        </Table>
    )
}

export default NetworkView