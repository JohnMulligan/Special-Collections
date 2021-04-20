import React from "react";
import { Layout } from "antd";
import NetworkViewClean from "../components/NetworkViewClean";
import NetworkView from "../components/NetworkView";

const { Content } = Layout;

const NetworkContainer = () => {
  return (
    <Layout
      style={{
        background: "#FFF",
      }}
    >
      <Layout style={{ padding: 24 }}>
        <Content>
          <NetworkViewClean />
        </Content>
      </Layout>
    </Layout>
  );
};

export default NetworkContainer;
