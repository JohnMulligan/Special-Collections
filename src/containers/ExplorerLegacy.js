import React, { useState } from "react";
import { Row, Col } from "antd";

import ItemSetSelector from "../components/ItemSetSelector";
import TemplateSelectorLegacy from "../components/TemplateSelectorLegacy";
import PropertySelectorLegacy from "../components/PropertySelectorLegacy";
import QueryBuilder from "../components/QueryBuilder";
import Visualizer from "./Visualizer";

const ExplorerLegacy = (props) => {
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
          <ItemSetSelector />
          <TemplateSelectorLegacy setAvailableProperties={setAvailableProperties} />
        </Col>
        <Col span={RIGHT_SPAN}>
          <PropertySelectorLegacy
            availableProperties={availableProperties}
            setActiveProperties={setActiveProperties}
          />
        </Col>
      </Row>

      <Row gutter={[HORIZONTAL_GUTTER, VERTICAL_GUTTER]}>
        <Col span={LEFT_SPAN}>
          <QueryBuilder
            activeProperties={activeProperties}
            availableProperties={availableProperties}
          />{" "}
        </Col>
        <Col span={RIGHT_SPAN}>
          <Visualizer activeProperties={activeProperties} />
        </Col>
      </Row>
    </>
  );
};

export default ExplorerLegacy;
