import { useEffect, useState } from "react";
import { ArrowLeft, PackageOpen, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

function ProductBulkUpload() {
  const [customers, setCustomers] = useState([]);
  const [bulkCustomer, setBulkCustomer] = useState("");
  const [bulkFiles, setBulkFiles] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/customers/`)
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error(error));
  }, []);

  const handleBulkUpload = async () => {
    if (!bulkCustomer) {
      setStatus("Please select a customer.");
      return;
    }

    if (bulkFiles.length === 0) {
      setStatus("Please select at least one Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("customer", bulkCustomer);
    bulkFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/bulk-upload/`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const failures = (result.errors || [])
        .map((item) => `${item.file}: ${item.error}`)
        .join("; ");

      if (result.created > 0) {
        setBulkFiles([]);
        setBulkCustomer("");
      }

      setStatus(
        failures
          ? `${result.created} uploaded, ${result.failed} failed. ${failures}`
          : result.message || "Upload complete"
      );
    } catch (error) {
      console.error(error);
      setStatus("Upload failed. Please try again.");
    }
  };

  return (
    <div className="bulk-upload-page">
      <Link to="/products" className="back-link">
        <ArrowLeft size={18} />
        Back to products
      </Link>

      <div className="page-header">
        <div>
          <h2>Bulk Upload Products</h2>
          <p>Upload multiple product files for one customer.</p>
        </div>
      </div>

      <section className="bulk-upload-card">
        <div className="bulk-upload-icon">
          <PackageOpen size={34} />
        </div>

        <label className="bulk-upload-label" htmlFor="bulk-customer">
          Customer
        </label>
        <select
          id="bulk-customer"
          value={bulkCustomer}
          onChange={(event) => setBulkCustomer(event.target.value)}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.company_name}
            </option>
          ))}
        </select>

        <label className="bulk-upload-label" htmlFor="bulk-files">
          Excel files
        </label>
        <input
          id="bulk-files"
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={(event) => setBulkFiles(Array.from(event.target.files))}
        />

        {status && <p className="bulk-upload-status">{status}</p>}

        <button className="bulk-upload-submit" onClick={handleBulkUpload}>
          <Upload size={18} />
          Upload products
        </button>
      </section>
    </div>
  );
}

export default ProductBulkUpload;
