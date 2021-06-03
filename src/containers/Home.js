import React, { useState } from "react";
import { Row, Col } from "antd";

import TemplateSelector from "../components/TemplateSelector";
import PropertySelector from "../components/PropertySelector";

import DataTableContainer from "../containers/DataTable";

const Home = (props) => {
  const [screenMode, setScreenMode] = useState('view');
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [availableProperties, setAvailableProperties] = useState();
  const [activeProperties, setActiveProperties] = useState([]);

  return (
    <>
      <Row className="p-col-12">
        <Col className="p-col-2">
          <TemplateSelector
            screenMode={screenMode}
            templates={templates}
            setTemplates={setTemplates}
            setActiveTemplate={setActiveTemplate}
            setAvailableProperties={setAvailableProperties}
          />
        </Col>
        <Col className="p-col-10">
          <PropertySelector
            screenMode={screenMode}
            availableProperties={availableProperties}
            setActiveProperties={setActiveProperties}
          />
        </Col>
      </Row>

      <Row className="p-col-12">
        <Col>
          <DataTableContainer
            screenMode={screenMode}
            setScreenMode={setScreenMode}
            templates={templates}
            availableProperties={availableProperties}
            activeTemplate={activeTemplate}
            activeProperties={activeProperties}
          />
        </Col>
      </Row>
    </>
  );
};

export default Home;
