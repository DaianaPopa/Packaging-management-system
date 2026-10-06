import { Package, FileText, Building2, Database } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {

  const role = localStorage.getItem("role");

  console.log("Current role:", role);

  return (
    <aside className="sidebar">

      <NavLink to="/" className="sidebar-link">
        <Package size={22} />
        <span>Products</span>
      </NavLink>

      <NavLink to="/customers" className="sidebar-link">
        <Building2 size={22} />
        <span>Customers</span>
      </NavLink>

      <NavLink to="/jobprocessing" className="sidebar-link">
        <FileText size={22} />
        <span>Job Processing</span>
      </NavLink>

      {role === "admin" && (
        <>
          <NavLink to="/dataAnalytics" className="sidebar-link">
            <Database size={22} />
            <span>Data Analytics</span>
          </NavLink>
        </>
      )}

    </aside>
  );
}

export default Sidebar;