import { Search, Plus, Eye, Pencil, Building2, Mail, Phone } from "lucide-react";

function Customers() {
  const customers = [];

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage customer information and linked products</p>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Search customers..." />
        </div>

        <button className="new-product-btn">
          Add Customer
        </button>
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
            {customers.length === 0 ? (
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
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>
                    <Mail size={16} /> {customer.email}
                  </td>
                  <td>
                    <Phone size={16} /> {customer.phone}
                  </td>
                  <td>{customer.products}</td>
                  <td className="actions">
                    <Eye size={18} />
                    <Pencil size={18} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="customer-form-card">
        <h3>Add New Customer</h3>

        <div className="customer-form-grid">
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" placeholder="Enter customer name" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter email address" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="Enter phone number" />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="Enter customer address" />
          </div>
        </div>

        <button className="generate-btn">
          Save Customer
        </button>
      </div>
    </div>
  );
}

export default Customers;