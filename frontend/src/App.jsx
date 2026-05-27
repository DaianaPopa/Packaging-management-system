import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </Layout>
  );
}

export default App;