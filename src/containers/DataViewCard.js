import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";

import { DataView } from 'primereact/dataview';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';

import CardView from "../components/CardView";

import { fetchItems } from "../utils/OmekaS";

import '../assets/css/DataView.css';

const DataViewCardContainer = (props) => {
    const [loading, setLoading] = useState(true);
    const [displayContent, setDisplayContent] = useState(false);
    const [collection, setCollection] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 12,
        sortField: 'o:id',
        sortDirection: 'asc',
        filter: [],
    });

    useEffect(() => {
        loadLazyData();
    }, [props.activeProperties, lazyParams]);

    const loadLazyData = () => {
        if (props.activeProperties && props.activeProperties.length > 0) {
            setDisplayContent(true);
            setLoading(true);
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
                lazyParams.search,
            ).then(data => {
                setTotalRecords(data.total);
                setDisplayContent(true);
                setCollection(data.items.map((row, key) => {
                    return parseItem(row, props.activeProperties);
                }));
                setLoading(false);
            });
        }
    }

    const parseItem = (row, properties) => {
        if (properties && properties.length > 0) {
            let item = {'id': row['o:id']};
            properties.map((property) => {
                let label = property['o:label'];
                if (row[property['o:term']] !== undefined && row[property['o:term']].length > 0) {
                    if (property['o:label'] === 'Title' || property['o:label'] === 'name') {
                        item[label] = row[property['o:term']][0]['@value'];
                    } else if (row[property['o:term']][0]['type'] === 'resource') {
                        item[label] = row[property['o:term']];
                    } else {
                        item[label] = itemChipsTemplate(row[property['o:term']]);
                    }
                } else {
                    item[label] = null;
                }
                return null;
            });

            if (row['thumbnail_display_urls']['square']) {
                item['thumbnail_url'] = row['thumbnail_display_urls']['square'];
            }

            return item;
        }
        return [];
    }

    const itemChipsTemplate = (rowData) => {
        let itemChips = [];
        if (rowData !== undefined && rowData[0]['type'] !== 'resource') {
            rowData.map((subItem) => {
                if (subItem['@value'] !== undefined) {
                    itemChips.push(<Chip label={subItem['@value']} className="p-mr-2 p-mb-2" style={{ 'font-size': "12px" }} />);
                }
                return null;
            });
        }

        return (
            <React.Fragment>
                {itemChips}
            </React.Fragment>
        );
    }

    const itemCardTemplate = (data) => {
        return (
            <CardView
                cardData={data}
                cardClassName="p-col-3 dataview-card"
                availableProperties={props.availableProperties}
                properties={props.activeProperties}
                editModeEnabled={false}
                showRelatedItens={true}
                getCellTemplate={props.getCellTemplate}
                getNewItem={props.getNewItem}
                showToast={props.showToast}
            />
        );
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

    const onPage = (event) => {
        let _lazyParams = {
            ...lazyParams,
            ...event,
        };
        setLazyParams(_lazyParams);
    }

    const renderHeader = () => {
        return (
            <div className="p-grid p-nogutter">
                <div className="p-col-12" style={{textAlign: 'right'}}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            className="p-d-block p-py-1"
                            onChange={onGlobalFilter}
                            placeholder={"Global Search"}
                        />
                    </span>
                </div>
            </div>
        );
    }

    const header = renderHeader();

    if (displayContent) {
        return (
            <div className="dataview-component">
                <div className="p-grid">
                    <div className="p-col-12">
                        <div className="card">
                            <DataView
                                loading={loading}
                                emptyMessage="No items found"
                                lazy
                                layout="grid"
                                value={collection}
                                itemTemplate={itemCardTemplate}
                                rows={lazyParams.rows}
                                rowsPerPageOptions={[12,24,36]}
                                first={lazyParams.first}
                                totalRecords={totalRecords}
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                                paginator
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                onPage={onPage}
                                header={header}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
}

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

export default connect(mapStateToProps)(DataViewCardContainer);