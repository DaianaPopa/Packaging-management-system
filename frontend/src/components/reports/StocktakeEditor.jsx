import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import "../../styles/stock.css";


function StocktakeEditor() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const customerId = searchParams.get("customer");
    const productId = searchParams.get("product");
    const reportDate = searchParams.get("date");

    const [components, setComponents] = useState([]);

    const [stock, setStock] = useState({
        product: "",
        sku: "",
        date: reportDate || "",
        signature: "",

        warehouse1: "",
        warehouse2: "",

        room: "",
        roomTotal: "",
    });
    useEffect(() => {
        if (customerId && productId) {
            loadStocktake();
        }
    }, [customerId, productId, reportDate]);

    async function loadStocktake() {
        try {

            const response = await fetch(
                `/api/job-processing/stocktake/?customer=${customerId}&product=${productId}&date=${reportDate}`
            );

            if (!response.ok) {
                throw new Error("Failed to load stocktake");
            }

            const data = await response.json();

            console.log("Stocktake API:", data);

            setStock({
                product: data.product,
                sku: data.sku,
                date: data.date,
                signature: "",
            });

            setComponents(data.components || []);

        } catch (err) {
            console.error(err);
        }
    }
    const handlePrint = () => {
    window.print();
};

const handleExportExcel = () => {
    try {
        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.aoa_to_sheet([
            ["R21 STOCKTAKE CHECKLIST"],
            [],
            ["JOB", `${stock.sku} - ${stock.product}`],
            ["DATE", stock.date],
            ["SIGNATURE", stock.signature],
        ]);

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Stocktake"
        );

        XLSX.writeFile(
            workbook,
            "Stocktake.xlsx"
        );

    } catch (err) {
        console.error(err);
    }
};

    return (
    <>
          <div className="stocktake-page" id="print-area">
              <h1 className="worksheet-title">
                  R21 STOCKTAKE CHECKLIST
              </h1>

          {/* HEADER */}
          <div className="stocktake-top">

              <div className="job-line">
                  <strong>JOB:</strong>
                  <span>{stock.sku} - {stock.product}</span>
              </div>

              <div className="signature-line">
                  <strong>SIGNATURE:</strong>
                  <input
                      value={stock.signature}
                      onChange={(e) =>
                          setStock({
                              ...stock,
                              signature: e.target.value,
                          })
                      }
                  />
              </div>

              <div className="date-line">
                  <strong>DATE:</strong>
                  <input
                      type="date"
                      value={stock.date}
                      onChange={(e) =>
                          setStock({
                              ...stock,
                              date: e.target.value,
                          })
                      }
                  />
              </div>

              <div className="balance-line">
                  <strong>Bal on System:</strong>
                  <input />
              </div>

          </div>

          {/* MAIN TABLE */}
          <table className="physical-stock-table">
              <thead>
                  <tr>
                      <th colSpan="2">PACKAGING</th>
                      <th colSpan="6">ROOM COUNT</th>
                      <th>OFFICE USE ONLY</th>
                      <th>WAREHOUSE (+)</th>
                      <th>TOTAL</th>
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
                      <th>TOTAL</th>
                      <th>WAREHOUSE</th>
                      <th>TOTAL</th>
                  </tr>
              </thead>

              <tbody>
                  {components.length > 0 ? (
                      components.map((component) => (
                          <tr key={component.id}>
                            <td>{component.component_sku}</td>
                              <td>{component.component_name}</td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                              <td><input /></td>
                          </tr>
                      ))
                  ) : (

                      <tr>
                          <td colSpan="11">
                              No components found
                          </td>
                      </tr>

                  )}
              </tbody>
          </table>
      </div>

      {/* BUTTONS */}
        <div className="stocktake-buttons no-print">

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

export default StocktakeEditor;