import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";

function SearchBar({ page = "products", onFilter }) {
  const [open, setOpen] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [filters, setFilters] = useState({
    customer: "",
    product: "",
    transaction: "",
    date: "",
  });

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch(
          "http://daianapopa.pythonanywhere.com/api/customers/"
        );

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };

    loadCustomers();
  }, []);

  // Load products when customer changes
  useEffect(() => {
    if (!filters.customer) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await fetch(
          `http://daianapopa.pythonanywhere.com/api/products/?customer=${filters.customer}`
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        console.log("Products:", data);

        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, [filters.customer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "customer"
        ? {
            product: "",
          }
        : {}),
    }));
  };

  // Apply filters
  const handleApply = () => {
    if (onFilter) {
      onFilter(filters);
    }

    setOpen(false);
  };

  // Clear filters
  const handleClear = () => {
    const cleared = {
      customer: "",
      product: "",
      transaction: "",
      date: "",
    };

    setFilters(cleared);
    setProducts([]);

    if (onFilter) {
      onFilter(cleared);
    }
  };

  return (
    <>
      <button
        className="filter-btn"
        onClick={() => setOpen(true)}
      >
        <Filter size={18} />
        Filters
      </button>

      {open && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header">
              <h2>Filters</h2>

              <button
                className="close-btn"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="filter-bar">

              {/* Customer */}

              <div className="filter-field">
                <label>Customer</label>

                <select
                  name="customer"
                  value={filters.customer}
                  onChange={handleChange}
                >
                  <option value="">
                    All Customers
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

              {/* Product */}

              {page === "products" && (
                <>
                  <div className="filter-field">
                    <label>Product</label>

                    <select
                      name="product"
                      value={filters.product}
                      onChange={handleChange}
                      disabled={!filters.customer}
                    >
                      <option value="">
                        All Products
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction */}

                  <div className="filter-field">
                    <label>Transaction</label>

                    <select
                      name="transaction"
                      value={filters.transaction}
                      onChange={handleChange}
                    >
                      <option value="">
                        All Transactions
                      </option>

                      <option value="other">
                        Other
                      </option>

                      <option value="mixed">
                        Mixed
                      </option>
                    </select>
                  </div>
                </>
              )}

              {/* Date */}

              <div className="filter-field">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleChange}
                />
              </div>

              {/* Buttons */}

              <div className="filter-actions">
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClear}
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="apply-btn"
                  onClick={handleApply}
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;