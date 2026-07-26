import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isNewCustomer = id === "new";
  const editMode = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(isNewCustomer || editMode);

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!isNewCustomer) {
      fetch(`http://daianapopa.pythonanywhere.com/api/customers/${id}/`)
        .then((res) => res.json())
        .then((data) => setFormData(data))
        .catch((err) => console.error("Customer error:", err));
    }
  }, [id, isNewCustomer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const url = isNewCustomer
      ? "http://daianapopa.pythonanywhere.com/api/customers/"
      : `http://daianapopa.pythonanywhere.com/api/customers/${id}/`;

    const method = isNewCustomer ? "POST" : "PUT";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    navigate("/customers");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this customer?")) return;

    await fetch(`http://daianapopa.pythonanywhere.com/api/customers/${id}/`, {
      method: "DELETE",
    });

    navigate("/customers");
  };

  return (
    <div>
      <div className="form-header">
        <h2>{isNewCustomer ? "New Customer" : "Customer Details"}</h2>
      </div>

      <form className="product-form" onSubmit={handleSave}>
        <div className="form-actions">
          {!isEditing && (
            <>
              <button type="button" onClick={() => navigate("/customers")}>
                Back
              </button>

              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button type="submit" className="save-btn">
                Save
              </button>

              <button type="button" onClick={() => navigate("/customers")}>
                Cancel
              </button>
            </>
          )}

          {!isNewCustomer && isEditing && (
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>

        <h3 className="section-title">Customer Information</h3>

        <div className="form-row">
          <label>Company Name *</label>
          <input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            disabled={!isEditing}
            required
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-row">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-row textarea-small">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </form>
    </div>
  );
}

export default CustomerDetail;