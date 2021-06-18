import React from "react";
import { connect } from "react-redux";

import { Button } from 'primereact/button';

import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/CardView.css';

const CardView = (props) => {
  if (props.cardData !== undefined) {
      let dialogCardViewTitle = null;
      let dialogCardViewItems = props.properties.map((property, i) => {
          if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
              dialogCardViewTitle = props.cardData[property['o:label']];
          } else if (props.cardData[property['o:label']]) {
              let itemTemplate = props.getCellTemplate(props.cardData[property['o:label']], property['o:label'], 'accordion', props.showRelatedItens);
              if (typeof(itemTemplate) === 'string') {
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
      });

      return (
          <div className={props.cardClassName}>
              <div className="card-grid card">
                  <div className="card-grid-content">
                      <div className="card-image">
                          {
                              props.cardData['thumbnail_url']
                              ? <img src={props.cardData['thumbnail_url']} title={dialogCardViewTitle} alt={dialogCardViewTitle} onError={(e) => e.target.src=PlaceHolder} />
                              : <img src={PlaceHolder} title={dialogCardViewTitle} alt={dialogCardViewTitle} />
                          }
                      </div>
                      <div className="card-title p-text-nowrap p-text-truncate" title={dialogCardViewTitle}>{dialogCardViewTitle}</div>
                      <div className="card-fields-div">
                        {dialogCardViewItems}
                      </div>
                  </div>
                  <div className="card-grid-bottom">
                      <Button
                          className="p-button-sm p-button-raised p-button-text"
                          icon="pi pi-eye"
                          label="View Details"
                          onClick={() => window.open(PATH_PREFIX + "/items/" + props.cardData['id'], "_blank")}>
                      </Button>
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
