import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  ClipboardCheck,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

import ProductSearch from "../components/common/ProductSearch";

const STORAGE_KEY = "jobProcessingSelectedProduct";

function JobProcessing() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const reports = [
    {
      title: "Worksheet",
      endpoint: "worksheet",
      description:
        "DEKAPAK worksheet for job processing and pallet tracking",
      icon: Table,
    },
    {
      title: "Traceability",
      endpoint: "traceability",
      description:
        "Track product components and supplier chain",
      icon: ClipboardCheck,
    },
    {
      title: "Reject Report",
      endpoint: "reject-report",
      description:
        "Record packaging and product rejects with reasons",
      icon: AlertTriangle,
    },
    {
      title: "Date Coding & Label Check",
      endpoint: "date-coding",
      description:
        "Verify date codes and labels on packaging",
      icon: CalendarDays,
    },
    {
      title: "Stocktake Sheet",
      endpoint: "stocktake",
      description:
        "Record inventory counts and discrepancies",
      icon: ClipboardCheck,
    },
  ];

  useEffect(() => {
    const savedProduct =
      sessionStorage.getItem(STORAGE_KEY);

    if (savedProduct) {
      try {
        setProduct(
          JSON.parse(savedProduct)
        );
      } catch (error) {
        console.error(error);

        sessionStorage.removeItem(
          STORAGE_KEY
        );
      }
    }
  }, []);

  const handleProductSelect = (
    selectedProduct
  ) => {

    setProduct(selectedProduct);

    if (selectedProduct) {

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(selectedProduct)
      );

    } else {

      sessionStorage.removeItem(
        STORAGE_KEY
      );
    }
  };

  const openReport = (endpoint) => {

    if (!product) {

      alert(
        "Please select a product."
      );

      return;
    }

    navigate(
      `/${endpoint}?product=${product.id}`
    );
  };

  const handlePrintAll = () => {

      if (!product) {

          alert("Please select a product first.");

          return;
      }

      navigate(
          `/print-workpack?product=${product.id}`
      );
  };

  return (
    <div>

      <div className="page-header">

        <h2>
          Job Processing
        </h2>

        <p>
          Select a product and generate a workpack.
        </p>

      </div>

      <div className="report-parameters">

        <h3>
          Find Product
        </h3>

        <div className="parameter-grid">

          <ProductSearch
            selectedProduct={product}
            onSelect={handleProductSelect}
          />

          <button
              onClick={() =>
                  navigate(`/print-workpack?product=${product.id}`)
              }
          >
              🖨 Print All
          </button>

        </div>

        {product && (

          <div className="job-processing-selected">

            <span>
              Selected product:
            </span>

            <strong>
              {product.sku} - {product.name}
            </strong>

          </div>

        )}

      </div>

      <div className="report-grid">

        {reports.map((report) => {

          const Icon =
            report.icon;

          return (

            <button
              key={report.endpoint}
              className="report-card"
              disabled={!product}
              onClick={() =>
                openReport(
                  report.endpoint
                )
              }
            >

              <div className="report-icon">
                <Icon size={28} />
              </div>

              <h3>
                {report.title}
              </h3>

              <p>
                {report.description}
              </p>

            </button>

          );
        })}

      </div>

    </div>
  );
}

export default JobProcessing;