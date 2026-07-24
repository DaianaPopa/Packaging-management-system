import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Pencil,
  Package,
} from "lucide-react";

import SearchBar from "../components/common/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        "http://127.0.0.1:8000/api/products/"
      );

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error(
        "Error loading products:",
        error
      );
    }
  };

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch =
        `${product.sku} ${product.name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCustomer =
        !activeFilters.customer ||
        String(product.customer) ===
          String(activeFilters.customer);

      const matchesProduct =
        !activeFilters.product ||
        String(product.id) ===
          String(activeFilters.product);

      const matchesTransaction =
        !activeFilters.transaction ||
        product.transaction ===
          activeFilters.transaction;

      const matchesDate =
        !activeFilters.date ||
        product.date_set_up ===
          activeFilters.date;

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesProduct &&
        matchesTransaction &&
        matchesDate
      );
    }
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>
            Manage and view all product
            information
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <SearchBar
          page="products"
          onFilter={setActiveFilters}
        />

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
                    Try changing your search
                    or filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(
                (product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>

                    <td>{product.name}</td>

                    <td>
                      {product.customer_name}
                    </td>

                    <td>
                      {product.transaction ||
                        "—"}
                    </td>

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
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;