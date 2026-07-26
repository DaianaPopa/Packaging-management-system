import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Pencil, Package, Upload } from "lucide-react";
import SearchBar from "../components/common/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCustomer, setBulkCustomer] = useState("");
  const [bulkFiles, setBulkFiles] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    customer: "",
    product: "",
    transaction: "",
    date: "",
  });

  useEffect(() => {
    fetchProducts();

    fetch("https://daianapopa.pythonanywhere.com/api/customers/")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "https://daianapopa.pythonanywhere.com/api/products/"
      );

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkCustomer) {
      alert("Please select a customer");
      return;
    }

    if (bulkFiles.length === 0) {
      alert("Please select files");
      return;
    }

    const formData = new FormData();

    formData.append("customer", bulkCustomer);

    bulkFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        "https://daianapopa.pythonanywhere.com/api/products/bulk-upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      alert(result.message || "Upload complete");

      setShowBulkModal(false);
      setBulkFiles([]);
      setBulkCustomer("");

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = `
      ${product.sku}
      ${product.name}
    `
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCustomer =
      !activeFilters.customer ||
      String(product.customer) === String(activeFilters.customer);

    const matchesProduct =
      !activeFilters.product ||
      String(product.id) === String(activeFilters.product);

    const matchesTransaction =
      !activeFilters.transaction ||
      product.transaction === activeFilters.transaction;

    const matchesDate =
      !activeFilters.date ||
      product.date_set_up === activeFilters.date;

    return (
      matchesSearch &&
      matchesCustomer &&
      matchesProduct &&
      matchesTransaction &&
      matchesDate
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage and view all product information</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <SearchBar
          page="products"
          onFilter={setActiveFilters}
        />

        <button
          className="upload-btn"
          onClick={() => setShowBulkModal(true)}
        >
          <Upload size={18} />
          Bulk Upload
        </button>

        <Link
          to="/products/new"
          className="new-product-btn"
        >
          New Product
        </Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>PRODUCT CODE</th>
              <th>PRODUCT DESCRIPTION</th>
              <th>CUSTOMER</th>
              <th>TRANSACTION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="empty-state"
                >
                  <div className="empty-icon">
                    <Package size={34} />
                  </div>

                  <h3>No products found</h3>

                  <p>
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>

                  <td>{product.name}</td>

                  <td>{product.customer_name}</td>

                  <td>{product.transaction || "—"}</td>

                  <td className="actions">
                    <Link
                      to={`/products/${product.id}`}
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/products/${product.id}?edit=true`}
                    >
                      <Pencil size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Bulk Upload Products</h3>

            <select
              value={bulkCustomer}
              onChange={(e) =>
                setBulkCustomer(e.target.value)
              }
            >
              <option value="">
                Select Customer
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

            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={(e) =>
                setBulkFiles(
                  Array.from(e.target.files)
                )
              }
            />

            <button onClick={handleBulkUpload}>
              Upload
            </button>

            <button
              onClick={() =>
                setShowBulkModal(false)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;