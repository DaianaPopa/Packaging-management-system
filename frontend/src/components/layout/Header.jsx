import { useState } from "react";
import {
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

function Header() {
  const [openMenu, setOpenMenu] = useState(false);

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
            <div className="avatar">Account</div>
          </button>

          {openMenu && (
            <div className="profile-dropdown">

              <button className="dropdown-item">
                <Settings size={18} />
                Settings
              </button>

              <button className="dropdown-item logout">
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