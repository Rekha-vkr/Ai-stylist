import { useState,useEffect } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";
import homeIllustration from "./assets/home-illustration.png";

function App() {
  // =========================
  // LOGIN / USER STATE
  // =========================
  const [showWardrobeForm, setShowWardrobeForm] = useState(false);

const [clothingName, setClothingName] = useState("");
const [clothingCategory, setClothingCategory] = useState("");
const [clothingColor, setClothingColor] = useState("");
const [clothingOccasion, setClothingOccasion] = useState("");
const [clothingSeason, setClothingSeason] = useState("");
const [clothingImage, setClothingImage] = useState(null);
const [wardrobeMessage, setWardrobeMessage] = useState("");
const [sortOrder, setSortOrder] = useState("recent");
const [filterOccasion, setFilterOccasion] = useState("All");
const [filterSeason, setFilterSeason] = useState("All");
const [showFilters, setShowFilters] = useState(false);

const [wardrobeItems, setWardrobeItems] = useState([]);
const [wardrobeLoading, setWardrobeLoading] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("All");

  const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem("isLoggedIn") === "true"
  
);
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
  useEffect(() => {
  if (isLoggedIn) {
    fetchWardrobe();
  }
}, [isLoggedIn]);

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

    if (response.ok && data.message === "Login successful!") {
  setIsLoggedIn(true);
  localStorage.setItem("isLoggedIn", "true");

  setActivePage("home");

  setLoginEmail("");
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
  //ADD CLOTHING//
  const handleAddClothing = async (e) => {
  e.preventDefault();

  setWardrobeMessage("");

  if (
    !clothingName ||
    !clothingCategory ||
    !clothingColor ||
    !clothingOccasion ||
    !clothingSeason
  ) {
    setWardrobeMessage("Please fill in all fields.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("item_name", clothingName);
    formData.append("category", clothingCategory);
    formData.append("color", clothingColor);
    formData.append("occasion", clothingOccasion);
    formData.append("season", clothingSeason);

    if (clothingImage) {
      formData.append("image", clothingImage);
    }

    const response = await fetch(
      "http://127.0.0.1:8000/wardrobe",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      setWardrobeMessage(
        "Clothes added successfully! 👗✨"
      );

      setClothingName("");
      setClothingCategory("");
      setClothingColor("");
      setClothingOccasion("");
      setClothingSeason("");
      setClothingImage(null);

      fetchWardrobe();

      setTimeout(() => {
        setActivePage("clothes");
        setWardrobeMessage("");
      }, 1200);
    } else {
      setWardrobeMessage(
        data.detail || "Failed to add clothing item."
      );
    }

  } catch (error) {
    console.error("Wardrobe error:", error);

    setWardrobeMessage(
      "Cannot connect to the server."
    );
  }
};
  // =====================================================
// GET WARDROBE ITEMS
// =====================================================

const fetchWardrobe = async () => {
  setWardrobeLoading(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/wardrobe"
    );

    const data = await response.json();

    if (response.ok) {
      setWardrobeItems(data);
    } else {
      console.error("Failed to fetch wardrobe:", data);
    }
  } catch (error) {
    console.error("Wardrobe fetch error:", error);
  } finally {
    setWardrobeLoading(false);
  }
};
const handleDeleteClothing = async (clothingId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this clothing item?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/wardrobe/${clothingId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.ok) {
      setWardrobeItems((currentItems) =>
        currentItems.filter(
          (item) => item._id !== clothingId
        )
      );
    } else {
      alert(data.detail || "Failed to delete clothing item.");
    }
  } catch (error) {
    console.error("Delete clothing error:", error);
    alert("Cannot connect to server.");
  }
};

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
  setIsLoggedIn(false);
  localStorage.removeItem("isLoggedIn");

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
                        required
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
                        required
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
    activePage === "clothes"
      ? "nav-link active"
      : "nav-link"
  }
  onClick={() => navigateTo("clothes")}
