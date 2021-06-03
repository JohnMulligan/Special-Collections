import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from "react-cookie";
import { connect } from "react-redux";

import $ from 'jquery';
import Axios from "axios";

import { DataTable } from 'primereact/datatable';
import { DataView } from 'primereact/dataview';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Toolbar } from 'primereact/toolbar';

import { fetchItems, fetchOne, patchResourceItem } from "../utils/OmekaS";
import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/DataTable.css';
import '../assets/css/Dialog.css';
import '../assets/css/CardView.css';

const DataTableContainer = (props) => {
    const [cookies] = useCookies(["userInfo"]);

    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [selectButtonMode, setSelectButtonMode] = useState(false);
    const textMaxLength = 150;

    const dt = useRef(null);
    const [collection, setCollection] = useState([]);
    const [totalRecords, setTotalRecords] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [columns, setColumns] = useState([]);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        sortField: 'o:id',
        sortOrder: 1,
        sortDirection: 'asc',
    });

    const [originalRow, setOriginalRow] = useState(null);

    const [displayDialog, setDisplayDialog] = useState(false);
    const [dialogHeader, setDialogHeader] = useState(null);
    const [dialogContent, setDialogContent] = useState(null);

    const toast = useRef(null);

    const overlayPanel = useRef(null);
    const [overlayPanelItems, setOverlayPanelItems] = useState([]);
    const [dataViewCollection, setDataViewCollection] = useState([]);
    const [dataViewLoading, setDataViewLoading] = useState(false);
    const [dataViewFirst, setDataViewFirst] = useState(0);
    const [dataViewTotalRecords, setDataViewTotalRecords] = useState(0);
    const [dataViewProperties, setDataViewProperties] = useState([]);

    useEffect(() => {
        loadLazyData();
    }, [props.activeProperties, lazyParams]);

    const propertyIsRelation = (property) => {
        return property['o:local_name'] && property['o:local_name'] === 'hasPart';
    }

    const loadLazyData = () => {
        if (props.activeProperties && props.activeProperties.length > 0) {
            setShowTable(true);
            setLoading(true);
            setColumns(buildColumns(props.activeProperties));
        } else {
            setColumns([]);
        }

        if (props.activeTemplate) {
            fetchItems(
                cookies.userInfo.host,
                props.query.endpoint,
                props.query.item_set_id,
                props.query.params,
                lazyParams.first,
                lazyParams.rows,
                lazyParams.sortField,
                lazyParams.sortDirection,
                lazyParams.globalFilter,
                lazyParams.filter
            ).then(data => {
                setTotalRecords(data.total);
                setShowTable(true);
                setCollection(data.items.map((row, key) => {
                    return parseItem(row, props.activeProperties, false);
                }));
                setLoading(false);
            });
        }
    }

    const buildColumns = (properties) => {
        let builtColumns = [];

        switch (props.screenMode) {
            case 'view':
                builtColumns.push(<Column key="view" columnKey="view" header="View" headerStyle={{ width:'60px' }} reorderable={false} className="p-datatable-column" body={viewTemplate} />);
            break;
            case 'edit':
                builtColumns.push(<Column key="editor" columnKey="editor" header="Edit" headerStyle={{ width: '100px' }} reorderable={false} className="p-datatable-column" bodyStyle={{ textAlign: 'center' }} rowEditor ></Column>);
            break;
            case 'select':
                builtColumns.push(<Column key="select" columnKey="select" header="Select All" headerStyle={{ width:'100px' }} reorderable={false} selectionMode="multiple" className="p-datatable-column" />);
            break;
            default:
            break;
        }

        builtColumns.push(<Column key="thumbnail" columnKey="thumbnail" header="Thumbnail" headerStyle={{ width: '150px' }} reorderable={false} className="p-datatable-column" body={thumbnailTemplate} bodyStyle={{ textAlign: 'center' }} />);

        properties.map((property, i) => {
            let fieldIsRelation = propertyIsRelation(property);
            builtColumns.push(
                <Column
                    key={property['o:id']}
                    columnKey={property['o:local_name']}
                    header={property['o:label']}
                    reorderable={props.screenMode === 'view'}
                    field={property['o:label']}
                    filterField={property['o:id'].toString()}
                    sortField={property['o:term']}
                    sortable={!fieldIsRelation && props.screenMode === 'view'}
                    filter={!fieldIsRelation && props.screenMode === 'view'}
                    filterPlaceholder={"Search by " + property['o:label']}
                    className="p-datatable-column"
                    body={cellTemplate}
                    editor={(props) => {
                        if(!fieldIsRelation) {
                            return editorTemplate(props, property['o:label']);
                        }
                    }}
                />
            );
            return null;
        });

        return builtColumns;
    }

    const loadLazyDataViewData = async (item) => {
        setDataViewLoading(true);
        fetchOne(
            cookies.userInfo.host,
            item['value_resource_name'],
            item['value_resource_id']
        ).then(data => {
            var resourceTemplate = props.templates.filter(
                (template) => template['o:resource_class']['o:id'] === data['o:resource_class']['o:id']
            )[0];

            const requests = resourceTemplate["o:resource_template_property"].map((property) =>
              Axios.get(property["o:property"]["@id"])
            );

            Axios.all(requests).then(res => {
                let properties = res.map((inner) => inner.data);
                setDataViewProperties(properties);
                setDataViewCollection([parseItem(data, properties, true)]);
                setDataViewLoading(false);
            });
        });
    }

    const parseItem = (row, properties, useCellTemplate) => {
        if (properties && properties.length > 0) {
            let item = {'id': row['o:id']};
            properties.map((property) => {
                let label = property['o:label'];
                let value = null;

                if (row[property['o:term']] !== undefined) {
                    if (row[property['o:term']][0]['@value'] !== undefined) {
                        value = row[property['o:term']][0]['@value'];
                    } else if (row[property['o:term']][0]['type'] === 'resource') {
                        value = row[property['o:term']];
                    }
                }

                item[label] = value;
                return null;
            });

            if (row['thumbnail_display_urls']['square']) {
                if (row['thumbnail_display_urls']['square'].indexOf(`http://${cookies.userInfo.host}`) === 0) {
                    item['thumbnail_url'] = row['thumbnail_display_urls']['square'];
                } else {
                    item['thumbnail_url'] = `http://${cookies.userInfo.host}/${row['thumbnail_display_urls']['square']}`;
                }
            }

            return item;
        }
        return [];
    }

    const cellTemplate = (rowData, index) => {
        if (rowData !== undefined) {
            return getCellTemplate(rowData[index.field], index.field, 'dialog', true);            
        }
        return null;
    }

    const getCellTemplate = (cellData, field, longTextOption, showRelatedItens) => {
        if (cellData && (typeof cellData) === 'object') {
            if (showRelatedItens) {
                return relatedItemsButtonTemplate(cellData);
            }
        } else {
            if (cellData && cellData.length > textMaxLength) {
                return longTextTemplate(field, cellData, textMaxLength, longTextOption);
            } else {
                return cellData;
            }
        }
        return null;
    }

    const relatedItemsButtonTemplate = (items) => {
        return (
            <Button
                type="button"
                icon="pi pi-plus-circle"
                label={Object.keys(items).length + " related items"}
                onClick={(e) => openOverlayPanel(e, items) }
                aria-haspopup aria-controls="overlay_panel"
                className="select-product-button"
            />
        );
    }

    const longTextTemplate = (header, content, maxLength, templateOption) => {
        switch (templateOption) {
            case 'dialog': 
                return (
                    <div>
                        <span>{content.substring(0, maxLength) + '...'}</span>
                        <Button
                            label="View More"
                            className="p-button-link p-py-0"
                            onClick={() => { openDialog(header, content);} }
                        />
                    </div>
                );
            break;
            case 'accordion': 
                return (
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
    }

    const viewTemplate = (rowData) => {
        if (rowData !== undefined) {
            return (
                <React.Fragment>
                    <Button icon="pi pi-eye" title="View" onClick={() => { openDialog(null, cardViewTemplate(rowData, props.activeProperties, true)); } }></Button>
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    const cardViewTemplate = (rowData, properties, showRelatedItens) => {
        if (rowData !== undefined) {
            var dialogCardViewTitle = null;
            var dialogCardViewItems = properties.map((property, i) => {
                if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
                    dialogCardViewTitle = rowData[property['o:label']];
                } else if (rowData[property['o:label']]) {
                    let itemTemplate = getCellTemplate(rowData[property['o:label']], property['o:label'], 'accordion', showRelatedItens);
                    if (typeof(itemTemplate) === 'string') {
                        return (
                            <div className="item-field">
                                <span className="item-field-title">{property['o:label'] + ':'}</span> {itemTemplate}
                            </div>
                        );
                    } else if (itemTemplate) {
                        return (
                            <div className="item-field">
                                {itemTemplate}
                            </div>
                        );
                    }
                }
                return null;
            });

            return (
                <div className="p-col-12">
                    <div className="item-grid-item card">
                        <div className="item-grid-item-content">
                            {
                                rowData['thumbnail_url']
                                ? <img src={rowData['thumbnail_url']} width="150" alt="" onError={(e) => e.target.src=PlaceHolder} />
                                : null
                            }
                            <div className="item-title">{dialogCardViewTitle}</div>
                            {dialogCardViewItems}
                        </div>
                        <div className="item-grid-item-bottom">
                            <Button icon="pi pi-eye" label="View Details" onClick={() => window.open(PATH_PREFIX + "/items/" + rowData['id'], "_blank")}></Button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    const thumbnailTemplate = (rowData) => {
        if (rowData !== undefined && rowData['thumbnail_url']) {
            return (
                <React.Fragment>
                    <img src={rowData['thumbnail_url']} width="100" height="100" alt="" onError={(e) => e.target.src=PlaceHolder} />
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    const dataViewGridTemplate = (rowData, layout) => {
        if (!rowData) {
            return null;
        }

        return cardViewTemplate(rowData, dataViewProperties, false);
    }

    const editorTemplate = (props, field) => {
        return (
            <InputTextarea
                value={props.rowData[field] ? props.rowData[field] : ""}
                onChange={(e) => onEditorValueChange(props, e.target.value)}
                rows={5}
                cols={20}
            />
        );
    }

    const onPage = (event) => {
        let _lazyParams = {
            ...lazyParams,
            ...event,
        };
        setLazyParams(_lazyParams);
    }

    const onSort = (event) => {
        let _lazyParams = {
            ...lazyParams,
            ...event,
            'first': 0,
            'sortDirection': (event.sortOrder === 1) ? 'asc' : 'desc',
        };
        setLazyParams(_lazyParams);
    }

    const onGlobalFilter = (event) => {
        let _lazyParams = {
            ...lazyParams,
            ...event,
            'first': 0,
            'globalFilter': event.target.value,
        };
        setLazyParams(_lazyParams);
    }

    const onFilter = (event) => {
        let search = {};
        let counter = 0;

        for (var propertyId of Object.keys(event.filters)) {
            if (!isNaN(propertyId)) {
                search['property[' + counter + '][joiner]'] = 'and';
                search['property[' + counter + '][property]'] = parseInt(propertyId);
                search['property[' + counter + '][type]'] = 'in';
                search['property[' + counter + '][text]'] = event.filters[propertyId]['value'];

                counter++;
            }
        }

        let _lazyParams = {
            ...lazyParams,
            ...event,
            'first': 0,
            'filter': (Object.keys(search).length > 0) ? search : null,
        };
        setLazyParams(_lazyParams);
    }

    const onColReorder = () => {
        // buildColumns(props.activeProperties);

        showToast('success', 'Success', 'Column Reordered!');
    }

    const onDataViewPage = (event) => {
        setDataViewLoading(true);
        const startIndex = event.first;
        setDataViewFirst(startIndex);
        loadLazyDataViewData(overlayPanelItems[startIndex]);
    }

    const onRowEditInit = (event) => {
        setOriginalRow({ ...collection[event.index] });
        $('.p-row-editor-init').each(function(){$(this).hide()});
    }

    const onRowEditCancel = (event) => {
        let rows = [...collection];
        rows[event.index] = originalRow;
        setOriginalRow(null);

        setCollection(rows);
        showToast('warn', 'Warning', 'Item changes not saved');
        $('.p-row-editor-init').each(function(){$(this).show()});
    }

    const onEditorValueChange = (props, value) => {
        let updatedProducts = [...props.value];
        updatedProducts[props.rowIndex][props.field] = value;
        setCollection(updatedProducts);
    }

    const onRowEditSave = (event) => {
        $('.p-row-editor-init').each(function(){$(this).show()});
        fetchOne(
            cookies.userInfo.host,
            props.query.endpoint,
            event.data['id']
        ).then(data => {
            props.availableProperties.map((property) => {
                if (!propertyIsRelation(property) && event.data[property['o:label']]) {
                    data[property['o:term']][0]['@value'] = event.data[property['o:label']];
                }
                return null;
            });
            patchResourceItem(cookies.userInfo, props.query.endpoint, event.data['id'], data);
            setOriginalRow(null);
            showToast('success', 'Success', 'Item successfully updated!');
        });
    }

    const toggleScreenMode = (toggleToMode) => {
        props.setScreenMode(toggleToMode);
    }

    const addNote = () => {
        setSelectedItems([]);
        toggleScreenMode('select');
        setSelectButtonMode('addNote');
        showToast('info', 'Add Note', 'Check items and click "Proceed to Add Note"');
    }

    const proceedToAddNote = () => {
        toggleScreenMode('view');
        setSelectButtonMode(null);

        let idItems = selectedItems.map((item) => {
            return item['id'];
        });

        window.open(PATH_PREFIX + "/note/" + JSON.stringify(idItems), "_blank").focus();
    }

    const addToProject = () => {
        setSelectedItems([]);
        toggleScreenMode('select');
        setSelectButtonMode('addToProject');
        showToast('info', 'Add to Project', 'Check items and click "Proceed to Add to Project"');
    }

    const proceedToAddToProject = () => {
        toggleScreenMode('view');
        setSelectButtonMode(null);

        let idItems = selectedItems.map((item) => {
            return item['id'];
        });

        openDialog('Add to Project', 'Items: ' + JSON.stringify(idItems));
    }

    const createProject = () => {
        openDialog('Create new project', 'TO DO');
    }

    const headerLeftContents = () => {
        return (
            <React.Fragment>
                <span className="datatable-title p-mr-2">{props.activeTemplate ? 'List of ' + props.activeTemplate['template'] : null}</span>
            </React.Fragment>
        );
    }

    const headerRightContents = () => {
        let buttons = [];
        switch (props.screenMode) {
            case 'view': 
                buttons.push(<Button key="add-note" label="Add Note" className="p-button-sm p-button-raised p-button-text p-mr-2" onClick={() => { addNote(); }} />);
                buttons.push(<Button key="add-to-project" label="Add to Project" className="p-button-sm p-button-raised p-button-text p-mr-2" onClick={() => { addToProject(); }} />);
                buttons.push(<Button key="create-project" label="Create Project" className="p-button-sm p-button-raised p-mr-2" onClick={() => { createProject(); }} />);
                buttons.push(<Button key="edit-mode" label="Edit Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" onClick={() => { toggleScreenMode('edit'); }} />);
            break;
            case 'edit':
                buttons.push(<Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" disabled={originalRow !== null} onClick={() => { toggleScreenMode('view'); }} />);
            break;
            case 'select':
                switch (selectButtonMode) {
                    case 'addNote':
                        buttons.push(<Button key="proceed-to-add-note" label="Proceed to Add Note" className="p-button-sm p-button-raised p-mr-2" disabled={selectedItems.length === 0} onClick={() => { proceedToAddNote(); }} />);
                    break;
                    case 'addToProject':
                        buttons.push(<Button key="proceed-to-add-to-project" label="Proceed to Add to Project" className="p-button-sm p-button-raised p-mr-2" disabled={selectedItems.length === 0} onClick={() => { proceedToAddToProject(); }} />);
                    break;
                    default:
                    break;
                }
                buttons.push(<Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" disabled={originalRow !== null} onClick={() => { toggleScreenMode('view'); }} />);
            break;
            default:
            break;
        }

        return (
            <React.Fragment>
                {buttons}
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText disabled={!(props.screenMode === 'view')} type="search" onChange={onGlobalFilter} placeholder="Global Search" className="p-py-1"/>
                </span>
            </React.Fragment>
        );
    }

    const renderHeader = () => {
        return (
            <div className="table-header">
                <Toolbar left={headerLeftContents} right={headerRightContents} />
            </div>
        );
    }

    const header = renderHeader();

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

    return (
        <div className="datatable-component datatable-responsive">
            <div className="card">
                {
                    showTable ?
                        <DataTable
                            loading={loading}
                            className="p-datatable-collection p-datatable-striped p-datatable-responsive"
                            emptyMessage="No items found"
                            lazy
                            ref={dt}
                            value={collection}
                            header={header}
                            scrollable
                            scrollHeight="600px"
                            globalFilter={lazyParams.globalFilter}
                            filters={lazyParams.filters}
                            onFilter={onFilter}
                            reorderableColumns
                            onColReorder={onColReorder}
                            resizableColumns
                            columnResizeMode="fit"
                            rowHover
                            rows={lazyParams.rows}
                            rowsPerPageOptions={[10,25,50]}
                            dataKey="id"
                            selectionMode={props.screenMode === "select" ? "checkbox" : null}
                            selection={selectedItems}
                            onSelectionChange={e => setSelectedItems(e.value)}
                            first={lazyParams.first}
                            totalRecords={totalRecords}
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                            paginator={props.screenMode === 'view'}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            onPage={onPage}
                            onSort={onSort}
                            sortField={lazyParams.sortField}
                            sortOrder={lazyParams.sortOrder}
                            editMode="row"
                            onRowEditInit={onRowEditInit}
                            onRowEditCancel={onRowEditCancel}
                            onRowEditSave={onRowEditSave}
                        >
                            {buildColumns(props.activeProperties)}
                        </DataTable>
                    : null
                }
            </div>
            <Toast
                ref={toast}
                position="top-left"
            />
            <Dialog
                header={dialogHeader}
                visible={displayDialog}
                maximizable
                style={{ width: '50vw' }}
                onHide={closeDialog}
            >
                {dialogContent}
            </Dialog>
            <OverlayPanel ref={overlayPanel} showCloseIcon id="overlay_panel" style={{width: '450px'}}>
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

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

export default connect(mapStateToProps)(DataTableContainer);