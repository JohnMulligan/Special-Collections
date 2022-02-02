import React, { useEffect, useRef, useState, useContext } from "react";
import { connect } from "react-redux";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
import { OverlayPanel } from "primereact/overlaypanel";

import { LargeTextField } from "../components/LargeTextField";

import { fetchItems } from "../utils/OmekaS";

import { DialogContext } from "../containers/Home";

const Link = ({item}) => {
    const dialogContext = useContext(DialogContext);

    return (
        <span
            onClick={() => { dialogContext.fetchOneAndOpenDialogCard(item); } }>
            <a href="#" 
                >
                {item.text}
            </a>
        </span>
      );
}

export const makeLinkItem = (subItem) => ({
    itemTypeId: 2,
    text: subItem['text'] || "",
    value_resource_id: subItem['value_resource_id'],
    value_resource_name: 'items',
});

export const linkableItemTemplate = (item, readonly) => {
    if (readonly) {
        return (<Link 
                    item={item}
                />);
    }
    return (<span>{item.text}</span>);

}

export const linkableItemType = (props, onLink) => ({
    id: 2,
    customToolbarItems: [
        <EntityLinkingButton
            resultsTemplate={(r) => <span>{r.text}</span>}
            onSearchEntity={(searchText) => {
                let lazyParams = {
                    first: 0,
                    rows: 10,
                    sortField: 'o:id',
                    sortOrder: 1,
                    sortDirection: 'asc',
                };

                return fetchItems(
                    props.query.endpoint,
                    props.query.item_set_id,
                    [],
                    lazyParams.first,
                    lazyParams.rows,
                    lazyParams.sortField,
                    lazyParams.sortDirection,
                    searchText
                ).then(data => {
                    return data.items.map((row) => {
                        return {
                            text: row['o:title'],
                            value_resource_id: row['o:id']
                        };
                    });
                });
            }}
            onLink={onLink}
        />
    ],
    itemTemplate: linkableItemTemplate,
    singleItemTemplate: linkableItemTemplate
});

export const EntityLinkingButton = ({
    onLink,
    onSearchEntity,
    resultsTemplate,
    debounceTime = 1000,
    searchPlaceHolderText = "Search"
}) => {
    const [popupState, setPopupState] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const op = useRef(null);
    const searchBox = useRef(null);

    // Debounce on search so that we only trigger after the
    // user stopped changing the text.
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchResults([]);
            if (searchText !== "") {
                onSearchEntity(searchText).then((data) => {
                    setSearchResults(data);
                });
            }
        }, debounceTime);

        return () => clearTimeout(delayDebounceFn);
    }, [debounceTime, searchText, onSearchEntity]);
    
    useEffect(() => {
        if (popupState === 1 && searchBox.current) {
          searchBox.current.focus();
        }
    }, [searchBox, popupState]);

    return (
        <Button
            className="p-button-sm p-button-raised p-mx-1"
            icon="pi pi-link"
            title="Add Link"
            onClick={(e) => {
                setPopupState(1);
                op.current.show(e);
            }}
        >
            <OverlayPanel ref={op} dismissable={true} onHide={() => setPopupState(0)}>
                <div>
                    <span className="p-input-icon-left">
                        <InputText
                            ref={searchBox}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={searchPlaceHolderText}
                        />
                    </span>
                    {searchResults.length > 0 && (
                        <ListBox
                            style={{ maxHeight: "300px", overflow: "auto" }}
                            options={searchResults}
                            itemTemplate={resultsTemplate}
                            onChange={(e) => {
                                op.current.hide();
                                onLink(e.value);
                            }}
                        />
                    )}
                </div>
            </OverlayPanel>
        </Button>
    );
};

const mapStateToProps = (state, props) => {
  return {
    ...props,
    query: state.query,
  };
};

export default connect(mapStateToProps)(linkableItemType);