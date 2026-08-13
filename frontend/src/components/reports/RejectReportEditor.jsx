import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

        const printStyle = document.createElement("style");
        printStyle.id = "worksheet-portrait-print";
        printStyle.innerHTML = `
            @page {
                size: A4 portrait !important;
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

    if (loading) {
        return <h2>Loading reject report...</h2>;
    }

    if (!report) {
        return <h2>Unable to load reject report.</h2>;
    }

    return (
        <>
        <div className="reject-page" id="print-area" ref={reportRef} >
            <h1 className="reject-title">
                REJECT REPORT
            </h1>

            {/* HEADER */}
            <div className="reject-header">

                <div className="header-box">
                    <label>Product</label>
                    <div>{report.product} </div>
                </div>

                <div className="header-box">
                    <label>Date</label>
                    <input
                        type="date"
                        value={report.date || ""}
                        onChange={(e) => setReport({ ...report, date: e.target.value,  }) }
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

                <div className="section-title">PACKAGING REJECTS</div>

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
                        {packagingRejects.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            value={row.code} 
                                            onChange={(e) =>
                                                updatePackaging(index, "code", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.incoming}
                                            onChange={(e) =>updatePackaging(index, "incoming", e.target.value )}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.incomingReason}
                                            onChange={(e) => updatePackaging( index, "incomingReason", e.target.value ) }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={ row.inhouse}
                                            onChange={(e) =>updatePackaging( index, "inhouse", e.target.value) }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.inhouseReason}
                                            onChange={(e) => updatePackaging( index, "inhouseReason", e.target.value )}
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
                <div className="section-title">PRODUCT REJECTS</div>

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
                                            onChange={(e) => updateProduct(index,"code", e.target.value ) }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={ row.incoming }
                                            onChange={(e) => updateProduct(index,"incoming", e.target.value ) }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={ row.incomingReason }
                                            onChange={(e) =>updateProduct(index,"incomingReason", e.target.value ) }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={ row.inhouse }
                                            onChange={(e) => updateProduct( index,  "inhouse", e.target.value  ) }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={ row.inhouseReason }
                                            onChange={(e) =>updateProduct( index, "inhouseReason", e.target.value ) }
                                        />
                                    </td>
                                </tr>
                            )
                        )}

                    </tbody>

                </table>

            </div>
        </div>

            {/* BUTTONS */}
            <div className="worksheet-buttons no-print">

                <button className="save-btn">
                    Save
                </button>

                <button className="print-btn" onClick={handlePrint}>
                    Print
                </button>

                <button onClick={() =>  navigate("/jobprocessing")}>
                    Cancel
                </button>

            </div>
    </>
    );
}

export default RejectReportEditor;