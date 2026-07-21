import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import "../../styles/reports.css";

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
        window.print();
    };

    const handleExportExcel = () => {

        const workbook =
            XLSX.utils.book_new();

        const data = [];

        data.push([
            `${traceability.product} Traceability Sheet`
        ]);

        data.push([]);

        data.push([
            "Date",
            traceability.date
        ]);

        data.push([
            "Product",
            traceability.product
        ]);

        data.push([
            "Line Code",
            traceability.sku
        ]);

        data.push([]);

        const worksheet =
            XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Traceability"
        );

        XLSX.writeFile(
            workbook,
            `Traceability_${traceability.sku}.xlsx`
        );
    };

 return (
        <>
            <div
                className="traceability-page"
                id="print-area"
                ref={traceabilityRef}
            >

                <h1 className="traceability-title">
                    {traceability.product}
                    {" "}
                    Traceability Sheet - Multiple Components
                </h1>

                <div className="traceability-header">

                    <div className="header-left">

                        <div>

                            <strong>Date:</strong>

                            <input
                                type="date"
                                value={traceability.date}
                                onChange={(e) =>
                                    setTraceability({
                                        ...traceability,
                                        date:
                                            e.target.value,
                                    })
                                }
                            />

                        </div>

                        <div>
                            If Part Pallet of WIP enters
                            room, please enter quantity
                            in Qty column
                        </div>

                        <div>
                            <strong>Outgoing Palman batch code:</strong>
                            {" "}
                        </div>

                        <div>
                            <strong>Product Line:</strong>
                            {" "}
                            {traceability.product}
                        </div>

                    </div>

                    <div className="header-right">

                        <div>

                            <strong>
                                Process Order:
                            </strong>

                            <input
                                value={
                                    traceability.processOrder
                                }
                                onChange={(e) =>
                                    setTraceability({
                                        ...traceability,
                                        processOrder:
                                            e.target.value,
                                    })
                                }
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

                            <th rowSpan="2">
                                DP No
                            </th>

                            <th rowSpan="2">
                                Pallet No
                            </th>

                            <th
                                colSpan={
                                    components.length * 2
                                }
                            >
                                DETAILS OF PACKED COMPONENTS
                            </th>

                        </tr>

                        <tr>

                            {components.map(
                                (component) => (
                                    <>

                                        <th
                                            key={`${component.id}-name`}
                                        >
                                            {
                                                component.component_name
                                            }
                                        </th>

                                        <th
                                            key={`${component.id}-qty`}
                                        >
                                            Qty
                                        </th>

                                    </>
                                )
                            )}

                        </tr>

                    </thead>

                    <tbody>

                        {Array.from({
                            length: 15,
                        }).map(
                            (_, rowIndex) => (

                                <tr
                                    key={rowIndex}
                                >

                                    <td>
                                        <input />
                                    </td>

                                    <td>
                                        <input />
                                    </td>

                                    {components.map(
                                        (
                                            component
                                        ) => (
                                            <>

                                                <td
                                                    key={`${component.id}-c`}
                                                />

                                                <td
                                                    key={`${component.id}-q`}
                                                >
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

                <button
                    className="print-btn"
                    onClick={handlePrint}
                >
                    Print
                </button>

                <button
                    className="excel-btn"
                    onClick={handleExportExcel}
                >
                    Export Excel
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