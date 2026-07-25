import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import "../../styles/reject.css";

function RejectReportEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportRef = useRef(null);

    const customerId = searchParams.get("customer");
    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date");

    const [loading, setLoading] = useState(true);

    const [report, setReport] = useState(null);

    const [packagingRejects, setPackagingRejects] = useState(
        Array.from({ length: 10 }, () => ({
            code: "",
            incoming: "",
            incomingReason: "",
            inhouse: "",
            inhouseReason: "",
        }))
    );

    const [productRejects, setProductRejects] = useState(
        Array.from({ length: 10 }, () => ({
            code: "",
            incoming: "",
            incomingReason: "",
            inhouse: "",
            inhouseReason: "",
        }))
    );

    useEffect(() => {
        if (customerId && productId) {
            loadRejectReport();
        } else {
            setLoading(false);
        }
    }, [customerId, productId, reportDate]);

    async function loadRejectReport() {
        try {
            const response = await fetch(
                `/api/job-processing/reject-report/?customer=${customerId}&product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                throw new Error("Failed to load reject report");
            }

            const data = await response.json();

            setReport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function updatePackaging(index, field, value) {
        const updated = [...packagingRejects];
        updated[index][field] = value;
        setPackagingRejects(updated);
    }

    function updateProduct(index, field, value) {
        const updated = [...productRejects];
        updated[index][field] = value;
        setProductRejects(updated);
    }

    const handlePrint = () => {
        // Hide elements that should not be printed
        const buttons = document.querySelector(".worksheet-buttons");
        const originalDisplay = buttons?.style.display;
        
        if (buttons) {
            buttons.style.display = "none";
        }
        
        // Trigger print
        window.print();
        
        // Show elements again after print dialog is dismissed
        setTimeout(() => {
            if (buttons) {
                buttons.style.display = originalDisplay || "";
            }
        }, 500);
    };

    const handleExportExcel = () => {
        try {
            const workbook = XLSX.utils.book_new();

            const data = [];

            data.push(["REJECT REPORT"]);
            data.push([]);

            data.push(["Product", report.product]);
            data.push(["Date", report.date]);
            data.push([]);

            data.push(["PACKAGING REJECTS"]);
            data.push([
                "Code",
                "Incoming",
                "Reason",
                "Inhouse",
                "Reason",
            ]);

            packagingRejects.forEach((r) => {
                data.push([
                    r.code,
                    r.incoming,
                    r.incomingReason,
                    r.inhouse,
                    r.inhouseReason,
                ]);
            });

            data.push([]);
            data.push(["PRODUCT REJECTS"]);

            productRejects.forEach((r) => {
                data.push([
                    r.code,
                    r.incoming,
                    r.incomingReason,
                    r.inhouse,
                    r.inhouseReason,
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(data);

            ws["!cols"] = [
                { wch: 25 },
                { wch: 15 },
                { wch: 20 },
                { wch: 15 },
                { wch: 20 }
            ];

            XLSX.utils.book_append_sheet(
                workbook,
                ws,
                "Reject Report"
            );

            // Generate filename with date
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `Reject_Report_${report.product}_${timestamp}.xlsx`;

            XLSX.writeFile(workbook, filename);
        } catch (err) {
            console.error("Error exporting to Excel:", err);
            alert("Failed to export reject report to Excel");
        }
    };

    if (loading) {
        return <h2>Loading reject report...</h2>;
    }

    if (!report) {
        return <h2>Unable to load reject report.</h2>;
    }

    return (
        <div
            className="reject-page"
            id="print-area"
            ref={reportRef}
        >
            <h1 className="reject-title">
                REJECT REPORT
            </h1>

            {/* HEADER */}

            <div className="reject-header">

                <div className="header-box">
                    <label>Product</label>

                    <div>
                        {report.product}
                    </div>
                </div>

                <div className="header-box">
                    <label>Date</label>

                    <input
                        type="date"
                        value={report.date || ""}
                        onChange={(e) =>
                            setReport({
                                ...report,
                                date: e.target.value,
                            })
                        }
                    />
                </div>

            </div>

            <div className="reject-note">
                Rejects to be recorded, stored,
                secured and labelled accordingly.
                This report is to be sent to the
                office at the end of each shift
                or production run.
            </div>

            {/* PACKAGING */}

            <div className="reject-section">

                <div className="section-title">
                    PACKAGING REJECTS
                </div>

                <table className="reject-table">

                    <thead>
                        <tr>
                            <th>Code / Description</th>
                            <th>Incoming Rejects</th>
                            <th>Reason</th>
                            <th>Inhouse Rejects</th>
                            <th>Reason</th>
                        </tr>
                    </thead>

                    <tbody>

                        {packagingRejects.map(
                            (row, index) => (
                                <tr key={index}>

                                    <td>
                                        <input
                                            value={row.code}
                                            onChange={(e) =>
                                                updatePackaging(
                                                    index,
                                                    "code",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.incoming
                                            }
                                            onChange={(e) =>
                                                updatePackaging(
                                                    index,
                                                    "incoming",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.incomingReason
                                            }
                                            onChange={(e) =>
                                                updatePackaging(
                                                    index,
                                                    "incomingReason",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.inhouse
                                            }
                                            onChange={(e) =>
                                                updatePackaging(
                                                    index,
                                                    "inhouse",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.inhouseReason
                                            }
                                            onChange={(e) =>
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

            {/* PRODUCT */}

            <div className="reject-section">

                <div className="section-title">
                    PRODUCT REJECTS
                </div>

                <table className="reject-table">

                    <thead>
                        <tr>
                            <th>Code / Description</th>
                            <th>Incoming Rejects</th>
                            <th>Reason</th>
                            <th>Inhouse Rejects</th>
                            <th>Reason</th>
                        </tr>
                    </thead>

                    <tbody>

                        {productRejects.map(
                            (row, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            value={row.code}
                                            onChange={(e) =>
                                                updateProduct(
                                                    index,
                                                    "code",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.incoming
                                            }
                                            onChange={(e) =>
                                                updateProduct(
                                                    index,
                                                    "incoming",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.incomingReason
                                            }
                                            onChange={(e) =>
                                                updateProduct(
                                                    index,
                                                    "incomingReason",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.inhouse
                                            }
                                            onChange={(e) =>
                                                updateProduct(
                                                    index,
                                                    "inhouse",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={
                                                row.inhouseReason
                                            }
                                            onChange={(e) =>
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

            {/* BUTTONS */}

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
                    onClick={() =>
                        navigate("/jobprocessing")
                    }
                >
                    Cancel
                </button>

            </div>

        </div>
    );
}

export default RejectReportEditor;