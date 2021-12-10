import React, { useCallback, useEffect, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";

export const LargeTextField = ({
    text,
    className,
    onChange,
    onFinish,
    readonly = false,
    maxChars = 40,
    popupMode = 0,
    placeholder = "Click to edit",
}) => {
    // Modes:
    // 0: display only
    // 1: opening popup
    // 2: popup opened
    const [mode, setMode] = useState(0);
    const [overlay, setOverlay] = useState(null);
    const ctl = useRef(null);
    const displayArea = useRef(null);
    const displayPopup = useRef(null);
    const dotsArea = useRef(null);
    const textArea = useRef(null);
    const isTruncated = text.length >= maxChars;

    const opRef = useCallback(
        (node) => {
            if (node !== null) {
                setOverlay(node);
            }
            if (popupMode > 0) {
                setMode(1);
            } 
        },
        [popupMode]
    );

    useEffect(() => {
        if (!!overlay && mode === 1 && !!ctl.current) {
            overlay.show({}, ctl.current);
        }
        if (!readonly && mode === 2 && textArea.current) {
            const ctl = textArea.current;
            ctl.focus();
            ctl.select();
        }
        if (readonly && mode === 2 && displayPopup.current) {
            displayPopup.current.focus();
        }
    }, [mode, overlay, readonly]);

    const emptyLabel = () => (readonly ? "" : placeholder);

    const activate = () => (isTruncated || !readonly) && setMode(1);

    const dots = (
        <span
            ref={dotsArea}
            style={{ letterSpacing: ".1rem" }}
            onClick={(e) => {
                activate();
                e.stopPropagation();
            }}
        >
            ...
        </span>
    );

    const preview = (
        <div
            tabIndex="0"
            ref={displayArea}
            class={className}
            style={{
                boxShadow: mode < 1 ? "" : "0 .15rem 0.3rem rgba(0,0,0,.35)",
                cursor: !readonly || isTruncated ? "cell" : "default",
                visibility: popupMode <= 1 ? "visible" : "collapse"
            }}
            onMouseOver={(e) => {
                if (readonly && isTruncated && dotsArea.current) {
                    dotsArea.current.style.background = "lightgray";
                }
            }}
            onMouseOut={(e) => {
                if (dotsArea.current) {
                    dotsArea.current.style.background = "";
                }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    activate(e);
                }
            }}
            onClick={readonly ? null : activate}
        >
            <span style={{ opacity: text.length === 0 ? 0.5 : 1.0, whiteSpace: "pre" }}>
                {isTruncated ? text.substring(0, maxChars) : text || emptyLabel()}
            </span>
            {!isTruncated || dots}
        </div>
    );

    const expanded = (
        <OverlayPanel
            appendTo={document.body}
            ref={opRef}
            dismissable
            showCloseIcon={true}
            onShow={() => setMode(2)}
            onHide={() => {
                if (!!onFinish) {
                    onFinish(textArea.current.value);
                }
                setMode(0);
                if (popupMode < 2 && displayArea.current) {
                    displayArea.current.focus();
                }
            }}
        >
            {readonly ? (
                <div
                    tabIndex="0"
                    ref={displayPopup}
                    style={{
                        width: "500px",
                        maxHeight: "300px",
                        overflow: "auto"
                    }}
                >
                    <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
                </div>
            ) : (
                <InputTextarea
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          overlay.hide();
                        }
                    }}
                    ref={textArea}
                    value={text}
                    style={{
                        width: "500px",
                        height: "200px"
                    }}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </OverlayPanel>
    );

    return (
        <div
            onKeyDown={(e) => {
                if (e.key === "Escape" && mode === 2) {
                  overlay.hide();
                }
            }}
            ref={ctl}
        >
            {preview}
            {expanded}
        </div>
    );
};