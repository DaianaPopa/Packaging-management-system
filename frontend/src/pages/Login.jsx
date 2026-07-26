import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://daianapopa.pythonanywhere.com/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert("Invalid username or password");
        return;
      }

      localStorage.setItem(
        "access",
        data.access
      );

      localStorage.setItem(
        "refresh",
        data.refresh
      );

      const meResponse = await fetch(
        "https://daianapopa.pythonanywhere.com/api/me/",
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      if (!meResponse.ok) {
        alert("Failed to load user");
        return;
      }

      const user = await meResponse.json();

      localStorage.setItem(
        "role",
        user.role
      );

      localStorage.setItem(
        "username",
        user.username
      );

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

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
              setUsername(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button type="submit">
            Login
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