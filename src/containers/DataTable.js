import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from "react-cookie";
import { connect } from "react-redux";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

import { fetch } from "../utils/OmekaS";

import '../assets/css/DataTable.css';

// import ProductService from '../service/ProductService';

const DataTableContainer = (props) => {
    const [cookies] = useCookies(["userInfo"]);
    const [globalFilter, setGlobalFilter] = useState(null);

    const dt = useRef(null);
    const [showTable, setShowTable] = useState(false);
    const [collection, setCollection] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [columns, setColumns] = useState([]);

    // const [products, setProducts] = useState([]);
    // const [selectedProducts8, setSelectedProducts8] = useState(null);

    useEffect(() => {
        if (props.activeProperties) {
            setColumns(
                props.activeProperties.map((property, i) => {
                    return <Column key={property['o:id']} field={property['o:label']} header={property['o:label']} sortable filter filterPlaceholder={"Search by " + property['o:label']} />;
                })
            );
        } else {
            setColumns([]);
        }

        const fetchInitial = async () => {
            // setTableState((state) => ({
                // ...state,
                // loading: true,
            // }));

            const data = await fetch(
                cookies.userInfo.host,
                props.query.endpoint,
                props.query.item_set_id,
                props.query.params,
                0,
                10
            );

            if (props.activeTemplate) {
                setShowTable(true);
                setCollection(data.map((row, key) => {
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
            }
        };
        fetchInitial();

        // const productService = new ProductService();
        // productService.getProductsSmall().then(data => setProducts(data));

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
                {
                    showTable ?
                        <DataTable
                            ref={dt}
                            value={collection}
                            header={header}
                            className="p-datatable-collection"
                            dataKey="id"
                            rowHover
                            globalFilter={globalFilter}
                            selectionMode="checkbox"
                            selection={selectedItems}
                            onSelectionChange={e => setSelectedItems(e.value)}
                            paginator
                            rows={10}
                            emptyMessage="No items found"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            rowsPerPageOptions={[10,25,50]}                    
                        >
                            <Column selectionMode="multiple" headerStyle={{width:'3em'}}/>
                            {columns}
                        </DataTable>
                    : null
                }

                {/*<DataTable value={products} selectionMode="checkbox" selection={selectedProducts8} onSelectionChange={e => setSelectedProducts8(e.value)} dataKey="id">
                    <Column selectionMode="multiple" headerStyle={{width: '3em'}}></Column>
                    <Column field="code" header="Code"/>
                    <Column field="name" header="Name"/>
                    <Column field="category" header="Category"/>
                    <Column field="quantity" header="Quantity"/>
                </DataTable>*/}
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