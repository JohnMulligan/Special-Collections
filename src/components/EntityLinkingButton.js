import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
import { OverlayPanel } from "primereact/overlaypanel";

export const EntityLinkingButton = ({
    onLink,
    onSearchTextChange,
    onSearchEntity,
    resultsTemplate,
    searchText,
    searchResults,
    debounceTime = 1000,
    searchPlaceHolderText = "Search"
}) => {
    const [popupState, setPopupState] = useState(0);
    const op = useRef(null);
    const searchBox = useRef(null);

    // Debounce on search so that we only trigger after the
    // user stopped changing the text.
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchText !== "") {
                onSearchEntity(searchText);
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
                            onChange={(e) => onSearchTextChange(e.target.value)}
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