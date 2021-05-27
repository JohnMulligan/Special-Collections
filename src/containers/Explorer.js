import React, { useState } from "react";
import { Row, Col } from "antd";

import TemplateSelector from "../components/TemplateSelector";
import PropertySelector from "../components/PropertySelector";

import DataTableContainer from "../containers/DataTable";

const Explorer = (props) => {
  const [templates, setTemplates] = useState([]);
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
          <TemplateSelector
            templates={templates}
            setTemplates={setTemplates}
            setActiveTemplate={setActiveTemplate}
            setAvailableProperties={setAvailableProperties}
          />
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
          <DataTableContainer
            templates={templates}
            activeTemplate={activeTemplate}
            activeProperties={activeProperties}
          />
        </Col>
      </Row>
    </>
  );
};

export default Explorer;
