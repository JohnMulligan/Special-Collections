import React, {useState} from "react";
import { connect } from "react-redux";

import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toolbar } from 'primereact/toolbar';

import AutoMultiValueField from "./AutoMultiValueField";
import { makeGenericItem } from "./AutoMultiValueField";
import UniversalViewer from "./UniversalViewer";

import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/CardView.css';

const CardView = (props) => {
    const [singleItemMode, setSingleItemMode] = useState('view');
    const [cardData, setCardData] = useState(props.cardData);

    const viewModeBtn = (
        <Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-eye" onClick={() => { setSingleItemMode('view'); }} />
    );

    const editModeBtn = (
        <Button key="edit-mode" label="Edit Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-pencil" onClick={() => { setSingleItemMode('edit'); }} />
    );

    const saveBtn = (
        <Button key="save-btn" label="Save" className="p-button-sm p-button-raised p-button-success p-mr-2" icon="pi pi-save" onClick={() => { console.log('save data'); }} />
    );

    const cancelBtn = (
        <Button key="cancel-btn" label="Cancel" className="p-button-sm p-button-raised p-button-text p-mr-2" icon="pi pi-times" onClick={() => { setSingleItemMode('view'); }} />
    );

    const leftToolbarItems = () => {
        let buttons = [];
        switch (singleItemMode) {
            case 'view': 
            break;
            case 'edit':
                buttons.push(saveBtn);
                buttons.push(cancelBtn);
            break;
            default:
            break;
        }

        return buttons;
    }

    const rightToolbarItems = () => {
        let buttons = [];
        switch (singleItemMode) {
            case 'view':
                if(props.editModeEnabled) {
                    buttons.push(editModeBtn);
                } 
            break;
            case 'edit':
                buttons.push(viewModeBtn);
            break;
            default:
            break;
        }

        return buttons;
    }

    const editorTemplate = (property) => {
        let fieldIsTitle = (property['o:label'] === 'Title' || property['o:label'] === 'name') ? true : false;
        let fieldIsRelation = props.propertyIsRelation(property);

        let value = cardData[property['o:label']] ? cardData[property['o:label']] : "";

        if (!fieldIsRelation) {
            if (property['o:data_type'].length > 0 && property['o:data_type'].includes('numeric:timestamp')) {
                return (
                    <div className="p-field p-col-6 p-p-3">
                        <span className="p-float-label p-text-bold p-mb-3">
                            <label htmlFor={property['o:label']}>{property['o:label']}</label>
                        </span>
                        <InputNumber
                            value={value ? parseInt(value) : ""}
                            onChange={(e) => onEditorValueChange(property['o:label'], e.value)}
                            useGrouping={false}
                            showButtons
                            buttonLayout="vertical"
                            style={{width: '75px'}}
                        />
                    </div>
                );
            } else {
                if (!Array.isArray(value)) {
                    value = [value];
                }
                value = value.map(makeGenericItem);

                return (
                    <div className={fieldIsTitle ? 'p-field p-col-12 p-p-3' : 'p-field p-col-6 p-p-3'}>
                        <span className="p-float-label p-text-bold p-mb-3">
                            <label htmlFor={property['o:label']}>{property['o:label']}</label>
                        </span>
                        <AutoMultiValueField
                            values={value}
                            // TO DO - Change item.text to accept 'link'
                            onChange={(value) => onEditorValueChange(property['o:label'], value.map(item => item.text))} 
                        />
                    </div>
                );
            }
        } else
        return null;

    }

    const onEditorValueChange = (propertyLabel, value) => {
        cardData[propertyLabel] = value;
    }

    if (cardData !== undefined) {
        let dialogCardViewTitle = null;
        let universalViewer = null;
        if (cardData['hasMedia']) {
            universalViewer = (
                <div className="p-col-6">
                    <UniversalViewer manifest={"/iiif/3/" + cardData['id'] + "/manifest"}/>
                </div>
            )
        }

        let dialogCardViewItems = props.properties.map((property, i) => {
            if(singleItemMode == 'view') {
                if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
                    dialogCardViewTitle = cardData[property['o:label']];
                } else if (cardData[property['o:label']]) {
                    let itemTemplate = props.getCellTemplate(cardData[property['o:label']], property['o:label'], 'accordion', props.showRelatedItens);
                    if (typeof(itemTemplate) === 'string' || ((cardData[property['o:label']] instanceof Array) && typeof(cardData[property['o:label']][0]) === 'string')) {
                        return (
                            <div className="card-field p-col-6 p-p-3">
                                <span className="card-field-title">
                                    {property['o:label']}
                                </span>
                                {itemTemplate}
                            </div>
                        );
                    } else if (itemTemplate) {
                        return (
                        <div className="card-field p-col-6 p-p-3">
                            {itemTemplate}
                        </div>
                        );
                    }
                }
                return null;
            } else {
                return editorTemplate(property);
            }
        });

        return (
            <div className={props.cardClassName}>
                <div className="card-grid card">
                    <div className="card-grid-content">
                        <div className="p-grid">
                            {universalViewer}
                            <div className={universalViewer ? 'p-col-6' : 'p-col-12'}>
                                <Toolbar
                                    left={leftToolbarItems}
                                    right={rightToolbarItems}
                                />
                                <div className="card-title p-text-nowrap p-text-truncate" title={dialogCardViewTitle}>
                                    {dialogCardViewTitle}
                                </div>
                                <div className="card-fields-div p-grid p-mt-2">
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
