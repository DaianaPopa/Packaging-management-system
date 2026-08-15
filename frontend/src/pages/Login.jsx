import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL =
    "https://daianapopa.pythonanywhere.com";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleLogin(e) {

        e.preventDefault();

        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/login/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.detail ||
                    "Invalid username or password."
                );

                return;
            }

            // Save JWT tokens
            localStorage.setItem(
                "access",
                data.access
            );

            localStorage.setItem(
                "refresh",
                data.refresh
            );

            // Get current user
            const meResponse =
                await fetch(
                    `${API_URL}/api/me/`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${data.access}`,
                        },
                    }
                );

            if (!meResponse.ok) {

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                throw new Error(
                    "Could not load user."
                );
            }

            const user =
                await meResponse.json();

            localStorage.setItem(
                "username",
                user.username
            );

            localStorage.setItem(
                "role",
                user.role
            );

            localStorage.setItem(
                "fullName",
                user.fullName || ""
            );

            localStorage.setItem(
                "email",
                user.email || ""
            );

            navigate("/");

        } catch (error) {

            console.error(error);

            alert(
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Login</h1>

                <form onSubmit={handleLogin}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                    <p className="auth-link">
                        Don't have an account?{" "}

                        <Link to="/register">
                            Register
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}

export default Login;