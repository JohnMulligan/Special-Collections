import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";

import { DataView } from 'primereact/dataview';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

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
                let value = null;

                if (row[property['o:term']] !== undefined) {
                    if (row[property['o:term']][0]['type'] === 'resource') {
                        value = row[property['o:term']];
                    } else {
                        let separator = '';
                        value = '';
                        row[property['o:term']].map((subItem) => {
                            if (subItem['@value'] !== undefined) {
                                value += separator + subItem['@value'];
                                separator = ' | ';
                            }
                            return null;
                        });
                    }
                }

                item[label] = value;
                return null;
            });

            if (row['thumbnail_display_urls']['square']) {
                item['thumbnail_url'] = row['thumbnail_display_urls']['square'];
            }

            return item;
        }
        return [];
    }

    const itemCardTemplate = (data) => {
        return (
            <CardView
                cardClassName="p-col-3"
                cardData={data}
                properties={props.activeProperties}
                showRelatedItens={true}
                openDialog={props.openDialog}
                openOverlayPanel={true}
                getCellTemplate={props.getCellTemplate}
            />            
        );
    }

    const propertiesFilters = () => {
        let builtFilters = [];

        props.activeProperties.map((property, i) => {
            if (!props.propertyIsRelation(property)) {
                builtFilters.push(
                    <div className="p-col-12 p-my-2">
                        <div className="p-d-flex p-jc-end">
                            <InputText type="text" className="p-inputtext-sm p-d-block p-py-1" placeholder={"Search by " + property['o:label']} />
                        </div>
                    </div>
                );
            }
            return null;
        });

        if (builtFilters.length > 0) {
            builtFilters.push(
                <div className="p-col-12 p-my-2">
                    <div className="p-d-flex p-jc-end">
                        <Button
                            className="p-button-sm p-button-raised"
                            icon="pi pi-search"
                            label="Search"
                            onClick={(e) => onFilter(e)}>
                        </Button>
                    </div>
                </div>
            );
        }

        return builtFilters;
    }

    const onFilter = (event) => {

        console.log(event);

        // let search = {};
        // let counter = 0;

        // for (let propertyId of Object.keys(event.filters)) {
        //     if (!isNaN(propertyId)) {
        //         search['property[' + counter + '][joiner]'] = 'and';
        //         search['property[' + counter + '][property]'] = parseInt(propertyId);
        //         search['property[' + counter + '][type]'] = 'in';
        //         search['property[' + counter + '][text]'] = event.filters[propertyId]['value'];

        //         counter++;
        //     }
        // }

        // let _lazyParams = {
        //     ...lazyParams,
        //     ...event,
        //     'first': 0,
        //     'filter': (Object.keys(search).length > 0) ? search : null,
        // };
        // setLazyParams(_lazyParams);
    }

    const onPage = (event) => {
        let _lazyParams = {
            ...lazyParams,
            ...event,
        };
        setLazyParams(_lazyParams);
    }

    if (displayContent) {
        return (
            <div className="dataview-component">
                <div className="p-grid">
                    <div className="p-col-2">
                        {propertiesFilters()}
                    </div>
                    <div className="p-col-10">
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
                                totalRecords={totalRecords}
                                first={lazyParams.first}
                                paginator
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                onPage={onPage}
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