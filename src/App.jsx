import { useState } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";

function App() {
  // =========================
  // LOGIN / USER STATE
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [activePage, setActivePage] = useState("home");

  // =========================
  // LOGIN STATE
  // =========================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // =========================
  // PASSWORD VISIBILITY
  // =========================

  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // REGISTER STATE
  // =========================

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");

  // =====================================================
// LOGIN
// Connects React → FastAPI → MongoDB
// =====================================================

const handleLogin = async (e) => {
  e.preventDefault();

  if (!loginEmail || !loginPassword) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Login successful
      setIsLoggedIn(true);
      setActivePage("home");

      // Clear password
      setLoginPassword("");

      console.log("Login successful:", data);
    } else {
      alert(data.error || "Invalid email or password.");
    }
  } catch (error) {
    console.error("Login error:", error);

    alert(
      "Cannot connect to the server. Please make sure FastAPI is running."
    );
  }
};

  // =====================================================
  // REGISTER
  // This already connects to FastAPI + MongoDB
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!registerName || !registerEmail || !registerPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully! ✨");

        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");

        // Show login after registration
        setTimeout(() => {
          setIsRegistering(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please make sure FastAPI is running."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage("home");
    setLoginEmail("");
    setLoginPassword("");
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigateTo = (page) => {
    setActivePage(page);
  };

  // =====================================================
  // LOGIN / REGISTER SCREEN
  // =====================================================

  if (!isLoggedIn) {
    return (
      <div className="app-container">

        <div className="page">

          {/* =========================
              LEFT FASHION IMAGE
          ========================= */}

          <section className="fashion-side">

            <div className="fashion-image-wrapper">

              <img
                src={fashionImage}
                alt="AI Fashion Stylist"
                className="fashion-image"
              />

            </div>

          </section>


          {/* =========================
              RIGHT LOGIN SIDE
          ========================= */}

          <section className="login-side">

            <div className="login-card">

              <div className="profile-icon">
                👒
              </div>


              {/* =========================
                  LOGIN
              ========================= */}

              {!isRegistering ? (
                <>

                  <h1>
                    Welcome Back <span>♡</span>
                  </h1>

                  <p className="subtitle">
                    Sign in to your AI Stylist
                  </p>


                  <form onSubmit={handleLogin}>

                    {/* EMAIL */}

                    <div className="input-group">

                      <span className="input-icon">
                        ✉️
                      </span>

                      <input
                        type="email"
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) =>
                          setLoginEmail(e.target.value)
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
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) =>
                          setLoginPassword(e.target.value)
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


                    {/* OPTIONS */}

                    <div className="options">

                      <label className="remember">

                        <input type="checkbox" />

                        <span>
                          Remember Me
                        </span>

                      </label>


                      <button
                        type="button"
                        className="forgot"
                        onClick={() =>
                          alert(
                            "Password recovery coming soon ✨"
                          )
                        }
                      >
                        Forgot Password?
                      </button>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                      type="submit"
                      className="login-button"
                    >
                      👗 &nbsp; Login &nbsp; →
                    </button>

                  </form>


                  {/* DIVIDER */}

                  <div className="divider">

                    <span></span>

                    <p>Or</p>

                    <span></span>

                  </div>


                  {/* SOCIAL LOGIN */}

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


                  {/* REGISTER */}

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

                /* =========================
                   REGISTER
                ========================= */

                <>

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
                          showPassword
                            ? "text"
                            : "password"
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


                    {/* REGISTER BUTTON */}

                    <button
                      type="submit"
                      className="login-button"
                    >
                      ✨ &nbsp; Create Account &nbsp; →
                    </button>


                    {/* MESSAGE */}

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


                  {/* BACK TO LOGIN */}

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

      </div>
    );
  }


  // =====================================================
  // LOGGED-IN WEBSITE
  // =====================================================

  return (
    <div className="app-container">

      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="top-navigation">

        <div
          className="nav-logo"
          onClick={() => navigateTo("home")}
        >
          👗 AI Stylist
        </div>


        <div className="nav-links">

          <button
            className={
              activePage === "home"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("home")}
          >
            Home
          </button>


          <button
            className={
              activePage === "wardrobe"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("wardrobe")}
          >
            My Wardrobe
          </button>


          <button
            className={
              activePage === "recommendation"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("recommendation")}
          >
            AI Stylist
          </button>


          <button
            className={
              activePage === "thrift"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("thrift")}
          >
            Thrift
          </button>


          <button
            className={
              activePage === "about"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("about")}
          >
            About Us
          </button>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =================================================
          HOME
      ================================================= */}

      {activePage === "home" && (

        <div className="dashboard-page">

          <div className="dashboard-content">

            <p className="about-label">
              WELCOME TO AI STYLIST
            </p>

            <h1>
              Style Smarter.
              <br />
              <span>Wear What You Own.</span>
            </h1>

            <p className="about-intro">
              Your intelligent personal stylist for creating
              beautiful outfits from your existing wardrobe.
            </p>


            <div className="dashboard-cards">

              <div
                className="dashboard-card"
                onClick={() => navigateTo("wardrobe")}
              >
                <div className="dashboard-icon">
                  👚
                </div>

                <h2>
                  My Wardrobe
                </h2>

                <p>
                  Add and organize your clothes
                  digitally.
                </p>

                <button>
                  Open Wardrobe →
                </button>
              </div>


              <div
                className="dashboard-card"
                onClick={() =>
                  navigateTo("recommendation")
                }
              >
                <div className="dashboard-icon">
                  ✨
                </div>

                <h2>
                  Outfit Recommendation
                </h2>

                <p>
                  Get personalized outfit ideas
                  from your wardrobe.
                </p>

                <button>
                  Get Recommendations →
                </button>
              </div>


              <div
                className="dashboard-card"
                onClick={() =>
                  navigateTo("thrift")
                }
              >
                <div className="dashboard-icon">
                  ♻️
                </div>

                <h2>
                  Thrift
                </h2>

                <p>
                  Give unused clothes a second
                  life through thrift.
                </p>

                <button>
                  Explore Thrift →
                </button>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          WARDROBE
      ================================================= */}

      {activePage === "wardrobe" && (

        <div className="feature-page">

          <div className="feature-content">

            <div className="feature-icon">
              👚
            </div>

            <h1>
              My Wardrobe
            </h1>

            <p>
              Build your digital wardrobe by adding
              the clothes you already own.
            </p>


            <div className="coming-soon-card">

              <h2>
                Digital Wardrobe
              </h2>

              <p>
                Upload clothing images, categorize
                your clothes and manage your wardrobe
                digitally.
              </p>

              <button className="feature-button">
                + Add Clothes
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          AI RECOMMENDATION
      ================================================= */}

      {activePage === "recommendation" && (

        <div className="feature-page">

          <div className="feature-content">

            <div className="feature-icon">
              ✨
            </div>

            <h1>
              AI Outfit Stylist
            </h1>

            <p>
              Tell us your occasion and preferences.
              AI will help create your look.
            </p>


            <div className="recommendation-form">

              <label>
                Occasion
              </label>

              <select>
                <option>
                  Select Occasion
                </option>

                <option>
                  College
                </option>

                <option>
                  Casual
                </option>

                <option>
                  Party
                </option>

                <option>
                  Formal
                </option>

                <option>
                  Wedding
                </option>
              </select>


              <label>
                Style Preference
              </label>

              <select>
                <option>
                  Select Style
                </option>

                <option>
                  Casual
                </option>

                <option>
                  Elegant
                </option>

                <option>
                  Traditional
                </option>

                <option>
                  Trendy
                </option>
              </select>


              <button className="feature-button">
                ✨ Generate Outfit
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          THRIFT
      ================================================= */}

      {activePage === "thrift" && (

        <div className="feature-page">

          <div className="feature-content">

            <div className="feature-icon">
              ♻️
            </div>

            <p className="about-label">
              SUSTAINABLE FASHION
            </p>

            <h1>
              Thrift Your Wardrobe
            </h1>

            <p>
              Give clothes you no longer use a second
              life by listing them for thrift.
            </p>


            <div className="thrift-cards">

              <div className="thrift-card">

                <div className="thrift-icon">
                  👗
                </div>

                <h2>
                  List Clothes
                </h2>

                <p>
                  List clothes you no longer wear
                  for other users to discover.
                </p>

                <button className="feature-button">
                  List an Item
                </button>

              </div>


              <div className="thrift-card">

                <div className="thrift-icon">
                  🔎
                </div>

                <h2>
                  Browse Thrift
                </h2>

                <p>
                  Discover pre-owned fashion items
                  from other users.
                </p>

                <button className="feature-button">
                  Browse Items
                </button>

              </div>


              <div className="thrift-card">

                <div className="thrift-icon">
                  🌱
                </div>

                <h2>
                  Sustainable Choice
                </h2>

                <p>
                  Extend the life of clothing and
                  reduce unnecessary fashion waste.
                </p>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          ABOUT US
      ================================================= */}

      {activePage === "about" && (

        <div className="about-page">

          <div className="about-content">

            <p className="about-label">
              ABOUT AI STYLIST
            </p>

            <h1>
              Style Smarter.
              <br />
              <span>Live Sustainably.</span>
            </h1>

            <p className="about-intro">
              AI Stylist is an intelligent personal styling
              platform that helps you create beautiful outfits
              using the clothes you already own.
            </p>


            <div className="about-cards">

              <div className="about-card">

                <div className="about-icon">
                  🤖
                </div>

                <h2>
                  AI-Powered Styling
                </h2>

                <p>
                  Get personalized outfit recommendations
                  based on your wardrobe, preferences,
                  occasion and lifestyle.
                </p>

              </div>


              <div className="about-card">

                <div className="about-icon">
                  👗
                </div>

                <h2>
                  Digital Wardrobe
                </h2>

                <p>
                  Organize your clothes digitally and
                  discover new combinations from pieces
                  you already own.
                </p>

              </div>


              <div className="about-card">

                <div className="about-icon">
                  ♻️
                </div>

                <h2>
                  Sustainable Thrift
                </h2>

                <p>
                  Give unused clothes a second life
                  through sustainable thrift.
                </p>

              </div>

            </div>


            <div className="mission-section">

              <h2>
                Our Mission
              </h2>

              <p>
                We believe great style doesn't require
                buying more clothes. AI Stylist combines
                technology, fashion and sustainability
                to help you make the most of what you
                already have.
              </p>

            </div>


            <div className="how-it-works">

              <h2>
                How AI Stylist Works
              </h2>


              <div className="steps">

                <div className="step">

                  <span>
                    01
                  </span>

                  <h3>
                    Add Your Wardrobe
                  </h3>

                  <p>
                    Upload and organize the clothes
                    you already own.
                  </p>

                </div>


                <div className="step">

                  <span>
                    02
                  </span>

                  <h3>
                    Tell Us Your Preferences
                  </h3>

                  <p>
                    Choose your occasion, weather,
                    style and preferences.
                  </p>

                </div>


                <div className="step">

                  <span>
                    03
                  </span>

                  <h3>
                    Get Your Look
                  </h3>

                  <p>
                    AI recommends outfits from
                    your existing wardrobe.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;