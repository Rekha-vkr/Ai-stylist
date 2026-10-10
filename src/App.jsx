import { useState, useEffect, useRef } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";
import homeIllustration from "./assets/home-illustration.png";

const API = "http://127.0.0.1:8000";

function App() {
  // =========================
  // PAGE / AUTH STATE
  // =========================
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [thriftPage, setThriftPage] = useState("home");
  const [message, setMessage] = useState("");

  // =========================
  // LOGIN / REGISTER STATE
  // =========================
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [thriftListings, setThriftListings] = useState([]);
  const [thriftLoading, setThriftLoading] = useState(false);
  const [savedThriftListings, setSavedThriftListings] = useState([]);
  
 const [thriftItemName, setThriftItemName] = useState("");
 const [thriftItemCategory, setThriftItemCategory] = useState("");
 const [thriftItemPrice, setThriftItemPrice] = useState("");
 const [thriftListingType, setThriftListingType] = useState("sale");
 const [thriftDescription, setThriftDescription] = useState("");
 const [thriftImage, setThriftImage] = useState(null);

  const [thriftSearch, setThriftSearch] = useState("");
  const [thriftCategory, setThriftCategory] = useState("");
  const [thriftType, setThriftType] = useState("");

  // =========================
  // WARDROBE FORM STATE
  // =========================
  const [showWardrobeForm, setShowWardrobeForm] = useState(false);
  const [clothingName, setClothingName] = useState("");
  const [clothingCategory, setClothingCategory] = useState("");
  const [clothingColor, setClothingColor] = useState("");
  const [clothingOccasion, setClothingOccasion] = useState("");
  const [clothingSeason, setClothingSeason] = useState("");
  const [clothingStyle, setClothingStyle] = useState("");
  const [clothingImage, setClothingImage] = useState(null);
  const [wardrobeMessage, setWardrobeMessage] = useState("");

  // =========================
  // WARDROBE LIST / FILTERS
  // =========================
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent");
  const [filterOccasion, setFilterOccasion] = useState("All");
  const [filterSeason, setFilterSeason] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [clothingSearch, setClothingSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // =========================
  // AI RECOMMENDATION STATE
  // =========================
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [recommendedOutfit, setRecommendedOutfit] = useState([]);
  const [recommendationOccasion, setRecommendationOccasion] = useState("");
  const [recommendationStyle, setRecommendationStyle] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [recommendationAnalysis, setRecommendationAnalysis] = useState(null);
  const [recommendationColorPalette, setRecommendationColorPalette] = useState([]);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);

  // =========================
  // CAMERA STATE
  // =========================
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);

  // =========================
  // FETCH WARDROBE ON LOGIN
  // =========================
  useEffect(() => {
    if (isLoggedIn) {
      fetchWardrobe();
    }
  }, [isLoggedIn]);

  // Attach camera stream to <video> when modal opens
  useEffect(() => {
    if (activePage === "thrift") {
      loadThriftListings();
      loadSavedThriftListings();
    }
  }, [activePage]);

  


  // =====================================================
  // LOGIN
  // =====================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === "Login successful!") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", data.user.id);
        setIsLoggedIn(true);
        setActivePage("home");
        setLoginEmail("");
        setLoginPassword("");
      } else {
        alert(data.error || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Cannot connect to the server. Please make sure FastAPI is running.");
    }
  };


  // =====================================================
  // REGISTER
  // =====================================================
  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!registerName || !registerEmail || !registerPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");

        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");

        setTimeout(() => {
          setIsRegistering(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server. Please make sure FastAPI is running.");
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    setActivePage("home");
    setLoginEmail("");
    setLoginPassword("");
  };


  // =====================================================
  // CAMERA
  // =====================================================
  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Cannot access camera. Please allow camera permission.");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL("image/jpeg"));
    closeCamera();
  };


  // =====================================================
  // HELPERS
  // =====================================================
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);

    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const categoryMatches = (item, selectedCategory) => {
    if (selectedCategory === "All") return true;

    if (selectedCategory === "Tops") {
      return item.category === "Shirt" || item.category === "T-Shirt";
    }

    if (selectedCategory === "Pants") {
      return (
        item.category === "Jeans" ||
        item.category === "Trousers" ||
        item.category === "Skirt"
      );
    }

    if (selectedCategory === "Dresses") {
      return item.category === "Dress" || item.category === "Saree";
    }

    if (selectedCategory === "Shoes") return item.category === "Shoes";
    if (selectedCategory === "Bags") return item.category === "Bags";
    if (selectedCategory === "Accessories")
      return item.category === "Accessories";
    if (selectedCategory === "Others") return item.category === "Others";

    return true;
  };


  // =====================================================
  // ADD CLOTHING (AI catalog -> save each garment)
  // =====================================================
  const handleAddClothing = async (e) => {
    e.preventDefault();

    setWardrobeMessage("");

    if (
      !clothingName ||
      !clothingCategory ||
      !clothingColor ||
      !clothingOccasion ||
      !clothingStyle ||
      !clothingSeason
    ) {
      setWardrobeMessage("Please fill in all fields.");
      return;
    }

    try {
      let imageFile = null;

      if (capturedImage) {
        imageFile = dataURLtoFile(capturedImage, "camera-photo.jpg");
      } else if (clothingImage) {
        imageFile = clothingImage;
      }

      if (!imageFile) {
        setWardrobeMessage("Please select or capture a clothing image.");
        return;
      }

      // =====================================================
      // STEP 1: GENERATE AI CATALOG IMAGES
      // =====================================================
      const extractFormData = new FormData();
      extractFormData.append("image", imageFile);
      extractFormData.append(
        "category",
        clothingCategory === "Shoes" ? "shoes" : "auto"
      );
      setWardrobeMessage("Detecting and separating your clothes...");

      const extractResponse = await fetch(`${API}/extract-clothing`, {
        method: "POST",
        body: extractFormData,
      });

      const extractData = await extractResponse.json();

      if (!extractResponse.ok) {
        throw new Error(
          extractData.detail || "Failed to create AI catalog images."
        );
      }

      if (!extractData.items || extractData.items.length === 0) {
        throw new Error("No clothing items were detected.");
      }

      // =====================================================
      // STEP 2: SAVE EACH DETECTED GARMENT
      // =====================================================
      for (let i = 0; i < extractData.items.length; i++) {
        const item = extractData.items[i];

        setWardrobeMessage(
          `Saving ${item.category.toLowerCase()} to your wardrobe...`
        );

        // Download generated AI catalog image
        const generatedImageResponse = await fetch(
          `${API}${item.image}`
        );

        if (!generatedImageResponse.ok) {
          throw new Error(
            `Failed to download ${item.category} catalog image.`
          );
        }

        const generatedImageBlob = await generatedImageResponse.blob();

        const generatedImageFile = new File(
          [generatedImageBlob],
          `ai-catalog-${item.category.toLowerCase()}.png`,
          { type: "image/png" }
        );

        const wardrobeFormData = new FormData();

        let itemName = clothingName;

        if (extractData.items.length > 1) {
          itemName = `${clothingName} - ${item.category}`;
        }

        wardrobeFormData.append("item_name", itemName);
        wardrobeFormData.append("category", item.category);
        wardrobeFormData.append("color", clothingColor);
        wardrobeFormData.append("occasion", clothingOccasion);
        wardrobeFormData.append("season", clothingSeason);
        wardrobeFormData.append("style", clothingStyle);
        wardrobeFormData.append("user_id", localStorage.getItem("userId"));
        wardrobeFormData.append("image", generatedImageFile);

        const wardrobeResponse = await fetch(`${API}/wardrobe`, {
          method: "POST",
          body: wardrobeFormData,
        });

        const wardrobeData = await wardrobeResponse.json();

        if (!wardrobeResponse.ok) {
          throw new Error(
            wardrobeData.detail || `Failed to save ${item.category}.`
          );
        }
      }

      // =====================================================
      // STEP 3: SUCCESS
      // =====================================================
      setWardrobeMessage(
        extractData.items.length > 1
          ? "Upper and lower clothes added successfully!"
          : "Clothes added successfully!"
      );

      setClothingName("");
      setClothingCategory("");
      setClothingColor("");
      setClothingOccasion("");
      setClothingStyle("");
      setClothingSeason("");
      setClothingImage(null);
      setCapturedImage(null);

      fetchWardrobe();

      setTimeout(() => {
        setShowWardrobeForm(false);
        setActivePage("clothes");
        setWardrobeMessage("");
      }, 1500);
    } catch (error) {
      console.error("Wardrobe error:", error);
      setWardrobeMessage(error.message || "Cannot connect to the server.");
    }
  };


  // =====================================================
  // GET WARDROBE ITEMS
  // =====================================================
  const fetchWardrobe = async () => {
    setWardrobeLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${API}/wardrobe?user_id=${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (response.ok) {
        setWardrobeItems(data);
      }
    } catch (error) {
      console.error("Wardrobe fetch error:", error);
    } finally {
      setWardrobeLoading(false);
    }
  };


  // =====================================================
  // DELETE CLOTHING
  // =====================================================
  const handleDeleteClothing = async (clothingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this clothing item?"
    );

    if (!confirmDelete) return;

    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${API}/wardrobe/${clothingId}?user_id=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok) {
        setWardrobeItems((currentItems) =>
          currentItems.filter((item) => item._id !== clothingId)
        );
      } else {
        alert(data.detail || "Failed to delete clothing item.");
      }
    } catch (error) {
      console.error("Delete clothing error:", error);
      alert("Cannot connect to server.");
    }
  };
  const loadThriftListings = async (
  search = "",
  category = "",
  listingType = ""
) => {
  setThriftLoading(true);

  try {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (listingType) params.append("listing_type", listingType);

    const response = await fetch(
      `http://127.0.0.1:8000/thrift?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to load listings.");
    }

    setThriftListings(data);
  } catch (error) {
    console.error("Thrift listings error:", error);
  } finally {
    setThriftLoading(false);
  }
};
const loadSavedThriftListings = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/thrift/saved?user_id=string@1234"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load saved thrift items."
      );
    }

    setSavedThriftListings(data);
  } catch (error) {
    console.error("Saved thrift error:", error);
  }
};
const handleSaveThrift = async (listingId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/thrift/${listingId}/save?user_id=string@1234`,
      { 
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to save thrift item.");
    }

    alert("Item saved!");
  } catch (error) {
    console.error("Save thrift error:", error);
    alert("Could not save item.");
  }
};
const handleUnsaveThrift = async (listingId) => {
  try {
    const response = await fetch(
      `${API}/thrift/${listingId}/save?user_id=string@1234`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to remove saved item."
      );
    }

    alert("Item removed from saved items!");

    loadSavedThriftListings();

  } catch (error) {
    console.error("Unsave thrift error:", error);
    alert("Could not remove saved item.");
  }
};
const handleDeleteThrift = async (listingId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this thrift listing?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API}/thrift/${listingId}?user_id=string@1234`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to delete thrift item."
      );
    }

    alert("Thrift listing deleted successfully!");

    loadThriftListings(
      thriftSearch,
      thriftCategory,
      thriftType
    );

    loadSavedThriftListings();

  } catch (error) {
    console.error("Delete thrift error:", error);
    alert(error.message || "Could not delete item.");
  }
};
const handleCreateThriftListing = async () => {
  try {
    if (!thriftItemName || !thriftItemCategory || !thriftImage) {
      alert("Please fill in the item name, category, and image.");
      return;
    }

    const formData = new FormData();

    formData.append("user_id", "string@1234");
    formData.append("item_name", thriftItemName);
    formData.append("category", thriftItemCategory);
    formData.append(
      "price",
      thriftListingType === "sale" ? thriftItemPrice : "0"
    );
    formData.append("listing_type", thriftListingType);
    formData.append("description", thriftDescription);
    formData.append("image", thriftImage);

    const response = await fetch(
      "http://127.0.0.1:8000/thrift",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to create thrift listing."
      );
    }

    alert("Item listed successfully!");

    setThriftItemName("");
    setThriftItemCategory("");
    setThriftItemPrice("");
    setThriftListingType("sale");
    setThriftDescription("");
    setThriftImage(null);

    loadThriftListings(
      thriftSearch,
      thriftCategory,
      thriftType
    );

  } catch (error) {
    console.error("Create thrift listing error:", error);
    alert("Could not list item.");
  }
};


  // =====================================================
  // NAVIGATION
  // =====================================================
  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo(0, 0);
  };


  // =====================================================
  // LOGIN / REGISTER SCREEN
  // =====================================================
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="page">

          {/* LEFT FASHION IMAGE WITH DOODLE QUOTE */}
          <section className="fashion-side">
            <div className="fashion-image-wrapper">
              <img
                src={fashionImage}
                alt="AI Fashion Stylist"
                className="fashion-image"
              />
              
            </div>
          </section>

          {/* RIGHT LOGIN SIDE */}
          <section className="login-side">
            <div className="login-card">
              <div className="card-brand-header">
                <div className="profile-icon" style={{ fontSize: "32px", marginBottom: "4px" }}>👒</div>
                <div className="card-brand-title">AI Stylist</div>
              </div>

              {!isRegistering ? (
                <>
                  <h1>
                    Welcome Back <span>♡</span>
                  </h1>
                  <p className="subtitle">Sign in to your AI Stylist</p>

                  <form onSubmit={handleLogin}>
                    <div className="input-group">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
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
                        onClick={() => alert("Password recovery coming soon")}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button type="submit" className="login-button">
                      👗 &nbsp; Login &nbsp; →
                    </button>
                  </form>

                  <div className="divider">
                    <span></span>
                    <p>Or continue with</p>
                    <span></span>
                  </div>

                  <button
                    type="button"
                    className="google-login-btn"
                    onClick={() => alert("Google Sign-In is coming soon!")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </button>

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
                  <h1>
                    Create Account <span>♡</span>
                  </h1>
                  <p className="subtitle">Join your AI Stylist journey</p>

                  <form onSubmit={handleRegister}>
                    <div className="input-group">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "◉"}
                      </button>
                    </div>

                    <button type="submit" className="login-button">
                      ✨ &nbsp; Create Account &nbsp; →
                    </button>

                    {message && (
                      <p style={{ textAlign: "center", marginTop: "15px", color: "var(--wine)", fontWeight: "500" }}>
                        {message}
                      </p>
                    )}
                  </form>

                  <div className="divider">
                    <span></span>
                    <p>Or continue with</p>
                    <span></span>
                  </div>

                  <button
                    type="button"
                    className="google-login-btn"
                    onClick={() => alert("Google Sign-In is coming soon!")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </button>

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
        <div className="nav-logo" onClick={() => navigateTo("home")}>
          👗 AI Stylist
        </div>

        <div className="nav-links">
          <button
            className={activePage === "home" ? "nav-link active" : "nav-link"}
            onClick={() => navigateTo("home")}
          >
            Home
          </button>

          <button
            className={
              activePage === "wardrobe" || activePage === "clothes"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => navigateTo("wardrobe")}
          >
            My Wardrobe
          </button>


          <button
            className={
              activePage === "recommendation" ? "nav-link active" : "nav-link"
            }
            onClick={() => navigateTo("recommendation")}
          >
            AI Stylist
          </button>

          <button
            className={activePage === "thrift" ? "nav-link active" : "nav-link"}
            onClick={() => navigateTo("thrift")}
          >
            Thrift
          </button>

          <button
            className={activePage === "about" ? "nav-link active" : "nav-link"}
            onClick={() => navigateTo("about")}
          >
            About Us
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>


      {/* =================================================
          HOME (SCREEN 4)
      ================================================= */}
      {activePage === "home" && (
        <div
          className="dashboard-page home-page-decorated"
          style={{
            "--home-background": `url(${homeIllustration})`
          }}
        >
          {/* FLOATING ANIMATED FASHION DOODLE STICKERS */}
          <div className="fashion-decorations">
            <img
              src="/fashion-assets/dress.png"
              alt=""
              className="fashion-decor fashion-dress"
            />
            <img
              src="/fashion-assets/handbag.png"
              alt=""
              className="fashion-decor fashion-handbag"
            />
            <img
              src="/fashion-assets/decoration.png"
              alt=""
              className="fashion-decor fashion-decoration"
            />
      
            
            <img
              src="/fashion-assets/perfume.png"
              alt=""
              className="fashion-decor fashion-perfume"
            />
            <img
              src="/fashion-assets/jewellery.png"
              alt=""
              className="fashion-decor fashion-jewellery"
            />
            <img
              src="/fashion-assets/hanger.png"
              alt=""
              className="fashion-decor fashion-hanger"
            />
            <img
              src="/fashion-assets/sparkles.png"
              alt=""
              className="fashion-decor fashion-sparkle"
            />
          </div>

          <div className="dashboard-content">
            {/* WELCOME BACK EDITORIAL HEADER */}
            <div className="dashboard-welcome-header">

              <div className="welcome-center">
                <span className="stylist-pill-badge">YOUR PERSONAL AI STYLIST</span>
                <h2>
                  Welcome back, <em>Fashionista!</em> <span>♡</span>
                </h2>
                <p>Ready to curate your look for today? ✨</p>
                <div
                  className="doodle-script-quote"
                  style={{ marginTop: "12px", fontSize: "1.45rem" }}
                >
                  Style is a form of self care ♡
                </div>
              </div>
            </div>

            {/* 4 LUXURY ACTION CARDS */}
            <div className="dashboard-action-cards">
              <div
                className="dashboard-action-card"
                onClick={() => navigateTo("wardrobe")}
              >
                <div className="action-icon-circle">👚</div>
                <h3>My Wardrobe</h3>
                <p>Add, browse, and organize your clothing collection digitally.</p>
                <span className="action-card-btn">Open Wardrobe →</span>
              </div>

              <div
                className="dashboard-action-card"
                onClick={() => navigateTo("recommendation")}
              >
                <div className="action-icon-circle">✨</div>
                <h3>AI Stylist</h3>
                <p>Curate personalized outfits tailored to every occasion & mood.</p>
                <span className="action-card-btn">Get Styled →</span>
              </div>

              <div
                className="dashboard-action-card"
                onClick={() => navigateTo("thrift")}
              >
                <div className="action-icon-circle">♻️</div>
                <h3>Thrift Store</h3>
                <p>Give unused clothes a second life through circular fashion.</p>
                <span className="action-card-btn">Explore Thrift →</span>
              </div>

              <div
                className="dashboard-action-card"
                onClick={() => navigateTo("about")}
              >
                <div className="action-icon-circle">👒</div>
                <h3>About Us</h3>
                <p>Discover our philosophy for mindful and sustainable style.</p>
                <span className="action-card-btn">Learn More →</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          WARDROBE (ADD CLOTHES)
      ================================================= */}
      
{(activePage === "wardrobe" || activePage === "clothes") && (
        <div className="wardrobe-page">
          {/* EDITORIAL HEADER (MATCHING FIGMA SCREEN 5) */}
          <div className="section-editorial-header">
            <div>
              <h1>My Wardrobe</h1>
              <p>Your style collection, organized beautifully.</p>
            </div>
            <button
              className="add-item-pill-btn"
              type="button"
              onClick={() => {
                setShowWardrobeForm(!showWardrobeForm);
                setWardrobeMessage("");
              }}
            >
              {showWardrobeForm ? "✕ Close Form" : "+ Add Item"}
            </button>
          </div>

          {/* ADD CLOTHING FORM */}
          {showWardrobeForm && (
            <div className="coming-soon-card">
              <h2>Add New Clothing</h2>
              <p>
                Upload a photo of your outfit or clothing piece — AI will detect each item and organize it into your wardrobe.
              </p>

              <form
                className="recommendation-form"
                onSubmit={handleAddClothing}
              >
                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Example: Pink Blazer, White Top"
                  value={clothingName}
                  onChange={(e) => setClothingName(e.target.value)}
                  required
                />

                <label>Clothing Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setClothingImage(e.target.files[0]);
                    setCapturedImage(null);
                  }}
                />

                <button
                  type="button"
                  className="feature-button"
                  style={{ marginTop: "10px" }}
                  onClick={openCamera}
                >
                  📷 Capture with Camera
                </button>

                {capturedImage && (
                  <p style={{ marginTop: "8px" }}>Camera photo captured!</p>
                )}

                <label>Category</label>
                <select
                  value={clothingCategory}
                  onChange={(e) => setClothingCategory(e.target.value)}
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
                  placeholder="Example: White, Pink, Navy"
                  value={clothingColor}
                  onChange={(e) => setClothingColor(e.target.value)}
                  required
                />

                <label>Occasion</label>
                <select
                  value={clothingOccasion}
                  onChange={(e) => setClothingOccasion(e.target.value)}
                  required
                >
                  <option value="">Select Occasion</option>
                  <option value="College">College</option>
                  <option value="Casual">Casual</option>
                  <option value="Party">Party</option>
                  <option value="Formal">Formal</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Travel">Travel</option>
                </select>

                <label>Style</label>
                <select
                  value={clothingStyle}
                  onChange={(e) => setClothingStyle(e.target.value)}
                  required
                >
                  <option value="">Select Style</option>
                  <option value="Casual">Casual</option>
                  <option value="Elegant">Elegant</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Trendy">Trendy</option>
                  <option value="Minimal">Minimal</option>
                </select>

                <label>Season</label>
                <select
                  value={clothingSeason}
                  onChange={(e) => setClothingSeason(e.target.value)}
                  required
                >
                  <option value="">Select Season</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Rainy">Rainy</option>
                  <option value="All Season">All Season</option>
                </select>

                <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                  <button type="submit" className="feature-button">
                    Save to Wardrobe
                  </button>
                  <button
                    type="button"
                    className="feature-button"
                    style={{ opacity: 0.7 }}
                    onClick={() => {
                      setShowWardrobeForm(false);
                      setWardrobeMessage("");
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {wardrobeMessage && (
                  <p style={{ marginTop: "15px" }}>{wardrobeMessage}</p>
                )}
              </form>
            </div>
          )}

          {/* SEARCH & FILTER TOOLBAR */}
          <div className="filter-search-toolbar">
            <div className="search-input-pill">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search your wardrobe..."
                value={clothingSearch}
                onChange={(e) => setClothingSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select-pill"
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
            >
              <option value="All">All Occasions</option>
              <option value="Casual">Casual</option>
              <option value="College">College</option>
              <option value="Party">Party</option>
              <option value="Formal">Formal</option>
              <option value="Wedding">Wedding</option>
              <option value="Travel">Travel</option>
            </select>

            <select
              className="filter-select-pill"
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
            >
              <option value="All">All Seasons</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Monsoon">Monsoon</option>
              <option value="All Season">All Season</option>
            </select>

            <button
              className="filter-select-pill"
              type="button"
              onClick={() =>
                setSortOrder(sortOrder === "recent" ? "oldest" : "recent")
              }
            >
              {sortOrder === "recent" ? "Sort: Recent ˅" : "Sort: Oldest ˅"}
            </button>
          </div>

          {/* CATEGORY TABS */}
          <div className="category-tabs">
            {[
              "All",
              "Tops",
              "Pants",
              "Dresses",
              "Shoes",
              "Bags",
              "Accessories",
              "Others",
            ].map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-tab active"
                    : "category-tab"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* CLOTHES GRID */}
          {wardrobeLoading ? (
            <p className="clothes-message">Loading your clothes...</p>
          ) : (
            <>
              <div className="clothes-grid">
                {wardrobeItems
                  .filter((item) => {
                    if (
                      clothingSearch &&
                      !item.item_name
                        ?.toLowerCase()
                        .includes(clothingSearch.toLowerCase())
                    ) {
                      return false;
                    }

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

                    return categoryMatches(item, selectedCategory);
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);

                    return sortOrder === "recent"
                      ? dateB - dateA
                      : dateA - dateB;
                  })
                  .map((item) => (
                    <div className="clothes-card" key={item._id}>
                      <div className="clothes-card-image">
                        {item.image ? (
                          <img
                            src={`${API}${item.image}`}
                            alt={item.item_name}
                          />
                        ) : (
                          <span>👗</span>
                        )}
                      </div>

                      <div className="clothes-card-info">
                        <h3>{item.item_name}</h3>
                        <p className="clothes-card-category">
                          {item.category}
                        </p>
                        <p className="clothes-card-tag">
                          {item.color} • {item.occasion} • {item.season}
                        </p>

                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <button
                            className="edit-clothing-button"
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setActivePage("edit");
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-clothing-button"
                            type="button"
                            onClick={() => handleDeleteClothing(item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                <button
                  className="add-clothes-card"
                  type="button"
                  onClick={() => {
                    setShowWardrobeForm(true);
                  }}
                >
                  <span>＋</span>
                  <p>Add Clothes</p>
                </button>
              </div>

              {wardrobeItems.filter((item) =>
                categoryMatches(item, selectedCategory)
              ).length === 0 && (
                <p className="clothes-message">
                  No clothes in this category yet. Click "+ Add Item" above to add your first piece!
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* =================================================
          EDIT CLOTHING
      ================================================= */}
      {activePage === "edit" && editingItem && (
        <div className="edit-page">
          <div className="edit-page-header">
            <button
              className="edit-back-button"
              type="button"
              onClick={() => {
                setEditingItem(null);
                setActivePage("wardrobe");
              }}
            >
              ← Back to My Wardrobe
            </button>
          </div>

          <div className="edit-page-content">
            <h1>Edit Clothing</h1>

            <p className="edit-page-subtitle">
              Update the details of your clothing item
            </p>

            <div className="edit-form">
              <div className="edit-form-group">
                <label>Clothing Name</label>
                <input
                  type="text"
                  value={editingItem.item_name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="edit-form-group">
                <label>Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="Shirt">Shirt</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Skirt">Skirt</option>
                  <option value="Dress">Dress</option>
                  <option value="Saree">Saree</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Bags">Bags</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={editingItem.color}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      color: e.target.value,
                    })
                  }
                />
              </div>

              <div className="edit-form-group">
                <label>Occasion</label>
                <select
                  value={editingItem.occasion}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      occasion: e.target.value,
                    })
                  }
                >
                  <option value="Casual">Casual</option>
                  <option value="College">College</option>
                  <option value="Party">Party</option>
                  <option value="Formal">Formal</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label>Season</label>
                <select
                  value={editingItem.season}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      season: e.target.value,
                    })
                  }
                >
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Monsoon">Monsoon</option>
                  <option value="All Season">All Season</option>
                </select>
              </div>

              <div className="edit-form-buttons">
                <button
                  className="edit-cancel-button"
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setActivePage("clothes");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="edit-save-button"
                  type="button"
                  onClick={async () => {
                    try {
                      const formData = new FormData();

                      formData.append("item_name", editingItem.item_name);
                      formData.append("category", editingItem.category);
                      formData.append("color", editingItem.color);
                      formData.append("occasion", editingItem.occasion);
                      formData.append("season", editingItem.season);

                      const userId = localStorage.getItem("userId");

                      const response = await fetch(
                        `${API}/wardrobe/${editingItem._id}?user_id=${encodeURIComponent(userId)}`,
                        {
                          method: "PUT",
                          body: formData,
                        }
                      );

                      const data = await response.json();

                      if (response.ok) {
                        alert("Clothing item updated successfully!");
                        setEditingItem(null);
                        await fetchWardrobe();
                        setActivePage("clothes");
                      } else {
                        alert(
                          data.detail || "Failed to update clothing item."
                        );
                      }
                    } catch (error) {
                      console.error("Update clothing error:", error);
                      alert("Cannot connect to server.");
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          AI STYLIST (OUTFIT RECOMMENDATION - SCREEN 7)
      ================================================= */}
      {activePage === "recommendation" && (
        <div className="recommendation-page">
          <div className="section-editorial-header">
            <div>
              <h1>AI Stylist Recommendations</h1>
              <p>Effortlessly curated outfits directly from your wardrobe.</p>
            </div>
            <div className="doodle-script-quote" style={{ fontSize: "1.35rem" }}>
              Effortless Chic for Any Occasion ✨
            </div>
          </div>

          <div className="recommendation-layout-grid">
            {/* COLUMN 1: PREFERENCES */}
            <div className="recommendation-card-box">
              <h2>Outfit Preferences</h2>

              <div className="preference-field">
                <label>Occasion</label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                >
                  <option value="">Select Occasion</option>
                  <option value="College">College</option>
                  <option value="Casual">Casual</option>
                  <option value="Party">Party</option>
                  <option value="Formal">Formal</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div className="preference-field">
                <label>Style Vibe</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  <option value="">Select Style Vibe</option>
                  <option value="Casual">Casual</option>
                  <option value="Elegant">Elegant</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Trendy">Trendy</option>
                  <option value="Minimal">Minimal</option>
                </select>
              </div>

              <button
                type="button"
                className="primary-pill-button"
                style={{ marginTop: "18px" }}
                disabled={isGeneratingOutfit}
                onClick={async () => {
                  if (!selectedOccasion) {
                    setAiRecommendation("Please select an occasion first.");
                    return;
                  }

                  const userId = localStorage.getItem("userId");
                  if (!userId) {
                    setAiRecommendation("Please log in again before generating an outfit.");
                    return;
                  }

                  try {
                    setIsGeneratingOutfit(true);
                    const response = await fetch(
                      `${API}/recommend-outfit?user_id=${encodeURIComponent(
                        userId
                      )}&occasion=${encodeURIComponent(selectedOccasion)}`
                    );

                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.detail || "Failed to generate outfit.");
                    }

                    setRecommendedOutfit(data.outfit || []);
                    setRecommendationOccasion(data.occasion || selectedOccasion);
                    setRecommendationStyle(data.style || selectedStyle || "Chic");
                    setAiRecommendation(
                      data.message || "Your curated outfit has been styled from your wardrobe."
                    );
                  } catch (error) {
                    console.error("Outfit recommendation error:", error);
                    setAiRecommendation(
                      error.message || "Something went wrong while generating your outfit."
                    );
                    setRecommendedOutfit([]);
                  } finally {
                    setIsGeneratingOutfit(false);
                  }
                }}
              >
                {isGeneratingOutfit ? "✨ Creating Outfit..." : "✨ Generate Outfit"}
              </button>
            </div>

            {/* COLUMN 2: TODAY'S LOOKBOOK */}
            <div className="recommendation-card-box">
              <h2>Today's Lookbook ♡</h2>

              {recommendedOutfit.length > 0 ? (
                <>
                  <div className="lookbook-collage">
                    {recommendedOutfit.map((item) => (
                      <div className="lookbook-item" key={item._id}>
                        <img src={`${API}${item.image}`} alt={item.item_name} />
                        <h4>{item.item_name}</h4>
                        <p>{item.category} • {item.color}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="doodle-script-quote"
                    style={{ display: "block", textAlign: "center", marginTop: "20px", fontSize: "1.3rem" }}
                  >
                    Curated with love for you ♡
                  </div>
                </>
              ) : (
                <div className="lookbook-empty-state">
                  <img src="/fashion-assets/dress.png" alt="Fashion Inspiration" />
                  <p>Select your occasion and tap Generate Outfit to view your curated lookbook!</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: WHY THIS WORKS */}
            <div className="recommendation-card-box">
              <h2>Why This Works? ✨</h2>

              <ul className="why-works-list">
                <li><span className="check-pink">✓</span> Color harmony & balance</li>
                <li><span className="check-pink">✓</span> Proportional silhouette match</li>
                <li>
                  <span className="check-pink">✓</span> Tailored for{" "}
                  <strong>{selectedOccasion || "your occasion"}</strong>
                </li>
                <li><span className="check-pink">✓</span> Day-to-night versatility</li>
              </ul>

              {aiRecommendation && (
                <div className="ai-reasoning-card">
                  <strong>Stylist Note:</strong>
                  <p style={{ marginTop: "6px" }}>{aiRecommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          THRIFT STORE (SCREEN 6)
      ================================================= */}
      {activePage === "thrift" && (
        <div className="thrift-page">
          <div className="section-editorial-header">
            <div>
              <h1>Thrift Store</h1>
              <p>Give pre-loved pieces a second story through circular fashion.</p>
            </div>
            <div className="doodle-script-quote" style={{ fontSize: "1.35rem" }}>
              Reduce • Reuse • Reimagine ♡
            </div>
          </div>

          {/* 3 EDITORIAL TABS */}
          <div className="thrift-tabs-bar">
            <button
              type="button"
              className={
                thriftPage === "browse" || thriftPage === "home"
                  ? "thrift-tab-btn active"
                  : "thrift-tab-btn"
              }
              onClick={() => setThriftPage("browse")}
            >
              Browse Listings
            </button>
            <button
              type="button"
              className={
                thriftPage === "list"
                  ? "thrift-tab-btn active"
                  : "thrift-tab-btn"
              }
              onClick={() => setThriftPage("list")}
            >
              + Sell / List an Item
            </button>
            <button
              type="button"
              className={
                thriftPage === "saved"
                  ? "thrift-tab-btn active"
                  : "thrift-tab-btn"
              }
              onClick={() => {
                setThriftPage("saved");
                loadSavedThriftListings();
              }}
            >
              Saved Items ({savedThriftListings.length})
            </button>
          </div>

          {/* TAB 1: BROWSE LISTINGS */}
          {(thriftPage === "browse" || thriftPage === "home") && (
            <div>
              {/* FILTER & SEARCH TOOLBAR */}
              <div className="filter-search-toolbar">
                <div className="search-input-pill">
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search thrift collection..."
                    value={thriftSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setThriftSearch(value);
                      loadThriftListings(value, thriftCategory, thriftType);
                    }}
                  />
                </div>

                <select
                  className="filter-select-pill"
                  value={thriftCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setThriftCategory(value);
                    loadThriftListings(thriftSearch, value, thriftType);
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="dress">Dresses</option>
                  <option value="shirt">Shirts</option>
                  <option value="tshirt">T-Shirts</option>
                  <option value="pants">Pants</option>
                  <option value="jacket">Jackets</option>
                  <option value="skirt">Skirts</option>
                  <option value="shoes">Shoes</option>
                </select>

                <select
                  className="filter-select-pill"
                  value={thriftType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setThriftType(value);
                    loadThriftListings(thriftSearch, thriftCategory, value);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="exchange">Exchange</option>
                </select>
              </div>

              {/* LISTINGS GRID */}
              {thriftLoading ? (
                <p className="clothes-message">Curating thrift pieces...</p>
              ) : thriftListings.length === 0 ? (
                <div className="lookbook-empty-state">
                  <p>No listings found matching your search. Be the first to list one!</p>
                  <button
                    type="button"
                    className="add-item-pill-btn"
                    style={{ margin: "16px auto" }}
                    onClick={() => setThriftPage("list")}
                  >
                    + List an Item
                  </button>
                </div>
              ) : (
                <div className="thrift-listings-grid">
                  {thriftListings.map((listing) => (
                    <div className="thrift-card" key={listing._id}>
                      <span className="thrift-card-badge">
                        {listing.listing_type === "sale" ? `₹${listing.price}` : "Exchange"}
                      </span>

                      <img
                        src={`${API}${listing.image}`}
                        alt={listing.item_name}
                      />

                      <h3>{listing.item_name}</h3>
                      <p className="clothes-card-category">{listing.category}</p>
                      {listing.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>
                          {listing.description}
                        </p>
                      )}

                      <div className="thrift-actions">
                        <button
                          type="button"
                          className="thrift-save-btn"
                          onClick={() => handleSaveThrift(listing._id)}
                        >
                          ♡ Save Item
                        </button>

                        {listing.user_id === "string@1234" && (
                          <button
                            type="button"
                            className="thrift-delete-btn"
                            onClick={() => handleDeleteThrift(listing._id)}
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SELL AN ITEM */}
          {thriftPage === "list" && (
            <div className="thrift-sell-card">
              <h2>Sell or Exchange an Item</h2>
              <p>Give your clothes another journey with fellow style lovers</p>

              <div className="edit-form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Floral Summer Dress"
                  value={thriftItemName}
                  onChange={(e) => setThriftItemName(e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>Category</label>
                <select
                  value={thriftItemCategory}
                  onChange={(e) => setThriftItemCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="dress">Dress</option>
                  <option value="shirt">Shirt</option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="pants">Pants</option>
                  <option value="jacket">Jacket</option>
                  <option value="skirt">Skirt</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label>Listing Type</label>
                <select
                  value={thriftListingType}
                  onChange={(e) => setThriftListingType(e.target.value)}
                >
                  <option value="sale">For Sale</option>
                  <option value="exchange">Exchange</option>
                </select>
              </div>

              {thriftListingType === "sale" && (
                <div className="edit-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={thriftItemPrice}
                    onChange={(e) => setThriftItemPrice(e.target.value)}
                  />
                </div>
              )}

              <div className="edit-form-group">
                <label>Description / Condition</label>
                <textarea
                  rows="3"
                  placeholder="Describe condition, size, fabric, or styling notes..."
                  value={thriftDescription}
                  onChange={(e) => setThriftDescription(e.target.value)}
                />
              </div>

              <div className="edit-form-group">
                <label>Item Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThriftImage(e.target.files[0])}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="primary-pill-button"
                  onClick={handleCreateThriftListing}
                >
                  ✨ Publish Listing
                </button>
                <button
                  type="button"
                  className="edit-cancel-button"
                  onClick={() => setThriftPage("browse")}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED ITEMS */}
          {thriftPage === "saved" && (
            <div>
              {savedThriftListings.length === 0 ? (
                <div className="lookbook-empty-state">
                  <p>You haven't saved any thrift pieces yet. Tap "♡ Save Item" on any piece you love!</p>
                  <button
                    type="button"
                    className="add-item-pill-btn"
                    style={{ margin: "16px auto" }}
                    onClick={() => setThriftPage("browse")}
                  >
                    ← Browse Listings
                  </button>
                </div>
              ) : (
                <div className="thrift-listings-grid">
                  {savedThriftListings.map((listing) => (
                    <div className="thrift-card" key={listing._id}>
                      <span className="thrift-card-badge">
                        {listing.listing_type === "sale" ? `₹${listing.price}` : "Exchange"}
                      </span>

                      <img
                        src={`${API}${listing.image}`}
                        alt={listing.item_name}
                      />

                      <h3>{listing.item_name}</h3>
                      <p className="clothes-card-category">{listing.category}</p>
                      {listing.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>
                          {listing.description}
                        </p>
                      )}

                      <button
                        type="button"
                        className="thrift-delete-btn"
                        style={{ width: "100%", marginTop: "10px" }}
                        onClick={() => handleUnsaveThrift(listing._id)}
                      >
                        ♡ Remove from Saved
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================
          ABOUT US (SCREEN 9)
      ================================================= */}
      {activePage === "about" && (
        <div className="about-page">
          <div className="section-editorial-header">
            <div>
              <h1>About AI Stylist</h1>
              <p>Style Smarter. Live Sustainably. Love what you wear.</p>
            </div>
            <div className="doodle-script-quote" style={{ fontSize: "1.35rem" }}>
              Fashion that respects what you already own ✨
            </div>
          </div>

          <p style={{ maxWidth: "680px", margin: "0 auto 36px", textAlign: "center", color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6" }}>
            AI Stylist is an intelligent personal styling atelier designed to help you unlock the hidden potential of your existing wardrobe, cultivate mindful fashion habits, and look confident every day.
          </p>

          {/* 3 CORE PILLARS STRIP */}
          <div className="about-cards-strip">
            <div className="about-info-card">
              <div className="action-icon-circle">🤖</div>
              <h2>Style Smarter</h2>
              <p>
                Get personalized outfit pairings tailored to your taste, body, occasion, and seasonal trends from clothes already in your closet.
              </p>
            </div>

            <div className="about-info-card">
              <div className="action-icon-circle">🌿</div>
              <h2>Conscious Fashion</h2>
              <p>
                Reduce garment waste and embrace sustainability by styling creatively and finding pre-loved gems in our community thrift.
              </p>
            </div>

            <div className="about-info-card">
              <div className="action-icon-circle">👗</div>
              <h2>Digital Wardrobe</h2>
              <p>
                Digitize your entire wardrobe in high definition. Track your garments, colors, and combinations on any screen, anywhere.
              </p>
            </div>
          </div>

          {/* 3-STEP TIMELINE */}
          <div style={{ textAlign: "center", margin: "48px 0 24px" }}>
            <h2 style={{ fontSize: "28px", fontStyle: "italic", marginBottom: "6px" }}>How AI Stylist Works</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Three effortless steps to elevating your everyday style</p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <span>01</span>
              <h3>Add Your Wardrobe</h3>
              <p>Snap photos or upload your clothing pieces. Our AI automatically tags categories, colors, and styles.</p>
            </div>

            <div className="step-card">
              <span>02</span>
              <h3>Set Your Occasion</h3>
              <p>Pick where you're heading — college, party, formal dinner, or casual brunch — and select your vibe.</p>
            </div>

            <div className="step-card">
              <span>03</span>
              <h3>Get Curated Looks</h3>
              <p>Receive custom lookbooks styled instantly with color harmony and silhouette matching rationale.</p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CAMERA MODAL (PHOTO BOOTH - SCREEN 8)
      ================================================= */}
      {cameraOpen && (
        <div className="camera-modal-overlay">
          <div className="camera-modal-box">
            <h2>Live Camera Booth 📷</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Frame your outfit or clothing piece in good lighting
            </p>

            <div className="camera-video-container">
              <video ref={videoRef} autoPlay playsInline />
            </div>

            <div className="camera-modal-actions">
              <button
                type="button"
                className="camera-capture-btn"
                onClick={capturePhoto}
              >
                📸 Capture Photo
              </button>
              <button
                type="button"
                className="camera-close-btn"
                onClick={closeCamera}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

