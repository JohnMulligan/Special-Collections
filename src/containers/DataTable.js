import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from "react-cookie";
import { connect } from "react-redux";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

import { fetch } from "../utils/OmekaS";

import '../assets/css/DataTable.css';

const DataTableContainer = (props) => {
    const [cookies] = useCookies(["userInfo"]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const dt = useRef(null);

    const [collection, setCollection] = useState([]);
    const [columns, setColumns] = useState([]);

    const [tableState, setTableState] = useState({
        data: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: props.query.size,
        },
        loading: false,
        selectedRowKeys: [],
    });
    
    useEffect(() => {
        setColumns(props.activeProperties.map((property) => {
            return <Column key={property['o:label']} field={property['o:label']} header={property['o:label']} sortable filter filterPlaceholder={"Search by " + property['o:label']} />;
        }));

        const fetchInitial = async () => {
            setTableState((state) => ({
                ...state,
                loading: true,
            }));

            const data = await fetch(
                cookies.userInfo.host,
                props.query.endpoint,
                props.query.item_set_id,
                props.query.params,
                0,
                10
            );

            setTableState((state) => ({
                ...state,
                data,
                loading: false,
                pagination: {
                    current: 1,
                    pageSize: 10,
                    total: props.query.size,
                },
            }));

            setCollection(data.map((row, key) => {
                let item = {};
                props.activeProperties.map((property) => {
                    let label = property['o:label'];
                    let value = null;

                    if (typeof row[property['o:term']] !== 'undefined') {
                        value = row[property['o:term']][0]['@value'];
                    }

                    item[label] = value;
                });
                return item;
            }));
        };
        fetchInitial();
    }, [cookies.userInfo.host, props.activeProperties, props.query]);

    const renderHeader = () => {
        return (
            <div className="table-header">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
        );
    }

    const header = renderHeader();
    
    return (
        <div className="datatable-component">
            <div className="card">
                <DataTable
                    ref={dt}
                    value={collection}
                    header={header}
                    className="p-datatable-collection"
                    dataKey="id"
                    rowHover
                    globalFilter={globalFilter}
                    // selection={selectedItems}
                    // onSelectionChange={e => setSelectedItems(e.value)}
                    paginator
                    rows={5}
                    emptyMessage="No items found"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10,25,50]}                    
                >
                    <Column selectionMode="multiple" style={{width:'3em'}}/>
                    {columns}
                </DataTable>
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