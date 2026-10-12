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
  const [isAiUploading, setIsAiUploading] = useState(false);
  const [detectedAttributes, setDetectedAttributes] = useState(null);
  const [showManualFields, setShowManualFields] = useState(false);
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

    const cat = (item.category || "").toLowerCase();
    const type = (item.item_type || "").toLowerCase();

    if (selectedCategory === "Tops") {
      return ["shirt", "t-shirt", "top", "blouse", "upper", "tops", "sweater", "hoodie", "jacket", "cardigan"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Pants") {
      return ["jeans", "trousers", "skirt", "pants", "lower", "bottom", "bottoms", "shorts", "chinos"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Dresses") {
      return ["dress", "saree", "one_piece", "gown", "frock", "kurti", "lehenga"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Shoes") {
      return ["shoes", "footwear", "sneakers", "boots", "heels", "sandals", "loafers", "flats"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Bags") {
      return ["bags", "bag", "handbag", "backpack", "tote", "purse", "clutch"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Accessories") {
      return ["accessories", "accessory", "belt", "scarf", "hat", "cap", "sunglasses", "watch", "jewelry"].some(
        (t) => cat.includes(t) || type.includes(t)
      );
    }

    if (selectedCategory === "Others") return true;

    return true;
  };

  // =====================================================
  // AI ZERO-EFFORT UPLOAD: AUTO-DETECT ALL ATTRIBUTES
  // =====================================================
  const handleAiAutoUploadClothing = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setWardrobeMessage("");
    setDetectedAttributes(null);

    let imageFile = null;
    if (capturedImage) {
      imageFile = dataURLtoFile(capturedImage, "camera-photo.jpg");
    } else if (clothingImage) {
      imageFile = clothingImage;
    }

    if (!imageFile) {
      setWardrobeMessage("Please select or capture a clothing image first.");
      return;
    }

    setIsAiUploading(true);
    setWardrobeMessage("✨ AI analyzing garment colors, style, occasion & season...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append(
        "user_id",
        localStorage.getItem("userId") || "string@1234"
      );

      const response = await fetch(`${API}/wardrobe/ai-upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI analysis failed. Please try again."
        );
      }

      const attrs = data.attributes || data.item || {};
      setDetectedAttributes(attrs);
      setWardrobeMessage(
        `✨ Recognized & Saved: "${attrs.item_name || "Garment"}"`
      );

      // Refresh wardrobe items
      await fetchWardrobe();

      // Reset image inputs
      setClothingImage(null);
      setCapturedImage(null);
      setClothingName("");
      setClothingCategory("");
      setClothingColor("");
      setClothingOccasion("");
      setClothingStyle("");
      setClothingSeason("");

      // Smoothly close after displaying detection badges
      setTimeout(() => {
        setIsAiUploading(false);
        setShowWardrobeForm(false);
        setWardrobeMessage("");
        setDetectedAttributes(null);
      }, 3000);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("AI Wardrobe Upload error:", error);
      if (error.name === "AbortError") {
        setWardrobeMessage("Scan took too long to respond. Please try again with a photo.");
      } else {
        setWardrobeMessage(error.message || "Failed to analyze and save clothing.");
      }
      setIsAiUploading(false);
    }
  };

  // =====================================================
  // MANUAL CLOTHING UPLOAD (Alternative/Fallback)
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

      const extractController = new AbortController();
      const extractTimer = setTimeout(() => extractController.abort(), 12000);

      const extractResponse = await fetch(`${API}/extract-clothing`, {
        method: "POST",
        body: extractFormData,
        signal: extractController.signal,
      });

      clearTimeout(extractTimer);

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

          {/* ADD CLOTHING FORM (AI AUTO-RECOGNITION) */}
          {showWardrobeForm && (
            <div className="coming-soon-card ai-wardrobe-upload-card">
              <div className="ai-upload-header-strip">
                <span className="curated-badge-pill">✨ VISION AI AUTO-CATALOG</span>
                <h2>Add Clothes with Zero Effort</h2>
                <p>
                  Simply upload or snap a photo — our AI instantly recognizes the <strong>garment type, color, occasion, season & style</strong> and saves it directly to your wardrobe. No manual typing required!
                </p>
              </div>

              {/* PHOTO UPLOAD & PREVIEW SECTION */}
              <div className="ai-upload-dropzone-box">
                {clothingImage || capturedImage ? (
                  <div className="ai-upload-preview-wrap">
                    <div className="ai-upload-image-preview">
                      <img
                        src={capturedImage || URL.createObjectURL(clothingImage)}
                        alt="Garment Preview"
                      />
                      <button
                        type="button"
                        className="ai-upload-remove-img-btn"
                        onClick={() => {
                          setClothingImage(null);
                          setCapturedImage(null);
                          setDetectedAttributes(null);
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ai-upload-ready-text">
                      <p className="ai-upload-filename">
                        📷 {clothingImage ? clothingImage.name : "Live Camera Capture"}
                      </p>
                      <span className="ai-upload-ready-pill">✓ Photo ready for AI recognition</span>
                    </div>
                  </div>
                ) : (
                  <div className="ai-upload-placeholder">
                    <div className="ai-upload-icon-circle">👗</div>
                    <h3>Select or Snap a Garment Photo</h3>
                    <p>Supported: JPG, PNG, WEBP from your closet or live camera</p>

                    <div className="ai-upload-action-row">
                      <label className="ai-upload-file-label">
                        📁 Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setClothingImage(e.target.files[0]);
                              setCapturedImage(null);
                              setDetectedAttributes(null);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        className="ai-camera-snap-btn"
                        onClick={openCamera}
                      >
                        📷 Live Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AI DETECTED ATTRIBUTES PREVIEW BANNER (IF DETECTED) */}
              {detectedAttributes && (
                <div className="ai-detected-success-card">
                  <div className="ai-detected-title-row">
                    <span className="ai-detected-sparkle">✨</span>
                    <div>
                      <h4>AI Recognized Garment Attributes</h4>
                      <p>Saved automatically into your wardrobe collection!</p>
                    </div>
                  </div>

                  <div className="ai-detected-badges-grid">
                    <div className="ai-detected-badge-item">
                      <span>Garment</span>
                      <strong>{detectedAttributes.item_name || "Garment"}</strong>
                    </div>
                    <div className="ai-detected-badge-item">
                      <span>Category</span>
                      <strong>{detectedAttributes.category || "Top"}</strong>
                    </div>
                    <div className="ai-detected-badge-item">
                      <span>Color</span>
                      <strong>{detectedAttributes.color || "Classic"}</strong>
                    </div>
                    <div className="ai-detected-badge-item">
                      <span>Occasion</span>
                      <strong>{detectedAttributes.occasion || "Casual"}</strong>
                    </div>
                    <div className="ai-detected-badge-item">
                      <span>Season</span>
                      <strong>{detectedAttributes.season || "All Season"}</strong>
                    </div>
                    <div className="ai-detected-badge-item">
                      <span>Style</span>
                      <strong>{detectedAttributes.style || "Casual"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* PRIMARY AI ACTION BUTTON */}
              <div className="ai-upload-primary-actions">
                <button
                  type="button"
                  className="ai-auto-save-glow-btn"
                  disabled={isAiUploading || (!clothingImage && !capturedImage)}
                  onClick={handleAiAutoUploadClothing}
                >
                  {isAiUploading ? (
                    <span className="ai-pulse-text">✨ AI Scanning & Cataloging Garment...</span>
                  ) : (
                    <span>✨ AI Auto-Detect & Add to Wardrobe</span>
                  )}
                </button>

                <button
                  type="button"
                  className="feature-button"
                  style={{ opacity: 0.7 }}
                  onClick={() => {
                    setShowWardrobeForm(false);
                    setWardrobeMessage("");
                    setDetectedAttributes(null);
                    setClothingImage(null);
                    setCapturedImage(null);
                  }}
                >
                  Cancel
                </button>
              </div>

              {wardrobeMessage && (
                <div className="ai-upload-status-toast">
                  <p>{wardrobeMessage}</p>
                </div>
              )}

              {/* OPTIONAL MANUAL OVERRIDE ACCORDION */}
              <div className="ai-manual-override-wrap">
                <button
                  type="button"
                  className="ai-manual-toggle-btn"
                  onClick={() => setShowManualFields(!showManualFields)}
                >
                  {showManualFields
                    ? "▲ Hide manual fields (AI auto-detects everything)"
                    : "▼ Need to customize fields manually? (Optional)"}
                </button>

                {showManualFields && (
                  <form
                    className="recommendation-form ai-manual-form-grid"
                    onSubmit={handleAddClothing}
                    style={{ marginTop: "16px" }}
                  >
                    <div className="edit-form-group">
                      <label>Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive Linen Button-down Shirt"
                        value={clothingName}
                        onChange={(e) => setClothingName(e.target.value)}
                      />
                    </div>

                    <div className="edit-form-group">
                      <label>Category</label>
                      <select
                        value={clothingCategory}
                        onChange={(e) => setClothingCategory(e.target.value)}
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
                    </div>

                    <div className="edit-form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive Green"
                        value={clothingColor}
                        onChange={(e) => setClothingColor(e.target.value)}
                      />
                    </div>

                    <div className="edit-form-group">
                      <label>Occasion</label>
                      <select
                        value={clothingOccasion}
                        onChange={(e) => setClothingOccasion(e.target.value)}
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

                    <div className="edit-form-group">
                      <label>Style</label>
                      <select
                        value={clothingStyle}
                        onChange={(e) => setClothingStyle(e.target.value)}
                      >
                        <option value="">Select Style</option>
                        <option value="Casual">Casual</option>
                        <option value="Elegant">Elegant</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Trendy">Trendy</option>
                        <option value="Minimal">Minimal</option>
                      </select>
                    </div>

                    <div className="edit-form-group">
                      <label>Season</label>
                      <select
                        value={clothingSeason}
                        onChange={(e) => setClothingSeason(e.target.value)}
                      >
                        <option value="">Select Season</option>
                        <option value="Summer">Summer</option>
                        <option value="Winter">Winter</option>
                        <option value="Rainy">Rainy</option>
                        <option value="All Season">All Season</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="primary-pill-button"
                      style={{ marginTop: "12px", width: "100%" }}
                    >
                      Save with Custom Fields
                    </button>
                  </form>
                )}
              </div>
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
                    const params = new URLSearchParams({
                      user_id: userId,
                      occasion: selectedOccasion
                    });
                    if (selectedStyle) {
                      params.append("style", selectedStyle);
                    }

                    const response = await fetch(`${API}/recommend-outfit?${params.toString()}`);
                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.detail || "Failed to generate outfit.");
                    }

                    setRecommendedOutfit(data.outfit || []);
                    setRecommendationOccasion(data.occasion || selectedOccasion);
                    setRecommendationStyle(data.style || selectedStyle || "Curated Chic");
                    setAiRecommendation(
                      data.message || `Curated Look for ${selectedOccasion} ♡`
                    );
                    setRecommendationAnalysis(data.analysis || null);
                    setRecommendationColorPalette(data.color_palette || []);
                  } catch (error) {
                    console.error("Outfit recommendation error:", error);
                    setAiRecommendation(
                      error.message || "Something went wrong while generating your outfit."
                    );
                    setRecommendedOutfit([]);
                    setRecommendationAnalysis(null);
                    setRecommendationColorPalette([]);
                  } finally {
                    setIsGeneratingOutfit(false);
                  }
                }}
              >
                {isGeneratingOutfit ? "✨ Curating Outfit Set..." : "✨ Generate Outfit Set"}
              </button>
            </div>

            {/* COLUMN 2: TODAY'S LOOKBOOK */}
            <div className="recommendation-card-box">
              <h2>Today's Curated Set ♡</h2>

              {recommendedOutfit.length > 0 ? (
                <>
                  <div className="outfit-pieces-summary-bar">
                    {recommendedOutfit.map((item) => (
                      <span key={item._id}>
                        {item.outfit_role || "Piece"}: {item.item_name}
                      </span>
                    ))}
                  </div>

                  <div className="lookbook-collage">
                    {recommendedOutfit.map((item) => (
                      <div className="lookbook-item" key={item._id}>
                        <div className="lookbook-item-image-wrap">
                          <img src={`${API}${item.image}`} alt={item.item_name} />
                          {item.outfit_role && (
                            <span className="outfit-role-pill">{item.outfit_role}</span>
                          )}
                        </div>
                        <h4>{item.item_name}</h4>
                        <p className="lookbook-meta-tag">
                          {item.color && (
                            <span
                              className="color-dot"
                              style={{
                                backgroundColor: item.color.toLowerCase(),
                              }}
                            ></span>
                          )}
                          {item.color} • {item.category}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Suggestion if footwear is missing in user's wardrobe */}
                  {!recommendedOutfit.some((i) => i.outfit_role === "Footwear") && (
                    <div className="missing-piece-hint">
                      💡 <strong>Stylist Footwear Tip:</strong> Complete this {recommendationOccasion || selectedOccasion} set with clean white sneakers or classic loafers!
                    </div>
                  )}

                  <div
                    className="doodle-script-quote"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "20px",
                      fontSize: "1.3rem",
                    }}
                  >
                    Curated with love for you ♡
                  </div>
                </>
              ) : (
                <div className="lookbook-empty-state">
                  <img src="/fashion-assets/dress.png" alt="Fashion Inspiration" />
                  <p>
                    Select an occasion (e.g. College, Wedding, Party) on the left to see your coordinated Top, Bottom & Footwear look!
                  </p>
                </div>
              )}
            </div>

            {/* COLUMN 3: WHY THIS WORKS & DEEP ANALYSIS */}
            <div className="recommendation-card-box">
              <h2>Stylist Analysis & Breakdown ✨</h2>

              {/* 1. OCCASION COMPATIBILITY */}
              <div className="analysis-section-box">
                <div className="analysis-section-title">
                  <span className="analysis-icon">
                    {recommendationOccasion?.toLowerCase() === "wedding"
                      ? "💍"
                      : recommendationOccasion?.toLowerCase() === "college"
                      ? "🎓"
                      : recommendationOccasion?.toLowerCase() === "formal"
                      ? "💼"
                      : recommendationOccasion?.toLowerCase() === "party"
                      ? "🍸"
                      : "✨"}
                  </span>
                  <strong>
                    Why this works for {recommendationOccasion || selectedOccasion || "the Occasion"}
                  </strong>
                </div>
                <p className="analysis-section-text">
                  {recommendationAnalysis?.occasion_fit ||
                    `Tailored specifically for ${selectedOccasion || "your occasion"}. Perfectly matches the setting, social context, and required comfort.`}
                </p>
              </div>

              {/* 2. COLOR HARMONY & PALETTE */}
              <div className="analysis-section-box">
                <div className="analysis-section-title">
                  <span className="analysis-icon">🎨</span>
                  <strong>Color Analysis & Harmony</strong>
                </div>

                {recommendationColorPalette && recommendationColorPalette.length > 0 && (
                  <div className="color-palette-chips">
                    {recommendationColorPalette.map((col, idx) => (
                      <span key={idx} className="color-chip-pill">
                        <span
                          className="color-chip-swatch"
                          style={{ backgroundColor: col.toLowerCase() }}
                        ></span>
                        {col}
                      </span>
                    ))}
                  </div>
                )}

                <p className="analysis-section-text">
                  {recommendationAnalysis?.color_harmony ||
                    "Cohesive color tones create pleasing contrast between the upper and lower garments while grounding the entire silhouette."}
                </p>
              </div>

              {/* 3. SILHOUETTE & PROPORTIONS */}
              <div className="analysis-section-box">
                <div className="analysis-section-title">
                  <span className="analysis-icon">✂️</span>
                  <strong>Silhouette & Fit Balance</strong>
                </div>
                <p className="analysis-section-text">
                  {recommendationAnalysis?.style_notes ||
                    "Proportions balance relaxed ease with structured lines, creating an elongating and naturally flattering look."}
                </p>
              </div>

              {/* 4. STYLIST PRO-TIP */}
              <div className="analysis-section-box highlight-tip-box">
                <div className="analysis-section-title">
                  <span className="analysis-icon">💡</span>
                  <strong>Stylist Pro-Tip</strong>
                </div>
                <p className="analysis-section-text">
                  {recommendationAnalysis?.styling_tips ||
                    "Try a gentle front-tuck at the waistband and add minimalist accessories to elevate the look with effortless chic."}
                </p>
              </div>
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
          ABOUT US (HAUTE EDITORIAL ATELIER)
      ================================================= */}
      {activePage === "about" && (
        <div className="about-page">
          {/* ATELIER EDITORIAL HERO */}
          <div className="about-atelier-hero">
            <span className="curated-badge-pill">✨ HAUTE INTELLIGENCE & CIRCULAR ATELIER</span>
            <h1 className="about-hero-title">The Future of Personal Styling is Already in Your Closet</h1>
            <p className="about-hero-subtitle">
              Where multimodal computer vision meets high-fashion alchemy, mindful curation, and sustainable living.
            </p>
          </div>

          {/* EDITORIAL MANIFESTO QUOTE PLAQUE */}
          <div className="about-manifesto-quote-plaque">
            <span className="quote-mark-watermark">“</span>
            <blockquote>
              True elegance is not about acquiring endless garments. It is about understanding the geometry of silhouette, the harmony of shade, and breathing eternal runway life into the treasures you already possess.
            </blockquote>
            <div className="quote-manifesto-author">
              <span className="author-line"></span>
              <em>— The AI Stylist Atelier Manifesto</em>
            </div>
          </div>

          {/* ATELIER METRICS COUNTER GRID */}
          <div className="about-metrics-grid">
            <div className="about-metric-card">
              <h3>30+</h3>
              <p>Distinct Curated Looks from Just 10 Closet Pieces</p>
            </div>
            <div className="about-metric-card">
              <h3>100%</h3>
              <p>Vision AI Auto-Recognition (Zero Manual Typing)</p>
            </div>
            <div className="about-metric-card">
              <h3>98.4%</h3>
              <p>Occasion-Specific Color Harmony Precision</p>
            </div>
            <div className="about-metric-card">
              <h3>0 Waste</h3>
              <p>Circular Thrift & Pre-Loved Garment Community</p>
            </div>
          </div>

          {/* 3 CORE ATELIER PILLARS */}
          <div className="about-cards-strip">
            <div className="about-info-card">
              <div className="action-icon-circle">💎</div>
              <h2>Visionary Neural Wardrobe</h2>
              <p>
                Advanced Gemini multimodal vision deciphers garment cuts, chromatic palettes, textile drapes, and seasonal weights instantly from photos.
              </p>
              <span className="about-pillar-tag">AI Vision Architecture</span>
            </div>

            <div className="about-info-card">
              <div className="action-icon-circle">🌿</div>
              <h2>Circular Fashion Collective</h2>
              <p>
                Breathe renewed life into pre-loved treasures. Our circular thrift community lets you sell and exchange timeless pieces without contributing to textile landfills.
              </p>
              <span className="about-pillar-tag">Conscious Circularity</span>
            </div>

            <div className="about-info-card">
              <div className="action-icon-circle">🪞</div>
              <h2>Private Dressing Atelier</h2>
              <p>
                Personalized algorithmic pairing matrix cross-references your tops, bottoms, shoes, and jewelry for weddings, college, work, and evening galas.
              </p>
              <span className="about-pillar-tag">Couture Pairing Engine</span>
            </div>
          </div>

          {/* 3-STEP ATELIER JOURNEY */}
          <div className="about-journey-section">
            <div className="about-journey-header">
              <span className="curated-badge-pill">HOW IT WORKS</span>
              <h2>The Three-Step Atelier Experience</h2>
              <p>Effortless transformation from closet clutter to curated everyday runway confidence</p>
            </div>

            <div className="steps-container">
              <div className="step-card">
                <span className="step-number">01</span>
                <h3>Digital Archival</h3>
                <p>
                  Snap or upload any garment. Vision AI automatically detects category, shade, style, occasion, and season with zero manual typing required.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <h3>Occasion & Vibe Prompting</h3>
                <p>
                  Select where you are headed — college lectures, summer weddings, dinner dates, or office meetings — and your aesthetic mood.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <h3>Algorithmic Runway Curations</h3>
                <p>
                  Receive cohesive head-to-toe outfits complete with chromatic harmonies, stylist commentary, and missing-piece smart recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CTA BANNER */}
          <div className="about-cta-banner">
            <h2>Ready to Elevate Your Everyday Style?</h2>
            <p>Your wardrobe has dozens of hidden looks waiting to be discovered.</p>
            <div className="about-cta-buttons">
              <button
                type="button"
                className="primary-pill-button"
                onClick={() => setActivePage("wardrobe")}
              >
                👗 Explore My Wardrobe
              </button>
              <button
                type="button"
                className="add-item-pill-btn"
                style={{ background: "#ffffff", color: "var(--wine)" }}
                onClick={() => setActivePage("recommendation")}
              >
                ✨ Get Styled for an Occasion
              </button>
            </div>
            <span className="about-craft-signature">
              Crafted with passion for conscious style lovers worldwide ✦
            </span>
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

