import React, { useEffect, useState } from "react";

import { Dropdown } from 'primereact/dropdown';

import { connect } from "react-redux";

import { clearQuery, setQuery } from "../redux/actions";

import { fetchTemplates } from "../utils/OmekaS";

import Axios from "axios";
import { authGet } from "../utils/Utils";

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

const TemplateSelector = (props) => {
    const [options, setOptions] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
  
    // May be able to initially define availableProperties and options?
    const defaultTemplate = {'template': 'Source', 'id': 6}; // Default is "Source"

    const onTemplateChange = async (e) => {
        const templateSelected = (e === undefined) ? defaultTemplate : e.value;

        setSelectedTemplate(templateSelected);
        props.setActiveTemplate(templateSelected);

        const template = props.templates.filter(
            (template) => template["o:id"] === templateSelected['id']
        )[0];

        if (template) {
            const propertiesDetailsRequests = template["o:resource_template_property"].map((property) => {
                return authGet(property["o:property"]["@id"]);
            });

            const propertiesDetailsResults = await Axios.all(propertiesDetailsRequests);
            const properties = propertiesDetailsResults.map((result, key) => {
                return {
                  ...template["o:resource_template_property"][key],
                  ...result.data
                };
            });

            props.setAvailableProperties(properties);
            props.clearQuery("items");

            const search = {};
            search["resource_class_id"] = template["o:resource_class"]["o:id"];
            props.setQuery("items", search, 99999);
        }
    }

  useEffect(() => {
      // get templates options on load
      const initComponent = async () => {
          const templates = await fetchTemplates();
          props.setTemplates(templates);

          setOptions(
            templates.map((template) => {
              let option = {
                template: template['o:label'],
                id: template['o:id'],
              };
              return option;
            })
          );
        
          // onTemplateChange();
      };

      initComponent();

  }, []);

  return (
      <div className="dropdown-component p-w-100">
          <div className="card">
              <Dropdown
                  value={selectedTemplate}
                  options={options}
                  disabled={!(props.screenMode === 'view')}
                  onChange={onTemplateChange}
                  optionLabel="template"
                  placeholder="Select a template"
                  className="p-w-100"
              />
          </div>
      </div>
  );
};

export default connect(mapStateToProps, { clearQuery, setQuery })(
    TemplateSelector
);