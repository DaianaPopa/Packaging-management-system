import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

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
import Settings from "./pages/Settings";

function App() {
  return (
    <Layout>
      <Routes>

        {/* Products */}
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />

        {/* Job Processing */}
        <Route path="/jobprocessing" element={<JobProcessing />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings/>} />

        {/* Report Editors */}
        <Route path="/worksheet" element={<WorksheetEditor />} />
        <Route path="/traceability" element={<TraceabilityEditor />} />
        <Route path="/reject-report" element={<RejectReportEditor />} />
        <Route path="/date-coding" element={<ChecksheetEditor />} />
        <Route path="/stocktake" element={<StocktakeEditor />} />

      </Routes>
    </Layout>
  );
}

export default App;