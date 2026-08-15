import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/check.css";

function ChecksheetEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sheetRef = useRef(null);

    const productId = searchParams.get("product");
    const reportDate =
        searchParams.get("date") ||
        new Date().toISOString().split("T")[0];

    const [loading, setLoading] = useState(true);
    const [sheet, setSheet] = useState(null);
    const [error, setError] = useState("");

    /*
    ---------------------------------------------------------
    LOAD CHECKSHEET
    ---------------------------------------------------------
    */

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            setLoading(false);
            return;
        }

        loadChecksheet();
    }, [productId, reportDate]);

    async function loadChecksheet() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/job-processing/checksheet/?product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => null);

                throw new Error(
                    errorData?.error ||
                    "Failed to load checksheet"
                );
            }

            const data = await response.json();

            console.log("Checksheet API:", data);

            setSheet({
                customer: data.customer || "",
                product: data.product || "",
                sku: data.sku || "",
                date: data.date || reportDate,

                time1: "",
                initial1: "",

                time2: "",
                initial2: "",

                outerCodingImage:
                    data.outerCodingImage || "",

                productCodingImage:
                    data.productCodingImage || "",

                evidenceImage:
                    data.evidenceImage || "",

                outerCodingImage2:
                    data.outerCodingImage2 || "",

                productCodingImage2:
                    data.productCodingImage2 || "",

                evidenceImage2:
                    data.evidenceImage2 || "",
            });

        } catch (err) {
            console.error(
                "Checksheet error:",
                err
            );

            setError(
                err.message ||
                "Failed to load checksheet."
            );

        } finally {
            setLoading(false);
        }
    }

    /*
    ---------------------------------------------------------
    UPDATE SHEET
    ---------------------------------------------------------
    */

    function updateSheet(field, value) {
        setSheet((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    /*
    ---------------------------------------------------------
    PRINT
    ---------------------------------------------------------
    */

    const handlePrint = () => {
        const buttons =
            document.querySelector(
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
            "checksheet-portrait-print";

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
                    padding: 0 !important;
                    box-shadow: none !important;
                    page-break-after: auto !important;
                }

                input {
                    border: none !important;
                    background: transparent !important;
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
    ---------------------------------------------------------
    SAVE
    ---------------------------------------------------------
    */
    const handleSave = async () => {

    const checksheetData = {
            product: productId,

            date: sheet.date,

            time1: sheet.time1,
            initial1: sheet.initial1,

            time2: sheet.time2,
            initial2: sheet.initial2,

            outerCodingImage:
                sheet.outerCodingImage,

            productCodingImage:
                sheet.productCodingImage,

            evidenceImage:
                sheet.evidenceImage,

            outerCodingImage2:
                sheet.outerCodingImage2,

            productCodingImage2:
                sheet.productCodingImage2,

            evidenceImage2:
                sheet.evidenceImage2,
        };

        try {

            const response = await fetch(
                "/api/job-processing/checksheet/save/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        checksheetData
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
    };
    /*
    ---------------------------------------------------------
    LOADING
    ---------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="datecoding-page">
                <h2>
                    Loading checksheet...
                </h2>
            </div>
        );
    }

    /*
    ---------------------------------------------------------
    ERROR
    ---------------------------------------------------------
    */

    if (error) {
        return (
            <div className="datecoding-page">

                <h2>
                    Unable to load checksheet
                </h2>

                <p>{error}</p>

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
    ---------------------------------------------------------
    NO PRODUCT
    ---------------------------------------------------------
    */

    if (!productId) {
        return (
            <div className="datecoding-page">

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
    ---------------------------------------------------------
    NO SHEET
    ---------------------------------------------------------
    */

    if (!sheet) {
        return (
            <div className="datecoding-page">

                <h2>
                    Unable to load checksheet.
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
    ---------------------------------------------------------
    PAGE
    ---------------------------------------------------------
    */

    return (
        <>
            <div
                className="datecoding-page"
                id="print-area"
                ref={sheetRef}
            >

                {/* ==================================================
                    TITLE
                ================================================== */}

                <h1 className="datecoding-title">
                    DATE CODING & LABEL CHECK SHEET
                </h1>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="datecoding-header">

                    <div className="header-box product">

                        <label>
                            Product
                        </label>

                        <div>
                            {sheet.sku
                                ? `${sheet.sku} - `
                                : ""}
                            {sheet.product}
                        </div>

                    </div>


                    <div className="header-box date">

                        <label>
                            Date
                        </label>

                        <input
                            type="date"
                            value={
                                sheet.date || ""
                            }
                            onChange={(e) =>
                                updateSheet(
                                    "date",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* ==================================================
                    INSTRUCTIONS
                ================================================== */}

                <div className="instruction-text">

                    BEST BEFORE & LOT CODE to be
                    attached from both product and
                    outer packaging. Start of
                    product check to be done by
                    Quality Manager.

                </div>


                {/* ==================================================
                    SECTION 1
                ================================================== */}

                <div className="coding-section">


                    {/* OUTER CODING */}

                    <div className="outer-coding-box">

                        {sheet.outerCodingImage ? (

                            <img
                                src={
                                    sheet.outerCodingImage
                                }
                                alt="Outer Coding"
                                className="coding-image"
                            />

                        ) : (

                            <div className="placeholder-text">
                                OUTER CODING
                            </div>

                        )}

                    </div>


                    {/* PRODUCT COLUMN */}

                    <div className="product-column">


                        {/* TIME / INITIAL */}

                        <div className="time-row">


                            <div className="time-box">

                                <label>
                                    Time:
                                </label>

                                <input
                                    type="text"
                                    value={
                                        sheet.time1
                                    }
                                    onChange={(e) =>
                                        updateSheet(
                                            "time1",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="time-box">

                                <label>
                                    Initial:
                                </label>

                                <input
                                    type="text"
                                    value={
                                        sheet.initial1
                                    }
                                    onChange={(e) =>
                                        updateSheet(
                                            "initial1",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* PRODUCT CODING */}

                        <div className="product-coding-box">

                            {sheet.productCodingImage ? (

                                <img
                                    src={
                                        sheet.productCodingImage
                                    }
                                    alt="Product Coding"
                                    className="coding-image"
                                />

                            ) : (

                                <div className="placeholder-text">
                                    PRODUCT CODING
                                </div>

                            )}

                        </div>


                        {/* CCP NOTE */}

                        <div className="ccp-note">

                            At the start of a
                            production run, attach
                            evidence of packaging
                            matching the specification
                            below.

                            <span>
                                {" "}CCP 2
                            </span>

                        </div>


                        {/* EVIDENCE */}

                        <div className="evidence-box">

                            {sheet.evidenceImage && (

                                <img
                                    src={
                                        sheet.evidenceImage
                                    }
                                    alt="Evidence"
                                    className="coding-image"
                                />

                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    CHANGE NOTE
                ================================================== */}

                <div className="change-note">

                    Any change of BEST BEFORE
                    and/or LOT CODE should be
                    attached below with new date
                    code, time of change and the
                    signature of supervisor in
                    charge.

                </div>


                {/* ==================================================
                    SECTION 2
                ================================================== */}

                <div className="coding-section">


                    {/* OUTER CODING */}

                    <div className="outer-coding-box">

                        {sheet.outerCodingImage2 ? (

                            <img
                                src={
                                    sheet.outerCodingImage2
                                }
                                alt="Outer Coding"
                                className="coding-image"
                            />

                        ) : (

                            <div className="placeholder-text">
                                OUTER CODING
                            </div>

                        )}

                    </div>


                    {/* PRODUCT COLUMN */}

                    <div className="product-column">


                        {/* TIME / INITIAL */}

                        <div className="time-row">


                            <div className="time-box">

                                <label>
                                    Time:
                                </label>

                                <input
                                    type="text"
                                    value={
                                        sheet.time2
                                    }
                                    onChange={(e) =>
                                        updateSheet(
                                            "time2",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="time-box">

                                <label>
                                    Initial:
                                </label>

                                <input
                                    type="text"
                                    value={
                                        sheet.initial2
                                    }
                                    onChange={(e) =>
                                        updateSheet(
                                            "initial2",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* PRODUCT CODING */}

                        <div className="product-coding-box">

                            {sheet.productCodingImage2 ? (

                                <img
                                    src={
                                        sheet.productCodingImage2
                                    }
                                    alt="Product Coding"
                                    className="coding-image"
                                />

                            ) : (

                                <div className="placeholder-text">
                                    PRODUCT CODING
                                </div>

                            )}

                        </div>


                        {/* CCP NOTE */}

                        <div className="ccp-note">

                            At the start of a
                            production run, attach
                            evidence of packaging
                            matching the specification
                            below.

                            <span>
                                {" "}CCP 2
                            </span>

                        </div>


                        {/* EVIDENCE */}

                        <div className="evidence-box">

                            {sheet.evidenceImage2 && (

                                <img
                                    src={
                                        sheet.evidenceImage2
                                    }
                                    alt="Evidence"
                                    className="coding-image"
                                />

                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                BUTTONS
            ================================================== */}

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

export default ChecksheetEditor;