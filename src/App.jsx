import { useState, useEffect } from "react";
import "./App.css";

import fashionImage from "./assets/fashion-ai.png";
import homeIllustration from "./assets/home-illustration.png";
import glowingBow from "./assets/glowing-bow-sticker.png";

import {
  DoodleSparkles,
  DoodleHanger,
  DoodleBow,
  DoodleHeart,
  DoodleSunglasses,
  DoodleRibbon,
  DoodleFloral,
  DoodlePerfume,
  DoodleDenim,
  DoodleMirror,
  DoodleLeaf,
  DoodleSwatches,
  CategoryDoodleIcon,
  FullSideDoodles,
} from "./FashionDoodles";
import { FASHION_WEB_IMAGES } from "./FashionImages";

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
  const [rememberMe, setRememberMe] = useState(true);
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
  const [outfitVariation, setOutfitVariation] = useState(0);
  const [totalVariations, setTotalVariations] = useState(1);
  const [isReGenerating, setIsReGenerating] = useState(false);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchStylistHistory = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`${API}/stylist/history?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendationHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error fetching stylist history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteStylistHistory = async (historyId) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${API}/stylist/history/${historyId}?user_id=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setRecommendationHistory((prev) => prev.filter((item) => item._id !== historyId));
      }
    } catch (err) {
      console.error("Error deleting stylist history item:", err);
    }
  };

  const handleRestoreLook = (historyItem) => {
    if (!historyItem) return;
    setRecommendedOutfit(historyItem.outfit || []);
    setRecommendationOccasion(historyItem.occasion || "");
    setSelectedOccasion(historyItem.occasion || "");
    if (historyItem.style) setSelectedStyle(historyItem.style);
    setRecommendationStyle(historyItem.style || "Curated Chic");
    setAiRecommendation(historyItem.headline || historyItem.message || `Curated Look for ${historyItem.occasion} ♡`);
    setRecommendationAnalysis(historyItem.analysis || null);
    setRecommendationColorPalette(historyItem.color_palette || []);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleGenerateOutfit = async (isVariation = false) => {
    if (!selectedOccasion) {
      setAiRecommendation("Please select an occasion first.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setAiRecommendation("Please log in again before generating an outfit.");
      return;
    }

    const nextVariation = isVariation ? outfitVariation + 1 : 0;

    try {
      if (isVariation) {
        setIsReGenerating(true);
      } else {
        setIsGeneratingOutfit(true);
      }

      const params = new URLSearchParams({
        user_id: userId,
        occasion: selectedOccasion,
        variation: nextVariation.toString()
      });
      if (selectedStyle) {
        params.append("style", selectedStyle);
      }
      if (isVariation && recommendedOutfit.length > 0) {
        const excludeIds = recommendedOutfit.map((i) => i._id).join(",");
        params.append("exclude_ids", excludeIds);
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
      setOutfitVariation(nextVariation);
      setTotalVariations(data.total_variations || 1);

      // Refresh stylist history immediately so newly curated look appears
      fetchStylistHistory();
    } catch (error) {
      console.error("Outfit recommendation error:", error);
      setAiRecommendation(
        error.message || "Something went wrong while generating your outfit."
      );
      if (!isVariation) {
        setRecommendedOutfit([]);
        setRecommendationAnalysis(null);
        setRecommendationColorPalette([]);
      }
    } finally {
      setIsGeneratingOutfit(false);
      setIsReGenerating(false);
    }
  };

  


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
    } catch {
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

  const categoryMatches = (item, selectedCategory) => {
    if (selectedCategory === "All") return true;

    const cat = (item.category || "").toLowerCase();
    const subCat = (item.sub_category || "").toLowerCase();
    const type = (item.item_type || "").toLowerCase();
    const name = (item.item_name || "").toLowerCase();

    const matchesAny = (keywords) =>
      keywords.some((t) => cat.includes(t) || subCat.includes(t) || type.includes(t) || name.includes(t));

    // 1. INDIAN & ETHNIC WEAR
    if (selectedCategory === "Indian & Ethnic Wear" || selectedCategory === "Indian Attire") {
      return cat === "indian & ethnic wear" || cat === "indian attire" || matchesAny([
        "saree", "sari", "half saree", "langa voni", "dhavani", "pattu pavadai", "lehenga", "ghagra", "chaniya", "anarkali", "kurti", "kurta", "salwar", "sherwani", "bandhgala", "nehru jacket", "modi vest", "achkan", "dhoti", "veshti", "mundu", "lungi", "sharara", "gharara", "dupatta", "chunni", "phulkari", "kanchipuram", "banarasi", "chanderi", "paithani", "chikankari", "kaftan", "caftan", "indo-western", "indo western", "kimono", "hanbok", "cheongsam", "qipao", "abaya", "dirndl", "ethnic"
      ]);
    }

    // 2. JEWELRY
    if (selectedCategory === "Jewelry" || selectedCategory === "Jewels") {
      return cat === "jewelry" || matchesAny([
        "jewel", "necklace", "choker", "earring", "jhumka", "jhumki", "chandbali", "bangle", "kada", "kangan", "bracelet", "ring", "anklet", "payal", "pajeb", "tikka", "maang tikka", "mathapatti", "borla", "passa", "nath", "nose ring", "mangalsutra", "haar", "hasli", "polki", "kundan", "diamond ring", "gold chain", "hathphool", "kamarbandh", "tagdi", "bichhiya", "toe ring", "brooch"
      ]);
    }

    // 3. FOOTWEAR
    if (selectedCategory === "Footwear" || selectedCategory === "Shoes & Heels" || selectedCategory === "Shoes") {
      return cat === "footwear" || cat === "shoes" || cat === "heels" || cat === "boots" || cat === "sandals" || matchesAny([
        "heel", "stilettos", "stiletto", "pumps", "wedge", "platform heel", "boots", "boot", "shoes", "shoe", "sneakers", "sneaker", "trainer", "loafers", "loafer", "flats", "flat", "sandals", "sandal", "slides", "flip-flop", "jutti", "mojari", "kolhapuri", "khussa", "oxford", "brogue", "derby", "mules", "espadrille", "slippers", "chappal"
      ]);
    }

    // 4. HATS & HEADWEAR
    if (selectedCategory === "Hats & Headwear" || selectedCategory === "Hats" || selectedCategory === "Caps") {
      return cat === "hats & headwear" || cat === "hats" || cat === "caps" || matchesAny([
        "hat", "hats", "cap", "caps", "fedora", "panama hat", "sun hat", "wide brim", "bucket hat", "boater", "cowboy hat", "bowler", "beret", "baseball cap", "snapback", "trucker", "beanie", "skull cap", "turban", "pagri", "pagdi", "safa", "pheta", "fascinator", "headwrap", "visor"
      ]);
    }

    // 5. BAGS & PURSES
    if (selectedCategory === "Bags & Purses" || selectedCategory === "Bags") {
      return cat === "bags & purses" || cat === "bags" || cat === "clutch" || matchesAny([
        "bag", "bags", "handbag", "backpack", "tote", "purse", "clutch", "potli", "batua", "hobo", "shoulder bag", "crossbody", "sling bag", "satchel", "fanny pack", "belt bag", "duffel", "duffle", "jhola", "minaudiere", "wristlet", "wallet"
      ]);
    }

    // 6. TOPS
    if (selectedCategory === "Tops") {
      return cat === "tops" || cat === "shirt" || cat === "t-shirt" || cat === "upper" || matchesAny([
        "shirt", "t-shirt", "tshirt", "top", "blouse", "upper", "tops", "sweater", "hoodie", "jacket", "cardigan", "polo", "crop top", "tank", "tee", "blazer", "coat", "sweatshirt", "corset", "bustier", "peplum", "vest", "waistcoat", "shrug", "poncho"
      ]);
    }

    // 7. PANTS & BOTTOMS
    if (selectedCategory === "Pants" || selectedCategory === "Bottoms") {
      return cat === "pants" || cat === "bottoms" || cat === "jeans" || cat === "trousers" || cat === "skirt" || cat === "shorts" || cat === "lower" || cat === "bottom" || matchesAny([
        "jeans", "trousers", "skirt", "pants", "pant", "lower", "bottom", "bottoms", "shorts", "short", "chinos", "denim", "cargo", "jogger", "flare", "slacks", "leggings", "jeggings", "palazzo", "culottes", "sweatpants"
      ]);
    }

    // 8. DRESSES & GOWNS
    if (selectedCategory === "Dresses & Gowns" || selectedCategory === "Gowns & Dresses" || selectedCategory === "Dresses") {
      return cat === "dresses & gowns" || cat === "gown" || cat === "dress" || matchesAny([
        "gown", "evening gown", "ballgown", "grand gown", "dress", "dresses", "frock", "jumpsuit", "romper", "one-piece", "one_piece", "slip dress", "cocktail dress", "maxi dress", "bodycon", "sundress"
      ]);
    }

    // 9. ACCESSORIES
    if (selectedCategory === "Accessories") {
      if (
        categoryMatches(item, "Jewelry") ||
        categoryMatches(item, "Hats & Headwear") ||
        categoryMatches(item, "Bags & Purses") ||
        categoryMatches(item, "Footwear")
      ) {
        return false;
      }
      return cat === "accessories" || matchesAny([
        "accessory", "accessories", "sunglasses", "sunglass", "glasses", "shades", "eyewear", "spectacles", "belt", "belts", "watch", "watches", "wristwatch", "scarf", "scarves", "shawl", "muffler", "stole", "bandana", "tie", "necktie", "bow tie", "bowtie", "pocket square", "cufflinks", "hair accessories", "headband", "scrunchie", "hair clip"
      ]);
    }

    // 10. OTHERS
    if (selectedCategory === "Others") {
      return (
        !categoryMatches(item, "Indian & Ethnic Wear") &&
        !categoryMatches(item, "Jewelry") &&
        !categoryMatches(item, "Footwear") &&
        !categoryMatches(item, "Hats & Headwear") &&
        !categoryMatches(item, "Bags & Purses") &&
        !categoryMatches(item, "Tops") &&
        !categoryMatches(item, "Pants") &&
        !categoryMatches(item, "Dresses & Gowns") &&
        !categoryMatches(item, "Accessories")
      );
    }

    return true;
  };

  // =====================================================
  // AI ZERO-EFFORT UPLOAD: AUTO-DETECT ALL ATTRIBUTES
  // =====================================================
  const handleAiAutoUploadClothing = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isAiUploading) return;
    setWardrobeMessage("");
    setDetectedAttributes(null);

    if (!clothingImage) {
      setWardrobeMessage("Please select a clothing image first.");
      return;
    }

    const imageFile = clothingImage;

    setIsAiUploading(true);
    setWardrobeMessage("✨ AI analyzing garment colors, style, occasion & season...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 28000);

    try {
      const activeUserId = localStorage.getItem("userId") || "string@1234";
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("user_id", activeUserId);

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

      // 1. Immediately inject the newly created item into React state (ZERO refresh needed!)
      if (data.item) {
        setWardrobeItems((prev) => [
          data.item,
          ...prev.filter((it) => it._id !== data.item._id),
        ]);
      }

      // 2. Automatically select 'All' category so the newly added garment is guaranteed visible
      setSelectedCategory("All");

      // 3. Clear inputs
      setClothingImage(null);
      setClothingName("");
      setClothingCategory("");
      setClothingColor("");
      setClothingOccasion("");
      setClothingStyle("");
      setClothingSeason("");

      // 4. Background re-fetch to sync with server
      fetchWardrobe();

      // 5. Automatically dismiss the upload form after 1.2s celebration so user sees the new item in their wardrobe
      setTimeout(() => {
        setIsAiUploading(false);
        setShowWardrobeForm(false);
        setWardrobeMessage("");
        setDetectedAttributes(null);
      }, 1200);
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
      if (!clothingImage) {
        setWardrobeMessage("Please select a clothing image.");
        return;
      }

      const imageFile = clothingImage;

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
      const userId = localStorage.getItem("userId") || "string@1234";

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
      `${API}/thrift?${params.toString()}`
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
        `${API}/thrift/saved?user_id=string@1234`
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
        `${API}/thrift/${listingId}/save?user_id=string@1234`,
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
        `${API}/thrift`,
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
  // FETCH WARDROBE & STYLIST ARCHIVE ON LOGIN / PAGE CHANGE
  // =====================================================
  useEffect(() => {
    if (isLoggedIn) {
      fetchWardrobe();
      fetchStylistHistory();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (activePage === "thrift") {
      loadThriftListings();
      loadSavedThriftListings();
    } else if (activePage === "recommendation" && isLoggedIn) {
      fetchStylistHistory();
    }
  }, [activePage, isLoggedIn]);


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
      <div className="app-container auth-wrapper">
        <div className="page auth-page">

          {/* LEFT HERO FASHION ARTWORK & BRANDING */}
          <section className="fashion-side">
            <div className="fashion-hero-frame">
              <img
                src={fashionImage}
                alt="AI Fashion Stylist"
                className="fashion-hero-artwork"
              />
            </div>
          </section>

          {/* RIGHT LOGIN SIDE */}
          <section className="login-side">
            <div className="login-card">
              {/* Top-Right Glowing Bow Sticker */}
              <div className="login-card-bow-container" aria-hidden="true">
                <img src={glowingBow} alt="" className="login-card-glow-bow" />
              </div>

              {/* Card Brand Header */}
              <div className="atelier-card-header">
                <div className="atelier-hanger-icon" aria-hidden="true">
                  <svg width="42" height="34" viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M25 15C25 10 25 5 29.5 5C32.5 5 34 7 34 9.5C34 12.5 31 14 26 15.5"
                      stroke="#f28da5"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25 16L8 26.5C6.5 27.4 6 29 7 30C7.8 31 9 31.5 10.5 31.5H39.5C41 31.5 42.2 31 43 30C44 29 43.5 27.4 42 26.5L25 16Z"
                      stroke="#f28da5"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      fill="rgba(242, 141, 165, 0.08)"
                    />
                    <path
                      d="M38 5C38 7.5 40.5 10 43 10C40.5 10 38 12.5 38 15C38 12.5 35.5 10 33 10C35.5 10 38 7.5 38 5Z"
                      fill="#ffccd8"
                    />
                    <circle cx="44" cy="16" r="1.2" fill="#ffccd8" />
                    <circle cx="31" cy="7" r="1" fill="#ffccd8" />
                  </svg>
                </div>

                <h1 className="atelier-card-title" style={{ color: "#faecef" }}>
                  {!isRegistering ? "Welcome Back " : "Create Account "}
                  <span className="atelier-heart-glyph" style={{ color: "#f8cbd6" }}>♡</span>
                </h1>
                <p className="atelier-pill-tag">PRIVATE DRESSING ROOM &amp; ATELIER</p>
                <p className="atelier-card-subtitle">Your personal AI-powered styling experience awaits.</p>
              </div>

              {!isRegistering ? (
                <>
                  <form onSubmit={handleLogin} className="atelier-form">
                    <div className="atelier-input-group">
                      <span className="atelier-input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="atelier-input-group">
                      <span className="atelier-input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="atelier-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="atelier-options-row">
                      <label className="atelier-remember-me">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="atelier-checkbox-custom" />
                        <span>Remember Me</span>
                      </label>

                      <button
                        type="button"
                        className="atelier-forgot-btn"
                        onClick={() => alert("Password recovery coming soon")}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button type="submit" className="atelier-login-btn">
                      Login &rarr;
                    </button>
                  </form>

                  <div className="atelier-divider">
                    <span className="atelier-divider-line" />
                    <p className="atelier-divider-text">Or continue with</p>
                    <span className="atelier-divider-line" />
                  </div>

                  <button
                    type="button"
                    className="atelier-google-btn"
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

                  <p className="atelier-footer-text">
                    New to AI Stylist?
                    <button
                      type="button"
                      className="atelier-link-btn"
                      onClick={() => {
                        setIsRegistering(true);
                        setMessage("");
                      }}
                    >
                      Create Account &rarr;
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <form onSubmit={handleRegister} className="atelier-form">
                    <div className="atelier-input-group">
                      <span className="atelier-input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="atelier-input-group">
                      <span className="atelier-input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="atelier-input-group">
                      <span className="atelier-input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="atelier-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <button type="submit" className="atelier-login-btn">
                      Create Account &rarr;
                    </button>

                    {message && (
                      <p className="atelier-message-badge">
                        {message}
                      </p>
                    )}
                  </form>

                  <div className="atelier-divider">
                    <span className="atelier-divider-line" />
                    <p className="atelier-divider-text">Or continue with</p>
                    <span className="atelier-divider-line" />
                  </div>

                  <button
                    type="button"
                    className="atelier-google-btn"
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

                  <p className="atelier-footer-text">
                    Already have an account?
                    <button
                      type="button"
                      className="atelier-link-btn"
                      onClick={() => {
                        setIsRegistering(false);
                        setMessage("");
                      }}
                    >
                      &larr; Back to Login
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
          {/* FLOATING WARDROBE VECTOR DOODLE STICKERS (SIDE GUTTERS - DENSE SCROLL) */}
          <div className="wardrobe-page-decorations page-side-doodles-container">
            <FullSideDoodles page="wardrobe" />
          </div>

          <div className="wardrobe-content-container page-content-container">
            {/* EDITORIAL HEADER (MATCHING FIGMA SCREEN 5) */}
            <div className="section-editorial-header">
            <div>
              <div className="header-badge-row">
                <span className="curated-badge-pill">✨ CLOSET ATELIER</span>
                <span className="wardrobe-count-pill">{wardrobeItems.length} Pieces</span>
              </div>
              <h1>My Wardrobe <span>♡</span></h1>
              <p>Your style collection, organized beautifully for effortless curation.</p>
              <div className="doodle-script-quote header-script-quote">
                "Curate • Coordinate • Cherish ♡"
              </div>
            </div>
            <button
              className="add-item-pill-btn"
              type="button"
              onClick={() => {
                setShowWardrobeForm(!showWardrobeForm);
                setWardrobeMessage("");
              }}
            >
              {showWardrobeForm ? "✕ Close Form" : "+ Add Garment"}
            </button>
          </div>

          {/* ADD CLOTHING FORM (AI AUTO-RECOGNITION) */}
          {showWardrobeForm && (
            <div className="coming-soon-card ai-wardrobe-upload-card">
              <div className="ai-upload-header-strip">
                <span className="curated-badge-pill">✨ VISION AI AUTO-CATALOG</span>
                <h2>Add Clothes with Zero Effort</h2>
                <p>
                  Simply upload a photo — our AI instantly recognizes the <strong>garment type, color, occasion, season & style</strong> and saves it directly to your wardrobe. No manual typing required!
                </p>
              </div>

              {/* PHOTO UPLOAD & PREVIEW SECTION */}
              <div className="ai-upload-dropzone-box">
                {clothingImage ? (
                  <div className="ai-upload-preview-wrap">
                    <div className="ai-upload-image-preview">
                      <img
                        src={URL.createObjectURL(clothingImage)}
                        alt="Garment Preview"
                      />
                      <button
                        type="button"
                        className="ai-upload-remove-img-btn"
                        onClick={() => {
                          setClothingImage(null);
                          setDetectedAttributes(null);
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="ai-upload-ready-text">
                      <p className="ai-upload-filename">
                        📁 {clothingImage.name}
                      </p>
                      <span className="ai-upload-ready-pill">✓ Photo ready for AI recognition</span>
                    </div>
                  </div>
                ) : (
                  <div className="ai-upload-placeholder">
                    <div className="ai-upload-icon-circle-decorated">
                      <DoodleHanger size={46} />
                      <DoodleSparkles className="ai-dropzone-sparkle-img" size={24} color="#d4af37" />
                    </div>
                    <h3>Select a Garment Photo</h3>
                    <p>Supported: JPG, PNG, WEBP from your closet</p>

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
                              setDetectedAttributes(null);
                            }
                          }}
                        />
                      </label>
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
                    {detectedAttributes.sub_category && (
                      <div className="ai-detected-badge-item">
                        <span>Type</span>
                        <strong>{detectedAttributes.sub_category}</strong>
                      </div>
                    )}
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
                  disabled={isAiUploading || !clothingImage}
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
                        <option value="Indian & Ethnic Wear">Indian & Ethnic Wear (Saree, Lehenga, Kurta, Sherwani, Anarkali, Dhoti)</option>
                        <option value="Jewelry">Jewelry & Jewels (Necklaces, Jhumkas, Bangles, Rings, Maang Tikka, Payal, Nath)</option>
                        <option value="Footwear">Footwear (Heels, Boots, Sneakers, Juttis, Mojaris, Loafers, Sandals)</option>
                        <option value="Hats & Headwear">Hats & Headwear (Fedoras, Caps, Beanies, Turbans, Berets)</option>
                        <option value="Bags & Purses">Bags & Purses (Handbags, Totes, Clutches, Potlis, Backpacks)</option>
                        <option value="Tops">Tops (Shirts, T-Shirts, Blouses, Crop Tops, Sweaters, Blazers, Jackets)</option>
                        <option value="Pants">Pants & Bottoms (Jeans, Trousers, Skirts, Shorts, Palazzos)</option>
                        <option value="Dresses & Gowns">Dresses & Gowns (Evening Gowns, Maxi Dresses, Jumpsuits)</option>
                        <option value="Accessories">Accessories (Sunglasses, Belts, Watches, Scarves, Hair Accessories)</option>
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

          {/* CATEGORY TABS WITH VECTOR DOODLE ICONS */}
          <div className="category-tabs">
            {[
              "All",
              "Indian & Ethnic Wear",
              "Jewelry",
              "Footwear",
              "Hats & Headwear",
              "Bags & Purses",
              "Tops",
              "Pants",
              "Dresses & Gowns",
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
                <CategoryDoodleIcon category={category} size={18} />
                <span>{category}</span>
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
                    if (clothingSearch && !item.item_name?.toLowerCase().includes(clothingSearch.toLowerCase())) return false;
                    if (filterOccasion !== "All" && item.occasion !== filterOccasion) return false;
                    if (filterSeason !== "All" && item.season !== filterSeason) return false;
                    return categoryMatches(item, selectedCategory);
                  })
                  .sort((a, b) => {
                    const diff = new Date(b.created_at || 0) - new Date(a.created_at || 0);
                    return sortOrder === "recent" ? diff : -diff;
                  })
                  .map((item) => (
                    <div className="clothes-card" key={item._id}>
                      <div className="clothes-card-image">
                        {item.image ? (
                          <img
                            src={`${API}${item.image}`}
                            alt={item.item_name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        ) : (
                          <span>👗</span>
                        )}
                      </div>

                      <div className="clothes-card-info">
                        <h3>{item.item_name}</h3>
                        <p className="clothes-card-category">
                          {item.sub_category && item.sub_category.toLowerCase() !== (item.category || "").toLowerCase()
                            ? `${item.category} • ${item.sub_category}`
                            : item.category}
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
                <div className="wardrobe-empty-state-card">
                  <div className="empty-state-art-composition">
                    <img
                      src={FASHION_WEB_IMAGES.wardrobeEmpty}
                      alt="Curated Wardrobe Collection"
                      className="empty-art-photo"
                    />
                    <DoodleHanger className="empty-art-hanger-svg" size={54} />
                    <DoodleSparkles className="empty-art-sparkles-svg" size={34} color="#d4af37" />
                    <DoodleBow className="empty-art-bow-svg" size={42} />
                  </div>
                  <h3>Your {selectedCategory === "All" ? "Wardrobe" : selectedCategory} is Ready for Style! ♡</h3>
                  <div className="doodle-script-quote empty-art-quote">
                    "A curated wardrobe is a love letter to yourself"
                  </div>
                  <p className="empty-state-guide">
                    Upload or snap garment photos — our Vision AI recognizes categories, shades, occasion and season automatically!
                  </p>
                  <button
                    type="button"
                    className="primary-pill-button empty-add-btn"
                    onClick={() => setShowWardrobeForm(true)}
                  >
                    ✨ + Add Garment with AI
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      )}

      {/* =================================================
          EDIT CLOTHING
      ================================================= */}
      {activePage === "edit" && editingItem && (
        <div className="edit-page">
          {/* EDIT PAGE VECTOR DOODLES (SIDE GUTTERS - DENSE SCROLL) */}
          <div className="edit-page-decorations page-side-doodles-container">
            <FullSideDoodles page="edit" />
          </div>

          <div className="edit-content-container page-content-container">
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
            <h1>Edit Clothing <span>♡</span></h1>

            <p className="edit-page-subtitle">
              Update the details of your clothing item
            </p>

            <div className="edit-atelier-preview-card">
              <div className="edit-preview-polaroid">
                {editingItem.image ? (
                  <img
                    src={`${API}${editingItem.image}`}
                    alt={editingItem.item_name}
                    className="edit-polaroid-img"
                  />
                ) : (
                  <div className="edit-polaroid-placeholder">
                    <img
                      src={FASHION_WEB_IMAGES.editAtelier}
                      alt="Atelier Moodboard"
                      className="edit-polaroid-img"
                    />
                  </div>
                )}
                <DoodleHeart className="edit-polaroid-pin" size={24} color="#d4af37" />
              </div>
              <div className="edit-atelier-note">
                <span className="curated-badge-pill">✂️ ATELIER CUSTOMIZATION</span>
                <h3>{editingItem.item_name || "Garment Details"}</h3>
                <div className="doodle-script-quote" style={{ fontSize: "1.3rem", margin: "4px 0" }}>
                  Refining your signature style silhouette ♡
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {editingItem.category} • {editingItem.color} • {editingItem.occasion}
                </p>
              </div>
            </div>

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
                  <option value="Indian & Ethnic Wear">Indian & Ethnic Wear (Saree, Lehenga, Kurta, Sherwani, Anarkali, Dhoti)</option>
                  <option value="Jewelry">Jewelry & Jewels (Necklaces, Jhumkas, Bangles, Rings, Maang Tikka, Payal, Nath)</option>
                  <option value="Footwear">Footwear (Heels, Boots, Sneakers, Juttis, Mojaris, Loafers, Sandals)</option>
                  <option value="Hats & Headwear">Hats & Headwear (Fedoras, Caps, Beanies, Turbans, Berets)</option>
                  <option value="Bags & Purses">Bags & Purses (Handbags, Totes, Clutches, Potlis, Backpacks)</option>
                  <option value="Tops">Tops (Shirts, T-Shirts, Blouses, Crop Tops, Sweaters, Blazers, Jackets)</option>
                  <option value="Pants">Pants & Bottoms (Jeans, Trousers, Skirts, Shorts, Palazzos)</option>
                  <option value="Dresses & Gowns">Dresses & Gowns (Evening Gowns, Maxi Dresses, Jumpsuits)</option>
                  <option value="Accessories">Accessories (Sunglasses, Belts, Watches, Scarves, Hair Accessories)</option>
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
        </div>
      )}


      {/* =================================================
          AI STYLIST (OUTFIT RECOMMENDATION - SCREEN 7)
      ================================================= */}
      {activePage === "recommendation" && (
        <div className="recommendation-page">
          {/* FLOATING AMBIENT VECTOR DOODLES (SIDE GUTTERS - DENSE SCROLL) */}
          <div className="recommendation-page-decorations page-side-doodles-container">
            <FullSideDoodles page="recommendation" />
          </div>

          <div className="recommendation-content-container page-content-container">
            <div className="section-editorial-header">
            <div>
              <div className="header-badge-row">
                <span className="curated-badge-pill">✨ COUTURE ALCHEMY</span>
              </div>
              <h1>AI Stylist Recommendations <span>♡</span></h1>
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
                className="primary-pill-button outfit-generate-btn"
                disabled={isGeneratingOutfit || isReGenerating}
                onClick={() => handleGenerateOutfit(false)}
              >
                {isGeneratingOutfit ? "✨ Curating Outfit Set..." : "✨ Generate Outfit Set"}
              </button>
              {aiRecommendation && (
                <p style={{ marginTop: "12px", color: "var(--wine, #732d4a)", fontSize: "0.9rem", textAlign: "center" }}>
                  {aiRecommendation}
                </p>
              )}
            </div>

            {/* COLUMN 2: TODAY'S LOOKBOOK */}
            <div className="recommendation-card-box">
              <h2>
                Today's Curated Set ♡
                {recommendationStyle && (
                  <span style={{ fontSize: "0.85rem", opacity: 0.8, marginLeft: "8px", fontWeight: "normal" }}>
                    • {recommendationStyle}
                  </span>
                )}
              </h2>

              {recommendedOutfit.length > 0 ? (
                <>
                  {/* RE-GENERATE & ALTERNATIVE VARIATION ACTION BAR */}
                  <div className="lookbook-actions-panel">
                    <div className="outfit-variation-badge">
                      <span>✨</span> Look #{outfitVariation + 1} {totalVariations > 1 ? `of ${totalVariations}` : ""}
                    </div>
                    <button
                      type="button"
                      className={`regenerate-outfit-btn ${isReGenerating ? "loading" : ""}`}
                      disabled={isReGenerating || isGeneratingOutfit}
                      onClick={() => handleGenerateOutfit(true)}
                      title="Curate an alternative outfit combination for this occasion"
                    >
                      <span className="spin-icon">🔄</span>
                      {isReGenerating ? "Curating New Look..." : "Re-generate Outfit"}
                    </button>
                  </div>

                  <div style={{ textAlign: "center", margin: "6px 0 12px" }}>
                    <DoodleSwatches className="lookbook-swatches-decor" size={54} />
                  </div>

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
                          <img
                            src={`${API}${item.image}`}
                            alt={item.item_name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
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
                <div className="lookbook-empty-moodboard">
                  <div className="lookbook-moodboard-art">
                    <img
                      src={FASHION_WEB_IMAGES.recommendationMoodboard}
                      alt="Stylist Lookbook Inspiration"
                      className="lookbook-muse-photo"
                    />
                    <DoodleSparkles className="lookbook-sparkles-doodle" size={36} color="#d4af37" />
                    <DoodleBow className="lookbook-bow-doodle" size={44} />
                  </div>
                  <h3>Your Daily Runway Awaits ♡</h3>
                  <div className="doodle-script-quote" style={{ fontSize: "1.35rem", margin: "6px 0 10px" }}>
                    "Curated specifically from pieces in your wardrobe"
                  </div>
                  <p className="lookbook-empty-sub">
                    Select your occasion (e.g. College, Party, Wedding, Formal) and style vibe on the left, then click <strong>Generate Outfit Set</strong> to reveal your head-to-toe coordinated look!
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

          {/* =================================================
              STYLIST LOOKBOOK ARCHIVE (PREVIOUS RECOMMENDATIONS)
          ================================================= */}
          <div className="stylist-history-section">
            <div className="stylist-history-header">
              <div>
                <h2>✦ Stylist Lookbook Archive</h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Your personal history of previous AI-curated outfits and styling breakdowns.
                </p>
              </div>
              {recommendationHistory.length > 0 && (
                <span className="stylist-pill-badge" style={{ margin: 0 }}>
                  {recommendationHistory.length} Saved Look{recommendationHistory.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoadingHistory ? (
              <div className="history-empty-box">
                <span>✨ Loading your curated lookbook archive...</span>
              </div>
            ) : recommendationHistory.length > 0 ? (
              <div className="stylist-history-grid">
                {recommendationHistory.map((item) => (
                  <div className="stylist-history-card" key={item._id}>
                    <div className="stylist-history-card-top">
                      <span className="history-occ-tag">
                        {item.occasion?.toLowerCase() === "wedding"
                          ? "💍 "
                          : item.occasion?.toLowerCase() === "college"
                          ? "🎓 "
                          : item.occasion?.toLowerCase() === "formal"
                          ? "💼 "
                          : item.occasion?.toLowerCase() === "party"
                          ? "🍸 "
                          : "✨ "}
                        {item.occasion}
                      </span>
                      <span className="history-time-tag">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Recent"}
                      </span>
                    </div>

                    <div className="stylist-history-thumbnails">
                      {(item.outfit || []).map((piece, pIdx) => (
                        <div className="stylist-history-thumb" key={pIdx}>
                          {piece.image ? (
                            <img
                              src={`${API}${piece.image}`}
                              alt={piece.item_name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                          ) : (
                            <span>👗</span>
                          )}
                          {piece.outfit_role && (
                            <span className="stylist-history-thumb-role">
                              {piece.outfit_role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="stylist-history-card-headline">
                      {item.headline || `Curated Look for ${item.occasion} ♡`}
                    </div>

                    <div className="stylist-history-card-snippet">
                      {item.analysis?.occasion_fit ? (
                        item.analysis.occasion_fit.length > 115
                          ? item.analysis.occasion_fit.substring(0, 115) + "..."
                          : item.analysis.occasion_fit
                      ) : (
                        `Coordinated ${item.occasion} outfit set curated with harmonious color palette and balanced silhouette.`
                      )}
                    </div>

                    <div className="stylist-history-card-actions">
                      <button
                        type="button"
                        className="restore-look-btn"
                        onClick={() => handleRestoreLook(item)}
                      >
                        ✦ View & Wear Look
                      </button>
                      <button
                        type="button"
                        className="delete-look-btn"
                        title="Remove from history"
                        onClick={() => handleDeleteStylistHistory(item._id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-empty-showcase">
                <div className="history-empty-art">
                  <img
                    src={FASHION_WEB_IMAGES.archiveJournal}
                    alt="Styling Journals"
                    className="history-books-photo"
                  />
                  <DoodleHeart className="history-heart-img" size={32} color="#d98ca8" />
                  <DoodleSparkles className="history-sparkle-img" size={28} color="#d4af37" />
                </div>
                <h4>Your Digital Style Archive is Ready ♡</h4>
                <p>Generate looks above to start building your personalized fashion lookbook collection!</p>
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
          {/* THRIFT VECTOR DOODLES (SIDE GUTTERS - DENSE SCROLL) */}
          <div className="thrift-page-decorations page-side-doodles-container">
            <FullSideDoodles page="thrift" />
          </div>

          <div className="thrift-content-container page-content-container">
            <div className="section-editorial-header">
            <div>
              <div className="header-badge-row">
                <span className="curated-badge-pill">🌿 CIRCULAR ATELIER</span>
              </div>
              <h1>Thrift Store <span>♡</span></h1>
              <p>Give pre-loved pieces a second story through circular fashion.</p>
            </div>
            <div className="doodle-script-quote" style={{ fontSize: "1.35rem" }}>
              Reduce • Reuse • Reimagine ♡
            </div>
          </div>

          {/* CIRCULAR FASHION HERO ATELIER BANNER */}
          <div className="thrift-atelier-banner">
            <div className="thrift-banner-text">
              <span className="curated-badge-pill">🌿 100% CIRCULAR FASHION ATELIER</span>
              <h2>Give Loved Clothes a Second Story</h2>
              <p>
                Discover curated pre-loved garments and give your own closet gems a second journey. Circular fashion honors quality, reduces waste, and protects our planet.
              </p>
              <div className="thrift-banner-quote doodle-script-quote">
                "Reduce • Re-wear • Reimagine ♡"
              </div>
            </div>
            <div className="thrift-banner-art">
              <img
                src={FASHION_WEB_IMAGES.thriftBanner}
                alt="Circular Sustainable Fashion"
                className="thrift-banner-photo"
              />
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
                <div className="thrift-empty-state-showcase">
                  <div className="thrift-empty-art">
                    <img
                      src={FASHION_WEB_IMAGES.thriftEmpty}
                      alt="Vintage Thrift Boutique"
                      className="thrift-empty-photo"
                    />
                    <DoodleSparkles className="thrift-empty-flowers" size={32} color="#d4af37" />
                    <DoodleHeart className="thrift-empty-quote" size={34} color="#d98ca8" />
                  </div>
                  <h3>No Listings Found in this Category</h3>
                  <div className="doodle-script-quote" style={{ fontSize: "1.3rem", margin: "6px 0 10px" }}>
                    "Every timeless piece deserves another adventure ♡"
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "440px", margin: "0 auto" }}>
                    Be the first to list a piece in this category for circular fashion lovers!
                  </p>
                  <button
                    type="button"
                    className="primary-pill-button"
                    style={{ width: "auto", margin: "18px auto 0", padding: "12px 28px" }}
                    onClick={() => setThriftPage("list")}
                  >
                    ✨ + Sell or Exchange an Item
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
                  className="primary-pill-button thrift-publish-btn"
                  onClick={handleCreateThriftListing}
                >
                  ✨ Add to Thrift Market
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
                <div className="thrift-saved-empty-showcase">
                  <DoodleSunglasses className="thrift-saved-glasses" size={64} />
                  <DoodleHeart className="thrift-saved-hearts" size={44} color="#d98ca8" />
                  <h3>Your Pre-Loved Wishlist is Empty ♡</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "440px", margin: "0 auto" }}>
                    Browse listings and tap "♡ Save Item" on pieces you love to build your dream thrift wishlist!
                  </p>
                  <button
                    type="button"
                    className="primary-pill-button"
                    style={{ width: "auto", margin: "18px auto 0", padding: "12px 28px" }}
                    onClick={() => setThriftPage("browse")}
                  >
                    ← Browse Thrift Collection
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
        </div>
      )}

      {/* =================================================
          ABOUT US (HAUTE EDITORIAL ATELIER)
      ================================================= */}
      {activePage === "about" && (
        <div className="about-page">
          {/* ABOUT US VECTOR DOODLES (SIDE GUTTERS - DENSE SCROLL) */}
          <div className="about-page-decorations page-side-doodles-container">
            <FullSideDoodles page="about" />
          </div>

          <div className="about-content-container page-content-container">
            {/* ATELIER EDITORIAL HERO */}
            <div className="about-atelier-hero">
            <div>
              <span className="curated-badge-pill">✨ HAUTE INTELLIGENCE & CIRCULAR ATELIER</span>
              <h1 className="about-hero-title">The Future of Personal Styling is Already in Your Closet</h1>
              <p className="about-hero-subtitle">
                Where multimodal computer vision meets high-fashion alchemy, mindful curation, and sustainable living.
              </p>
            </div>
            <div className="about-hero-art-showcase">
              <img
                src="/fashion-assets/girl.png"
                alt="Anime Haute Couture Muse"
                className="about-muse-photo"
              />
              <DoodleSparkles className="about-decor-sparkles" size={38} color="#d4af37" />
              <DoodleRibbon className="about-decor-ribbon" size={68} />
              <DoodleBow className="about-decor-frames" size={48} />
              <div className="about-art-quote doodle-script-quote">
                Where Vision AI meets Haute Couture ♡
              </div>
            </div>
          </div>

          {/* EDITORIAL MANIFESTO QUOTE PLAQUE */}
          <div className="about-manifesto-quote-plaque">
            <DoodleFloral className="about-manifesto-corner-floral" size={60} />
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
              <div className="about-pillar-icon-box">
                <DoodleSwatches size={38} />
                <DoodleSparkles className="about-pillar-sparkle" size={22} color="#d4af37" />
              </div>
              <h2>Visionary Neural Wardrobe</h2>
              <p>
                Advanced Gemini multimodal vision deciphers garment cuts, chromatic palettes, textile drapes, and seasonal weights instantly from photos.
              </p>
              <span className="about-pillar-tag">AI Vision Architecture</span>
            </div>

            <div className="about-info-card">
              <div className="about-pillar-icon-box">
                <DoodleDenim size={36} />
                <DoodleLeaf className="about-pillar-leaf" size={24} />
              </div>
              <h2>Circular Fashion Collective</h2>
              <p>
                Breathe renewed life into pre-loved treasures. Our circular thrift community lets you sell and exchange timeless pieces without contributing to textile landfills.
              </p>
              <span className="about-pillar-tag">Conscious Circularity</span>
            </div>

            <div className="about-info-card">
              <div className="about-pillar-icon-box">
                <DoodleMirror size={36} />
                <DoodlePerfume className="about-pillar-perfume" size={26} />
              </div>
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
                <DoodleHanger size={36} className="about-step-asset-img" />
                <span className="step-number">01</span>
                <h3>Digital Archival</h3>
                <p>
                  Snap or upload any garment. Vision AI automatically detects category, shade, style, occasion, and season with zero manual typing required.
                </p>
              </div>

              <div className="step-card">
                <DoodleSwatches size={36} className="about-step-asset-img" />
                <span className="step-number">02</span>
                <h3>Occasion & Vibe Prompting</h3>
                <p>
                  Select where you are headed — college lectures, summer weddings, dinner dates, or office meetings — and your aesthetic mood.
                </p>
              </div>

              <div className="step-card">
                <DoodleBow size={36} className="about-step-asset-img" />
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
            <DoodleSparkles className="about-cta-sparkle-decor" size={44} color="#d4af37" />
            <DoodleBow className="about-cta-bow-decor" size={54} />
            <h2>Ready to Elevate Your Everyday Style?</h2>
            <p>Your wardrobe has dozens of hidden looks waiting to be discovered.</p>
            <div className="about-cta-buttons">
              <button
                type="button"
                className="cta-explore-wardrobe-btn"
                onClick={() => setActivePage("wardrobe")}
              >
                👗 Explore My Wardrobe
              </button>
              <button
                type="button"
                className="cta-styled-occasion-btn"
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
        </div>
      )}
    </div>
  );
}

export default App;

