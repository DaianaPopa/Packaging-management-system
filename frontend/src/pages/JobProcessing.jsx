import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  ClipboardCheck,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

function JobProcessing() {
  const navigate = useNavigate();
  const reports = [
    {
      title: "Worksheet",
      endpoint: "worksheet",
      description: "DEKAPAK worksheet for job processing and pallet tracking",
      icon: Table,
    },
    {
      title: "Traceability",
      endpoint: "traceability",
      description: "Track product components and supplier chain",
      icon: ClipboardCheck,
    },
    {
      title: "Reject Report",
      endpoint: "reject-report",
      description: "Record packaging and product rejects with reasons",
      icon: AlertTriangle,
    },
    {
      title: "Date Coding & Label Check",
      endpoint: "date-coding",
      description: "Verify date codes and labels on packaging",
      icon: CalendarDays,
    },
    {
      title: "Stocktake Sheet",
      endpoint: "stocktake",
      description: "Record inventory counts and discrepancies",
      icon: ClipboardCheck,
    },
  ];

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (!customer) {
      setProducts([]);
      setProduct("");
      return;
    }

    loadProducts(customer);
  }, [customer]);

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers/");

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadProducts = async (customerId) => {
    try {
      setLoadingProducts(true);

      const response = await fetch(
        `/api/products/?customer=${customerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openReport = (endpoint) => {
    if (!customer || !product) {
      alert("Please select a customer and product.");
      return;
    }

    navigate(`/${endpoint}?customer=${customer}&product=${product}&date=${date}`);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Job Processing</h2>
        <p>Select the report you want to generate.</p>
      </div>

      <div className="report-parameters">
        <h3>Report Parameters</h3>

        <div className="parameter-grid">

          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Customer</label>

            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              disabled={loadingCustomers}
            >
              <option value="">
                {loadingCustomers
                  ? "Loading customers..."
                  : "Select customer..."}
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product</label>

            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              disabled={!customer || loadingProducts}
            >
              <option value="">
                {!customer
                  ? "Select customer first..."
                  : loadingProducts
                  ? "Loading products..."
                  : "Select product..."}
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.sku} - {product.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="report-grid">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <button
              key={report.endpoint}
              className="report-card"
              disabled={!customer || !product}
              onClick={() => openReport(report.endpoint)}
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