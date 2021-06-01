import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import { Dropdown } from 'primereact/dropdown';
import '../assets/css/Dropdown.css';

import { connect } from "react-redux";

import { clearQuery, setQuery } from "../redux/actions";

import { fetchTemplates } from "../utils/OmekaS";

import Axios from "axios";

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

const TemplateSelector = (props) => {
  const [cookies] = useCookies(["userInfo"]);
  const [options, setOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // May be able to initially define availableProperties and options?
  const defaultTemplate = {'template': 'Source', 'id': 6}; // Default is "Source"

  const onTemplateChange = async (e) => {
      props.setScreenMode('view');

      const templateSelected = (e === undefined) ? defaultTemplate : e.value;

      setSelectedTemplate(templateSelected);
      props.setActiveTemplate(templateSelected);

      const template = props.templates.filter(
        (template) => template["o:id"] === templateSelected['id']
      )[0];

      if (template) {
        const requests = template["o:resource_template_property"].map((property) =>
          Axios.get(property["o:property"]["@id"])
        );

        const res = await Axios.all(requests);
        const properties = res.map((inner) => inner.data);

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
        const res = await fetchTemplates(cookies.userInfo.host);
        props.setTemplates(res);

        setOptions(
          res.map((template) => {
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

  }, [cookies]);

  return (
      <div className="dropdown-component">
          <div className="card">
              <Dropdown value={selectedTemplate} options={options} onChange={onTemplateChange} optionLabel="template" placeholder="Select a template" />
          </div>
      </div>
  );
};

export default connect(mapStateToProps, { clearQuery, setQuery })(
    TemplateSelector
);