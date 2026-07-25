import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import AdminRoute from "./components/layout/AdminRoute";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Reports
import WorksheetEditor from "./components/reports/WorksheetEditor";
import TraceabilityEditor from "./components/reports/TraceabilityEditor";
import RejectReportEditor from "./components/reports/RejectReportEditor";
import ChecksheetEditor from "./components/reports/ChecksheetEditor";
import StocktakeEditor from "./components/reports/StocktakeEditor";

// Pages
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Reports from "./pages/Reports";
import JobProcessing from "./pages/JobProcessing";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>

                <Route
                  path="/"
                  element={<Products />}
                />

                <Route
                  path="/products"
                  element={<Products />}
                />

                <Route
                  path="/products/:id"
                  element={<ProductDetail />}
                />

                <Route
                  path="/customers"
                  element={<Customers />}
                />

                <Route
                  path="/customers/:id"
                  element={<CustomerDetail />}
                />

                <Route
                  path="/reports"
                  element={
                    <AdminRoute>
                      <Reports />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/jobprocessing"
                  element={<JobProcessing />}
                />

                <Route
                  path="/settings"
                  element={<Settings />}
                />

                <Route
                  path="/worksheet"
                  element={<WorksheetEditor />}
                />

                <Route
                  path="/traceability"
                  element={<TraceabilityEditor />}
                />

                <Route
                  path="/reject-report"
                  element={<RejectReportEditor />}
                />

                <Route
                  path="/date-coding"
                  element={<ChecksheetEditor />}
                />

                <Route
                  path="/stocktake"
                  element={<StocktakeEditor />}
                />

              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;