import React, { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import { useCookies } from "react-cookie";


const NetworkView = (props) => {
    const [cookies] = useCookies(["userInfo"]);

    const [networkState, setNetworkState] = useState({
        data: [],
        loading: false,

    });

    useEffect(() => {
        const fetchInitial = async () => {
          setNetworkState((state) => ({
            ...state,
            loading: true,
          }));
    
          const data = await fetch(
            cookies.userInfo.host,
            props.query.endpoint,
            props.query.item_set_id,
            props.query.params,
            0,
            10
          );
    
          setNetworkState((state) => ({
            ...state,
            data,
            loading: false,
          }));
        };
    
        fetchInitial();
      }, [props.query, cookies.userInfo.host]);

    return(
        <Table>
        </Table>
    )
}

export default NetworkView