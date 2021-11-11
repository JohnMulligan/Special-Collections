import React, {useState} from "react";
import { connect } from "react-redux";

import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/CardView.css';
import UniversalViewer from "./UniversalViewer";

const CardView = (props) => {
  const [singleItemMode, setSingleItemMode] = useState('view');

  if (props.cardData !== undefined) {
      let dialogCardViewTitle = null;
      let universalViewer = null;
      if (props.cardData['hasMedia']) {
        universalViewer = (
          <div className="p-col-6">
            <UniversalViewer manifest={"/iiif/3/" + props.cardData['id'] + "/manifest"}/>
          </div>
        )
      }
      let dialogCardViewItems = props.properties.map((property, i) => {
        if(singleItemMode == 'view') {
          if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
              dialogCardViewTitle = props.cardData[property['o:label']];
          } else if (props.cardData[property['o:label']]) {
              let itemTemplate = props.getCellTemplate(props.cardData[property['o:label']], property['o:label'], 'accordion', props.showRelatedItens);
              console.log();
              if (typeof(itemTemplate) === 'string' || ((props.cardData[property['o:label']] instanceof Array) && typeof(props.cardData[property['o:label']][0]) === 'string')) {
                  return (
                      <div className="card-field">
                          <span className="card-field-title">{property['o:label'] + ':'}</span> {itemTemplate}
                      </div>
                  );
              } else if (itemTemplate) {
                  return (
                      <div className="card-field">
                          {itemTemplate}
                      </div>
                  );
              }
          }
          return null;
        } else {
          return (
            <div className="p-field p-col-12 p-md-4">
              <span className="p-float-label">
                  <InputTextarea
                    id={property['o:label']}
                    value={props.cardData[property['o:label']]}
                      rows={5}
                      cols={50}
                  />
                  <label htmlFor={property['o:label']}>{property['o:label']}</label>
              </span>
            </div>
          )
        }
      });

      return (
          <div className={props.cardClassName}>
              <div className="card-grid card">
                  <div className="card-grid-content">
                    <div className="p-grid">
                        {universalViewer}
                        <div className="p-col-6">
                          <Button key="edit-mode" label="Edit Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" onClick={() => { setSingleItemMode('edit'); }} />
                          <Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" onClick={() => { setSingleItemMode('view'); }} />
                          <div className="card-title p-text-nowrap p-text-truncate" title={dialogCardViewTitle}>{dialogCardViewTitle}</div>
                          <div className="card-fields-div">
                            {dialogCardViewItems}
                          </div>
                        </div>
                    </div>
                  </div>
              </div>
          </div>
      );
  } else {
      return null;
  }
};

const mapStateToProps = (state, props) => {
  return {
    ...props
  };
};

export default connect(mapStateToProps)(CardView);
