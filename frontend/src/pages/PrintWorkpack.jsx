import { Fragment, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "../styles/worksheet.css";
import "../styles/traceability.css";
import "../styles/reject.css";
import "../styles/check.css";
import "../styles/stock.css";
import "../styles/printWorkpack.css";
import ReportIssueMeta from "../components/reports/ReportIssueMeta";
import StocktakeTable from "../components/reports/StocktakeTable";

function PrintWorkpack() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productId = searchParams.get("product");
    const date = searchParams.get("date");
    const [workpack, setWorkpack] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            return;
        }

        async function loadWorkpack() {
            try {
                setError("");
                const params = new URLSearchParams({ product: productId });
                if (date) params.set("date", date);

                const response = await fetch(
                    `/api/job-processing/workpack/?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error(`Failed to load workpack (${response.status})`);
                }
                setWorkpack(await response.json());
            } catch (loadError) {
                console.error("Print workpack error:", loadError);
                setError(loadError.message);
            }
        }

        loadWorkpack();
    }, [productId, date]);

    useEffect(() => {
        if (!workpack) return undefined;
        const goBack = () => navigate(-1);
        window.addEventListener("afterprint", goBack);
        const timer = setTimeout(() => window.print(), 500);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("afterprint", goBack);
        };
    }, [workpack, navigate]);

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
    const dateCoding = workpack.checksheet || {};
    const stocktake = workpack.stocktake || {};
    const savedProduct = workpack.product || {};
    const productSku = savedProduct.sku || "";
    const productName = savedProduct.name || "";
    const customerName = savedProduct.customer || "";
    const traceabilityRows = Array.isArray(traceability.rows) ? traceability.rows : [];
    const packagingRows = Array.isArray(stocktake.components) ? stocktake.components : [];
    const productRows = Array.isArray(stocktake.product_rows)
        ? stocktake.product_rows
        : stocktake.product_row
            ? [stocktake.product_row]
            : [];
    const stocktakeProductRows = productRows.length > 0
        ? productRows
        : packagingRows.filter((row) => row.component_sku?.trim().toUpperCase() === "MB850");
    const stocktakePackagingRows = packagingRows.filter(
        (row) => row.component_sku?.trim().toUpperCase() !== "MB850"
    );
    const stocktakeIssue = stocktake.issue || workpack.issue;
    const isMbSku = (sku) => sku?.trim().toUpperCase().startsWith("MB");
    const packedProducts = (traceability.components || []).filter((component) => isMbSku(component.component_sku));
    const missingMbRows = [...stocktakeProductRows, ...packagingRows]
        .filter((row) => isMbSku(row.component_sku))
        .filter((row, index, all) => all.findIndex((other) => other.component_sku === row.component_sku) === index)
        .filter((row) => !packedProducts.some((component) => component.component_sku?.trim().toUpperCase() === row.component_sku.trim().toUpperCase()))
        .map((row, index) => ({
            id: `stocktake-mb-${index}`,
            component_sku: row.component_sku,
            component_name: row.component_name,
        }));
    const shownProducts = [...packedProducts, ...missingMbRows];
    const traceabilityProductSlots = [
        ...shownProducts,
        ...Array.from(
            { length: Math.max(0, 4 - shownProducts.length) },
            (_, index) => ({ id: `blank-product-${index}`, isPlaceholder: true })
        ),
    ];

    return (
        <div id="print-area" className="print-workpack">

            <section className="workpack-page worksheet worksheet-print-page">
                <h1 className="worksheet-title">DEKAPAK WORKSHEET</h1>
                <div className="worksheet-issue-date">
                    <span>Issue No: {workpack.issue || ""}</span>
                    <span>Print Date: {new Date().toLocaleDateString()}</span>
                </div>

                <table className="worksheet-header">
                    <tbody>
                        <tr>
                            <th>Customer</th>
                            <td>{customerName}</td>
                            <th>Product Code</th>
                            <td>{productSku}</td>
                        </tr>
                        <tr>
                            <th>Pallet Configuration</th>
                            <td>{savedProduct.pallet_configuration || ""}</td>
                            <th>Product Name</th>
                            <td>{productName}</td>
                        </tr>
                        <tr>
                            <th>Job Type</th>
                            <td>{savedProduct.transaction || ""}</td>
                            <th>Date</th>
                            <td />
                        </tr>
                    </tbody>
                </table>

                <div className="worksheet-content">
                    <div className="job-description">
                        <div className="job-title">Job Description</div>
                        {(worksheet.steps || []).map((step, index) => (
                            <div className="job-row" key={step.step_number || index}>
                                {step.instruction}
                            </div>
                        ))}
                        {Array.from({
                            length: Math.max(0, 8 - (worksheet.steps?.length || 0)),
                        }).map((_, index) => (
                            <div className="job-row" key={`blank-${index}`} />
                        ))}
                    </div>

                    <table className="pallet-table">
                        <thead>
                            <tr><th>Pallet No.</th><th>No. of Outers</th></tr>
                        </thead>
                        <tbody>
                            {(worksheet.pallets || []).map((pallet, index) => (
                                <tr key={index}>
                                    <td>{pallet.pallet || index + 1}</td>
                                    <td>{pallet.outers || ""}</td>
                                </tr>
                            ))}
                            {(!worksheet.pallets || worksheet.pallets.length === 0) &&
                                Array.from({ length: 20 }).map((_, index) => (
                                    <tr key={index}><td>{index + 1}</td><td /></tr>
                                ))}
                            <tr><td><strong>Totals</strong></td><td /></tr>
                        </tbody>
                    </table>
                </div>

                <div className="worksheet-footer">
                    {["Please initial when instructions are understood:", "Supervisors Signature:", "Office Use:"].map((label) => (
                        <div className="footer-item" key={label}>
                            <span>{label}</span>
                            <div className="signature-line" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="workpack-page workpack-landscape-page">
                <div className="workpack-landscape-content traceability-page traceability-print-page">
                <h1 className="traceability-title">Traceability Sheet - Multiple Components</h1>
                <ReportIssueMeta issue={traceability.issue || workpack.issue} />
                <div className="traceability-header">
                    <div className="traceability-header-left">
                        <div><strong>Customer:</strong> {customerName}</div>
                        <div><strong>Date:</strong></div>
                        <div>If Part Pallet of WIP enters room, please enter quantity in Qty column</div>
                        <div><strong>Outgoing Palman batch code:</strong> {traceability.outgoingBatchCode || traceability.batchCode || ""}</div>
                        <div><strong>Product Line:</strong> {productName}</div>
                    </div>
                    <div className="traceability-header-right">
                        <div><strong>Process Order:</strong> {traceability.processOrder || ""}</div>
                        <div><strong>Line Code:</strong> {productSku}</div>
                    </div>
                </div>

                <table className="traceability-table">
                    <thead>
                        <tr>
                            <th rowSpan="2">DP No</th>
                            <th rowSpan="2">Pallet No</th>
                            <th colSpan={traceabilityProductSlots.length * 2}>DETAILS OF PACKED COMPONENTS</th>
                        </tr>
                        <tr>
                            {traceabilityProductSlots.map((component) => (
                                <Fragment key={component.id}>
                                    <th>
                                        {component.component_name || ""}
                                        <br />
                                        <small>{component.component_sku || ""}</small>
                                    </th>
                                    <th className="traceability-qty-column">Qty</th>
                                </Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(traceabilityRows.length > 0 ? traceabilityRows : Array.from({ length: 7 }, () => ({}))).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>{row.dpNo || ""}</td>
                                <td>{row.palletNo || ""}</td>
                                {traceabilityProductSlots.map((component) => {
                                    const values = row.components;
                                    const code = Array.isArray(values)
                                        ? values.find((item) => item.componentId === component.id)?.code
                                        : values?.[`${component.id}_code`];
                                    const qty = Array.isArray(values)
                                        ? values.find((item) => item.componentId === component.id)?.qty
                                        : values?.[`${component.id}_qty`] ?? values?.[component.id]?.qty;
                                    return (
                                        <Fragment key={component.id}>
                                            <td>{component.isPlaceholder ? "" : code || ""}</td>
                                            <td className="traceability-qty-column">{component.isPlaceholder ? "" : qty || ""}</td>
                                        </Fragment>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </section>

            <section className="workpack-page reject-page reject-print-page">
                <h1 className="reject-title">REJECT REPORT</h1>
                <ReportIssueMeta issue={rejectReport.issue || workpack.issue} />
                <div className="reject-header">
                    <div className="header-box"><label>Customer</label><div>{customerName}</div></div>
                    <div className="header-box"><label>Product</label><div className="header-value product-name">{productName}</div></div>
                    <div className="header-box"><label>SKU</label><div>{productSku}</div></div>
                    <div className="header-box"><label>Date</label><div>&nbsp;</div></div>
                </div>
                <div className="reject-note">
                    Rejects to be recorded, stored, secured and labelled accordingly. This report is to be sent to the office at the end of each shift or production run.
                </div>
                {[
                    ["PACKAGING REJECTS", rejectReport.packagingRejects],
                    ["PRODUCT REJECTS", rejectReport.productRejects],
                ].map(([title, entries]) => (
                    <div className="reject-section" key={title}>
                        <div className="section-title">{title}</div>
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
                                {(Array.isArray(entries) ? entries : []).map((row, index) => (
                                    <tr key={row.id || `${title}-${index}`} className={row.type === "manual" ? "reject-manual-row" : ""}>
                                        <td>
                                            <div className={row.type === "manual" ? "manual-reject-product" : "reject-product"}>
                                                <strong>{row.sku || ""}</strong>
                                                <span>{row.name || ""}</span>
                                            </div>
                                        </td>
                                        <td>{row.incoming || ""}</td>
                                        <td>{row.incoming_reason || row.incomingReason || ""}</td>
                                        <td>{row.inhouse || ""}</td>
                                        <td>{row.inhouse_reason || row.inhouseReason || ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            <section className="workpack-page datecoding-page date-coding-print-page">
                <h1 className="datecoding-title">DATE CODING &amp; LABEL CHECK SHEET</h1>
                <ReportIssueMeta issue={dateCoding.issue || workpack.issue} />
                <div className="datecoding-header">
                    <div className="header-box product">
                        <label>Product</label>
                        <div>
                            {productSku ? `${productSku} - ` : ""}
                            {productName}
                        </div>
                    </div>
                    <div className="header-box date">
                        <label>Date</label>
                        <div>&nbsp;</div>
                    </div>
                </div>
                <div className="instruction-text">
                    BEST BEFORE &amp; LOT CODE to be attached from both product and outer packaging. Start of product check to be done by Quality Manager.
                </div>
                {[1, 2].map((checkNumber) => {
                    const suffix = checkNumber === 1 ? "" : "2";
                    const outerImage = dateCoding[`outerCodingImage${suffix}`];
                    const productImage = dateCoding[`productCodingImage${suffix}`];
                    const evidenceImage = dateCoding[`evidenceImage${suffix}`];
                    return (
                        <Fragment key={checkNumber}>
                            <div className="coding-section">
                                <div className="outer-coding-box">
                                    {outerImage ? <img src={outerImage} alt="Outer Coding" className="coding-image" /> : <div className="placeholder-text">OUTER CODING</div>}
                                </div>
                                <div className="product-column">
                                    <div className="time-row">
                                        <div className="time-box"><label>Time</label><span>{dateCoding[`time${checkNumber}`] || ""}</span></div>
                                        <div className="time-box"><label>Initial</label><span>{dateCoding[`initial${checkNumber}`] || ""}</span></div>
                                    </div>
                                    <div className="product-coding-box">
                                        {productImage ? <img src={productImage} alt="Product Coding" className="coding-image" /> : <div className="placeholder-text">PRODUCT CODING</div>}
                                    </div>
                                    <div className="ccp-note">
                                        At the start of a production run, attach evidence of packaging matching the specification below.
                                        <span> CCP 2</span>
                                    </div>
                                    <div className="evidence-box">
                                        {evidenceImage ? <img src={evidenceImage} alt="Evidence" className="coding-image" /> : null}
                                    </div>
                                </div>
                            </div>
                            {checkNumber === 1 && (
                                <div className="change-note">
                                    Any change of BEST BEFORE and/or LOT CODE should be attached below with new date code, time of change and the signature of supervisor in charge.
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </section>

            <section className="workpack-page workpack-landscape-page">
                <div className="workpack-landscape-content stocktake-page stocktake-print-page">
                <h1 className="worksheet-title">R21 STOCKTAKE CHECKLIST</h1>
                <ReportIssueMeta issue={stocktakeIssue} />
                <div className="stocktake-top">
                    <div className="job-line">
                        <strong>JOB:</strong>
                        <span className="stocktake-job-value">
                            {[productSku, productName].filter(Boolean).join(" ")}
                        </span>
                    </div>
                    <div className="stocktake-signature-line">
                        <strong>SIGNATURE:</strong><span>{stocktake.signature || ""}</span>
                    </div>
                    <div className="date-line">
                        <strong>DATE:</strong><span className="blank-date-line" />
                    </div>
                    <div className="balance-line">
                        <strong>Bal on System:</strong><span>{stocktake.balanceOnSystem || ""}</span>
                    </div>
                </div>
                <StocktakeTable
                    title="PRODUCT"
                    product={{
                        sku: productSku,
                        name: productName,
                    }}
                    rows={stocktakeProductRows.length > 0 ? stocktakeProductRows : [{}]}
                    readOnly
                />
                <StocktakeTable
                    title="PACKAGING"
                    rows={stocktakePackagingRows}
                    readOnly
                />
                </div>
            </section>
        </div>
    );
}

export default PrintWorkpack;