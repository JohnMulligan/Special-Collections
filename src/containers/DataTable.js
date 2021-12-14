import React, { useState, useEffect, useRef } from 'react';
import { connect } from "react-redux";

import $ from 'jquery';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import AutoMultiValueField, { genericEditableItemType } from "../components/AutoMultiValueField";
import { makeNumberItem } from "../components/AutoMultiValueField";
import { makeLinkItem, linkableItemType } from "../components/OmekaLinking";

import { fetchItems, fetchOne, patchResourceItem } from "../utils/OmekaS";
import { PATH_PREFIX, PlaceHolder } from "../utils/Utils";

import '../assets/css/DataTable.css';

const RowCardView = ({rowData, collection, openDialog, cardViewTemplate, activeProperties, onRowEditSave}) => {
    if (!!rowData) {
        const index = collection.findIndex(element => element.id === rowData.id);
    
        const editSave = (data) => {
            onRowEditSave({data, index});
        };

        return (
            <React.Fragment>
                <Button
                    className="p-button-sm p-button-raised"
                    icon="pi pi-eye"
                    title="View"
                    // TO DO - Change to use props
                    onClick={() => { openDialog(null, cardViewTemplate(rowData, activeProperties, true, editSave)); } }>
                </Button>
            </React.Fragment>
        );
    } else {
        return null;
    }
}

