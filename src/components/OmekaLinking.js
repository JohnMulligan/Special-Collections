import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
import { OverlayPanel } from "primereact/overlaypanel";

export const makeLinkItem = (subItem) => ({
    id: 2,
    text: subItem['value_resource_id'] || "",
    value_resource_name: subItem['value_resource_name'],
    value_resource_id: subItem['value_resource_id'],
});

export const linkableItemTemplate = (item) => (
    <div>
        <button>[LINK]</button>
        <span>{item.text}</span>
    </div>
);

export const linkableItemType = (onLink) => ({
    id: 2,
    description: "Omeka-S link",
    customToolbarItems: [
        <EntityLinkingButton
            resultsTemplate={(r) => <span>{r.text}</span>}
            onSearchEntity={(v) => {
                // Generate fake results for now.
                const results = [];
                for (let i = 0; i < 5; ++i) {
                    // TODO call makeLinkItem?
                    results[i] = {
                        itemTypeId: 2,
                        text: `${v} Match #${i + 1}`,
                        value_resource_name: "value_resource_name",
                        value_resource_id: i + 1
                    };
                }
                return results;
            }}
            onLink={onLink}
        />
    ],
    singleItemTemplate: linkableItemTemplate,
    itemTemplate: linkableItemTemplate
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
            if (searchText !== "") {
                const results = onSearchEntity(searchText);
                // TODO: promise?
                setSearchResults(results);
            }
        }, debounceTime);

        return () => clearTimeout(delayDebounceFn);
    }, [debounceTime, searchText, onSearchEntity]);
    
    useEffect(() => {
            if (popupState === 1 && searchBox.current) {
              searchBox.current.focus();
            }
        },
        [searchBox, popupState]
    );

    return (
        <Button
            className="p-button-sm p-button-raised p-mr-2"
            icon="pi pi-plus-circle"
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