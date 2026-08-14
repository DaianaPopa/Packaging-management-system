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

  // Restore selected product when Job Processing loads
  useEffect(() => {
    const savedProduct =
      sessionStorage.getItem(STORAGE_KEY);

    if (savedProduct) {
      try {
        const parsedProduct =
          JSON.parse(savedProduct);

        setProduct(parsedProduct);
      } catch (error) {
        console.error(
          "Could not restore selected product:",
          error
        );

        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Product selected from ProductSearch
  const handleProductSelect = (selectedProduct) => {
    setProduct(selectedProduct);

    if (selectedProduct) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(selectedProduct)
      );
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  // Open report
  const openReport = (endpoint) => {
    if (!product) {
      alert("Please select a product.");
      return;
    }

    navigate(
      `/${endpoint}?product=${product.id}`
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Job Processing</h2>

        <p>
          Search for a product and select the report
          you want to generate.
        </p>
      </div>

      <div className="report-parameters">
        <h3>Find Product</h3>

        <div className="parameter-grid">
          <ProductSearch
            selectedProduct={product}
            onSelect={handleProductSelect}
          />
        </div>

        {product && (
          <div className="job-processing-selected">
            <span>Selected product:</span>

            <strong>
              {product.sku} - {product.name}
            </strong>
          </div>
        )}
      </div>

      <div className="report-grid">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <button
              key={report.endpoint}
              className="report-card"
              disabled={!product}
              onClick={() =>
                openReport(report.endpoint)
              }
            >
              <div className="report-icon">
                <Icon size={28} />
              </div>

              <h3>{report.title}</h3>

              <p>{report.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default JobProcessing;