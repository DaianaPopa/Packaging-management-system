import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Settings,
  LogOut,
} from "lucide-react";

function Header() {
  const [openMenu, setOpenMenu] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    setOpenMenu(false);

    navigate("/login");
  };

  const handleSettings = () => {
    setOpenMenu(false);
    navigate("/settings");
  };

  return (
    <header className="header">

      <div className="logo-section">
        <h1>
          <span className="logo-red">DEKA</span>
          <span className="logo-blue">PAK</span>
        </h1>

        <span className="system-name">
          Packaging System
        </span>
      </div>

      <div className="header-right">

        <div className="profile-wrapper">

          <button
            className="profile-btn"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <div className="avatar">
              {localStorage.getItem("username") || "Account"}
            </div>
          </button>

          {openMenu && (
            <div className="profile-dropdown">

              <button
                className="dropdown-item"
                onClick={handleSettings}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Header;