import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/stock.css";
import ReportIssueMeta from "./ReportIssueMeta";
import StocktakeTable from "./StocktakeTable";

function StocktakeEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const stocktakeRef = useRef(null);

    const productId = searchParams.get("product");
    const reportDate =
        searchParams.get("date") ||
        new Date().toISOString().split("T")[0];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [components, setComponents] = useState([]);

    const [stock, setStock] = useState({
        product: "",
        sku: "",
        issue: "",
        date: reportDate,
        signature: "",
        balanceOnSystem: "",
    });

    const productCodeRows = components.filter(
        (component) => component.component_sku?.trim().toUpperCase().startsWith("MB")
    );
    const packagingComponents = components.filter(
        (component) => !component.component_sku?.trim().toUpperCase().startsWith("MB")
    );

    /*
    ---------------------------------------------------------
    LOAD STOCKTAKE
    ---------------------------------------------------------
    */

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            setLoading(false);
            return;
        }

        loadStocktake();
    }, [productId, reportDate]);

    async function loadStocktake() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/job-processing/stocktake/?product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                throw new Error(
                    errorData?.error || "Failed to load stocktake"
                );
            }

            const data = await response.json();

            console.log("Stocktake API:", data);

            setStock({
                product: data.product || "",
                sku: data.sku || "",
                issue: data.issue || "",
                date: reportDate,
                signature: "",
                balanceOnSystem: "",
            });

            /*
             * Add empty editable fields to every component.
            */

            const loadedComponents = (data.components || []).map(
                (component) => ({
                    ...component,

                    batchNo: "",
                    bestBefore: "",
                    qtyPerPallet: "",
                    qtyInRoom: "",
                    boxes: "",
                    singles: "",
                    room: "",
                    warehouse: "",
                    total: "",
                })
            );

            setComponents(loadedComponents);

        } catch (err) {
            console.error("Stocktake error:", err);
            setError(err.message || "Failed to load stocktake.");
        } finally {
            setLoading(false);
        }
    }

    /*
    ---------------------------------------------------------
    UPDATE HEADER
    ---------------------------------------------------------
    */

    function updateStock(field, value) {
        setStock((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function updateJobLine(value) {
        const separatorIndex = value.search(/\s/);

        if (separatorIndex < 0) {
            setStock((previous) => ({
                ...previous,
                sku: value,
                product: "",
            }));
            return;
        }

        setStock((previous) => ({
            ...previous,
            sku: value.slice(0, separatorIndex),
            product: value.slice(separatorIndex).trimStart(),
        }));
    }

    /*
    ---------------------------------------------------------
    UPDATE COMPONENT ROW
    ---------------------------------------------------------
    */

    function updateComponent(index, field, value) {
        setComponents((previous) => {
            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    }

    function updatePackagingComponent(index, field, value) {
        const componentId = packagingComponents[index]?.id;
        const originalIndex = components.findIndex(
            (component) => component.id === componentId
        );

        if (originalIndex >= 0) {
            updateComponent(originalIndex, field, value);
        }
    }

    function updateProductComponent(index, field, value) {
        const componentId = productCodeRows[index]?.id;
        const originalIndex = components.findIndex(
            (component) => component.id === componentId
        );

        if (originalIndex >= 0) {
            updateComponent(originalIndex, field, value);
        }
    }

    /*
    ---------------------------------------------------------
    PRINT
    ---------------------------------------------------------
    */

    const handlePrint = () => {
        const buttons = document.querySelector(
            ".stocktake-buttons"
        );

        const originalDisplay =
            buttons?.style.display;
        const originalZoom =
            stocktakeRef.current?.style.zoom;

        if (stocktakeRef.current) {
            const printableWidth = (281 * 96) / 25.4;
            const printableHeight = (194 * 96) / 25.4;
            const contentWidth = stocktakeRef.current.scrollWidth;
            const contentHeight = stocktakeRef.current.scrollHeight;
            const scale = Math.min(
                1,
                printableWidth / contentWidth,
                printableHeight / contentHeight
            );

            stocktakeRef.current.style.zoom = String(scale);
        }

        if (buttons) {
            buttons.style.display = "none";
        }

        const printStyle =
            document.createElement("style");

        printStyle.id =
            "stocktake-landscape-print";

        printStyle.innerHTML = `
            @page {
                size: A4 landscape;
                margin: 8mm;
            }

            @media print {

                body {
                    width: 100% !important;
                    margin: 0 !important;
                }

                #print-area {
                    width: 100% !important;
                    min-height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }

                input {
                    border: none !important;
                    background: transparent !important;
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

            if (stocktakeRef.current) {
                stocktakeRef.current.style.zoom =
                    originalZoom || "";
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

    const stocktakeData = {
        product: productId,

        date: stock.date,

        issue: stock.issue,

        signature: stock.signature,

        balanceOnSystem:
            stock.balanceOnSystem,

        components: packagingComponents.map(
            (component) => ({
                component_id: component.id,

                component_sku:
                    component.component_sku,

                component_name:
                    component.component_name,

                batch_no:
                    component.batchNo,

                best_before:
                    component.bestBefore,

                qty_per_pallet:
                    component.qtyPerPallet,

                qty_in_room:
                    component.qtyInRoom,

                boxes:
                    component.boxes,

                singles:
                    component.singles,

                room:
                    component.room,

                warehouse:
                    component.warehouse,

                total:
                    component.total,
            })
        ),
        product_rows: productCodeRows.map((component) => ({
            component_id: component.id,
            component_sku: component.component_sku,
            component_name: component.component_name,
            batch_no: component.batchNo,
            best_before: component.bestBefore,
            qty_per_pallet: component.qtyPerPallet,
            qty_in_room: component.qtyInRoom,
            boxes: component.boxes,
            singles: component.singles,
            room: component.room,
            warehouse: component.warehouse,
            total: component.total,
        })),
    };

    try {

        const response = await fetch(
            "/api/job-processing/stocktake/save/",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    stocktakeData
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
            <div className="stocktake-page">
                <h2>Loading stocktake...</h2>
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
            <div className="stocktake-page">
                <h2>Unable to load stocktake</h2>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/jobprocessing")
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
            <div className="stocktake-page">
                <h2>Please select a product first.</h2>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/jobprocessing")
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
                className="stocktake-page"
                id="print-area"
                ref={stocktakeRef}
            >
                <h1 className="worksheet-title">
                    R21 STOCKTAKE CHECKLIST
                </h1>

                <ReportIssueMeta issue={stock.issue} onIssueChange={(value) => updateStock("issue", value)} />

                {/* HEADER */}

                <div className="stocktake-top">

                    <div className="job-line">
                        <strong>JOB:</strong>

                        <span
                            className="stocktake-job-value"
                            contentEditable
                            suppressContentEditableWarning
                            role="textbox"
                            aria-label="Job SKU and product"
                            onInput={(event) => updateJobLine(event.currentTarget.textContent)}
                        >
                            {[stock.sku, stock.product].filter(Boolean).join(" ")}
                        </span>
                    </div>

                    <div className="stocktake-signature-line">
                        <strong>
                            SIGNATURE:
                        </strong>

                        <input
                            value={
                                stock.signature
                            }
                            onChange={(e) =>
                                updateStock(
                                    "signature",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="date-line">
                        <strong>DATE:</strong>
                        <span className="blank-date-line"></span>
                    </div>

                    <div className="balance-line">
                        <strong>
                            Bal on System:
                        </strong>

                        <input
                            value={
                                stock.balanceOnSystem
                            }
                            onChange={(e) =>
                                updateStock(
                                    "balanceOnSystem",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                </div>

                <StocktakeTable
                    title="PRODUCT"
                    rows={productCodeRows}
                    onChange={updateProductComponent}
                />

                <StocktakeTable
                    title="PACKAGING"
                    rows={packagingComponents}
                    onChange={updatePackagingComponent}
                />

            </div>

            {/* BUTTONS */}

            <div className="stocktake-buttons no-print">

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

export default StocktakeEditor;