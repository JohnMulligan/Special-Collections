import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { ListBox } from "primereact/listbox";
import { Toolbar } from "primereact/toolbar";
import { OverlayPanel } from "primereact/overlaypanel";
import { Col, Grid, Row } from "react-flexbox-grid";
import {
  MdAddCircleOutline,
  MdEditNote,
  MdDeleteForever
} from "react-icons/md";

import { LargeTextField } from "./LargeTextField";

export default ({ name }) => <h1>Hello {name}!</h1>;

export const AutoMultiValueField = ({ values, onChange, readonly = false }) => {
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [singleItem, setSingleItem] = useState(null);

  if (!Array.isArray(values)) {
    values = [values];
  }

  if (selected !== null && selected >= values.length) {
    setSelected(null);
  }

  if (values.length === 1 && singleItem === null) {
    setSingleItem(values[0]);
  }

  const options = values.map((item, index) => ({ item, index }));

  const toolbarBtnStyle = { padding: "3px" };

  const addItem = readonly ? null : (
    <Button
      style={toolbarBtnStyle}
      tooltip="Add"
      onClick={() => setEdit({ selected: null, text: "" })}
    >
      <MdAddCircleOutline className="icon" />
    </Button>
  );

  const inputWithAddButton = (
    <div className="p-grid p-nogutter">
      <div className="p-col">
          <LargeTextField
            onChange={setSingleItem}
            onFinish={(v) => {
              setSingleItem(null);
              if (v === "" && values.length === 0) return;
              if (values.length === 1 && v === values[0]) return;
              onChange(v === "" ? [] : [v]);
            }}
            text={singleItem || ""}
          />
      </div>
      <div className="p-col">{addItem}</div>
    </div>
  );

  const listBoxItemTemplate = (option) => (
    <LargeTextField readonly={true} maxChars={30} text={option.item} />
  );

  const toolbarItems = [
    addItem,
    <Button
      className="p-mr-2"
      tooltip="Edit"
      style={toolbarBtnStyle}
      onClick={() => {
        if (!selected) return;
        const index = selected.index;
        if (index >= 0 && index < values.length) {
          setEdit({ selected, text: values[index] });
        }
      }}
      disabled={selected >= 0}
    >
      <MdEditNote className="icon" />
    </Button>,
    <Button
      className="p-button-danger"
      tooltip="Delete"
      style={toolbarBtnStyle}
      onClick={() => {
        if (!selected) return;
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
      disabled={selected >= 0}
    >
      <MdDeleteForever className="icon" />
    </Button>
  ];

  const multiValuedField = (
    <div>
      {!readonly && <Toolbar style={{ padding: 0 }} left={toolbarItems} />}
      <ListBox
        style={{ maxHeight: "120px", overflow: "auto" }}
        value={selected}
        options={options}
        itemTemplate={listBoxItemTemplate}
        onChange={(e) => readonly || setSelected(e.value)}
      />
    </div>
  );
  return (
    <div>
      {edit === null || (
        <div style={{ position: "absolute" }}>
          <LargeTextField
            text={edit.text}
            onChange={(v) => setEdit({ ...edit, text: v })}
            onFinish={(v) => {
              const changed = values.slice();
              if (!edit.selected) {
                if (v !== "") changed.push(v);
              } else {
                if (v !== "") {
                  changed.splice(edit.selected.index, 1, v);
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
        ? inputWithAddButton
        : values.length > 0 && multiValuedField}
    </div>
  );
};
