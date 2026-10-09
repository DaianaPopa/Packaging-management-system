import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/api";

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
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    productCode: "",
    dateSetUp: new Date().toISOString().split("T")[0],
    customer: "",
    productDescription: "",
    productNotes: "",
    innerBarcode: "",
    outerBarcode: "",
    suspendRecord: false,
    palletisationStatistics: "",
    transaction: "",
    issue: "",
    issueDate: "",
    packingProcess: [],
    components: [],
    packings: [],
  });

  // Load customers
  useEffect(() => {
    fetch(`${API_BASE_URL}/customers/`)
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  // Load existing product
  useEffect(() => {
    if (isNewProduct) return;

    fetch(`${API_BASE_URL}/products/${id}/`)
      .then((res) => res.json())
      .then((product) => {
        setFormData((prev) => ({
          ...prev,
          productCode: product.sku || "",
          customer: product.customer || "",
          productDescription: product.name || "",
          productNotes: product.description || "",
          innerBarcode: product.inner_barcode || "",
          outerBarcode: product.outer_barcode || "",
          transaction: product.transaction || "",
          palletisationStatistics: product.pallet_configuration || "",
          issue: product.issue || "",
          issueDate: product.issue_date || "",
          dateSetUp: product.date_set_up || "",
          suspendRecord: Boolean(product.suspend_record),

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
        `${API_BASE_URL}/uploadedfiles/upload-temp/`,
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
        innerBarcode: extracted.inner_barcode || "",
        outerBarcode: extracted.outer_barcode || "",
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
    setSaveError("");

    const productPayload = {
      customer: formData.customer,
      sku: formData.productCode,
      name: formData.productDescription,
      description: formData.productNotes,
      transaction: formData.transaction,
      pallet_configuration: formData.palletisationStatistics,
      date_set_up: formData.dateSetUp,
      issue: formData.issue,
      issue_date: formData.issueDate || null,
      suspend_record: Boolean(formData.suspendRecord),
      inner_barcode: formData.innerBarcode || "",
      outer_barcode: formData.outerBarcode || "",
      components: formData.components.map(({ id, ...component }) => component),
      packing_process: formData.packingProcess.map(({ id, ...step }) => step),
    };

    try {
      let response;

      if (isNewProduct) {
        const formDataPayload = new FormData();
        Object.entries(productPayload).forEach(([key, value]) => {
          if (key !== "components" && key !== "packing_process") {
            formDataPayload.append(key, value ?? "");
          }
        });
        formDataPayload.append("components", JSON.stringify(productPayload.components));
        formDataPayload.append("steps", JSON.stringify(productPayload.packing_process));
        if (tempFileId) {
          formDataPayload.append("temp_file_id", tempFileId);
        }

        response = await fetch(`${API_BASE_URL}/products/create-with-file/`, {
          method: "POST",
          body: formDataPayload,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/products/${id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        const details = Object.entries(result)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
          .join("; ");
        throw new Error(details || "The product could not be saved.");
      }

      alert("Product saved successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.message || "Error saving product.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`${API_BASE_URL}/products/${id}/`, {
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
        {saveError && <p className="form-error" role="alert">{saveError}</p>}

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

        <div className="form-row">
          <label>Pallet configuration</label>
          <input
            name="palletConfiguration"
            value={formData.palletisationStatistics}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, palletisationStatistics: e.target.value }))
            }
            disabled={!isEditing}
          />
        </div>

        <div className="form-row">
        <label>Suspend Record</label>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={!formData.suspendRecord}
              disabled={!isEditing}
              onChange={() =>
                setFormData(prev => ({
                  ...prev,
                  suspendRecord: false,
                }))
              }
            />
            No
          </label>

          <label>
            <input
              type="radio"
              checked={formData.suspendRecord}
              disabled={!isEditing}
              onChange={() =>
                setFormData(prev => ({
                  ...prev,
                  suspendRecord: true,
                }))
              }
            />
            Yes
          </label>
        </div>
      </div>

      <div className="form-row">
        <label>Transaction</label>

        <select
            value={formData.transaction}
            disabled={!isEditing}
            onChange={(e)=>
                setFormData(prev=>({
                    ...prev,
                    transaction:e.target.value
                }))
            }
        >
            <option value="">Select Transaction</option>

            <option value="machine">Machine Packed</option>
            <option value="hand">Hand Packed</option>
            <option value="mixed">Machine + Hand Packed</option>
            <option value="other">Other</option>
        </select>
      </div>

      <div className="form-row">
        <label>Issue</label>

        <input
          value={formData.issue}
          disabled={!isEditing}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              issue: e.target.value,
            }))
          }
        />
      </div>

      <div className="form-row">
        <label>Issue Date</label>

        <input
          type="date"
          value={formData.issueDate}
          disabled={!isEditing}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              issueDate: e.target.value,
            }))
          }
        />
      </div>

        <h3 className="section-title">Job Description</h3>

        {formData.packingProcess.map((step, index) => (
          <div className="form-row" key={`step-${index}`}>
            <label>Job Description {index + 1}</label>

            <textarea
              rows="3"
              value={step.instruction || ""}
              disabled={!isEditing}
              onChange={(e) => {
                const updated = [...formData.packingProcess];
                updated[index].instruction = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  packingProcess: updated,
                }));
              }}
            />

            {isEditing && (
              <button
                type="button"
                className="delete-btn-small"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    packingProcess: prev.packingProcess.filter(
                      (_, i) => i !== index
                    ),
                  }));
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <button
            type="button"
            className="add-btn"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                packingProcess: [
                  ...prev.packingProcess,
                  {
                    step_number: prev.packingProcess.length + 1,
                    instruction: "",
                  },
                ],
              }))
            }
          >
            + Add Job Description
          </button>
        )}

        <h3 className="section-title">Components</h3>

        {formData.components.map((component, index) => (
          <div className="component-card" key={index}>
            <h4>Component {index + 1}</h4>

            <div className="component-grid">
              <input
                placeholder="SKU"
                value={component.component_sku || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index].component_sku = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    components: updated,
                  }));
                }}
              />

              <input
                placeholder="Component Name"
                value={component.component_name || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index].component_name = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    components: updated,
                  }));
                }}
              />

              <input
                placeholder="Supplier"
                value={component.supplier || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index].supplier = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    components: updated,
                  }));
                }}
              />

              <input
                placeholder="Units per Piece"
                value={component.units_per_piece || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index].units_per_piece = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    components: updated,
                  }));
                }}
              />

              <input
                placeholder="Units per Outer"
                value={component.units_per_outer || ""}
                disabled={!isEditing}
                onChange={(e) => {
                  const updated = [...formData.components];
                  updated[index].units_per_outer = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    components: updated,
                  }));
                }}
              />
            </div>

            {isEditing && (
              <button
                type="button"
                className="delete-btn-small"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    components: prev.components.filter((_, i) => i !== index),
                  }))
                }
              >
                Delete Component
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <button
            type="button"
            className="add-btn"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                components: [
                  ...prev.components,
                  {
                    component_sku: "",
                    component_name: "",
                    supplier: "",
                    units_per_piece: "",
                    units_per_outer: "",
                  },
                ],
              }))
            }
          >
            + Add Component
          </button>
        )}

        <h3 className="section-title">Packing Fields</h3>

        {formData.packings.map((packing, index) => (
          <div className="form-row" key={index}>
            <label>Packing {index + 1}</label>

            <input
              value={packing}
              disabled={!isEditing}
              onChange={(e) => {
                const updated = [...formData.packings];
                updated[index] = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  packings: updated,
                }));
              }}
            />

            {isEditing && (
              <button
                type="button"
                className="delete-btn-small"
                onClick={() => {
                  const updated = formData.packings.filter((_, i) => i !== index);

                  setFormData((prev) => ({
                    ...prev,
                    packings: updated,
                  }));
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <button
            type="button"
            className="add-btn"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                packings: [...prev.packings, ""],
              }))
            }
          >
            + Add Packing
          </button>
        )}
            {/* />
          </div>
        ))} */}
      </form>
    </div>
  );
}

export default ProductDetail;
