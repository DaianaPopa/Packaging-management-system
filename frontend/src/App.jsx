import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Reports from "./pages/Reports";
import JobProcessing from "./pages/JobProcessing";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/jobprocessing" element={<JobProcessing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;