import { Package, FileText, Building2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-link">
        <Package size={22} />
        <span>Products</span>
      </NavLink>

      <NavLink to="/reports" className="sidebar-link">
        <FileText size={22} />
        <span>Reports</span>
      </NavLink>

      <NavLink to="/customers" className="sidebar-link">
        <Building2 size={22} />
        <span>Customers</span>
      </NavLink>
    </aside>
  )
}

export default Sidebar