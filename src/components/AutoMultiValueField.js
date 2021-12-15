import React, { useState } from "react";
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { Toolbar } from "primereact/toolbar";

import { LargeTextField } from "../components/LargeTextField";

import '../assets/css/AutoMultiValueField.css';

export const makeGenericItem = (value) => ({ itemTypeId: 0, text: value });

export const makeNumberItem = (num) => ({ itemTypeId: 1, text: num });

export const genericEditableItemType = {
    id: 0,
    customToolbarItems: [],
    itemTemplate: (item) => (
        <LargeTextField
            readonly={true}
            maxChars={30}
            text={item.text}
        />
    ),
    singleItemTemplate: null
};

const AutoMultiValueField = ({
    values,
    fieldClassName = "",
    onChange,
    readonly = false,
    itemTypesAllowed = [genericEditableItemType]
}) => {
    const [selected, setSelected] = useState(null);
    const [edit, setEdit] = useState(null);
    const [singleItem, setSingleItem] = useState(null);

    if (!Array.isArray(values)) {
        values = [values];
    }

    if (selected !== null && selected >= values.length) {
        setSelected(null);
    }

    const options = values.map((item, index) => ({ item, index }));

    if (values.length === 1 && singleItem === null) {
        setSelected(options[0]);
        setSingleItem(values[0].text);
    }

    const canHaveGenericItems = itemTypesAllowed.indexOf(genericEditableItemType) >= 0;

    const disableActionBtn = (targetItemTypeId) =>
        selected === null ||
        selected.index < 0 ||
        selected.index >= values.length ||
        (targetItemTypeId !== null && values[selected.index].itemTypeId !== targetItemTypeId);

    const addItemBtn = readonly ? null : (
        <Button
            className="p-button-sm p-button-raised p-mx-1"
            icon="pi pi-plus-circle"
            title="Add"
            onClick={() => setEdit({ selected: null, text: "" })}
        >
        </Button>
    );

    const editItemBtn = (
        <Button
            className="p-button-sm p-button-info p-mx-1"
            icon="pi pi-pencil"
            title="Edit"
            onClick={() => {
                if (!selected) {
                    return;
                }
                const index = selected.index;
                if (index >= 0 && index < values.length) {
                    setEdit({ selected, text: values[index].text });
                }
            }}
            disabled={disableActionBtn(0)}
        >
        </Button>
    );

    const deleteItemBtn = (
        <Button
            className="p-button-sm p-button-danger p-mx-1"
            icon="pi pi-trash"
            title="Delete"
            onClick={() => {
                if (!selected) {
                    return;
                }
                const index = selected.index;
                if (index >= 0 && index < values.length) {
                    // Make a copy of the values, remove the item
                    // and fire onChange.
                    const changed = values.slice();
                    changed.splice(selected.index, 1);
                    setSelected(null);
                    setSingleItem(null);
                    onChange(changed);
                }
            }}
            disabled={disableActionBtn(0) && disableActionBtn(2)}
        >
        </Button>
    );

    const listBoxItemTemplate = (option) => {
        const { item } = option;

        for (const itemType of itemTypesAllowed) {
            if (itemType.id == item.itemTypeId) {
                return itemType.itemTemplate(item);
            }
        }
    };

    const toolbarItems = [deleteItemBtn];

    if (canHaveGenericItems) {
        toolbarItems.unshift(editItemBtn);
        toolbarItems.unshift(addItemBtn);
    }

    const rightToolbarItems = [];
    for (const { customToolbarItems } of itemTypesAllowed) {
        for (const item of customToolbarItems) {
            rightToolbarItems.push(item);
        }
    }

    let singleItemTemplate = null;
    if (values.length === 1 && values[0].itemTypeId !== 0) {
        const t = itemTypesAllowed[values[0].itemTypeId];
        if (t.singleItemTemplate) {
            singleItemTemplate = t.singleItemTemplate(values[0]);
        }
    }

    const inputWithCmdButtons = (
        <React.Fragment>
            <div className="p-grid">
                <div className="p-col-12 p-pb-0 toolbar-edit-field-container">
                    <Toolbar
                        className="p-p-1 no-border toolbar-edit-field"
                        left={toolbarItems}
                        right={rightToolbarItems}
                    />
                </div>
            </div>
            <div className="p-grid">
                <div className="p-col-12">
                    {singleItemTemplate || (
                        <LargeTextField
                            className={fieldClassName}
                            onChange={setSingleItem}
                            onFinish={(v) => {
                                setSingleItem(null);
                                if (v === "" && values.length === 0) {
                                    return;
                                }
                                if (values.length === 1 && v === values[0]) {
                                    return;
                                }
                                onChange(v === "" ? [] : [makeGenericItem(v)]);
                            }}
                            text={singleItem || ""}
                            readonly={
                                values.length > 1 ||
                                (values.length === 1 && values[0].itemTypeId !== 0)
                            }
                        />
                    )}
                </div>
            </div>
        </React.Fragment>
    );

    const multiValuedField = (
        <React.Fragment>
            <div className="p-grid">
                <div className="p-col-12 p-pb-0 toolbar-edit-field-container">
                    {!readonly && (
                        <Toolbar
                            className="p-p-1 no-border toolbar-edit-field"
                            left={toolbarItems}
                            right={rightToolbarItems}
                        />
                    )}
                </div>
            </div>
            <div className="p-grid">
                <div className="p-col-12">
                    <ListBox
                        className={fieldClassName}
                        listClassName="bg-white"
                        style={{
                            maxHeight: "120px",
                            overflow: "auto",
                        }}
                        value={selected}
                        options={options}
                        itemTemplate={listBoxItemTemplate}
                        onChange={(e) => readonly || setSelected(e.value)}
                    />
                </div>
            </div>
        </React.Fragment>
    );

    return (
        <div style={{ maxWidth: "100%" }}>
            {edit === null || (
                <div style={{ position: "absolute" }}>
                    <LargeTextField
                        text={edit.text}
                        onChange={(v) => setEdit({ ...edit, text: v })}
                        onFinish={(v) => {
                            const changed = values.slice();
                            if (!edit.selected) {
                                if (v !== "") {
                                    changed.push(makeGenericItem(v));
                                }
                            } else {
                                if (v !== "") {
                                    changed.splice(edit.selected.index, 1, makeGenericItem(v));
                                } else {
                                    changed.splice(edit.selected.index, 1);
                                }
                            }
                            onChange(changed);
                            setEdit(null);
                            setSelected(null);
                            setSingleItem(null);
                        }}
                        style={{ visibility: "invisible" }}
                        popupMode={2}
                    />
                </div>
            )}
            {values.length <= 1 && !readonly
                ? inputWithCmdButtons
                : values.length > 0 && multiValuedField
            }
        </div>
    );
};

export default AutoMultiValueField;