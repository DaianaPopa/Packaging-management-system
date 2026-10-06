import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Pencil, Package, Upload, Trash } from "lucide-react";
import SearchBar from "../components/common/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [showCreationOptions, setShowCreationOptions] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    customer: "",
    product: "",
    transaction: "",
    date: "",
  });

  useEffect(() => {
    fetchProducts();
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

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) {
      return;
    }

    try {
      const response = await fetch(
        "https://daianapopa.pythonanywhere.com/api/products/bulk-delete/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedProductIds }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete products");
      }

      alert(result.message || "Products deleted successfully");
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete selected products");
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const toggleAllProducts = () => {
    const visibleIds = filteredProducts.map((product) => product.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.includes(id));

    setSelectedProductIds(allSelected ? selectedProductIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedProductIds, ...visibleIds])));
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
          className="bulk-delete-btn"
          onClick={handleBulkDelete}
          disabled={selectedProductIds.length === 0}
        >
          <Trash size={18} />
          Delete Selected
          {selectedProductIds.length > 0 && ` (${selectedProductIds.length})`}
        </button>

        <div className="product-creation-menu">
          <button
            type="button"
            className="primary-action-btn"
            aria-expanded={showCreationOptions}
            onClick={() => setShowCreationOptions((current) => !current)}
          >
            New Product
          </button>

          {showCreationOptions && (
            <div className="product-creation-options">
              <Link to="/products/new" className="creation-option" onClick={() => setShowCreationOptions(false)}>
                <span className="creation-option-icon">+</span>
                <span>
                  <strong>Individual</strong>
                  <small>Create one product</small>
                </span>
              </Link>
              <Link to="/products/bulk-upload" className="creation-option" onClick={() => setShowCreationOptions(false)}>
                <Upload size={22} />
                <span>
                  <strong>Bulk</strong>
                  <small>Upload multiple files</small>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="selection-column">
                <input
                  className="selection-checkbox"
                  type="checkbox"
                  aria-label="Select all products"
                  checked={filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id))}
                  onChange={toggleAllProducts}
                />
              </th>
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
                  colSpan="6"
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
                  <td>
                    <input
                      className="selection-checkbox"
                      type="checkbox"
                      aria-label={`Select product ${product.sku}`}
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </td>

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
    </div>
  );
}

export default Products;