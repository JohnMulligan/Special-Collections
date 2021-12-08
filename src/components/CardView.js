import React, {useState} from "react";
import { connect } from "react-redux";

import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Chip } from 'primereact/chip';
import { Toolbar } from 'primereact/toolbar';

import AutoMultiValueField from "./AutoMultiValueField";
import { makeGenericItem } from "./AutoMultiValueField";
import UniversalViewer from "./UniversalViewer";

import { fetchOne, patchResourceItem } from "../utils/OmekaS";
import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/CardView.css';

const CardView = (props) => {
    const { cardData, onCardSave } = props;

    const [singleItemMode, setSingleItemMode] = useState('view');
    const [editCardData, setEditCardData] = useState(cardData);

    const viewModeBtn = (
        <Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-eye" onClick={() => { setSingleItemMode('view'); }} />
    );

    const editModeBtn = (
        <Button key="edit-mode" label="Edit Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-pencil" onClick={() => { setSingleItemMode('edit'); }} />
    );

    const saveBtn = (
        <Button key="save-btn" label="Save" className="p-button-sm p-button-raised p-button-success p-mr-2" icon="pi pi-save" onClick={() => { onEditorSaveData(); }} />
    );

    const cancelBtn = (
        <Button key="cancel-btn" label="Cancel" className="p-button-sm p-button-raised p-button-text p-mr-2" icon="pi pi-times" onClick={() => { onEditorCancel(); }} />
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
                if(props.editModeEnabled && !!onCardSave) {
                    buttons.push(editModeBtn);
                }
            break;
            
            case 'edit':
            break;

            default:
            break;
        }

        return buttons;
    }

    const viewTemplate = (property) => {
        if (editCardData[property['o:label']]) {
            let itemTemplate = props.getCellTemplate(editCardData[property['o:label']], property['o:label'], 'accordion', props.showRelatedItens);
            if (typeof(itemTemplate) === 'string' || ((editCardData[property['o:label']] instanceof Array) && typeof(editCardData[property['o:label']][0]) === 'string')) {
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
                    <div className="card-field p-col-12 p-p-3">
                        <div className="p-grid">
                            <span className="p-col-12">
                                {property['o:label']}
                            </span>
                            <div className="p-col-12">
                                {itemTemplate}
                            </div>
                        </div>
                    </div>
                );
            }
        }
        return null;
    }

    const editorTemplate = (property) => {
        let fieldIsTitle = (property['o:label'] === 'Title' || property['o:label'] === 'name') ? true : false;
        let fieldIsRelation = props.propertyIsRelation(property);

        let value = editCardData[property['o:label']] || "";

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
        } else {
            return null;
        }
    }

    const onEditorValueChange = (propertyLabel, value) => {
        setEditCardData({
            ...editCardData,
            [propertyLabel]: value
        });
    }

    const onEditorCancel = () => {
        setEditCardData(cardData);
        
        props.showToast('warn', 'Warning', 'Item changes not saved');

        setSingleItemMode('view');
    }

    const onEditorSaveData = () => {
        onCardSave(editCardData);

        setSingleItemMode('view');
    }

    if (!!editCardData) {
        let cardViewTitle = null;
        let universalViewer = null;
        if (editCardData['hasMedia']) {
            universalViewer = (
                <div className="p-col-6">
                    <UniversalViewer manifest={"/iiif/3/" + editCardData['id'] + "/manifest"}/>
                </div>
            )
        }

        let cardViewItems = props.properties.map((property, i) => {
            if(singleItemMode == 'view') {
                if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
                    cardViewTitle = editCardData[property['o:label']];
                } else if (editCardData[property['o:label']]) {
                    return viewTemplate(property);
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
                                <div className="card-title p-text-nowrap p-text-truncate" title={cardViewTitle}>
                                    {cardViewTitle}
                                </div>
                                <div className="card-fields-div p-grid p-mt-2">
                                    {cardViewItems}
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
