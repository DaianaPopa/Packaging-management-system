import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/traceability.css";

function TraceabilityEditor() {

    const navigate = useNavigate();
    const traceabilityRef = useRef(null);
    const [searchParams] = useSearchParams();
    const customerId = searchParams.get("customer");
    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date");
    const [loading, setLoading] = useState(true);
    const [components, setComponents] = useState([]);
    const [traceability, setTraceability] = useState({
        customer: "",
        product: "",
        sku: "",
        date: reportDate || "",
        processOrder: "",
    });
    useEffect(() => {

        if (customerId && productId) {
            loadTraceability();
        }

    }, [customerId, productId, reportDate]);

    async function loadTraceability() {

        try {
            const response = await fetch(
                `/api/job-processing/traceability/?customer=${customerId}&product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load traceability"
                );
            }

            const data = await response.json();

            setTraceability({
                customer: data.customer,
                product: data.product,
                sku: data.sku,
                date: data.date,
                processOrder: "",
            });

            setComponents(
                data.components || []
            );

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
    }
    

    const handlePrint = () => {
        // Hide elements that should not be printed
        const buttons = document.querySelector(".worksheet-buttons");
        const originalDisplay = buttons?.style.display;

        if (buttons) {
            buttons.style.display = "none";
        }

        const printStyle = document.createElement("style");
        printStyle.id = "worksheet-portrait-print";
        printStyle.innerHTML = `
            @page {
                size: A4 landscape !important;
                margin: 8mm;
            }

            @media print {
                body {
                    width: 100% !important;
                }

                #print-area {
                    width: 100% !important;
                    height: auto !important;
                    min-height: auto !important;
                    box-shadow: none !important;
                    page-break-after: auto !important;
                }
            }
        `;
        document.head.appendChild(printStyle);

        // Trigger print
        window.print();

        // Show elements again after print dialog is dismissed
        setTimeout(() => {
            if (buttons) {
                buttons.style.display = originalDisplay || "";
            }
            printStyle.remove();
        }, 1000);
    };

    return (
        <>
            <div
                className="traceability-page"
                id="print-area"
                ref={traceabilityRef}
            >

                <h1 className="traceability-title">
                    {traceability.product}{" "}
                    Traceability Sheet - Multiple Components
                </h1>

                <div className="traceability-header">
                    <div className="traceability-header-left">

                        <div>
                            <strong>Date:</strong>
                            <input
                                type="date"
                                value={traceability.date}
                                onChange={(e) => setTraceability({ ...traceability, date: e.target.value,})}
                            />
                        </div>

                        <div>
                            If Part Pallet of WIP enters
                            room, please enter quantity
                            in Qty column
                        </div>

                        <div>
                            <strong>Outgoing Palman batch code:</strong>{" "}
                        </div>

                        <div>
                            <strong>Product Line:</strong>{" "}{traceability.product}
                        </div>
                    </div>

                    <div className="traceability-header-right">
                        <div>
                            <strong> Process Order:</strong>
                            <input
                                value={ traceability.processOrder }
                                onChange={(e) => setTraceability({ ...traceability, processOrder: e.target.value,})}
                            />
                        </div>

                        <div>
                            <strong>
                                Line Code:
                            </strong>
                            {" "}
                            {traceability.sku}
                        </div>
                    </div>
                </div>

                <table className="traceability-table">
                    <thead>
                        <tr>
                            <th rowSpan="2"> DP No</th>
                            <th rowSpan="2">Pallet No</th>
                            <th colSpan={components.length * 2}
                            >DETAILS OF PACKED COMPONENTS</th>
                        </tr>

                        <tr>
                            {components.map((component) => (
                                    <>
                                        <th key={`${component.id}-name`}>
                                            {component.component_name}
                                        </th>
                                        <th key={`${component.id}-qty`}>
                                            Qty
                                        </th>
                                    </>
                                )
                            )}
                        </tr>

                    </thead>

                    <tbody>
                        {Array.from({length: 15,}).map((_, rowIndex) => (

                                <tr key={rowIndex}>

                                    <td><input /></td>
                                    <td><input /></td>

                                    {components.map(
                                        ( component ) => (
                                            <>
                                                <td key={`${component.id}-c`}/>
                                                <td key={`${component.id}-q`}>
                                                    <input />
                                                </td>
                                            </>
                                        )
                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

            <div className="worksheet-buttons no-print">

                <button className="save-btn">
                    Save
                </button>

                <button className="print-btn"  onClick={handlePrint}>
                    Print
                </button>

                <button type="button" onClick={() => navigate( "/jobprocessing")}>
                    Cancel
                </button>
            </div>
        </>
    );
}

export default TraceabilityEditor;