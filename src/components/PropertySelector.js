import React, { useEffect, useState } from "react";

import { MultiSelect } from 'primereact/multiselect';
import '../assets/css/MultiSelect.css';

const PropertySelector = (props) => {
  const [selectedProperties, setSelectedProperties] = useState(null);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState([]);

  const onPropertyChange = async (e) => {
      const propertiesSelected = (e === undefined) ? null : e.value;

      setSelectedProperties(propertiesSelected);

      props.setActiveProperties(propertiesSelected.map((propertySelected) => {
          let property = null;
          props.availableProperties.map((availableProperty) => {
              if (availableProperty['o:label'] === propertySelected['property']) {
                  property = availableProperty;
              }
              return null;
          });
          return property;
      }));
  }

  useEffect(() => {
    if (props.availableProperties) {
      setOptions(
        props.availableProperties.map((property) => {
          let option = {
            property: property['o:label'],
          };
          return option;
        })
      );

      setValue(
        props.availableProperties.map((property) => property["o:label"])
      );
    }
  }, [props.availableProperties]);

  useEffect(() => {
    setSelectedProperties(
      props.availableProperties
        ? props.availableProperties.map((property) => {
            let option = {
              property: property['o:label'],
            };
            return option;
          })
        : []
      );

    props.setActiveProperties(
      props.availableProperties
        ? props.availableProperties.filter((property) =>
            value.includes(property["o:label"])
          )
        : []
    );

    // onPropertyChange();
  }, [props.setActiveProperties, props.availableProperties, value]);

  return (
    <div className="multiselect-component">
        <div className="card">
            <MultiSelect value={selectedProperties} options={options} onChange={onPropertyChange} optionLabel="property" placeholder="Select fields" display="chip" />
        </div>
    </div>    
  );
};

export default PropertySelector;
