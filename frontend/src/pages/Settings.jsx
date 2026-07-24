import { useState } from "react";

function Settings() {
    const [settings, setSettings] = useState({

        companyName: "",
        companyEmail: "",
        phone: "",
        address: "",

        username: "admin",
        fullName: "",
        email: "",

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",

        theme: "light",

    });

    const handleChange = (e) => {

        setSettings({

            ...settings,

            [e.target.name]: e.target.value,

        });

    };

    const handleSave = () => {

        console.log(settings);

        alert("Settings saved successfully");

    };

    return (

        <div className="settings-page">
            <h1 className="settings-title">
                Settings
            </h1>

            {/* COMPANY INFORMATION */}
            <div className="settings-card">
                <h2>
                    🏢 Company Information
                </h2>
                <div className="settings-grid">
                    <div className="form-group">
                        <label>
                            Company Name
                        </label>
                        <input
                            name="companyName"
                            value={settings.companyName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Company Email
                        </label>
                        <input
                            type="email"
                            name="companyEmail"
                            value={settings.companyEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Phone Number
                        </label>
                        <input
                            name="phone"
                            value={settings.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>
                            Address
                        </label>
                        <textarea
                            name="address"
                            rows="4"
                            value={settings.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* USER PROFILE */}
            <div className="settings-card">
                <h2>
                    👤 User Profile
                </h2>
                <div className="settings-grid">
                    <div className="form-group">
                        <label>
                            Username
                        </label>
                        <input
                            name="username"
                            value={settings.username}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Full Name
                        </label>
                        <input
                            name="fullName"
                            value={settings.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Role
                        </label>
                        <input
                            value="Administrator"
                            disabled
                        />
                    </div>
                </div>
            </div>

            {/* PASSWORD */}
            <div className="settings-card">
                <h2>
                    🔒 Change Password
                </h2>
                <div className="settings-grid">
                    <div className="form-group">
                        <label>
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={settings.currentPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={settings.newPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={settings.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* APPEARANCE */}
            <div className="settings-card">
                <h2>
                    🎨 Appearance
                </h2>
                <div className="theme-options">
                    <label>
                        <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={
                                settings.theme === "light"
                            }
                            onChange={handleChange}
                        />Light
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={
                                settings.theme === "dark"
                            }
                            onChange={handleChange}
                        />Dark
                    </label>
                </div>
            </div>

            <div className="settings-actions">
                <button
                    className="save-settings-btn"
                    onClick={handleSave}
                >Save Changes
                </button>

                <button
                    className="cancel-settings-btn"
                >Cancel
                </button>
            </div>
        </div>
    );
}
export default Settings;