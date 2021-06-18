import React from "react";
import { Tabs } from "antd";

import {
  TableOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import TableView from "../components/TableView";
import CardViewLegacy from "../components/CardViewLegacy";

const { TabPane } = Tabs;

const Visualizer = (props) => {
  
  return (
    <Tabs defaultActiveKey={1} type="card">
      <TabPane
        tab={
          <span>
            <TableOutlined />
            Table
          </span>
        }
        key={1}
      >
        <TableView activeProperties={props.activeProperties} />
      </TabPane>
      <TabPane
        tab={
          <span>
            <VideoCameraAddOutlined />
            Card
          </span>
        }
        key={2}
      >
        <CardViewLegacy activeProperties={props.activeProperties} />
      </TabPane>
    </Tabs>
  );
};

export default Visualizer;
