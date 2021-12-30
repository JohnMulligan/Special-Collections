import React, {useState, useEffect} from "react";
import { connect } from "react-redux";

import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Toolbar } from 'primereact/toolbar';

import { propertyIsTitle, propertyIsNumericTimestamp, propertyIsRelation } from "../containers/Home";

import AutoMultiValueField, { makeGenericItem, makeNumberItem, genericEditableItemType } from "../components/AutoMultiValueField";
import { makeLinkItem, linkableItemType } from "../components/OmekaLinking";
import UniversalViewer from "../components/UniversalViewer";

import { PlaceHolder } from "../utils/Utils";

import '../assets/css/CardView.css';

const CardView = (props) => {
    const { cardData, onCardSave } = props;

    const [singleItemMode, setSingleItemMode] = useState('view');
    const [editCardData, setEditCardData] = useState(cardData);

    useEffect(() => {
        setEditCardData(cardData);
    }, [cardData]);

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

    const toolbarTemplate = () => {
        let leftToolbarItems = [];
        let rightToolbarItems = [];

        switch (singleItemMode) {
            case 'view':
                if(props.editModeEnabled && !!onCardSave) {
                    rightToolbarItems.push(editModeBtn);
                }
            break;

            case 'edit':
                leftToolbarItems.push(saveBtn);
                leftToolbarItems.push(cancelBtn);
            break;
        }

        if (leftToolbarItems.length > 0 || rightToolbarItems.length > 0) {
            return (
                <Toolbar
                    left={leftToolbarItems}
                    right={rightToolbarItems}
                />
            );
        } else {
            return null;
        }
    }

    const cardThumbnailTemplate = () => {
        if (cardData['thumbnail_url']) {
            return (
                <React.Fragment>
                    <img
                        src={cardData['thumbnail_url']}
                        class="border-default"
                        onError={(e) => e.target.src=PlaceHolder}
                    />
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    const viewTemplate = (property) => {
        if (editCardData[property['o:label']]) {
            let itemTemplate = props.getCellTemplate(editCardData[property['o:label']], property['o:label'], 'accordion', props.showRelatedItems);
            if (typeof(itemTemplate) === 'string' || ((editCardData[property['o:label']] instanceof Array) && typeof(editCardData[property['o:label']][0]) === 'string')) {
                return (
                    <div className={props.fieldViewClassName || 'card-field p-col-6 p-p-2'}>
                        <span className="card-field-title">
                            {property['o:label']}
                        </span>
                        {itemTemplate}
                    </div>
                );
            } else if (itemTemplate) {
                return (
                    <div className={props.fieldViewClassName || 'card-field p-col-12 p-p-2'}>
                        <div className="p-grid">
                            <div className="p-col-12">
                                <span className="card-field-title">
                                    {property['o:label']}
                                </span>
                            </div>
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
        let value = editCardData[property['o:label']] || "";

        if (!propertyIsRelation(property)) {
            if (propertyIsNumericTimestamp(property)) {
                return (
                    <div className="p-field p-col-6 p-p-2">
                        <span className="p-float-label p-text-bold p-mb-3">
                            <label htmlFor={property['o:label']}>{property['o:label']}</label>
                        </span>
                        <InputNumber
                            value={value && value.length === 1 ? parseInt(value[0].text) : ""}
                            onChange={(e) => onEditorValueChange(property['o:label'], [makeNumberItem(e.value)])}
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
                
                const editTypesAllowed = [genericEditableItemType];
                if (property['o:data_type'].includes('resource:item')) {
                    editTypesAllowed.push(linkableItemType(props, (linkItem) => onRowLinkItem(property['o:label'], linkItem, value)));
                }

                return (
                    <div className={propertyIsTitle(property) ? 'p-field p-col-12 p-p-2' : 'p-field p-col-6 p-p-2'}>
                        <span className="p-float-label p-text-bold p-mb-3">
                            <label htmlFor={property['o:label']}>{property['o:label']}</label>
                        </span>
                        <AutoMultiValueField
                            values={value}
                            fieldClassName={props.fieldEditorClassName}
                            onChange={(value) => onEditorValueChange(property['o:label'], value)} 
                            itemTypesAllowed={editTypesAllowed}
                        />
                    </div>
                );
            }
        } else {
            return null;
        }
    }

    const onRowLinkItem = (propertyLabel, linkItem, arrayItems) => {
        const changed = arrayItems.slice();
        changed.push(makeLinkItem(linkItem));

        onEditorValueChange(propertyLabel, changed);
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
        let thumbnailDiv = null;

        if (editCardData['hasMedia']) {
            universalViewer = (
                <div className="p-col-6">
                    <UniversalViewer manifest={"/iiif/3/" + editCardData['id'] + "/manifest"}/>
                </div>
            )
        } else {
            thumbnailDiv = (
                <div className="card-image-div">
                    {cardThumbnailTemplate()}
                </div>
            );
        }

        let cardViewItems = props.properties.map((property, i) => {
            if(singleItemMode == 'view') {
                if (propertyIsTitle(property)) {
                    if (typeof(editCardData[property['o:label']]) === 'string') {
                        cardViewTitle = editCardData[property['o:label']];
                    } else if (!!editCardData[property['o:label']][0] && !!editCardData[property['o:label']][0]['text']) {
                        cardViewTitle = editCardData[property['o:label']][0]['text'] || "[Untitled]";
                    }
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
                                {toolbarTemplate()}
                                {thumbnailDiv}
                                <div className="card-title p-text-nowrap p-text-truncate" title={cardViewTitle}>
                                    {cardViewTitle}
                                </div>
                                <div className="card-fields-div p-grid p-mt-1">
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
    ...props,
    query: state.query,
  };
};

export default connect(mapStateToProps)(CardView);