>
  My Clothes
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

  <div
    className="dashboard-page home-page-decorated"
    style={{ backgroundImage: `url(${homeIllustration})` }}
  >

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
          <div className="dashboard-icon">👚</div>
          <h2>My Wardrobe</h2>
          <p>Add and organize your clothes digitally.</p>
          <button>Open Wardrobe →</button>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigateTo("recommendation")}
        >
          <div className="dashboard-icon">✨</div>
          <h2>Outfit Recommendation</h2>
          <p>Get personalized outfit ideas from your wardrobe.</p>
          <button>Get Recommendations →</button>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigateTo("thrift")}
        >
          <div className="dashboard-icon">♻️</div>
          <h2>Thrift</h2>
          <p>Give unused clothes a second life through thrift.</p>
          <button>Explore Thrift →</button>
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

              <button
                className="feature-button"
                onClick={() => {
                setShowWardrobeForm(true);
                setWardrobeMessage("");
                    } }>
              + Add Clothes
              </button>
              {showWardrobeForm && (
  <form
    className="recommendation-form"
    onSubmit={handleAddClothing}
  >
    <label>Item Name</label>
    <input
      type="text"
      placeholder="Example: White Shirt"
      value={clothingName}
      onChange={(e) =>
        setClothingName(e.target.value)
      }
      required
    />
    <label>Clothing Image</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setClothingImage(e.target.files[0])
  }
/>

    <label>Category</label>
    <select
      value={clothingCategory}
      onChange={(e) =>
        setClothingCategory(e.target.value)
      }
      required
    >
      <option value="">Select Category</option>

<option value="Shirt">Shirt</option>
<option value="T-Shirt">T-Shirt</option>

<option value="Jeans">Jeans</option>
<option value="Trousers">Trousers</option>

<option value="Dress">Dress</option>
<option value="Saree">Saree</option>

<option value="Shoes">Shoes</option>
<option value="Bags">Bags</option>

<option value="Accessories">Accessories</option>
<option value="Others">Others</option>
    </select>

    <label>Color</label>
    <input
      type="text"
      placeholder="Example: White"
      value={clothingColor}
      onChange={(e) =>
        setClothingColor(e.target.value)
      }
      required
    />

    <label>Occasion</label>
    <select
      value={clothingOccasion}
      onChange={(e) =>
        setClothingOccasion(e.target.value)
      }
      required
    >
      <option value="">Select Occasion</option>
      <option value="College">College</option>
      <option value="Casual">Casual</option>
      <option value="Party">Party</option>
      <option value="Formal">Formal</option>
      <option value="Wedding">Wedding</option>
    </select>

    <label>Season</label>
    <select
      value={clothingSeason}
      onChange={(e) =>
        setClothingSeason(e.target.value)
      }
      required
    >
      <option value="">Select Season</option>
      <option value="Summer">Summer</option>
      <option value="Winter">Winter</option>
      <option value="Rainy">Rainy</option>
      <option value="All Season">All Season</option>
    </select>

    <button
      type="submit"
      className="feature-button"
    >
      Add to Wardrobe 👗
    </button>

    {wardrobeMessage && (
      <p style={{ marginTop: "15px" }}>
        {wardrobeMessage}
      </p>
    )}
  </form>
)}

            </div>

          </div>

        </div>
      )}
      {/* =================================================
    MY CLOTHES
================================================= */}

