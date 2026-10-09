import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Pencil,
  Building2,
  Plus,
  Trash,
} from "lucide-react";

import SearchBar from "../components/common/SearchBar";
import { API_BASE_URL } from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);

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
        `${API_BASE_URL}/customers/`
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

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedCustomerIds.length} selected customers?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/bulk-delete/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedCustomerIds }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete customers");
      }

      alert(result.message || "Customers deleted successfully");
      setSelectedCustomerIds([]);
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete selected customers");
    }
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId]
    );
  };

  const toggleAllCustomers = () => {
    const visibleIds = filteredCustomers.map((customer) => customer.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCustomerIds.includes(id));

    setSelectedCustomerIds(allSelected ? selectedCustomerIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedCustomerIds, ...visibleIds])));
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

        <button
          className="bulk-delete-btn"
          onClick={handleBulkDelete}
          disabled={selectedCustomerIds.length === 0}
        >
          <Trash size={18} />
          Delete Selected
          {selectedCustomerIds.length > 0 && ` (${selectedCustomerIds.length})`}
        </button>

        <Link
          to="/customers/new"
          className="primary-action-btn add-customer-btn"
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="selection-column">
                <input
                  className="selection-checkbox"
                  type="checkbox"
                  aria-label="Select all customers"
                  checked={filteredCustomers.length > 0 && filteredCustomers.every((customer) => selectedCustomerIds.includes(customer.id))}
                  onChange={toggleAllCustomers}
                />
              </th>
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
                  colSpan="6"
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
                      <input
                        className="selection-checkbox"
                        type="checkbox"
                        aria-label={`Select customer ${customer.company_name}`}
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                      />
                    </td>

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