import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/worksheet.css";

function WorksheetEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const worksheetRef = useRef(null);

    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date") || new Date()
        .toISOString()
        .split("T")[0];

    const [loading, setLoading] = useState(true);
    const [worksheet, setWorksheet] = useState(null);

    const [pallets, setPallets] = useState(
        Array.from({ length: 20 }, (_, i) => ({
            pallet: i + 1,
            outers: "",
        }))
    );

    /*
    =========================================================
    LOAD WORKSHEET
    =========================================================
    */

    useEffect(() => {
        if (productId) {
            loadWorksheet();
        } else {
            setLoading(false);
        }
    }, [productId, reportDate]);

    async function loadWorksheet() {
        try {
            setLoading(true);

            const response = await fetch(
                `/api/job-processing/worksheet/?product=${productId}&date=${reportDate || ""}`
            );

            if (!response.ok) {
                throw new Error("Failed to load worksheet");
            }

            const data = await response.json();

            setWorksheet({
                ...data,

                // Keep date blank unless supplied
                date: data.date || "",

                steps: data.steps || [],

                // Make sure editable header values exist
                customer: data.customer || "",
                sku: data.sku || "",
                pallet_configuration:
                    data.pallet_configuration || "",
                product: data.product || "",
                transaction: data.transaction || "",
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    /*
    =========================================================
    UPDATE HEADER FIELD
    =========================================================
    */

    function updateHeader(field, value) {
        setWorksheet((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    /*
    =========================================================
    UPDATE JOB DESCRIPTION
    =========================================================
    */

    function updateStep(index, value) {
        setWorksheet((previous) => {
            const updatedSteps = [
                ...(previous.steps || []),
            ];

            while (updatedSteps.length <= index) {
                updatedSteps.push({
                    step_number:
                        updatedSteps.length + 1,
                    instruction: "",
                });
            }

            updatedSteps[index] = {
                ...updatedSteps[index],
                instruction: value,
            };

            return {
                ...previous,
                steps: updatedSteps,
            };
        });
    }

    /*
    =========================================================
    NUMBER OF JOB DESCRIPTION ROWS
    =========================================================
    */

    const minimumRows = 8;

    const totalRows = Math.max(
        minimumRows,
        worksheet?.steps?.length || 0
    );

    /*
    =========================================================
    UPDATE PALLET
    =========================================================
    */

    function updateOuter(index, value) {
        setPallets((previous) => {
            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                outers: value,
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
        const buttons = document.querySelector(
            ".worksheet-buttons"
        );

        const originalDisplay =
            buttons?.style.display;

        if (buttons) {
            buttons.style.display = "none";
        }

        const printStyle =
            document.createElement("style");

        printStyle.id =
            "worksheet-portrait-print";

        printStyle.innerHTML = `
            @page {
                size: A4 portrait !important;
                margin: 8mm;
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
                    box-shadow: none !important;
                    page-break-after: auto !important;
                }

                input {
                    border: none !important;
                    background: transparent !important;
                }

                [contenteditable="true"] {
                    outline: none !important;
                }
            }
        `;

        document.head.appendChild(printStyle);

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

        const worksheetData = {
            product: productId,

            date: worksheet.date,

            customer: worksheet.customer,

            sku: worksheet.sku,

            product_name: worksheet.product,

            transaction: worksheet.transaction,

            pallet_configuration:
                worksheet.pallet_configuration,

            steps: worksheet.steps,

            pallets: pallets,
        };

        try {

            const response = await fetch(
                "/api/job-processing/worksheet/save/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        worksheetData
                    ),
                }
            );

            const result =
                await response.json();

            console.log(result);

            alert("Worksheet saved");

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
            <div className="worksheet">
                <h2>
                    Loading worksheet...
                </h2>
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
            <div className="worksheet">
                <h2>
                    Please select a product first.
                </h2>
            </div>
        );
    }

    /*
    =========================================================
    ERROR
    =========================================================
    */

    if (!worksheet) {
        return (
            <div className="worksheet">
                <h2>
                    Unable to load worksheet.
                </h2>
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
                id="print-area"
                className="worksheet"
                ref={worksheetRef}
            >

                {/* =================================================
                    TITLE
                ================================================= */}

                <h1 className="worksheet-title">
                    DEKAPAK WORKSHEET
                </h1>


                {/* =================================================
                    HEADER
                ================================================= */}

                <table className="worksheet-header">

                    <tbody>

                        {/* ROW 1 */}

                        <tr>

                            <th>
                                Customer
                            </th>

                            <td
                                contentEditable={true}
                                suppressContentEditableWarning={
                                    true
                                }
                                onInput={(e) =>
                                    updateHeader(
                                        "customer",
                                        e.currentTarget
                                            .textContent
                                    )
                                }
                            >
                                {worksheet.customer}
                            </td>


                            <th>
                                Product Code
                            </th>

                            <td
                                contentEditable={true}
                                suppressContentEditableWarning={
                                    true
                                }
                                onInput={(e) =>
                                    updateHeader(
                                        "sku",
                                        e.currentTarget
                                            .textContent
                                    )
                                }
                            >
                                {worksheet.sku}
                            </td>

                        </tr>


                        {/* ROW 2 */}

                        <tr>

                            <th>
                                Pallet Configuration
                            </th>

                            <td
                                contentEditable={true}
                                suppressContentEditableWarning={
                                    true
                                }
                                onInput={(e) =>
                                    updateHeader(
                                        "pallet_configuration",
                                        e.currentTarget
                                            .textContent
                                    )
                                }
                            >
                                {
                                    worksheet.pallet_configuration
                                }
                            </td>


                            <th>
                                Product Name
                            </th>

                            <td
                                contentEditable={true}
                                suppressContentEditableWarning={
                                    true
                                }
                                onInput={(e) =>
                                    updateHeader(
                                        "product",
                                        e.currentTarget
                                            .textContent
                                    )
                                }
                            >
                                {worksheet.product}
                            </td>

                        </tr>


                        {/* ROW 3 */}

                        <tr>

                            <th>
                                Job Type
                            </th>

                            <td
                                contentEditable={true}
                                suppressContentEditableWarning={
                                    true
                                }
                                onInput={(e) =>
                                    updateHeader(
                                        "transaction",
                                        e.currentTarget
                                            .textContent
                                    )
                                }
                            >
                                {worksheet.transaction}
                            </td>


                            <th>
                                Date
                            </th>

                            <td>

                                <input
                                    type="date"
                                    value={
                                        worksheet.date || ""
                                    }
                                    onChange={(e) =>
                                        updateHeader(
                                            "date",
                                            e.target.value
                                        )
                                    }
                                />

                            </td>

                        </tr>

                    </tbody>

                </table>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="worksheet-content">


                    {/* =================================================
                        JOB DESCRIPTION
                    ================================================= */}

                    <div className="job-description">

                        <div className="job-title">
                            Job Description
                        </div>


                        {Array.from({
                            length: totalRows,
                        }).map((_, index) => {

                            const instruction =
                                worksheet.steps?.[
                                    index
                                ]?.instruction || "";

                            return (
                                <div
                                    key={index}
                                    className="job-row"
                                    contentEditable={true}
                                    suppressContentEditableWarning={
                                        true
                                    }
                                    onInput={(e) =>
                                        updateStep(
                                            index,
                                            e.currentTarget
                                                .textContent
                                        )
                                    }
                                >
                                    {instruction}
                                </div>
                            );
                        })}

                    </div>


                    {/* =================================================
                        PALLET TABLE
                    ================================================= */}

                    <table className="pallet-table">

                        <thead>

                            <tr>

                                <th>
                                    Pallet No.
                                </th>

                                <th>
                                    No. of Outers
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {pallets.map(
                                (pallet, index) => (

                                    <tr
                                        key={index}
                                    >

                                        <td>
                                            {
                                                pallet.pallet
                                            }
                                        </td>

                                        <td>

                                            <input
                                                type="number"
                                                value={
                                                    pallet.outers
                                                }
                                                onChange={(e) =>
                                                    updateOuter(
                                                        index,
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            />

                                        </td>

                                    </tr>

                                )
                            )}


                            {/* TOTAL */}

                            <tr>

                                <td>
                                    <strong>
                                        Totals
                                    </strong>
                                </td>

                                <td>
                                    <input
                                        type="number"
                                    />
                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="worksheet-footer">

                    <div className="footer-item">

                        <span>
                            Please initial when
                            instructions are understood:
                        </span>

                        <div className="signature-line"></div>

                    </div>


                    <div className="footer-item">

                        <span>
                            Supervisors Signature:
                        </span>

                        <div className="signature-line"></div>

                    </div>


                    <div className="footer-item">

                        <span>
                            Office Use:
                        </span>

                        <div className="signature-line"></div>

                    </div>

                </div>

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="worksheet-buttons no-print">

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
                        navigate("/jobprocessing")
                    }
                >
                    Cancel
                </button>

            </div>
        </>
    );
}

export default WorksheetEditor;