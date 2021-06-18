import React, { useEffect, useState } from "react";
import { Select } from "antd";

import { connect } from "react-redux";

import { clearQuery, setQuery } from "../redux/actions";

import { fetchTemplates } from "../utils/OmekaS";

import Axios from "axios";
import { authGet } from "../utils/Utils";

const { Option } = Select;

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

const TemplateSelectorLegacy = (props) => {
  const defaultId = 6; // Default is "Source"
  // May be able to initially define availableProperties and options?

  const [options, setOptions] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // get templates options on load
    const fetchOptions = async () => {
      const res = await fetchTemplates();
      setTemplates(res);

      setOptions(
        res.map((template) => (
          <Option key={template["o:id"]} value={template["o:id"]}>
            {template["o:label"]}
          </Option>
        ))
      );
    };

    fetchOptions();
  }, []);

  const handleChange = async (value) => {
    const template = templates.filter(
      (template) => template["o:id"] === value
    )[0];

    const requests = template["o:resource_template_property"].map((property) =>
      authGet(property["o:property"]["@id"])
    );

    const res = await Axios.all(requests);
    const properties = res.map((inner) => inner.data);

    props.setAvailableProperties(properties);
    props.clearQuery("items");

    const search = {};
    search["resource_class_id"] = template["o:resource_class"]["o:id"];
    props.setQuery("items", search, 99999);
  };

  useEffect(() => {
    if (templates.length > 0) {
      handleChange(defaultId);
    }
  }, [templates]);

  return (
    <Select
      style={{ width: "100%" }}
      placeholder="Please select template"
      onChange={handleChange}
      defaultValue={defaultId}
    >
      {options}
    </Select>
  );
};

//export default TemplateSelectorLegacy;
export default connect(mapStateToProps, { clearQuery, setQuery })(
  TemplateSelectorLegacy
);
