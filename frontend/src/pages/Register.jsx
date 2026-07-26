import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://daianapopa.pythonanywhere.com/api/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert("Registration failed");
        return;
      }

      alert("User created successfully");

      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Register</h1>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          {/* <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="user">
              User
            </option>

            <option value="admin">
              Admin
            </option>
          </select> */}

          <button type="submit">
            Register
          </button>

            <p className="auth-link">
            Already have an account?{" "}
            <Link to="/login">
                Login
            </Link>
            </p>

        </form>

      </div>
    </div>
  );
}

export default Register;