import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Pencil,
  Building2,
} from "lucide-react";

import SearchBar from "../components/common/SearchBar";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeFilters, setActiveFilters] = useState({
    customer: "",
    date: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/customers/"
      );

      const data = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error(
        "Error loading customers:",
        error
      );
    }
  };

  const filteredCustomers = customers.filter(
    (customer) => {
      const matchesSearch =
        customer.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCustomer =
        !activeFilters.customer ||
        String(customer.id) ===
          String(activeFilters.customer);

      const matchesDate =
        !activeFilters.date ||
        customer.created_at.slice(0, 10) ===
          activeFilters.date;

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesDate
      );
    }
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>
            Manage customer information and
            linked products
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <SearchBar
          page="customers"
          onFilter={setActiveFilters}
        />

        <Link
          to="/customers/new"
          className="new-product-btn"
        >
          Add Customer
        </Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>CUSTOMER NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>PRODUCTS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="empty-state"
                >
                  <div className="empty-icon">
                    <Building2 size={34} />
                  </div>

                  <h3>No customers found</h3>

                  <p>
                    Try changing your search
                    or filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(
                (customer) => (
                  <tr key={customer.id}>
                    <td>
                      {customer.company_name}
                    </td>

                    <td>
                      {customer.email || "—"}
                    </td>

                    <td>
                      {customer.phone || "—"}
                    </td>

                    <td>
                      {customer.product_count ||
                        0}
                    </td>

                    <td className="actions">
                      <Link
                        to={`/customers/${customer.id}`}
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        to={`/customers/${customer.id}?edit=true`}
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

export default Customers;