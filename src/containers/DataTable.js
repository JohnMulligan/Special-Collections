import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from "react-cookie";
import { connect } from "react-redux";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

import { fetchItems } from "../utils/OmekaS";

import '../assets/css/DataTable.css';

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
        // page: 1,
        sortField: 'o:id',
        sortOrder: 1,
        sortDirection: 'asc',
    });

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
                    return <Column key={property['o:id']} columnKey={property['o:local_name']} header={property['o:label']} field={property['o:label']} filterField={property['o:id'].toString()} sortField={property['o:term']} sortable filter filterPlaceholder={"Search by " + property['o:label']} />;
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
                        return item;
                    } else {
                        setShowTable(false);
                    }
                }));
                setLoading(false);
            });
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
        return (
            <div className="table-header">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onChange={onGlobalFilter} placeholder="Global Search" />
                </span>
            </div>
        );
    }

    const header = renderHeader();    

    return (
        <div className="datatable-component">
            <div className="card">
                {
                    showTable ?
                        <DataTable
                            loading={loading}
                            className="p-datatable-collection"
                            emptyMessage="No items found"
                            lazy
                            ref={dt}
                            value={collection}
                            header={header}
                            globalFilter={lazyParams.globalFilter}
                            filters={lazyParams.filters}
                            onFilter={onFilter}
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
                            <Column selectionMode="multiple" headerStyle={{width:'3em'}}/>
                            {columns}
                        </DataTable>
                    : null
                }
            </div>
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