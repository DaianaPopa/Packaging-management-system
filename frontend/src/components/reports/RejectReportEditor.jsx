import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/reject.css";
import ReportIssueMeta from "./ReportIssueMeta";

function RejectReportEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportRef = useRef(null);

    /*
    =========================================================
    PRODUCT / DATE
    =========================================================
    */

    const productId = searchParams.get("product");

    const reportDate =
        searchParams.get("date") ||
        new Date().toISOString().split("T")[0];

    /*
    =========================================================
    LOADING / ERROR
    =========================================================
    */

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    =========================================================
    REPORT
    =========================================================
    */

    const [report, setReport] = useState({
        customer: "",
        product: "",
        sku: "",
        issue: "",
        date: "",
    });

    /*
    =========================================================
    PACKAGING REJECTS
    =========================================================

    Automatic component rows + 5 blank rows
    */

    const [packagingRejects, setPackagingRejects] =
        useState([]);

    /*
    =========================================================
    PRODUCT REJECTS
    =========================================================

    One product row + 5 blank rows
    */

    const [productRejects, setProductRejects] =
        useState([]);

    function resizeRejectText(field) {
        field.style.height = "auto";
        field.style.height = `${field.scrollHeight}px`;
    }

    /*
    =========================================================
    LOAD REPORT
    =========================================================
    */

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            setLoading(false);
            return;
        }

        loadRejectReport();
    }, [productId, reportDate]);

    async function loadRejectReport() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/job-processing/reject-report/?product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                const errorData =
                    await response
                        .json()
                        .catch(() => null);

                throw new Error(
                    errorData?.error ||
                    "Failed to load reject report"
                );
            }

            const data = await response.json();

            console.log(
                "Reject Report API:",
                data
            );

            /*
            -------------------------------------------------
            REPORT HEADER
            -------------------------------------------------
            */

            setReport({
                customer: data.customer || "",
                product: data.product || "",
                sku: data.sku || "",
                issue: data.issue || "",
                date: "",
            });

            /*
            =================================================
            PACKAGING COMPONENTS
            =================================================
            */

            const packagingComponents =
                (data.components || [])
                    .filter((component) =>
                        component.component_sku?.trim().toUpperCase().startsWith("ZM")
                    )
                    .map((component) => ({
                        id:
                            `component-${component.id}`,

                        type: "component",

                        sku:
                            component.component_sku ||
                            "",

                        name:
                            component.component_name ||
                            "",

                        incoming: "",
                        incomingReason: "",

                        inhouse: "",
                        inhouseReason: "",
                    }));

            const productComponents =
                (data.components || [])
                    .filter((component) =>
                        component.component_sku?.trim().toUpperCase().startsWith("MB")
                    )
                    .map((component) => ({
                        id: `product-${component.id}`,
                        type: "product",
                        sku: component.component_sku || "",
                        name: component.component_name || "",
                        incoming: "",
                        incomingReason: "",
                        inhouse: "",
                        inhouseReason: "",
                    }));

            /*
            -------------------------------------------------
            ADD 5 COMPLETELY BLANK ROWS
            -------------------------------------------------
            */

            const packagingBlankRows =
                Array.from(
                    { length: 4 },
                    (_, index) => ({
                        id:
                            `packaging-blank-${index}`,

                        type: "manual",

                        sku: "",
                        name: "",

                        incoming: "",
                        incomingReason: "",

                        inhouse: "",
                        inhouseReason: "",
                    })
                );

            setPackagingRejects([
                ...packagingComponents,
                ...packagingBlankRows,
            ]);

            /*
            =================================================
            PRODUCT REJECT TABLE
            =================================================
            */

            /*
            -------------------------------------------------
            ADD 5 COMPLETELY BLANK ROWS
            -------------------------------------------------
            */

            const productBlankRows =
                Array.from(
                    { length: 4 },
                    (_, index) => ({
                        id:
                            `product-blank-${index}`,

                        type: "manual",

                        sku: "",
                        name: "",

                        incoming: "",
                        incomingReason: "",

                        inhouse: "",
                        inhouseReason: "",
                    })
                );

            setProductRejects([
                ...productComponents,
                ...productBlankRows,
            ]);

        } catch (err) {
            console.error(
                "Reject report error:",
                err
            );

            setError(
                err.message ||
                "Failed to load reject report."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
    =========================================================
    UPDATE REPORT
    =========================================================
    */

    function updateReport(
        field,
        value
    ) {
        setReport((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    /*
    =========================================================
    UPDATE PACKAGING ROW
    =========================================================
    */

    function updatePackaging(
        index,
        field,
        value
    ) {
        setPackagingRejects((previous) => {

            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    }

    /*
    =========================================================
    UPDATE PRODUCT ROW
    =========================================================
    */

    function updateProduct(
        index,
        field,
        value
    ) {
        setProductRejects((previous) => {

            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    }

    /*
    =========================================================
    PRINT
    =========================================================
    */

    const handlePrint = () => {

        const buttons =
            document.querySelector(
                ".reject-buttons"
            );

        const originalDisplay =
            buttons?.style.display;

        if (buttons) {
            buttons.style.display = "none";
        }

        const printStyle =
            document.createElement("style");

        printStyle.id =
            "reject-portrait-print";

        printStyle.innerHTML = `
            @page {
                size: A4 portrait !important;
                margin: 12mm;
            }

            @media print {

                body {
                    width: 100% !important;
                    margin: 0 !important;
                }

                #print-area {
                    width: 100% !important;
                    height: auto !important;
                    min-height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: static !important;
                    box-shadow: none !important;
                }

                input {
                    border: none !important;
                    background: transparent !important;
                }

                .no-print {
                    display: none !important;
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

    /*
    =========================================================
    SAVE
    =========================================================
    */
    const handleSave = async () => {
        const rejectReportData = {
            product: productId,
            date: reportDate,
            issue: report.issue,
            customer: report.customer,
            product_name: report.product,
            sku: report.sku,
            packagingRejects: packagingRejects.map((row) => ({
                type: row.type,
                component_id:
                    row.type === "component"
                        ? row.id.replace("component-", "")
                        : null,
                sku: row.sku,
                name: row.name,
                incoming: row.incoming,
                incoming_reason: row.incomingReason,
                inhouse: row.inhouse,
                inhouse_reason: row.inhouseReason,
            })),
            productRejects: productRejects.map((row) => ({
                type: row.type,
                sku: row.sku,
                name: row.name,
                incoming: row.incoming,
                incoming_reason: row.incomingReason,
                inhouse: row.inhouse,
                inhouse_reason: row.inhouseReason,
            })),
        };

        console.log("Reject report ready to save:", rejectReportData);

        try {
            const response = await fetch("/api/job-processing/reject-report/save/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(rejectReportData),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error);
                return;
            }

            alert(result.message);
        } catch (error) {
            console.error(error);
            alert("Save failed");
        }
    };

    /*
    =========================================================
    LOADING
    =========================================================
    */

    if (loading) {
        return (
            <div className="reject-page">

                <h2>
                    Loading reject report...
                </h2>

            </div>
        );
    }

    /*
    =========================================================
    ERROR
    =========================================================
    */

    if (error) {
        return (
            <div className="reject-page">

                <h2>
                    Unable to load reject report
                </h2>

                <p>
                    {error}
                </p>

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

    /*
    =========================================================
    NO PRODUCT
    =========================================================
    */

    if (!productId) {
        return (
            <div className="reject-page">

                <h2>
                    Please select a product first.
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

    /*
    =========================================================
    PAGE
    =========================================================
    */

    return (
        <>
            <div
                className="reject-page"
                id="print-area"
                ref={reportRef}
            >

                {/* ==================================================
                    TITLE
                ================================================== */}

                <h1 className="reject-title">
                    REJECT REPORT
                </h1>

                <ReportIssueMeta issue={report.issue} onIssueChange={(value) => updateReport("issue", value)} />

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="reject-header">

                    <div className="header-box">

                        <label>
                            Customer
                        </label>

                        <input type="text" value={report.customer} onChange={(e) => updateReport("customer", e.target.value)} />

                    </div>


                    <div className="header-box">

                        <label>
                            Product
                        </label>

                        <input className="header-value product-name" type="text" value={report.product} onChange={(e) => updateReport("product", e.target.value)} />

                    </div>

                    <div className="header-box">

                        <label>
                            SKU
                        </label>

                        <input type="text" value={report.sku} onChange={(e) => updateReport("sku", e.target.value)} />

                    </div>


                    <div className="header-box">

                        <label>
                            Date
                        </label>

                        <input
                            type="text"
                            value={
                                report.date || ""
                            }
                            onChange={(e) =>
                                updateReport(
                                    "date",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* ==================================================
                    NOTE
                ================================================== */}

                <div className="reject-note">

                    Rejects to be recorded, stored,
                    secured and labelled accordingly.
                    This report is to be sent to the
                    office at the end of each shift
                    or production run.

                </div>


                {/* ==================================================
                    PACKAGING REJECTS
                ================================================== */}

                <div className="reject-section">

                    <div className="section-title">
                        PACKAGING REJECTS
                    </div>


                    <table className="reject-table">

                        <thead>

                            <tr>

                                <th>
                                    Code / Description
                                </th>

                                <th>
                                    Incoming Rejects
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Inhouse Rejects
                                </th>

                                <th>
                                    Reason
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {packagingRejects.map(
                                (
                                    row,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            row.id
                                        }
                                        className={row.type === "manual" ? "reject-manual-row" : ""}
                                    >

                                        {/* CODE / DESCRIPTION */}

                                        <td>

                                            {row.type === "component" ? (
                                                <div className="manual-reject-product">
                                                    <textarea rows="1" value={row.sku} onInput={(e) => resizeRejectText(e.currentTarget)} onChange={(e) => updatePackaging(index, "sku", e.target.value)} />
                                                    <textarea rows="1" value={row.name} onInput={(e) => resizeRejectText(e.currentTarget)} onChange={(e) => updatePackaging(index, "name", e.target.value)} />
                                                </div>
                                            ) : (

                                                <div className="manual-reject-product">

                                                    <textarea
                                                        rows="1"
                                                        value={
                                                            row.sku
                                                        }
                                                        onInput={(e) => resizeRejectText(e.currentTarget)}
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updatePackaging(
                                                                index,
                                                                "sku",
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <textarea
                                                        rows="1"
                                                        value={
                                                            row.name
                                                        }
                                                        onInput={(e) => resizeRejectText(e.currentTarget)}
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updatePackaging(
                                                                index,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            )}

                                        </td>


                                        {/* INCOMING */}

                                        <td>

                                            <input
                                                type="number"
                                                value={
                                                    row.incoming
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updatePackaging(
                                                        index,
                                                        "incoming",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INCOMING REASON */}

                                        <td>

                                            <textarea
                                                rows="1"
                                                value={
                                                    row.incomingReason
                                                }
                                                onInput={(e) => resizeRejectText(e.currentTarget)}
                                                onChange={(
                                                    e
                                                ) =>
                                                    updatePackaging(
                                                        index,
                                                        "incomingReason",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INHOUSE */}

                                        <td>

                                            <input
                                                type="number"
                                                value={
                                                    row.inhouse
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updatePackaging(
                                                        index,
                                                        "inhouse",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INHOUSE REASON */}

                                        <td>

                                            <textarea
                                                rows="1"
                                                value={
                                                    row.inhouseReason
                                                }
                                                onInput={(e) => resizeRejectText(e.currentTarget)}
                                                onChange={(
                                                    e
                                                ) =>
                                                    updatePackaging(
                                                        index,
                                                        "inhouseReason",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>


                {/* ==================================================
                    PRODUCT REJECTS
                ================================================== */}

                <div className="reject-section">

                    <div className="section-title">
                        PRODUCT REJECTS
                    </div>


                    <table className="reject-table">

                        <thead>

                            <tr>

                                <th>
                                    Code / Description
                                </th>

                                <th>
                                    Incoming Rejects
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Inhouse Rejects
                                </th>

                                <th>
                                    Reason
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {productRejects.map(
                                (
                                    row,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            row.id
                                        }
                                        className={row.type === "manual" ? "reject-manual-row" : ""}
                                    >

                                        {/* CODE / DESCRIPTION */}

                                        <td>

                                            {row.type === "product" ? (
                                                <div className="manual-reject-product">
                                                    <textarea rows="1" value={row.sku} onInput={(e) => resizeRejectText(e.currentTarget)} onChange={(e) => updateProduct(index, "sku", e.target.value)} />
                                                    <textarea rows="1" value={row.name} onInput={(e) => resizeRejectText(e.currentTarget)} onChange={(e) => updateProduct(index, "name", e.target.value)} />
                                                </div>
                                            ) : (

                                                <div className="manual-reject-product">

                                                    <textarea
                                                        rows="1"
                                                        value={
                                                            row.sku
                                                        }
                                                        onInput={(e) => resizeRejectText(e.currentTarget)}
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateProduct(
                                                                index,
                                                                "sku",
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <textarea
                                                        rows="1"
                                                        value={
                                                            row.name
                                                        }
                                                        onInput={(e) => resizeRejectText(e.currentTarget)}
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateProduct(
                                                                index,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            )}

                                        </td>


                                        {/* INCOMING */}

                                        <td>

                                            <input
                                                type="number"
                                                value={
                                                    row.incoming
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateProduct(
                                                        index,
                                                        "incoming",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INCOMING REASON */}

                                        <td>

                                            <textarea
                                                rows="1"
                                                value={
                                                    row.incomingReason
                                                }
                                                onInput={(e) => resizeRejectText(e.currentTarget)}
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateProduct(
                                                        index,
                                                        "incomingReason",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INHOUSE */}

                                        <td>

                                            <input
                                                type="number"
                                                value={
                                                    row.inhouse
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateProduct(
                                                        index,
                                                        "inhouse",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* INHOUSE REASON */}

                                        <td>

                                            <textarea
                                                rows="1"
                                                value={
                                                    row.inhouseReason
                                                }
                                                onInput={(e) => resizeRejectText(e.currentTarget)}
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateProduct(
                                                        index,
                                                        "inhouseReason",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="reject-buttons no-print">

                <button
                    className="save-btn"
                    onClick={handleSave}
                >
                    Save
                </button>


                <button
                    className="print-btn"
                    onClick={handlePrint}
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

export default RejectReportEditor;