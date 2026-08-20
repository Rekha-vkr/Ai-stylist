import { useState } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";

function App() {
  const [showPassword, setShowPassword] = useState(false);

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


      {/* RIGHT — LOGIN */}
      <section className="login-side">

        <div className="login-card">

          {/* Profile */}
          <div className="profile-icon">
            👒
          </div>

          <h1>
            Welcome Back <span>♡</span>
          </h1>

          <p className="subtitle">
            Sign in to your AI Stylist
          </p>


          <form onSubmit={handleLogin}>

            {/* Username */}
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


            {/* Password */}
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


            {/* Options */}
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


            {/* Login */}
            <button
              type="submit"
              className="login-button"
            >
              👗 &nbsp; Login &nbsp; →
            </button>

          </form>


          {/* Divider */}
          <div className="divider">
            <span></span>
            <p>Or</p>
            <span></span>
          </div>


          {/* Social */}
          <div className="social-buttons">

            <button type="button">
              G
            </button>

            <button type="button">
              f
            </button>

            <button type="button">
              
            </button>

          </div>


          {/* Signup */}
          <p className="signup-text">
            New to AI Stylist?
            <button
              type="button"
              onClick={() =>
                alert("Create Account coming soon ✨")
              }
            >
              Create Account →
            </button>
          </p>

        </div>

      </section>

    </div>
  );
}

export default App;