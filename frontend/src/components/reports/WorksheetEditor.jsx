import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/worksheet.css";

function WorksheetEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const worksheetRef = useRef(null);
    const customerId = searchParams.get("customer");
    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date");
    const [loading, setLoading] = useState(true);
    const [worksheet, setWorksheet] = useState(null);
    const [pallets, setPallets] = useState(
        Array.from({ length: 20 }, (_, i) => ({
            pallet: i + 1,
            outers: "",
        }))
    );

    useEffect(() => {
        if (customerId && productId) {
            loadWorksheet();
        } else {
            setLoading(false);
        }
    }, [customerId, productId, reportDate]);

    async function loadWorksheet() {
        try {
            const response = await fetch(
                `/api/job-processing/worksheet/?customer=${customerId}&product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                throw new Error("Failed to load worksheet");
            }

            const data = await response.json();

            setWorksheet(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function updateOuter(index, value) {
        const updated = [...pallets];

        updated[index].outers = value;

        setPallets(updated);
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
        return <h2>Loading worksheet...</h2>;
    }

    if (!customerId || !productId) {
        return <h2>Please select a customer and product first.</h2>;
    }

    if (!worksheet) {
        return <h2>Unable to load worksheet.</h2>;
    }

    return (
    <>
        <div id="print-area" className="worksheet" ref={worksheetRef}>
            <h1 className="worksheet-title">
                DEKAPAK WORKSHEET
            </h1>

            {/* HEADER */}
            <table className="worksheet-header">
                <tbody>
                    <tr>
                        <th>Customer</th>
                        <td>{worksheet.customer}</td>

                        <th>Product Code</th>
                        <td>{worksheet.sku}</td>
                    </tr>

                    <tr>
                        <th>Pallet Configuration</th>
                        <td>{worksheet.pallet_configuration}</td>

                        <th>Product Name</th>
                        <td>{worksheet.product}</td>
                    </tr>

                    <tr>
                        <th>Job Type</th>
                        <td>{worksheet.transaction}</td>

                        <th>Date</th>
                        <td><input
                            type="date"
                            value={worksheet.date || ""}
                            onChange={(e) =>
                                setWorksheet({
                                    ...worksheet,
                                    date: e.target.value,
                                })
                            }
                        /></td>

                    </tr>
                </tbody>
            </table>

            {/* MAIN CONTENT */}
            <div className="worksheet-content">
                {/* LEFT SIDE */}
                <div className="job-description">
                    <div className="job-title">
                        Job Description
                    </div>

                    {(worksheet.steps || []).map((step) => (
                        <div
                            key={step.step_number}
                            className="job-row"
                        >
                            {step.instruction}
                        </div>
                    ))}

                    {/* Empty rows to match original */}
                    {Array.from({
                        length: Math.max(0, 8 - (worksheet.steps?.length || 0))
                    }).map((_, index) => (
                        <div
                            key={`blank-${index}`}
                            className="job-row"
                        />
                    ))}
                </div>

                {/* RIGHT SIDE */}
                <table className="pallet-table">

                    <thead>
                        <tr>
                            <th>Pallet No.</th>
                            <th>No. of Outers</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pallets.map((pallet, index) => (
                            <tr key={index}>
                                <td>{pallet.pallet}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={pallet.outers}
                                        onChange={(e) =>
                                            updateOuter(index, e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <strong>Totals</strong>
                            </td>
                            <td></td>
                        </tr>
                    </tbody>

                </table>

            </div>

            {/* FOOTER */}

            <div className="worksheet-footer">

                <div className="footer-item">
                    <span>
                        Please initial when instructions are understood:
                    </span>
                    <div className="signature-line"></div>
                </div>

                <div className="footer-item">
                    <span>Supervisors Signature:</span>
                    <div className="signature-line"></div>
                </div>

                <div className="footer-item">
                    <span>Office Use:</span>
                    <div className="signature-line"></div>
                </div>

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

                <button
                    type="button"
                    onClick={() => navigate("/jobprocessing")}
                >
                    Cancel
                </button>

            </div>
    </>
  );
}

export default WorksheetEditor;