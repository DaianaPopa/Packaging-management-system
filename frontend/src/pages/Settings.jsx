import { useEffect, useState } from "react";

const API_URL =
    "https://daianapopa.pythonanywhere.com";

function Settings() {

    // =====================================================
    // CURRENT USER SETTINGS
    // =====================================================

    const [settings, setSettings] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);


    // =====================================================
    // ADMIN USER MANAGEMENT
    // =====================================================

    const [users, setUsers] =
        useState([]);

    const [loadingUsers, setLoadingUsers] =
        useState(false);

    const [changingRole, setChangingRole] =
        useState(null);

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [activity, setActivity] =
        useState([]);

    const [loadingActivity, setLoadingActivity] =
        useState(false);


    // =====================================================
    // LOAD SETTINGS
    // =====================================================

    useEffect(() => {

        loadSettings();

    }, []);


    // =====================================================
    // LOAD CURRENT USER
    // =====================================================

    async function loadSettings() {

        const token =
            localStorage.getItem("access");

        if (!token) {

            window.location.href =
                "/login";

            return;
        }

        try {

            const response =
                await fetch(
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

                username:
                    data.username || "",

                fullName:
                    data.fullName || "",

                email:
                    data.email || "",

                role:
                    data.role || "",

                currentPassword:
                    "",

                newPassword:
                    "",

                confirmPassword:
                    "",
            });

            // Load users only if current user is admin
            if (data.role === "admin") {

                loadUsers();
            }

        } catch (error) {

            console.error(error);

            alert(
                "Failed to load settings."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // LOAD ALL USERS
    // =====================================================

    async function loadUsers() {

        const token =
            localStorage.getItem("access");

        if (!token) {
            return;
        }

        setLoadingUsers(true);

        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/users/`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load users."
                );
            }

            setUsers(data);

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to load users."
            );

        } finally {

            setLoadingUsers(false);
        }
    }


    // =====================================================
    // CHANGE INPUT
    // =====================================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;

        setSettings(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    }


    // =====================================================
    // SAVE PROFILE SETTINGS
    // =====================================================

    async function handleSave() {

        const token =
            localStorage.getItem("access");

        setSaving(true);

        try {

            const response =
                await fetch(
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


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

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

            const response =
                await fetch(
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

            setSettings(
                (previous) => ({
                    ...previous,

                    currentPassword: "",

                    newPassword: "",

                    confirmPassword: "",
                })
            );

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


    // =====================================================
    // CHANGE USER ROLE
    // =====================================================

    async function handleRoleChange(
        userId,
        newRole
    ) {

        const token =
            localStorage.getItem("access");

        setChangingRole(userId);

        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/users/${userId}/role/`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            role: newRole,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to change user role."
                );
            }

            // Update the user immediately
            setUsers(
                (previousUsers) =>
                    previousUsers.map(
                        (user) =>
                            user.id === userId
                                ? {
                                      ...user,
                                      role: newRole,
                                  }
                                : user
                    )
            );

            alert(
                data.message ||
                "User role updated successfully."
            );

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to change user role."
            );

            // Reload users in case something went wrong
            loadUsers();

        } finally {

            setChangingRole(null);
        }
    }


    // =====================================================
    // LOAD USER ACTIVITY
    // =====================================================

    async function loadActivity(user) {

        const token =
            localStorage.getItem("access");

        setSelectedUser(user);

        setLoadingActivity(true);

        setActivity([]);

        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/users/${user.id}/activity/`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load activity."
                );
            }

            setActivity(
                data.activities || []
            );

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to load user activity."
            );

        } finally {

            setLoadingActivity(false);
        }
    }


    // =====================================================
    // CLOSE ACTIVITY
    // =====================================================

    function closeActivity() {

        setSelectedUser(null);

        setActivity([]);
    }


    // =====================================================
    // RESET
    // =====================================================

    function handleReset() {

        loadSettings();
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="settings-page">

                <h2>
                    Loading settings...
                </h2>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="settings-page">

            <h1 className="settings-title">
                Settings
            </h1>


            {/* =================================================
                USER PROFILE
            ================================================= */}

            <div className="settings-card">

                <h2>
                    👤 User Profile
                </h2>

                <div className="settings-grid">

                    {/* USERNAME */}

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


                    {/* FULL NAME */}

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


                    {/* EMAIL */}

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


                    {/* ROLE */}

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


            {/* =================================================
                PASSWORD
            ================================================= */}

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


            {/* =================================================
                ADMIN USER MANAGEMENT
            ================================================= */}

            {settings.role === "admin" && (

                <div className="settings-card">

                    <h2>
                        👥 User Management
                    </h2>

                    <p>
                        Manage users and their
                        access roles.
                    </p>


                    {loadingUsers ? (

                        <p>
                            Loading users...
                        </p>

                    ) : users.length === 0 ? (

                        <p>
                            No users found.
                        </p>

                    ) : (

                        <div className="user-management-table">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Username
                                        </th>

                                        <th>
                                            Full Name
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Last Activity
                                        </th>

                                        <th>
                                            Activity
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {users.map(
                                        (user) => (

                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        user.username
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.fullName ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        user.email ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <select
                                                        value={
                                                            user.role
                                                        }
                                                        onChange={
                                                            (e) =>
                                                                handleRoleChange(
                                                                    user.id,
                                                                    e.target.value
                                                                )
                                                        }
                                                        disabled={
                                                            changingRole ===
                                                            user.id
                                                        }
                                                    >

                                                        <option value="user">
                                                            User
                                                        </option>

                                                        <option value="admin">
                                                            Admin
                                                        </option>

                                                    </select>

                                                </td>

                                                <td>

                                                    {user.last_activity
                                                        ? new Date(
                                                              user.last_activity
                                                          ).toLocaleString()
                                                        : "No activity"}

                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="save-settings-btn"
                                                        onClick={() =>
                                                            loadActivity(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        View Activity
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}


            {/* =================================================
                ACTIVITY
            ================================================= */}

            {settings.role === "admin" &&
                selectedUser && (

                    <div className="settings-card">

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                            }}
                        >

                            <h2>
                                📋 Activity -
                                {" "}
                                {
                                    selectedUser.username
                                }
                            </h2>

                            <button
                                type="button"
                                className="cancel-settings-btn"
                                onClick={
                                    closeActivity
                                }
                            >
                                Close
                            </button>

                        </div>


                        {loadingActivity ? (

                            <p>
                                Loading activity...
                            </p>

                        ) : activity.length === 0 ? (

                            <p>
                                No activity recorded
                                for this user.
                            </p>

                        ) : (

                            <div className="user-activity-list">

                                {activity.map(
                                    (item) => (

                                        <div
                                            className="activity-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        item.action
                                                    }
                                                </strong>

                                                <p>
                                                    {
                                                        item.description
                                                    }
                                                </p>

                                            </div>

                                            <span>

                                                {new Date(
                                                    item.created_at
                                                ).toLocaleString()}

                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                )}


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="settings-actions">

                <button
                    className="save-settings-btn"
                    onClick={
                        handleSave
                    }
                    disabled={
                        saving
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>


                <button
                    className="cancel-settings-btn"
                    onClick={
                        handleReset
                    }
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