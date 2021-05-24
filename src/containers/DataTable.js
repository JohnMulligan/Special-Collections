import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from "react-cookie";
import { connect } from "react-redux";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import { fetchItems } from "../utils/OmekaS";
import { PlaceHolder } from "../utils/Utils";

import '../assets/css/DataTable.css';
import '../assets/css/Dialog.css';

const DataTableContainer = (props) => {
    const [cookies] = useCookies(["userInfo"]);

    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const [collection, setCollection] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [columns, setColumns] = useState([]);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        sortField: 'o:id',
        sortOrder: 1,
        sortDirection: 'asc',
    });

    const [displayDialog, setDisplayDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState(null);
    const [dialogHeader, setDialogHeader] = useState(null);

    const dt = useRef(null);

    useEffect(() => {
        loadLazyData();
    }, [props.activeProperties, lazyParams]);

    const loadLazyData = () => {
        if (props.activeProperties && props.activeProperties.length > 0) {
            setShowTable(true);
            setLoading(true);
            setColumns(
                props.activeProperties.map((property, i) => {
                    return <Column
                                key={property['o:id']}
                                columnKey={property['o:local_name']}
                                header={property['o:label']}
                                field={property['o:label']}
                                filterField={property['o:id'].toString()}
                                sortField={property['o:term']}
                                sortable
                                filter
                                filterPlaceholder={"Search by " + property['o:label']}
                                className="p-datatable-column"
                                body={longTextTemplate}
                            />;
                })
            );
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
                    if (props.activeProperties && props.activeProperties.length > 0) {
                        let item = {'id': key};
                        props.activeProperties.map((property) => {
                            let label = property['o:label'];
                            let value = null;

                            if (typeof row[property['o:term']] !== 'undefined') {
                                value = row[property['o:term']][0]['@value'];
                            }

                            item[label] = value;
                        });

                        if (row['thumbnail_display_urls']['square'] && row['thumbnail_display_urls']['square'].indexOf(`http://${cookies.userInfo.host}`) == 0) {
                            item['thumbnail_url'] = row['thumbnail_display_urls']['square'];
                        } else {
                            item['thumbnail_url'] = row['thumbnail_display_urls']['square'] ? `http://${cookies.userInfo.host}/${row['thumbnail_display_urls']['square']}` : PlaceHolder;
                        }

                        return item;
                    }
                }));
                setLoading(false);
            });
        }
    }

    const openDialog = (content, header) => {
        setDisplayDialog(true);
        setDialogContent(content);
        setDialogHeader(header);
    }

    const longTextTemplate = (rowData, index) => {
        const cellMaxLength = 150;
        if (rowData !== undefined) {
            if (rowData[index.field] && rowData[index.field].length > cellMaxLength) {
                return (
                    <div>
                        <span>{rowData[index.field].substring(0, cellMaxLength) + '...'}</span>
                        <Button
                            label="View More"
                            className="p-button-link p-py-0"
                            onClick={() => {
                                openDialog(rowData[index.field], index.field);
                            }}/>
                    </div>
                );
            } else {
                return rowData[index.field];
            }
        }
        return null;
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

    const renderHeader = () => {
        const headerTitle = props.activeTemplate ? 'List of ' + props.activeTemplate['template'] : null;

        return (
            <div className="table-header">
                {headerTitle}
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onChange={onGlobalFilter} placeholder="Global Search" className="p-py-1"/>
                </span>
            </div>
        );
    }

    const header = renderHeader();

    const thumbnailTemplate = (rowData) => {
        const thumbnailSrc = (rowData !== undefined) ? rowData['thumbnail_url'] : null;
        return (
            <React.Fragment>
                <img src={thumbnailSrc} width="100" height="100" onError={(e) => e.target.src=PlaceHolder}/>
            </React.Fragment>
        );
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
                            globalFilter={lazyParams.globalFilter}
                            filters={lazyParams.filters}
                            onFilter={onFilter}
                            reorderableColumns
                            resizableColumns
                            columnResizeMode="fit"
                            rowHover
                            rows={lazyParams.rows}
                            rowsPerPageOptions={[10,25,50]}
                            dataKey="id"
                            selectionMode="checkbox"
                            selection={selectedItems}
                            onSelectionChange={e => setSelectedItems(e.value)}
                            first={lazyParams.first}
                            totalRecords={totalRecords}
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                            paginator
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            onPage={onPage}
                            onSort={onSort}
                            sortField={lazyParams.sortField}
                            sortOrder={lazyParams.sortOrder}
                        >
                            <Column header="Actions" columnKey="actions" selectionMode="multiple" headerStyle={{width:'100px'}} className="p-datatable-column" reorderable={false}/>
                            <Column header="Thumbnail" columnKey="thumbnail" body={thumbnailTemplate} className="p-datatable-column" reorderable={false}/>
                            {columns}
                        </DataTable>
                    : null
                }
            </div>
            <Dialog header={dialogHeader} visible={displayDialog} maximizable style={{ width: '50vw' }} onHide={() => {setDisplayDialog(false); setDialogContent(null)}}>
                {dialogContent}
            </Dialog>
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
