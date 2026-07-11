import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Pencil, Building2, Mail, Phone, Filter } from "lucide-react";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/customers/");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage customer information and linked products</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        

         <button className="filter-btn">
         <Filter size={18} />Filters
        </button>

        <Link to="/customers/new" className="new-product-btn">
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
                <td colSpan="5" className="empty-state">
                  <div className="empty-icon">
                    <Building2 size={34} />
                  </div>
                  <h3>No customers yet</h3>
                  <p>Add your first customer to start managing products.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.company_name}</td>

                  <td>
                    <span className="table-icon-cell">
                      { customer.email || "—"}
                    </span>
                  </td>

                  <td>
                    <span className="table-icon-cell">
                      { customer.phone || "—"}
                    </span>
                  </td>

                  <td>{customer.product_count || 0}</td>

                  <td className="actions">
                    <Link to={`/customers/${customer.id}`}>
                      <Eye size={18} />
                    </Link>

                    <Link to={`/customers/${customer.id}?edit=true`}>
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

export default Customers;