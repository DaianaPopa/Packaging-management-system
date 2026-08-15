import { useEffect, useState } from "react";

const API_URL =
    "https://daianapopa.pythonanywhere.com";

function Settings() {

    const [settings, setSettings] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] =
        useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {

        const token =
            localStorage.getItem("access");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/me/`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load user"
                );
            }

            const data =
                await response.json();

            setSettings({
                username: data.username || "",
                fullName: data.fullName || "",
                email: data.email || "",
                role: data.role || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (error) {

            console.error(error);

            alert(
                "Failed to load settings."
            );

        } finally {

            setLoading(false);

        }
    }

    function handleChange(e) {

        const { name, value } = e.target;

        setSettings((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSave() {

        const token =
            localStorage.getItem("access");

        setSaving(true);

        try {

            const response = await fetch(
                `${API_URL}/api/settings/save/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        fullName:
                            settings.fullName,

                        email:
                            settings.email,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to save settings"
                );
            }

            alert(
                data.message ||
                "Settings saved successfully."
            );

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to save settings."
            );

        } finally {

            setSaving(false);

        }
    }

    async function handleChangePassword() {

        if (
            !settings.currentPassword ||
            !settings.newPassword ||
            !settings.confirmPassword
        ) {

            alert(
                "Please fill in all password fields."
            );

            return;
        }

        if (
            settings.newPassword !==
            settings.confirmPassword
        ) {

            alert(
                "New passwords do not match."
            );

            return;
        }

        const token =
            localStorage.getItem("access");

        setChangingPassword(true);

        try {

            const response = await fetch(
                `${API_URL}/api/settings/change-password/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        currentPassword:
                            settings.currentPassword,

                        newPassword:
                            settings.newPassword,

                        confirmPassword:
                            settings.confirmPassword,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                const error =
                    Array.isArray(data.error)
                        ? data.error.join(" ")
                        : data.error ||
                          "Failed to change password.";

                throw new Error(error);
            }

            alert(
                data.message ||
                "Password changed successfully."
            );

            setSettings((previous) => ({
                ...previous,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to change password."
            );

        } finally {

            setChangingPassword(false);

        }
    }

    function handleReset() {
        loadSettings();
    }

    if (loading) {

        return (
            <div className="settings-page">
                <h2>
                    Loading settings...
                </h2>
            </div>
        );
    }

    return (

        <div className="settings-page">

            <h1 className="settings-title">
                Settings
            </h1>

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
                            type="text"
                            name="username"
                            value={
                                settings.username
                            }
                            disabled
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={
                                settings.fullName
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={
                                settings.email
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Role
                        </label>

                        <input
                            type="text"
                            value={
                                settings.role
                            }
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
                            value={
                                settings.currentPassword
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            New Password
                        </label>

                        <input
                            type="password"
                            name="newPassword"
                            value={
                                settings.newPassword
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={
                                settings.confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>

                </div>

                <button
                    className="save-settings-btn"
                    onClick={
                        handleChangePassword
                    }
                    disabled={
                        changingPassword
                    }
                >
                    {changingPassword
                        ? "Changing..."
                        : "Change Password"}
                </button>

            </div>

            {/* BUTTONS */}

            <div className="settings-actions">

                <button
                    className="save-settings-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>

                <button
                    className="cancel-settings-btn"
                    onClick={handleReset}
                    disabled={
                        saving ||
                        changingPassword
                    }
                >
                    Reset
                </button>

            </div>

        </div>
    );
}

export default Settings;