import React, { useState } from "react";

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
        <div className="home-container">
            <div className="p-grid p-ai-center p-py-1 p-px-3">
                <div className="p-col-2">
                  <TemplateSelector
                      screenMode={screenMode}
                      templates={templates}
                      setTemplates={setTemplates}
                      setActiveTemplate={setActiveTemplate}
                      setAvailableProperties={setAvailableProperties}
                  />
                </div>
                <div className="p-col-10">
                  <PropertySelector
                      screenMode={screenMode}
                      availableProperties={availableProperties}
                      setActiveProperties={setActiveProperties}
                  />
                </div>

                <div className="p-col-12">
                    <DataTableContainer
                        screenMode={screenMode}
                        setScreenMode={setScreenMode}
                        templates={templates}
                        availableProperties={availableProperties}
                        activeTemplate={activeTemplate}
                        activeProperties={activeProperties}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