{activePage === "clothes" && (

  <div className="clothes-page">

    {/* =================================================
        HEADER
    ================================================= */}

    <div className="clothes-header">

      <h1>
        My Clothes
      </h1>

      <button
        className="clothes-menu-button"
        type="button"
      >
        ⋮
      </button>

    </div>


    {/* =================================================
        FILTER / SORT
    ================================================= */}

    <div className="clothes-controls">

      <button
  className="filter-button"
  type="button"
  onClick={() => setShowFilters(!showFilters)}
>
  ☷ Filter
</button>
      <button
  className="sort-button"
  type="button"
  onClick={() => {
    setSortOrder(
      sortOrder === "recent"
        ? "oldest"
        : "recent"
    );
  }}
>
  {sortOrder === "recent"
    ? "Recently added ˅"
    : "Oldest added ˅"}
</button>
    </div>
    {showFilters && (

  <div className="filter-panel">

    <div className="filter-group">

      <label>
        Occasion
      </label>

      <select
        value={filterOccasion}
        onChange={(e) =>
          setFilterOccasion(e.target.value)
        }
      >
        <option value="All">
          All Occasions
        </option>

        <option value="Casual">
          Casual
        </option>

        <option value="College">
          College
        </option>

        <option value="Party">
          Party
        </option>

        <option value="Formal">
          Formal
        </option>

        <option value="Wedding">
          Wedding
        </option>

        <option value="Travel">
          Travel
        </option>
      </select>

    </div>


    <div className="filter-group">

      <label>
        Season
      </label>

      <select
        value={filterSeason}
        onChange={(e) =>
          setFilterSeason(e.target.value)
        }
      >
        <option value="All">
          All Seasons
        </option>

        <option value="Summer">
          Summer
        </option>

        <option value="Winter">
          Winter
        </option>

        <option value="Monsoon">
          Monsoon
        </option>

        <option value="All Season">
          All Season
        </option>
      </select>

    </div>


    <button
      className="clear-filter-button"
      type="button"
      onClick={() => {
        setFilterOccasion("All");
        setFilterSeason("All");
      }}
    >
      Clear Filters
    </button>

  </div>

)}


    {/* =================================================
        CATEGORY TABS
    ================================================= */}

    <div className="category-tabs">

      {[
        "All",
        "Tops",
        "Pants",
        "Dresses",
        "Shoes",
        "Bags",
        "Accessories",
        "Others"
      ].map((category) => (

        <button
          key={category}
          type="button"
          className={
            selectedCategory === category
              ? "category-tab active"
              : "category-tab"
          }
          onClick={() =>
            setSelectedCategory(category)
          }
        >
          {category}
        </button>

      ))}

    </div>


    {/* =================================================
        CLOTHES GRID
    ================================================= */}

    {wardrobeLoading ? (

      <p className="clothes-message">
        Loading your clothes...
      </p>

    ) : (

      <div className="clothes-grid">

        {[...wardrobeItems]
          .filter((item) => {
            if (
  filterOccasion !== "All" &&
  item.occasion !== filterOccasion
) {
  return false;
}

if (
  filterSeason !== "All" &&
  item.season !== filterSeason
) {
  return false;
}

            /* ALL */

            if (selectedCategory === "All") {
              return true;
            }


            /* TOPS */

            if (selectedCategory === "Tops") {
              return (
                item.category === "Shirt" ||
                item.category === "T-Shirt"
              );
            }


            /* PANTS */

            if (selectedCategory === "Pants") {
              return (
                item.category === "Jeans" ||
                item.category === "Trousers" ||
                item.category === "Skirt"
              );
            }


            /* DRESSES */

            if (selectedCategory === "Dresses") {
              return (
                item.category === "Dress" ||
                item.category === "Saree"
              );
            }


            /* SHOES */

            if (selectedCategory === "Shoes") {
              return item.category === "Shoes";
            }


            /* BAGS */

            if (selectedCategory === "Bags") {
              return item.category === "Bags";
            }


            /* ACCESSORIES */

            if (selectedCategory === "Accessories") {
              return (
                item.category === "Accessories"
              );}
              if (selectedCategory === "Others") {
              return item.category === "Others";
            }


            return true;

})
.sort((a, b) => {
  const dateA = new Date(a.created_at || 0);
  const dateB = new Date(b.created_at || 0);

  if (sortOrder === "recent") {
    return dateB - dateA;
  }

  return dateA - dateB;
})
.map((item) => (

            <div
              className="clothes-card"
              key={item._id}
            >

              {/* CLOTHING IMAGE */}

<div className="clothes-card-image">

  {item.image ? (
    <img
      src={`http://127.0.0.1:8000${item.image}`}
      alt={item.item_name}
    />
  ) : (
    <span>
      👗
    </span>
  )}

</div>


              {/* CLOTHING DETAILS */}

              <div className="clothes-card-info">

                <h3>
                  {item.item_name}
                </h3>

                <p className="clothes-category-name">
                  {item.category}
                </p>

                <p>
                  {item.color}
                </p>

              </div>
              <button
  className="delete-clothing-button"
  type="button"
  onClick={() => handleDeleteClothing(item._id)}
>
  Delete
</button>

            </div>

          ))}


        {/* =================================================
            ADD ITEM CARD
        ================================================= */}

        <button
          className="add-clothes-card"
          type="button"
          onClick={() => {

            setActivePage("wardrobe");

            setShowWardrobeForm(true);

            setWardrobeMessage("");

          }}
        >

          <div className="add-clothes-icon">
            +
          </div>

          <span>
            Add Items
          </span>

        </button>

      </div>

    )}


    {/* =================================================
        EMPTY CATEGORY MESSAGE
    ================================================= */}

    {!wardrobeLoading &&

      wardrobeItems.filter((item) => {

        if (selectedCategory === "All") {
          return true;
        }

        if (selectedCategory === "Tops") {
          return (
            item.category === "Shirt" ||
            item.category === "T-Shirt"
          );
        }

        if (selectedCategory === "Pants") {
          return (
            item.category === "Jeans" ||
            item.category === "Trousers" ||
            item.category === "Skirt"
          );
        }

        if (selectedCategory === "Dresses") {
          return (
            item.category === "Dress" ||
            item.category === "Saree"
          );
        }

        if (selectedCategory === "Shoes") {
          return item.category === "Shoes";
        }

        if (selectedCategory === "Bags") {
          return item.category === "Bags";
        }

        if (selectedCategory === "Accessories") {
          return (
            item.category === "Accessories"
          );
        }
        if (selectedCategory === "Others") {
          return item.category === "Others";
        }


        return true;

      }).length === 0 && (

        <p className="clothes-message">
          No clothes in this category yet.
        </p>

      )}

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