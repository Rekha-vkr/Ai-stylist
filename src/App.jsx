import { useState } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";

function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username || !password) {
      alert("Please enter your username and password.");
      return;
    }

    alert(`Welcome to AI Stylist, ${username} ✨`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!registerName || !registerEmail || !registerPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully! ✨");

        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please make sure FastAPI is running."
      );
    }
  };

  return (
    <div className="page">

      {/* LEFT — FASHION IMAGE */}
      <section className="fashion-side">
        <div className="fashion-image-wrapper">
          <img
            src={fashionImage}
            alt="AI Fashion Stylist"
            className="fashion-image"
          />
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="login-side">

        <div className="login-card">

          <div className="profile-icon">
            👒
          </div>

          {!isRegistering ? (
            <>
              {/* LOGIN */}

              <h1>
                Welcome Back <span>♡</span>
              </h1>

              <p className="subtitle">
                Sign in to your AI Stylist
              </p>

              <form onSubmit={handleLogin}>

                <div className="input-group">
                  <span className="input-icon">
                    ♙
                  </span>

                  <input
                    type="text"
                    name="username"
                    placeholder="Email or Username"
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "🙈" : "◉"}
                  </button>
                </div>

                <div className="options">

                  <label className="remember">
                    <input type="checkbox" />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    className="forgot"
                    onClick={() =>
                      alert("Password recovery coming soon ✨")
                    }
                  >
                    Forgot Password?
                  </button>

                </div>

                <button
                  type="submit"
                  className="login-button"
                >
                  👗 &nbsp; Login &nbsp; →
                </button>

              </form>

              <div className="divider">
                <span></span>
                <p>Or</p>
                <span></span>
              </div>

              <div className="social-buttons">
                <button type="button">G</button>
                <button type="button">f</button>
                <button type="button"></button>
              </div>

              <p className="signup-text">
                New to AI Stylist?

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setMessage("");
                  }}
                >
                  Create Account →
                </button>
              </p>
            </>
          ) : (
            <>
              {/* REGISTRATION */}

              <h1>
                Create Account <span>♡</span>
              </h1>

              <p className="subtitle">
                Join your AI Stylist journey
              </p>

              <form onSubmit={handleRegister}>

                {/* NAME */}
                <div className="input-group">
                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={registerName}
                    onChange={(e) =>
                      setRegisterName(e.target.value)
                    }
                  />
                </div>

                {/* EMAIL */}
                <div className="input-group">
                  <span className="input-icon">
                    ✉️
                  </span>

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={registerEmail}
                    onChange={(e) =>
                      setRegisterEmail(e.target.value)
                    }
                  />
                </div>

                {/* PASSWORD */}
                <div className="input-group">
                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) =>
                      setRegisterPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "🙈" : "◉"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="login-button"
                >
                  ✨ &nbsp; Create Account &nbsp; →
                </button>

                {message && (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "15px",
                    }}
                  >
                    {message}
                  </p>
                )}

              </form>

              <p className="signup-text">
                Already have an account?

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setMessage("");
                  }}
                >
                  ← Back to Login
                </button>
              </p>
            </>
          )}

        </div>

      </section>

    </div>
  );
}

export default App;