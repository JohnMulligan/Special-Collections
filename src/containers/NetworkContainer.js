import React from "react";
import { Layout } from "antd";
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
          <NetworkView />
        </Content>
      </Layout>
    </Layout>
  );
};

export default NetworkContainer;
