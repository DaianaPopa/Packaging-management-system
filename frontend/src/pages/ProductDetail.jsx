import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isNewProduct = id === "new";
  const editMode = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(isNewProduct || editMode);
  const [customers, setCustomers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempFileId, setTempFileId] = useState(null);

  const [formData, setFormData] = useState({
    productCode: "",
    dateSetUp: new Date().toISOString().split("T")[0],
    customer: "",
    productDescription: "",
    productNotes: "",
    suspendRecord: "N",
    palletisationStatistics: "",
    transaction: "",
    issue: "",
    issueDate: "",
    packingProcess: [],
    components: [],
    packings: Array(6).fill(""),
  });

  // Load customers
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/customers/")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  // Load existing product
  useEffect(() => {
    if (isNewProduct) return;

    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((res) => res.json())
      .then((product) => {
        setFormData((prev) => ({
          ...prev,
          productCode: product.sku || "",
          customer: product.customer || "",
          productDescription: product.name || "",
          productNotes: product.description || "",
          transaction: product.transaction || "",
          palletisationStatistics: product.pallet_configuration || "",
          issue: product.issue || "",
          issueDate: product.issue_date || "",
          dateSetUp: product.date_set_up || "",

          // ⭐ Correct field name from serializer
          packingProcess: product.packing_process || [],

          components: product.components || [],
        }));
      });
  }, [id, isNewProduct]);

  // Handle file upload + auto-fill
  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;

    const file = e.target.files[0];
    setSelectedFile(file);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const autoFillResponse = await fetch(
        "http://127.0.0.1:8000/api/uploadedfiles/upload-temp/",
        {
          method: "POST",
          body: uploadData,
        }
      );

      if (!autoFillResponse.ok) {
        alert("Error uploading file. Please try again.");
        return;
      }

      const { temp_file_id, extracted } = await autoFillResponse.json();
      setTempFileId(temp_file_id);

      // Auto-fill form with extracted data
      setFormData((prev) => ({
        ...prev,
        productCode: extracted.sku || "",
        productDescription: extracted.name || "",
        palletisationStatistics: extracted.units_per_outer || "",
        transaction: extracted.transaction || "",
        components: extracted.components || [],
        packingProcess: extracted.steps || [],
      }));
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error uploading file. Please check the console for details.");
    }
  };

  // Save product (multipart/form-data)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!tempFileId) {
      alert("Please attach a file first.");
      return;
    }

    const fd = new FormData();

    fd.append("customer", formData.customer);
    fd.append("sku", formData.productCode);
    fd.append("name", formData.productDescription);
    fd.append("description", formData.productNotes);
    fd.append("transaction", formData.transaction);
    fd.append("pallet_configuration", formData.palletisationStatistics);
    fd.append("date_set_up", formData.dateSetUp);
    fd.append("issue", formData.issue);
    fd.append("issue_date", formData.issueDate);

    fd.append("temp_file_id", tempFileId);

    // ⭐ MUST be JSON strings
    fd.append("components", JSON.stringify(formData.components));
    fd.append("steps", JSON.stringify(formData.packingProcess));

    const response = await fetch(
      "http://127.0.0.1:8000/api/products/create-with-file/",
      {
        method: "POST",
        body: fd, // ⭐ No headers
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Save error:", errorText);
      alert("Error saving product.");
      return;
    }

    alert("Product saved successfully!");
    navigate("/products");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
      method: "DELETE",
    });

    navigate("/products");
  };

  return (
    <div>
      <div className="form-header">
        <h2>
          {isNewProduct ? "Products: New Item" : "Products: Product Details"}
        </h2>
      </div>

      <form className="product-form" onSubmit={handleSave}>
        <div className="form-actions">
          {!isEditing && (
            <>
              <button type="button" onClick={() => navigate("/products")}>
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

              <button type="button" onClick={() => navigate("/products")}>
                Cancel
              </button>
            </>
          )}

          {!isNewProduct && isEditing && (
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>

        {isEditing && (
          <div className="attach-row">
            <input
              id="productFile"
              type="file"
              hidden
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={() => document.getElementById("productFile").click()}
            >
              Attach File
            </button>

            {selectedFile && (
              <p className="attached-file">📄 {selectedFile.name}</p>
            )}
          </div>
        )}

        <h3 className="section-title">Product Information</h3>

        <div className="form-row">
          <label>Product Code *</label>
          <input
            name="productCode"
            value={formData.productCode}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, productCode: e.target.value }))
            }
            disabled={!isEditing}
            required
          />
        </div>

        <div className="form-row">
          <label>Date Set Up *</label>
          <input
            type="date"
            name="dateSetUp"
            value={formData.dateSetUp}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dateSetUp: e.target.value }))
            }
            disabled={!isEditing}
          />
        </div>

        <div className="form-row">
          <label>Customer *</label>
          <select
            name="customer"
            value={formData.customer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customer: e.target.value }))
            }
            disabled={!isEditing}
            required
          >
            <option value="">Select Customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.company_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Product Description *</label>
          <input
            name="productDescription"
            value={formData.productDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                productDescription: e.target.value,
              }))
            }
            disabled={!isEditing}
            required
          />
        </div>

        <div className="form-row textarea-large">
          <label>Product Notes</label>
          <textarea
            name="productNotes"
            value={formData.productNotes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                productNotes: e.target.value,
              }))
            }
            disabled={!isEditing}
          />
        </div>

        <h3 className="section-title">Packing Process / Job Description</h3>

        {formData.packingProcess.map((step, index) => (
          <div className="form-row" key={`packing-process-${index}`}>
            <label>Step {step.step_number || index + 1}</label>
            <input
              value={step.instruction || ""}
              disabled={!isEditing}
              onChange={(e) => {
                const updated = [...formData.packingProcess];
                updated[index] = {
                  ...updated[index],
                  instruction: e.target.value,
                };
                setFormData((prev) => ({
                  ...prev,
                  packingProcess: updated,
                }));
              }}
            />
          </div>
        ))}

        <h3 className="section-title">Components</h3>

        {formData.components.map((component, index) => (
          <div className="form-row" key={`component-${index}`}>
            <label>Component {index + 1}</label>

            <div className="component-grid">
              <input
                placeholder="SKU"
                value={component.component_sku || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index] = {
                    ...updated[index],
                    component_sku: e.target.value,
                  };
                  setFormData((prev) => ({ ...prev, components: updated }));
                }}
              />

              <input
                placeholder="Supplier"
                value={component.supplier || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index] = {
                    ...updated[index],
                    supplier: e.target.value,
                  };
                  setFormData((prev) => ({ ...prev, components: updated }));
                }}
              />

              <input
                placeholder="Units per Piece"
                value={component.units_per_piece || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index] = {
                    ...updated[index],
                    units_per_piece: e.target.value,
                  };
                  setFormData((prev) => ({ ...prev, components: updated }));
                }}
              />

              <input
                placeholder="Units per Outer"
                value={component.units_per_outer || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index] = {
                    ...updated[index],
                    units_per_outer: e.target.value,
                  };
                  setFormData((prev) => ({ ...prev, components: updated }));
                }}
              />
            </div>
          </div>
        ))}

        <h3 className="section-title">Packing Fields</h3>

        {formData.packings.map((packing, index) => (
          <div className="form-row" key={`packing-${index}`}>
            <label>Packing {index + 1}</label>
            <input
              value={packing}
              disabled={!isEditing}
              onChange={(e) => {
                const updated = [...formData.packings];
                updated[index] = e.target.value;
                setFormData((prev) => ({ ...prev, packings: updated }));
              }}
            />
          </div>
        ))}
      </form>
    </div>
  );
}

export default ProductDetail;
