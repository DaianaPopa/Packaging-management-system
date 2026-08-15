import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/stock.css";

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
        date: reportDate,
        signature: "",
        balanceOnSystem: "",
    });

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
                date: data.date || reportDate,
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

        if (buttons) {
            buttons.style.display = "none";
        }

        const printStyle =
            document.createElement("style");

        printStyle.id =
            "stocktake-landscape-print";

        printStyle.innerHTML = `
            @page {
                size: A4 landscape !important;
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

        signature: stock.signature,

        balanceOnSystem:
            stock.balanceOnSystem,

        components: components.map(
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

                {/* HEADER */}

                <div className="stocktake-top">

                    <div className="job-line">
                        <strong>JOB:</strong>

                        <span>
                            {stock.sku} -{" "}
                            {stock.product}
                        </span>
                    </div>

                    <div className="signature-line">
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

                        <input
                            type="date"
                            value={stock.date}
                            onChange={(e) =>
                                updateStock(
                                    "date",
                                    e.target.value
                                )
                            }
                        />
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

                {/* MAIN TABLE */}

                <table className="physical-stock-table">

                    <thead>

                        <tr>
                            <th colSpan="2">
                                PACKAGING
                            </th>

                            <th colSpan="6">
                                ROOM COUNT
                            </th>

                            <th colSpan="3">
                                OFFICE USE ONLY
                            </th>
                        </tr>

                        <tr>
                            <th>CODE</th>

                            <th>
                                DESCRIPTION
                            </th>

                            <th>
                                BATCH NO.
                            </th>

                            <th>
                                BEST BEFORE
                            </th>

                            <th>
                                QTY / PALLET
                            </th>

                            <th>
                                QTY IN ROOM
                            </th>

                            <th>
                                BOXES
                            </th>

                            <th>
                                SINGLES
                            </th>

                            <th>
                                ROOM
                            </th>

                            <th>
                                WAREHOUSE
                            </th>

                            <th>
                                TOTAL
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {components.length > 0 ? (

                            components.map(
                                (component, index) => (

                                    <tr
                                        key={
                                            component.id
                                        }
                                    >

                                        {/* CODE */}

                                        <td>
                                            {
                                                component.component_sku
                                            }
                                        </td>

                                        {/* DESCRIPTION */}

                                        <td>
                                            {
                                                component.component_name
                                            }
                                        </td>

                                        {/* BATCH */}

                                        <td>
                                            <input
                                                value={
                                                    component.batchNo
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "batchNo",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* BEST BEFORE */}

                                        <td>
                                            <input
                                                // type="date"
                                                value={
                                                    component.bestBefore
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "bestBefore",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* QTY / PALLET */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.qtyPerPallet
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "qtyPerPallet",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* QTY IN ROOM */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.qtyInRoom
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "qtyInRoom",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* BOXES */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.boxes
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "boxes",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* SINGLES */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.singles
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "singles",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* ROOM */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.room
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "room",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* WAREHOUSE */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.warehouse
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "warehouse",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* TOTAL */}

                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    component.total
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateComponent(
                                                        index,
                                                        "total",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                    </tr>
                                )
                            )

                        ) : (

                            <tr>
                                <td colSpan="11">
                                    No components found
                                </td>
                            </tr>

                        )}
                    {/* EXTRA MANUAL ROWS */}
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr key={`manual-${index}`}>

                                <td>
                                    <input />
                                </td>

                                <td>
                                    <input />
                                </td>

                                <td>
                                    <input />
                                </td>

                                <td>
                                    <input />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                                <td>
                                    <input type="number" />
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>

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