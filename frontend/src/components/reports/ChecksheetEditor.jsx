import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import "../../styles/reports.css";

function ChecksheetEditor() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sheetRef = useRef(null);

    const customerId = searchParams.get("customer");
    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date");

    const [loading, setLoading] = useState(true);
    const [sheet, setSheet] = useState(null);

    useEffect(() => {
        if (customerId && productId) {
            loadChecksheet();
        } else {
            setLoading(false);
        }
    }, [customerId, productId, reportDate]);

    async function loadChecksheet() {
        try {
            const response = await fetch(
                `/api/job-processing/checksheet/?customer=${customerId}&product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                throw new Error("Failed to load checksheet");
            }

            const data = await response.json();

            setSheet({
                product: data.product,
                date: reportDate,
                time1: "",
                initial1: "",
                time2: "",
                initial2: "",
                outerCodingImage: data.outerCodingImage || "",
                productCodingImage: data.productCodingImage || "",
                evidenceImage: data.evidenceImage || "",
                outerCodingImage2: data.outerCodingImage2 || "",
                productCodingImage2: data.productCodingImage2 || "",
                evidenceImage2: data.evidenceImage2 || "",
            });
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
            
            data.push(["DATE CODING & LABEL CHECK SHEET V2 2025"]);
            data.push([]);
            
            data.push(["Product", sheet.product]);
            data.push(["Date", sheet.date]);
            data.push([]);
            
            data.push(["SECTION 1"]);
            data.push(["Time", sheet.time1]);
            data.push(["Initial", sheet.initial1]);
            data.push([]);
            
            data.push(["SECTION 2"]);
            data.push(["Time", sheet.time2]);
            data.push(["Initial", sheet.initial2]);
            
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            ws["!cols"] = [
                { wch: 30 },
                { wch: 25 }
            ];
            
            XLSX.utils.book_append_sheet(workbook, ws, "Checksheet");
            
            // Generate filename with date
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `Checksheet_${sheet.product}_${timestamp}.xlsx`;
            
            XLSX.writeFile(workbook, filename);
        } catch (err) {
            console.error("Error exporting to Excel:", err);
            alert("Failed to export checksheet to Excel");
        }
    };

    if (loading) {
        return <h2>Loading checksheet...</h2>;
    }

    if (!customerId || !productId) {
        return <h2>Please select a customer and product first.</h2>;
    }

    if (!sheet) {
        return <h2>Unable to load checksheet.</h2>;
    }

    return (
        <>
            <div
                className="datecoding-page"
                id="print-area"
                ref={sheetRef}
            >
                {/* TITLE */}

                <h1 className="datecoding-title">
                    DATE CODING & LABEL CHECK SHEET 
                </h1>

                {/* HEADER */}

                <div className="datecoding-header">

                    <div className="header-box product">
                        <label>Product</label>
                        <div>{sheet.product}</div>
                    </div>

                    <div className="header-box date">
                        <label>Date</label>

                        <input
                            type="date"
                            value={sheet.date || ""}
                            onChange={(e) =>
                                setSheet({
                                    ...sheet,
                                    date: e.target.value,
                                })
                            }
                        />
                    </div>

                </div>

                {/* INSTRUCTIONS */}

                <div className="instruction-text">
                    BEST BEFORE & LOT CODE to be attached from
                    both product and outer packaging. Start of
                    product check to be done by Quality Manager.
                </div>

                {/* SECTION 1 */}

                <div className="coding-section">

                    <div className="outer-coding-box">
                        {sheet.outerCodingImage ? (
                            <img
                                src={sheet.outerCodingImage}
                                alt="Outer Coding"
                                className="coding-image"
                            />
                        ) : (
                            <div className="placeholder-text">
                                OUTER CODING
                            </div>
                        )}
                    </div>

                    <div className="product-column">

                        <div className="time-row">

                            <div className="time-box">
                                <label>Time:</label>

                                <input
                                    type="text"
                                    value={sheet.time1}
                                    onChange={(e) =>
                                        setSheet({
                                            ...sheet,
                                            time1: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="time-box">
                                <label>Initial:</label>

                                <input
                                    type="text"
                                    value={sheet.initial1}
                                    onChange={(e) =>
                                        setSheet({
                                            ...sheet,
                                            initial1:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        <div className="product-coding-box">
                            {sheet.productCodingImage ? (
                                <img
                                    src={sheet.productCodingImage}
                                    alt="Product Coding"
                                    className="coding-image"
                                />
                            ) : (
                                <div className="placeholder-text">
                                    PRODUCT CODING
                                </div>
                            )}
                        </div>

                        <div className="ccp-note">
                            At the start of a production run,
                            attach evidence of packaging
                            matching the specification below.
                            <span> CCP 2</span>
                        </div>

                        <div className="evidence-box">
                            {sheet.evidenceImage && (
                                <img
                                    src={sheet.evidenceImage}
                                    alt="Evidence"
                                    className="coding-image"
                                />
                            )}
                        </div>

                    </div>

                </div>

                {/* CHANGE NOTE */}

                <div className="change-note">
                    Any change of BEST BEFORE and/or LOT CODE
                    should be attached below with new date
                    code, time of change and the signature
                    of supervisor in charge.
                </div>

                {/* SECTION 2 */}

                <div className="coding-section">

                    <div className="outer-coding-box">
                        {sheet.outerCodingImage2 ? (
                            <img
                                src={sheet.outerCodingImage2}
                                alt="Outer Coding"
                                className="coding-image"
                            />
                        ) : (
                            <div className="placeholder-text">
                                OUTER CODING
                            </div>
                        )}
                    </div>

                    <div className="product-column">

                        <div className="time-row">

                            <div className="time-box">
                                <label>Time:</label>

                                <input
                                    type="text"
                                    value={sheet.time2}
                                    onChange={(e) =>
                                        setSheet({
                                            ...sheet,
                                            time2:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="time-box">
                                <label>Initial:</label>

                                <input
                                    type="text"
                                    value={sheet.initial2}
                                    onChange={(e) =>
                                        setSheet({
                                            ...sheet,
                                            initial2:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                       <div className="product-coding-box">
                            {sheet.productCodingImage2 ? (
                                <img
                                    src={sheet.productCodingImage2}
                                    alt="Product Coding"
                                    className="coding-image"
                                />
                            ) : (
                                <div className="placeholder-text">
                                    PRODUCT CODING
                                </div>
                            )}
                        </div>

                        <div className="ccp-note">
                            At the start of a production run,
                            attach evidence of packaging
                            matching the specification below.
                            <span> CCP 2</span>
                        </div>

                        <div className="evidence-box">
                            {sheet.evidenceImage2 && (
                                <img
                                    src={sheet.evidenceImage2}
                                    alt="Evidence"
                                    className="coding-image"
                                />
                            )}
                        </div>
                    </div>

                </div>

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

export default ChecksheetEditor;
