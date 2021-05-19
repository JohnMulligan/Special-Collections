import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { Layout, Row, Col, Divider } from "antd";

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import TemplateSelector from "../components/TemplateSelector";
import PropertySelector from "../components/PropertySelector";
import PropertySelectorLegacy from "../components/PropertySelectorLegacy";

import DataTableContainer from "../containers/DataTable";

import Visualizer from "./Visualizer";

const Explorer = (props) => {
  const [cookies] = useCookies(["userInfo"]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [availableProperties, setAvailableProperties] = useState();
  const [activeProperties, setActiveProperties] = useState([]);

  const HORIZONTAL_GUTTER = 48;
  const VERTICAL_GUTTER = 8;
  const LEFT_SPAN = 4;
  const RIGHT_SPAN = 20;

  return (
    <>
      <Row gutter={[HORIZONTAL_GUTTER, VERTICAL_GUTTER]}>
        <Col span={LEFT_SPAN}>
          <TemplateSelector setActiveTemplate={setActiveTemplate} setAvailableProperties={setAvailableProperties} />
        </Col>
        <Col span={10}>
          <PropertySelector
            availableProperties={availableProperties}
            setActiveProperties={setActiveProperties}
          />
        </Col>
      </Row>

      <Row gutter={[HORIZONTAL_GUTTER, VERTICAL_GUTTER]}>
        <Col span={LEFT_SPAN + RIGHT_SPAN}>
          <DataTableContainer activeTemplate={activeTemplate} activeProperties={activeProperties} />
        </Col>
      </Row>
    </>
  );
};

export default Explorer;
