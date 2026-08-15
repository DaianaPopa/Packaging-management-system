import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import "../styles/worksheet.css";
import "../styles/traceability.css";
import "../styles/stock.css";

function PrintWorkpack() {
    const [searchParams] = useSearchParams();

    const productId = searchParams.get("product");
    const date = searchParams.get("date");

    const [workpack, setWorkpack] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            return;
        }

        loadWorkpack();
    }, [productId, date]);

    useEffect(() => {
        if (!workpack) {
            return;
        }

        // Give React time to render everything before opening print.
        const timer = setTimeout(() => {
            window.print();
        }, 800);

        return () => clearTimeout(timer);
    }, [workpack]);

    async function loadWorkpack() {
        try {
            setError("");

            let url =
                `/api/job-processing/workpack/?product=${productId}`;

            if (date) {
                url += `&date=${date}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to load workpack (${response.status})`
                );
            }

            const data = await response.json();

            console.log("PRINT WORKPACK:", data);

            setWorkpack(data);

        } catch (err) {
            console.error("Print workpack error:", err);
            setError(err.message);
        }
    }

    if (error) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Unable to load workpack</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!workpack) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Preparing workpack...</h2>
            </div>
        );
    }

    const worksheet = workpack.worksheet || {};
    const traceability = workpack.traceability || {};
    const rejectReport = workpack.reject_report || {};
    const dateCoding = workpack.date_coding || {};
    const stocktake = workpack.stocktake || {};

    return (
        <div className="print-workpack">

            {/* =====================================================
                1. WORKSHEET
            ====================================================== */}

            <section className="workpack-page worksheet-print-page">

                <h1 className="worksheet-title">
                    DEKAPAK WORKSHEET
                </h1>

                <table className="worksheet-header">
                    <tbody>

                        <tr>
                            <th>Customer</th>
                            <td>
                                {worksheet.customer || ""}
                            </td>

                            <th>Product Code</th>
                            <td>
                                {worksheet.sku || ""}
                            </td>
                        </tr>

                        <tr>
                            <th>
                                Pallet Configuration
                            </th>

                            <td>
                                {worksheet.pallet_configuration || ""}
                            </td>

                            <th>
                                Product Name
                            </th>

                            <td>
                                {worksheet.product_name ||
                                    worksheet.product ||
                                    ""}
                            </td>
                        </tr>

                        <tr>
                            <th>
                                Job Type
                            </th>

                            <td>
                                {worksheet.transaction || ""}
                            </td>

                            <th>
                                Date
                            </th>

                            <td>
                                {worksheet.date || ""}
                            </td>
                        </tr>

                    </tbody>
                </table>

                <div className="worksheet-content">

                    <div className="job-description">

                        <div className="job-title">
                            Job Description
                        </div>

                        {(worksheet.steps || []).map(
                            (step) => (
                                <div
                                    key={step.step_number}
                                    className="job-row"
                                >
                                    {step.instruction}
                                </div>
                            )
                        )}

                        {Array.from({
                            length: Math.max(
                                0,
                                8 -
                                    (worksheet.steps?.length || 0)
                            ),
                        }).map((_, index) => (
                            <div
                                key={`blank-${index}`}
                                className="job-row"
                            />
                        ))}

                    </div>

                    <table className="pallet-table">

                        <thead>
                            <tr>
                                <th>Pallet No.</th>
                                <th>No. of Outers</th>
                            </tr>
                        </thead>

                        <tbody>

                            {(worksheet.pallets || []).map(
                                (pallet, index) => (
                                    <tr key={index}>
                                        <td>
                                            {pallet.pallet ||
                                                index + 1}
                                        </td>

                                        <td>
                                            {pallet.outers || ""}
                                        </td>
                                    </tr>
                                )
                            )}

                            {/* If no saved pallets, show empty rows */}
                            {(!worksheet.pallets ||
                                worksheet.pallets.length === 0) &&
                                Array.from({
                                    length: 20,
                                }).map((_, index) => (
                                    <tr key={index}>
                                        <td>
                                            {index + 1}
                                        </td>
                                        <td></td>
                                    </tr>
                                ))}

                            <tr>
                                <td>
                                    <strong>
                                        Totals
                                    </strong>
                                </td>

                                <td></td>
                            </tr>

                        </tbody>

                    </table>

                </div>

                <div className="worksheet-footer">

                    <div className="footer-item">
                        <span>
                            Please initial when instructions
                            are understood:
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

            </section>


            {/* =====================================================
                2. TRACEABILITY
            ====================================================== */}

            <section className="workpack-page traceability-print-page">

                <h1 className="traceability-title">
                    {traceability.product || ""}
                    {" "}
                    Traceability Sheet - Multiple Components
                </h1>

                <div className="traceability-header">

                    <div className="traceability-header-left">

                        <div>
                            <strong>Date:</strong>{" "}
                            {traceability.date || ""}
                        </div>

                        <div>
                            If Part Pallet of WIP enters
                            room, please enter quantity
                            in Qty column
                        </div>

                        <div>
                            <strong>
                                Outgoing Palman batch code:
                            </strong>
                            {" "}
                            {traceability.batchCode || ""}
                        </div>

                        <div>
                            <strong>
                                Product Line:
                            </strong>
                            {" "}
                            {traceability.product || ""}
                        </div>

                    </div>

                    <div className="traceability-header-right">

                        <div>
                            <strong>
                                Process Order:
                            </strong>
                            {" "}
                            {traceability.processOrder || ""}
                        </div>

                        <div>
                            <strong>
                                Line Code:
                            </strong>
                            {" "}
                            {traceability.sku || ""}
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
                                    (traceability.components ||
                                        []).length * 2
                                }
                            >
                                DETAILS OF PACKED COMPONENTS
                            </th>
                        </tr>

                        <tr>

                            {(traceability.components ||
                                []).map(
                                    (component) => (
                                        <th
                                            key={
                                                component.id
                                            }
                                        >
                                            {component.component_name}
                                        </th>
                                    )
                                )}

                        </tr>

                    </thead>

                    <tbody>

                        {(traceability.rows || []).map(
                            (row, rowIndex) => (
                                <tr key={rowIndex}>

                                    <td>
                                        {row.dpNo || ""}
                                    </td>

                                    <td>
                                        {row.palletNo || ""}
                                    </td>

                                    {(traceability.components ||
                                        []).map(
                                            (component) => {

                                                const componentData =
                                                    row.components?.find(
                                                        (item) =>
                                                            item.componentId ===
                                                            component.id
                                                    );

                                                return (
                                                    <td
                                                        key={
                                                            component.id
                                                        }
                                                    >
                                                        {componentData?.qty ||
                                                            ""}
                                                    </td>
                                                );
                                            }
                                        )}

                                </tr>
                            )
                        )}

                        {/* Empty rows if nothing saved */}
                        {(!traceability.rows ||
                            traceability.rows.length === 0) &&
                            Array.from({
                                length: 15,
                            }).map((_, index) => (
                                <tr key={index}>

                                    <td></td>

                                    <td></td>

                                    {(traceability.components ||
                                        []).map(
                                            (component) => (
                                                <td
                                                    key={
                                                        component.id
                                                    }
                                                ></td>
                                            )
                                        )}

                                </tr>
                            ))}

                    </tbody>

                </table>

            </section>


            {/* =====================================================
                3. REJECT REPORT
            ====================================================== */}

            <section className="workpack-page reject-print-page">

                <h1>
                    REJECT REPORT
                </h1>

                <div className="report-header">

                    <div>
                        <strong>Customer:</strong>{" "}
                        {rejectReport.customer || ""}
                    </div>

                    <div>
                        <strong>Product:</strong>{" "}
                        {rejectReport.product || ""}
                    </div>

                    <div>
                        <strong>SKU:</strong>{" "}
                        {rejectReport.sku || ""}
                    </div>

                    <div>
                        <strong>Date:</strong>{" "}
                        {rejectReport.date || ""}
                    </div>

                </div>

                <table className="report-table">

                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Quantity</th>
                            <th>Comments</th>
                        </tr>
                    </thead>

                    <tbody>

                        {(rejectReport.rows || []).map(
                            (row, index) => (
                                <tr key={index}>
                                    <td>
                                        {row.time || ""}
                                    </td>

                                    <td>
                                        {row.reason || ""}
                                    </td>

                                    <td>
                                        {row.quantity || ""}
                                    </td>

                                    <td>
                                        {row.comments || ""}
                                    </td>
                                </tr>
                            )
                        )}

                    </tbody>

                </table>

            </section>


            {/* =====================================================
                4. DATE CODING
            ====================================================== */}

            <section className="workpack-page date-coding-print-page">

                <h1>
                    DATE CODING & LABEL CHECK
                </h1>

                <div className="report-header">

                    <div>
                        <strong>Customer:</strong>{" "}
                        {dateCoding.customer || ""}
                    </div>

                    <div>
                        <strong>Product:</strong>{" "}
                        {dateCoding.product || ""}
                    </div>

                    <div>
                        <strong>SKU:</strong>{" "}
                        {dateCoding.sku || ""}
                    </div>

                    <div>
                        <strong>Date:</strong>{" "}
                        {dateCoding.date || ""}
                    </div>

                </div>

                <table className="report-table">

                    <thead>
                        <tr>
                            <th>Check</th>
                            <th>Expected</th>
                            <th>Actual</th>
                            <th>Pass / Fail</th>
                            <th>Comments</th>
                        </tr>
                    </thead>

                    <tbody>

                        {(dateCoding.rows || []).map(
                            (row, index) => (
                                <tr key={index}>

                                    <td>
                                        {row.check || ""}
                                    </td>

                                    <td>
                                        {row.expected || ""}
                                    </td>

                                    <td>
                                        {row.actual || ""}
                                    </td>

                                    <td>
                                        {row.result || ""}
                                    </td>

                                    <td>
                                        {row.comments || ""}
                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </table>

            </section>


            {/* =====================================================
                5. STOCKTAKE
            ====================================================== */}

            <section className="workpack-page stocktake-print-page">

                <h1 className="worksheet-title">
                    R21 STOCKTAKE CHECKLIST
                </h1>

                <div className="stocktake-top">

                    <div className="job-line">
                        <strong>JOB:</strong>{" "}
                        {stocktake.sku || ""}
                        {" - "}
                        {stocktake.product || ""}
                    </div>

                    <div className="date-line">
                        <strong>DATE:</strong>{" "}
                        {stocktake.date || ""}
                    </div>

                    <div className="signature-line">
                        <strong>SIGNATURE:</strong>{" "}
                        {stocktake.signature || ""}
                    </div>

                </div>

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
                            <th>DESCRIPTION</th>
                            <th>BATCH NO.</th>
                            <th>BEST BEFORE</th>
                            <th>QTY / PALLET</th>
                            <th>QTY IN ROOM</th>
                            <th>BOXES</th>
                            <th>SINGLES</th>
                            <th>ROOM</th>
                            <th>WAREHOUSE</th>
                            <th>TOTAL</th>
                        </tr>

                    </thead>

                    <tbody>

                        {(stocktake.rows ||
                            stocktake.components ||
                            []).map(
                                (row, index) => (
                                    <tr key={index}>

                                        <td>
                                            {row.component_sku ||
                                                row.code ||
                                                ""}
                                        </td>

                                        <td>
                                            {row.component_name ||
                                                row.description ||
                                                ""}
                                        </td>

                                        <td>
                                            {row.batchNo || ""}
                                        </td>

                                        <td>
                                            {row.bestBefore || ""}
                                        </td>

                                        <td>
                                            {row.qtyPerPallet ||
                                                ""}
                                        </td>

                                        <td>
                                            {row.qtyInRoom || ""}
                                        </td>

                                        <td>
                                            {row.boxes || ""}
                                        </td>

                                        <td>
                                            {row.singles || ""}
                                        </td>

                                        <td>
                                            {row.room || ""}
                                        </td>

                                        <td>
                                            {row.warehouse || ""}
                                        </td>

                                        <td>
                                            {row.total || ""}
                                        </td>

                                    </tr>
                                )
                            )}

                    </tbody>

                </table>

            </section>

        </div>
    );
}

export default PrintWorkpack;