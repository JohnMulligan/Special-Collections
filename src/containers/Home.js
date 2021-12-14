import React, { useState, useRef } from 'react';

import Axios from "axios";

import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { DataView } from 'primereact/dataview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';

import TemplateSelector from "../components/TemplateSelector";
import PropertySelector from "../components/PropertySelector";

import DataTableContainer from "../containers/DataTable";
import DataViewCardContainer from "../containers/DataViewCard";

import AutoMultiValueField from "../components/AutoMultiValueField";
import { genericEditableItemType, makeGenericItem, makeNumberItem } from "../components/AutoMultiValueField";
import { linkableItemType, makeLinkItem } from '../components/OmekaLinking'

import CardView from "../components/CardView";

import { fetchOne } from "../utils/OmekaS";
import { authGet } from "../utils/Utils";

const textMaxLength = 150;

const Home = (props) => {
    const [screenMode, setScreenMode] = useState('view');
    const [viewMode, setViewMode] = useState('table');

    const toast = useRef(null);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [dialogHeader, setDialogHeader] = useState(null);
    const [dialogContent, setDialogContent] = useState(null);

    const overlayPanel = useRef(null);
    const [overlayPanelItems, setOverlayPanelItems] = useState([]);

    const [dataViewCollection, setDataViewCollection] = useState([]);
    const [dataViewLoading, setDataViewLoading] = useState(false);
    const [dataViewFirst, setDataViewFirst] = useState(0);
    const [dataViewTotalRecords, setDataViewTotalRecords] = useState(0);
    const [dataViewProperties, setDataViewProperties] = useState([]);

    const [templates, setTemplates] = useState([]);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [availableProperties, setAvailableProperties] = useState();
    const [activeProperties, setActiveProperties] = useState([]);

    const toggleViewMode = (toggleToMode) => {
        setViewMode(toggleToMode);
    }

    const showToast = (severityClass, summary, detail) => {
        toast.current.show({
            severity: severityClass,
            summary: summary,
            detail: detail,
            life: 5000
        });
    }

    const openDialog = (header, content) => {
        setDisplayDialog(true);
        setDialogContent(content);
        setDialogHeader(header);
    }

    const closeDialog = () => {
        setDisplayDialog(false);
        setDialogContent(null);
    }

    const openOverlayPanel = (event, items) => {
        overlayPanel.current.toggle(event);

        setDataViewFirst(0);
        setDataViewCollection([]);
        setOverlayPanelItems(items);
        setDataViewTotalRecords(items.length);

        loadLazyDataViewData(items[dataViewFirst]);
    }

    const onDataViewPage = (event) => {
        setDataViewLoading(true);
        const startIndex = event.first;
        setDataViewFirst(startIndex);
        loadLazyDataViewData(overlayPanelItems[startIndex]);
    }

    const propertyIsRelation = (property) => {
        return property['o:local_name'] && property['o:local_name'] === 'hasPart';
    }

    const loadLazyDataViewData = async (item) => {
        setDataViewLoading(true);
        fetchOne(
            item['value_resource_name'],
            item['value_resource_id']
        ).then(data => {
            let resourceTemplate = templates.filter(
                (template) => template['o:resource_class']['o:id'] === data['o:resource_class']['o:id']
            )[0];

            const requests = resourceTemplate["o:resource_template_property"].map((property) =>
                authGet(property["o:property"]["@id"])
            );

            Axios.all(requests).then(res => {
                let properties = res.map((inner) => inner.data);
                setDataViewProperties(properties);
                setDataViewCollection([parseItem(data, properties)]);
                setDataViewLoading(false);
            });
        });
    }

    const parseItem = (row, properties) => {
        if (properties && properties.length > 0) {
            let item = {'id': row['o:id'], 'hasMedia': false};
            for (const property of properties) {
                let label = property['o:label'];
                let value = [];

                if (row[property['o:term']] !== undefined && row[property['o:term']].length > 0) {
                    for (const subItem of row[property['o:term']]) {
                        let vtype = subItem.type;
                        if (vtype === 'literal') {
                            value.push(makeGenericItem(subItem['@value'] || ""));
                        } else if (vtype === 'numeric:timestamp') {
                            value.push(makeNumberItem(subItem['@value'] || ""));
                        } else if (vtype === 'resource') {
                            value.push(makeLinkItem({...subItem, 'text': subItem['display_title']}));
                        }
                    }
                }

                item[label] = value;
            }

            if (row['thumbnail_display_urls']['square']) {
                item['thumbnail_url'] = row['thumbnail_display_urls']['square'];
            }

            if (row['o:media'].length > 0) {
                item['hasMedia'] = true;
            }

            return item;
        }
        return [];
    }

    const getDataTableCellTemplate = (cellData, field, longTextOption, showRelatedItens) => {
        if (!cellData) return null;
        if (field === 'Has Part') {
            return relatedItemsButtonTemplate(cellData);
        }
        return (
            <div className="p-d-flex p-ai-center p-flex-wrap">
                <AutoMultiValueField
                    values={cellData}
                    fieldClassName="no-border bg-white p-p-1"
                    readonly={true}
                    itemTypesAllowed={[
                        genericEditableItemType,
                        {...genericEditableItemType, id: 1},
                        {...linkableItemType(props, null), id: 2}]
                    }
                />
            </div>
        );
    }

    const getDataViewCardCellTemplate = (cellData, field, longTextOption, showRelatedItens) => {
        if (!cellData) return null;
        if (cellData instanceof Array) {
            if (showRelatedItens) {
                return relatedItemsButtonTemplate(cellData);
            }
        } else if ((typeof cellData) === 'object') {
            return cellData;
        } else if ((typeof cellData) === 'string') {
            if (cellData.length > textMaxLength) {
                return longTextTemplate(field, cellData, textMaxLength, longTextOption);
            }
        }
        return cellData;
    }

    const relatedItemsButtonTemplate = (items) => {
        return (
            <Button
                icon="pi pi-plus-circle"
                className="p-button-sm p-button-raised p-button-text"
                label={items.length + " related items"}
                onClick={(e) => openOverlayPanel(e, items) }
                aria-haspopup aria-controls="overlay_panel"
            />
      );
    }

    const longTextTemplate = (header, content, maxLength, templateOption) => {
        let template = null;
        switch (templateOption) {
            case 'dialog': 
                template = (
                    <div className="dialog-long-text-details">
                        <span>{content.substring(0, maxLength) + '...'}</span>
                        <Button
                            className="p-button-link p-py-0"
                            label="View More"
                            onClick={() => { openDialog(header, content);} }
                        />
                    </div>
                );
            break;
            case 'accordion': 
                template = (
                    <Accordion>
                        <AccordionTab header={header}>
                            <p>{content}</p>
                        </AccordionTab>
                    </Accordion>
                );
            break;
            default:
            break;
        }
        return template;
    }

    const dataViewGridTemplate = (rowData, layout) => {
        if (!rowData) {
            return null;
        }

        return cardViewTemplate(rowData, dataViewProperties, false, null);
    }

    const cardViewTemplate = (rowData, properties, showRelatedItens, onCardSave) => {
        return (
            <CardView
                cardData={rowData}
                fieldClassName="border-default bg-white p-p-1"
                cardClassName="p-col-12 fullscreen-card"
                onCardSave={onCardSave}
                availableProperties={availableProperties}
                properties={properties}
                editModeEnabled={true}
                showRelatedItens={showRelatedItens}
                getCellTemplate={getDataTableCellTemplate}
                getNewItem={getNewItem}
                propertyIsRelation={propertyIsRelation}
                showToast={showToast}
            />
        );
    }

    const getNewItem = (property, value) => {
        if (value.itemTypeId === 0) {
            return {
                '@value': value.text,
                'is_public': true,
                'property_id': property['o:id'],
                'property_label': property['o:label'],
                'type': 'literal'
            };
        } else if (value.itemTypeId === 1) {
            return {
                '@value': value.text,
                'is_public': true,
                'property_id': property['o:id'],
                'property_label': property['o:label'],
                'type': 'numeric:timestamp'
            };
        } else if (value.itemTypeId === 2) {
            return {
                'display_title': value['text'],
                'value_resource_id': value['value_resource_id'],
                'is_public': true,
                'property_id': property['o:id'],
                'property_label': property['o:label'],
                'type': 'resource'
            };
        }
    }

    const containerContent = () => {
        if (viewMode === 'table') {
            return (
                <DataTableContainer
                    screenMode={screenMode}
                    setScreenMode={setScreenMode}
                    activeTemplate={activeTemplate}
                    availableProperties={availableProperties}
                    activeProperties={activeProperties}
                    showToast={showToast}
                    openDialog={openDialog}
                    propertyIsRelation={propertyIsRelation}
                    parseItem={parseItem}
                    getCellTemplate={getDataTableCellTemplate}
                    cardViewTemplate={cardViewTemplate}
                    getNewItem={getNewItem}
                />
            );
        } else {
            return (
                <DataViewCardContainer
                    activeTemplate={activeTemplate}
                    availableProperties={availableProperties}
                    activeProperties={activeProperties}
                    showToast={showToast}
                    propertyIsRelation={propertyIsRelation}
                    getCellTemplate={getDataViewCardCellTemplate}
                    getNewItem={getNewItem}
                />
            );
        }
    }

    return (
        <div className="home-container">
            <div className="p-grid p-ai-center p-py-1 p-px-3">
                <div className="p-col-2">
                    <div className="p-d-flex p-jc-end">
                        <TemplateSelector
                            screenMode={screenMode}
                            templates={templates}
                            setTemplates={setTemplates}
                            setActiveTemplate={setActiveTemplate}
                            setAvailableProperties={setAvailableProperties}
                        />
                    </div>
                </div>
                <div className="p-col-8">
                  <PropertySelector
                      screenMode={screenMode}
                      availableProperties={availableProperties}
                      setActiveProperties={setActiveProperties}
                  />
                </div>
                <div className="p-col-2">
                    <div className="p-d-flex p-jc-end">
                        <Button key="view-mode-table" label="Table" className="p-button-sm p-button-raised p-button-text" icon="pi pi-table" disabled={viewMode === 'table'} onClick={() => { toggleViewMode('table'); }} />
                        <Button key="view-mode-card" label="Card" className="p-button-sm p-button-raised p-button-text" icon="pi pi-image" disabled={viewMode === 'card'} onClick={() => { toggleViewMode('card'); }} />
                    </div>
                </div>
                <div className="p-col-12">
                    {containerContent()}
                </div>
            </div>
            <Toast
                ref={toast}
                position="top-left"
            />
            <Dialog
                header={dialogHeader}
                visible={displayDialog}
                maximized
                style={{ width: '50vw' }}
                onHide={closeDialog}
            >
                {dialogContent}
            </Dialog>
            <OverlayPanel ref={overlayPanel} showCloseIcon id="overlay_panel" style={{width: '75vw'}}>
                <DataView
                    value={dataViewCollection}
                    layout="grid"
                    itemTemplate={dataViewGridTemplate}
                    lazy
                    paginator
                    paginatorPosition={'both'}
                    paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    rows={1}
                    totalRecords={dataViewTotalRecords}
                    first={dataViewFirst}
                    onPage={onDataViewPage}
                    loading={dataViewLoading}
                />
            </OverlayPanel>
        </div>
    );
};

export default Home;
