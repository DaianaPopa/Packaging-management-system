import React, { useEffect, useState, useRef,} from "react";
import {useNavigate,useSearchParams,} from "react-router-dom";
import "../../styles/traceability.css";
import ReportIssueMeta from "./ReportIssueMeta";


function TraceabilityEditor() {
    const navigate = useNavigate();
    const traceabilityRef = useRef(null);
    const [searchParams] = useSearchParams();

    // ==================================================
    // PRODUCT
    // ==================================================

    const productId =
        searchParams.get("product");

    const reportDate =
        searchParams.get("date") ||
        new Date()
            .toISOString()
            .split("T")[0];

    // ==================================================
    // STATE
    // ==================================================

    const [loading, setLoading] =useState(true);
    const [components, setComponents] =useState([]);
    const packedProducts = components.filter(
        (component) => component.component_sku?.trim().toUpperCase().startsWith("MB")
    );
    const productColumnSlots = [
        ...packedProducts,
        ...Array.from(
            { length: Math.max(0, 4 - packedProducts.length) },
            (_, index) => ({ id: `blank-product-${index}`, isPlaceholder: true })
        ),
    ];
    const [traceability, setTraceability] =
        useState({
            customer: "",
            product: "",
            sku: "",
            issue: "",
            issueDate: "",
            date: "",
            processOrder: "",
            outgoingBatchCode: "",
        });


    // ==================================================
    // TRACEABILITY ROWS
    // ==================================================

    const [rows, setRows] = useState(
        Array.from(
            { length: 7 },
            () => ({
                dpNo: "",
                palletNo: "",
                components: {},
            })
        )
    );


    // ==================================================
    // LOAD TRACEABILITY
    // ==================================================

    useEffect(() => {

        if (productId) {

            loadTraceability();

        } else {

            setLoading(false);

        }

    }, [productId, reportDate]);


    async function loadTraceability() {

        try {

            setLoading(true);


            const response =
                await fetch(
                    `/api/job-processing/traceability/?product=${productId}&date=${reportDate}`
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to load traceability"
                );

            }


            const data =
                await response.json();


            console.log(
                "TRACEABILITY DATA:",
                data
            );


            setTraceability({

                customer:
                    data.customer || "",

                product:
                    data.product || "",

                sku:
                    data.sku || "",

                issue:
                    data.issue || "",

                issueDate:
                    data.issue_date || "",

                date: "",

                processOrder: "",

                outgoingBatchCode: "",

            });


            setComponents(
                data.components || []
            );


        } catch (error) {

            console.error(
                "Traceability error:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    // ==================================================
    // UPDATE DP / PALLET
    // ==================================================

    function updateRow(
        rowIndex,
        field,
        value
    ) {

        setRows(
            (previousRows) => {

                const updatedRows =
                    [...previousRows];


                updatedRows[rowIndex] = {
                    ...updatedRows[rowIndex],
                    [field]: value,
                };


                return updatedRows;

            }
        );

    }

    function updateComponent(index, field, value) {
        setComponents((previous) => previous.map((component, componentIndex) =>
            componentIndex === index
                ? { ...component, [field]: value }
                : component
        ));
    }


    // ==================================================
    // UPDATE COMPONENT CODE
    // ==================================================

    function updateComponentCode(
        rowIndex,
        componentId,
        value
    ) {

        setRows(
            (previousRows) => {

                const updatedRows =
                    [...previousRows];


                updatedRows[rowIndex] = {

                    ...updatedRows[rowIndex],

                    components: {

                        ...updatedRows[
                            rowIndex
                        ].components,

                        [`${componentId}_code`]:
                            value,

                    },

                };


                return updatedRows;

            }
        );

    }


    // ==================================================
    // UPDATE COMPONENT QUANTITY
    // ==================================================

    function updateComponentQuantity(
        rowIndex,
        componentId,
        value
    ) {

        setRows(
            (previousRows) => {

                const updatedRows =
                    [...previousRows];


                updatedRows[rowIndex] = {

                    ...updatedRows[rowIndex],

                    components: {

                        ...updatedRows[
                            rowIndex
                        ].components,

                        [`${componentId}_qty`]:
                            value,

                    },

                };


                return updatedRows;

            }
        );

    }


    // ==================================================
    // PRINT
    // ==================================================

    const handlePrint = () => {

        const buttons =
            document.querySelector(
                ".worksheet-buttons"
            );


        const originalDisplay =
            buttons?.style.display;


        if (buttons) {

            buttons.style.display =
                "none";

        }


        const printStyle =
            document.createElement(
                "style"
            );


        printStyle.id =
            "traceability-landscape-print";


        printStyle.innerHTML = `

            @page {
                size: A4 landscape !important;
                margin: 5mm;
            }

            @media print {

                body {
                    width: 100% !important;
                }

                #print-area {

                    width: 100% !important;

                    height: auto !important;

                    min-height: 210mm !important;

                    box-shadow: none !important;

                    page-break-after: auto !important;

                }

            }

        `;


        document.head.appendChild(
            printStyle
        );


        window.print();


        setTimeout(() => {

            if (buttons) {

                buttons.style.display =
                    originalDisplay || "";

            }


            printStyle.remove();

        }, 1000);

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <h2>
                Loading traceability...
            </h2>
        );

    }


    // ==================================================
    // NO PRODUCT
    // ==================================================

    if (!productId) {

        return (

            <div>

                <h2>
                    Please select a product
                    first.
                </h2>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/jobprocessing"
                        )
                    }
                >
                    Back to Job Processing
                </button>

            </div>

        );

    }

    // save button
        const handleSave = async () => {

        const traceabilityData = {

            product: productId,

            date: reportDate,

            issue: traceability.issue,

            customer: traceability.customer,

            product_name: traceability.product,

            sku: traceability.sku,

            processOrder:
                traceability.processOrder,

            outgoingBatchCode:
                traceability.outgoingBatchCode,

            components,

            rows: rows,
        };

        try {

            const response = await fetch(
                "/api/job-processing/traceability/save/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        traceabilityData
                    ),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                alert(result.error);
                return;
            }

            alert(result.message);

        } catch (error) {

            console.error(error);

            alert("Save failed");
        }
    }

    // ==================================================
    // PAGE
    // ==================================================

    return (

        <>

            <div
                className="traceability-page"
                id="print-area"
                ref={traceabilityRef}
            >
                <h1 className="traceability-title">
                    Traceability Sheet - Multiple Components
                </h1>

                <ReportIssueMeta issue={traceability.issue} onIssueChange={(value) => setTraceability((previous) => ({ ...previous, issue: value }))} />

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="traceability-header">


                    {/* LEFT */}
                    <div className="traceability-header-left">

                        <div>
                            <strong>
                                Customer:
                            </strong>

                            {" "}

                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => setTraceability((previous) => ({ ...previous, customer: e.currentTarget.textContent }))}
                            >
                                {traceability.customer}
                            </span>

                        </div>


                        <div>

                            <strong>
                                Date:
                            </strong>


                            <input
                                type="text"
                                value={
                                    traceability.date
                                }
                                onChange={(e) =>
                                    setTraceability(
                                        {
                                            ...traceability,

                                            date:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                            />

                        </div>


                        <div>

                            If Part Pallet of WIP
                            enters room, please
                            enter quantity in Qty
                            column

                        </div>


                        <div>

                            <strong>
                                Outgoing Palman
                                batch code:
                            </strong>


                            <input
                                type="text"
                                value={
                                    traceability.outgoingBatchCode
                                }
                                onChange={(e) =>
                                    setTraceability(
                                        {
                                            ...traceability,

                                            outgoingBatchCode:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                            />

                        </div>


                        <div>

                            <strong>
                                Product Line:
                            </strong>

                            {" "}

                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => setTraceability((previous) => ({ ...previous, product: e.currentTarget.textContent }))}
                            >
                                {traceability.product}
                            </span>

                        </div>

                    </div>


                    {/* RIGHT */}
                    <div className="traceability-header-right">


                        <div>

                            <strong>
                                Process Order:
                            </strong>


                            <input
                                type="text"
                                value={
                                    traceability.processOrder
                                }
                                onChange={(e) =>
                                    setTraceability(
                                        {
                                            ...traceability,

                                            processOrder:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                            />

                        </div>


                        <div>

                            <strong>
                                Line Code:
                            </strong>

                            {" "}

                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => setTraceability((previous) => ({ ...previous, sku: e.currentTarget.textContent }))}
                            >
                                {traceability.sku}
                            </span>

                        </div>


                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <table className="traceability-table">


                    <thead>

                        {/* MAIN HEADER */}

                        <tr>

                            <th rowSpan="2">
                                DP No
                            </th>


                            <th rowSpan="2">
                                Pallet No
                            </th>


                            <th
                                colSpan={
                                    productColumnSlots.length * 2
                                }
                            >
                                DETAILS OF PACKED
                                COMPONENTS
                            </th>

                        </tr>


                        {/* COMPONENT HEADERS */}

                        <tr>

                            {productColumnSlots.map(
                                (component, componentIndex) => (

                                    <React.Fragment
                                        key={
                                            component.id
                                        }
                                    >

                                        <th>

                                            {!component.isPlaceholder && (
                                                <span
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onInput={(e) => updateComponent(componentIndex, "component_name", e.currentTarget.textContent)}
                                                >
                                                    {component.component_name || ""}
                                                </span>
                                            )}

                                            <br />

                                            <small>
                                                {!component.isPlaceholder && (
                                                    <span
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onInput={(e) => updateComponent(componentIndex, "component_sku", e.currentTarget.textContent)}
                                                    >
                                                        {component.component_sku || ""}
                                                    </span>
                                                )}
                                            </small>

                                        </th>


                                        <th className="traceability-qty-column">
                                            Qty
                                        </th>

                                    </React.Fragment>

                                )
                            )}

                        </tr>

                    </thead>


                    {/* ==================================================
                        TABLE BODY
                    ================================================== */}

                    <tbody>

                        {rows.map(
                            (
                                row,
                                rowIndex
                            ) => (

                                <tr
                                    key={
                                        rowIndex
                                    }
                                >


                                    {/* DP NO */}

                                    <td>

                                        <input
                                            type="text"
                                            value={
                                                row.dpNo
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateRow(
                                                    rowIndex,
                                                    "dpNo",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </td>


                                    {/* PALLET NO */}

                                    <td>

                                        <input
                                            type="text"
                                            value={
                                                row.palletNo
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                updateRow(
                                                    rowIndex,
                                                    "palletNo",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </td>


                                    {/* COMPONENTS */}

                                    {productColumnSlots.map(
                                        (
                                            component
                                        ) => (

                                            component.isPlaceholder ? (
                                                <React.Fragment key={component.id}>
                                                    <td></td>
                                                    <td className="traceability-qty-column"></td>
                                                </React.Fragment>
                                            ) : <React.Fragment
                                                key={
                                                    component.id
                                                }
                                            >


                                                {/* COMPONENT CODE */}

                                                <td>

                                                    <input
                                                        type="text"
                                                        value={
                                                            row
                                                                .components?.[
                                                                `${component.id}_code`
                                                            ] ||
                                                            ""
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateComponentCode(
                                                                rowIndex,
                                                                component.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                </td>


                                                {/* QUANTITY */}

                                                <td className="traceability-qty-column">

                                                    <input
                                                        type="number"
                                                        value={
                                                            row
                                                                .components?.[
                                                                `${component.id}_qty`
                                                            ] ||
                                                            ""
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateComponentQuantity(
                                                                rowIndex,
                                                                component.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                </td>

                                            </React.Fragment>

                                        )
                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="worksheet-buttons no-print">


              <button
                  className="save-btn"
                  type="button"
                  onClick={handleSave}
               >
                   Save
               </button>


                <button
                    className="print-btn"
                    type="button"
                    onClick={
                        handlePrint
                    }
                >
                    Print
                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/jobprocessing"
                        )
                    }
                >
                    Cancel
                </button>


            </div>

        </>

    );
}


export default TraceabilityEditor;