const DataTableContainer = (props) => {
    const [loading, setLoading] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [selectButtonMode, setSelectButtonMode] = useState(false);
    
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

    const [originalCollection, setOriginalCollection] = useState([]);
    const [originalRow, setOriginalRow] = useState(null);

    useEffect(() => {
        loadLazyData();
    }, [props.activeProperties, lazyParams]);

    const loadLazyData = () => {
        if (props.activeProperties && props.activeProperties.length > 0) {
            setDisplayContent(true);
            setLoading(true);
            setColumns(buildColumns(props.activeProperties));
        } else {
            setColumns([]);
        }

        if (props.activeTemplate) {
            fetchItems(
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
                setDisplayContent(true);
                setOriginalCollection(data.items);
                setCollection(data.items.map((row, key) => {
                    return props.parseItem(row, props.activeProperties);
                }));
                setLoading(false);
            });
        }
    }

    const buildColumns = (properties) => {
        let builtColumns = [];

        switch (props.screenMode) {
            case 'view':
                builtColumns.push(<Column key="view" columnKey="view" header="View" headerStyle={{ width:'60px' }} reorderable={false} className="p-datatable-column text-align-center" body={viewTemplate} />);
            break;
            case 'edit':
                builtColumns.push(<Column key="editor" columnKey="editor" header="Edit" headerStyle={{ width: '100px' }} reorderable={false} className="p-datatable-column text-align-center" rowEditor ></Column>);
            break;
            case 'select':
                builtColumns.push(<Column key="select" columnKey="select" header="Select All" headerStyle={{ width:'100px' }} reorderable={false} selectionMode="multiple" className="p-datatable-column text-align-center" />);
            break;
            default:
            break;
        }

        builtColumns.push(<Column key="thumbnail" columnKey="thumbnail" header="Thumbnail" headerStyle={{ width: '150px' }} reorderable={false} className="p-datatable-column text-align-center" body={thumbnailTemplate} />);

        properties.map((property, i) => {
            let fieldIsRelation = props.propertyIsRelation(property);
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
                    editor={(columnProperties) => {
                        if(!fieldIsRelation) {
                            return editorTemplate(columnProperties, property);
                        }
                    }}
                    exportable={!fieldIsRelation}
                />
            );
            return null;
        });

        return builtColumns;
    }

    const cellTemplate = (rowData, index) => {
        if (rowData !== undefined) {
            return props.getCellTemplate(rowData[index.field], index.field, true);            
        }
        return null;
    }

    const viewTemplate = (rowData) => {
        return (
            <RowCardView
                rowData={rowData}
                collection={collection}
                onRowEditSave={onRowEditSave}
                {...props}
            />
        );
    }

    const thumbnailTemplate = (rowData) => {
        if (rowData !== undefined && rowData['thumbnail_url']) {
            return (
                <React.Fragment>
                    <img
                        src={rowData['thumbnail_url']}
                        class="border-default"
                        width="100"
                        height="100"
                        alt=""
                        onError={(e) => e.target.src=PlaceHolder}
                    />
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    const editorTemplate = (columnProperties, cellProperty) => {
        let value = columnProperties.rowData[cellProperty['o:label']] ? columnProperties.rowData[cellProperty['o:label']] : "";

        if (cellProperty['o:data_type'].length > 0 && cellProperty['o:data_type'].includes('numeric:timestamp')) {
            return (
                <InputNumber
                    value={value && value.length === 1 ? parseInt(value[0].text) : ""}
                    onChange={(e) => onEditorValueChange(columnProperties, [makeNumberItem(e.value)])}
                    useGrouping={false}
                    showButtons
                    buttonLayout="vertical"
                    style={{width: '75px'}}
                />
            );
        } else {
            if (!Array.isArray(value)) {
                value = [value];
            }
            const editTypesAllowed = [genericEditableItemType];
            if (cellProperty['o:data_type'].includes('resource:item')) {
                editTypesAllowed.push(linkableItemType(props, (linkItem) => onRowLinkItem(columnProperties, linkItem, value)));
            }
            return (
                <AutoMultiValueField
                    values={value}
                    fieldClassName="border-default bg-white p-p-1"
                    onChange={(value) => onEditorValueChange(columnProperties, value)}
                    itemTypesAllowed={editTypesAllowed}
                />
            );
        }
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

        for (let propertyId of Object.keys(event.filters)) {
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
        props.showToast('success', 'Success', 'Column Reordered!');
    }

    const onRowEditInit = (event) => {
        setOriginalRow({ ...collection[event.index] });
        $('.p-row-editor-init').each(function(){$(this).hide()});
    }

    const onRowLinkItem = (properties, linkItem, arrayItems) => {
        const changed = arrayItems.slice();
        changed.push(makeLinkItem(linkItem));

        onEditorValueChange(properties, changed);
    }

    const onRowEditCancel = (event) => {
        let rows = [...collection];
        rows[event.index] = originalRow;
        setOriginalRow(null);

        setCollection(rows);
        props.showToast('warn', 'Warning', 'Item changes not saved');
        $('.p-row-editor-init').each(function(){$(this).show()});
    }

    const onEditorValueChange = (properties, value) => {
        let updatedProperties = [...properties.value];
        updatedProperties[properties.rowIndex][properties.field] = value;
        setCollection(updatedProperties);
    }

    const onRowEditSave = (event) => {
        // TO DO - Use effect
        $('.p-row-editor-init').each(function(){$(this).show()});
        fetchOne(
            props.query.endpoint,
            event.data['id']
        ).then(data => {
            props.availableProperties.map((property) => {
                let editedValue = event.data[property['o:label']]
                
                if (!props.propertyIsRelation(property) && editedValue) {
                    if (editedValue instanceof Array) {
                        var newData = editedValue.map((value) => {
                            return props.getNewItem(property, value);
                        });
                        data[property['o:term']] = newData;
                    } else {
                        if (data[property['o:term']] !== undefined) {
                            data[property['o:term']][0]['@value'] = parseInt(editedValue);
                        } else {
                            data[property['o:term']] = [props.getNewItem(property, parseInt(editedValue))];
                        }
                    }
                }
                return null;
            });
            patchResourceItem(props.query.endpoint, event.data['id'], data);

            let rows = [...collection];
            rows[event.index] = props.parseItem(data, props.activeProperties);
            setOriginalRow(null);

            setCollection(rows);

            props.showToast('success', 'Success', 'Item successfully updated!');
        });
    }

    const toggleScreenMode = (toggleToMode) => {
        props.setScreenMode(toggleToMode);
    }

    const addNote = () => {
        setSelectedItems([]);
        toggleScreenMode('select');
        setSelectButtonMode('addNote');
        props.showToast('info', 'Add Note', 'Check items and click "Proceed to Add Note"');
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
        props.showToast('info', 'Add to Project', 'Check items and click "Proceed to Add to Project"');
    }

    const proceedToAddToProject = () => {
        toggleScreenMode('view');
        setSelectButtonMode(null);

        let idItems = selectedItems.map((item) => {
            return item['id'];
        });

        props.openDialog('Add to Project', 'Items: ' + JSON.stringify(idItems));
    }

    const createProject = () => {
        props.openDialog('Create new project', 'TO DO');
    }

    const exportData = () => {
        dt.current.exportCSV();
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
                buttons.push(<Button key="export-data" label="Export CSV" className="p-button-sm p-button-raised p-button-warning p-mr-2" icon="pi pi-download" onClick={() => { exportData(); }} />);
                buttons.push(<Button key="edit-mode" label="Edit Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-pencil" onClick={() => { toggleScreenMode('edit'); }} />);
            break;
            case 'edit':
                buttons.push(<Button key="view-mode" label="View Mode" className="p-button-sm p-button-raised p-button-info p-mr-2" disabled={originalRow !== null} icon="pi pi-eye" onClick={() => { toggleScreenMode('view'); }} />);
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
                <Toolbar
                    left={headerLeftContents}
                    right={headerRightContents}
                />
            </div>
        );
    }

    const header = renderHeader();

    if (displayContent) {
        return (
            <div className="datatable-component datatable-responsive">
                <div className="card">
                    <DataTable
                        loading={loading}
                        className="p-datatable-collection p-datatable-responsive"
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

export default connect(mapStateToProps)(DataTableContainer);