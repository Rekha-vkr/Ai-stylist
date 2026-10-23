import React from "react";

// ==========================================================================
// CRYSTAL-CLEAR VECTOR FASHION DOODLES & ICONS (ZERO BLURRINESS)
// ==========================================================================

export const DoodleSparkles = ({ className = "", style = {}, size = 32, color = "#d4af37" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Large 4-point sparkle star */}
    <path
      d="M20 2C20 12 28 20 38 20C28 20 20 28 20 38C20 28 12 20 2 20C12 20 20 12 20 2Z"
      fill={color}
      opacity="0.92"
    />
    {/* Small accent star */}
    <path
      d="M32 4C32 7 35 10 38 10C35 10 32 13 32 16C32 13 29 10 26 10C29 10 32 7 32 4Z"
      fill="#f4d38c"
      opacity="0.8"
    />
    <circle cx="8" cy="32" r="2" fill={color} opacity="0.75" />
    <circle cx="34" cy="30" r="1.5" fill="#f4d38c" opacity="0.85" />
  </svg>
);

export const DoodleHanger = ({ className = "", style = {}, size = 50, stroke = "var(--wine, #732d4a)" }) => (
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 60 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Hanger Hook */}
    <path
      d="M30 18C30 14 30 6 36 6C40 6 42 9 42 12C42 16 38 18 31 20"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Triangle Body */}
    <path
      d="M30 20L6 32C4.5 32.8 4 34.5 5 36C5.8 37.2 7.2 38 8.8 38H51.2C52.8 38 54.2 37.2 55 36C56 34.5 55.5 32.8 54 32L30 20Z"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="rgba(217, 140, 168, 0.08)"
    />
    {/* Delicate bow on neck */}
    <path
      d="M26 21C24 19 23 23 27 23C30 23 30 19 33 21C35 23 37 19 34 19C31 19 29 23 26 21Z"
      fill="#d98ca8"
    />
  </svg>
);

export const DoodleBow = ({ className = "", style = {}, size = 44, color = "#d98ca8" }) => (
  <svg
    width={size}
    height={size * 0.75}
    viewBox="0 0 50 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Left loop */}
    <path
      d="M25 18C20 10 7 8 8 18C9 26 21 24 25 18Z"
      fill={color}
      stroke="var(--wine-dark, #5a2139)"
      strokeWidth="1.5"
    />
    {/* Right loop */}
    <path
      d="M25 18C30 10 43 8 42 18C41 26 29 24 25 18Z"
      fill={color}
      stroke="var(--wine-dark, #5a2139)"
      strokeWidth="1.5"
    />
    {/* Ribbon tails */}
    <path
      d="M22 21C18 28 14 34 10 36C12 33 16 28 20 23"
      stroke="var(--wine, #732d4a)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M28 21C32 28 36 34 40 36C38 33 34 28 30 23"
      stroke="var(--wine, #732d4a)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Center knot */}
    <ellipse cx="25" cy="18" rx="4" ry="4.5" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodleHeart = ({ className = "", style = {}, size = 32, color = "#d98ca8" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path
      d="M18 31C18 31 5 22.5 5 13C5 7.5 9.5 4 14 4C16.8 4 18 6 18 6C18 6 19.2 4 22 4C26.5 4 31 7.5 31 13C31 22.5 18 31 18 31Z"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2"
      fill={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Heart shine */}
    <path
      d="M9 11C9 8.5 11 6.5 13 6"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export const DoodleSunglasses = ({ className = "", style = {}, size = 50, stroke = "var(--wine, #732d4a)" }) => (
  <svg
    width={size}
    height={size * 0.45}
    viewBox="0 0 60 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Bridge */}
    <path d="M26 12C28 10 32 10 34 12" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    {/* Left Frame (Cat-eye) */}
    <path
      d="M4 8C12 6 24 10 24 16C24 22 14 24 7 20C2 17 2 11 4 8Z"
      fill="rgba(115, 45, 74, 0.22)"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Right Frame (Cat-eye) */}
    <path
      d="M56 8C48 6 36 10 36 16C36 22 46 24 53 20C58 17 58 11 56 8Z"
      fill="rgba(115, 45, 74, 0.22)"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Lens reflections */}
    <line x1="10" y1="11" x2="18" y2="19" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
    <line x1="42" y1="11" x2="50" y2="19" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
  </svg>
);

export const DoodleRibbon = ({ className = "", style = {}, size = 55 }) => (
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 60 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path
      d="M6 38C16 42 28 32 24 20C20 8 36 6 42 16C46 22 52 26 56 22"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M10 40C20 44 32 34 28 22C24 10 40 8 46 18"
      stroke="var(--rose, #d98ca8)"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />
  </svg>
);

export const DoodleFloral = ({ className = "", style = {}, size = 46 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Petals */}
    <ellipse cx="25" cy="15" rx="7" ry="11" fill="rgba(217, 140, 168, 0.35)" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    <ellipse cx="25" cy="35" rx="7" ry="11" fill="rgba(217, 140, 168, 0.35)" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    <ellipse cx="15" cy="25" rx="11" ry="7" fill="rgba(217, 140, 168, 0.35)" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    <ellipse cx="35" cy="25" rx="11" ry="7" fill="rgba(217, 140, 168, 0.35)" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    {/* Center */}
    <circle cx="25" cy="25" r="5" fill="#f4d38c" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    <circle cx="25" cy="25" r="2" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodlePerfume = ({ className = "", style = {}, size = 42 }) => (
  <svg
    width={size}
    height={size * 1.25}
    viewBox="0 0 40 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Spray nozzle */}
    <rect x="17" y="4" width="6" height="5" rx="1.5" fill="#d4af37" stroke="var(--wine, #732d4a)" strokeWidth="1.5" />
    <rect x="14" y="9" width="12" height="4" rx="1" fill="#f4d38c" stroke="var(--wine, #732d4a)" strokeWidth="1.5" />
    {/* Glass Bottle */}
    <rect
      x="8"
      y="13"
      width="24"
      height="32"
      rx="6"
      fill="rgba(217, 140, 168, 0.22)"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2"
    />
    {/* Label */}
    <rect x="12" y="22" width="16" height="14" rx="2" fill="#ffffff" stroke="var(--rose, #d98ca8)" strokeWidth="1" />
    <line x1="15" y1="27" x2="25" y2="27" stroke="var(--wine, #732d4a)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="31" x2="23" y2="31" stroke="var(--rose, #d98ca8)" strokeWidth="1" strokeLinecap="round" />
    {/* Spray mist dots */}
    <circle cx="29" cy="5" r="1" fill="#d4af37" opacity="0.8" />
    <circle cx="34" cy="3" r="1.5" fill="#d4af37" opacity="0.8" />
    <circle cx="37" cy="8" r="1" fill="#d4af37" opacity="0.7" />
  </svg>
);

export const DoodleHeels = ({ className = "", style = {}, size = 44 }) => (
  <svg
    width={size}
    height={size * 0.85}
    viewBox="0 0 50 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Stiletto heel */}
    <path d="M12 24L8 40H11L14 26" fill="var(--wine, #732d4a)" />
    {/* Sole curve and arch */}
    <path
      d="M10 24C16 25 24 28 32 36C38 38 46 38 48 37C45 34 38 28 34 22C30 16 22 18 10 24Z"
      fill="rgba(217, 140, 168, 0.35)"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Ankle strap */}
    <path d="M14 18C14 14 18 10 24 12" stroke="var(--wine, #732d4a)" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="24" cy="12" r="1.5" fill="#d4af37" />
  </svg>
);

export const DoodleDenim = ({ className = "", style = {}, size = 38 }) => (
  <svg
    width={size}
    height={size * 1.1}
    viewBox="0 0 40 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Waistband */}
    <path d="M8 8H32V12H8V8Z" fill="#3b5998" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    {/* Legs */}
    <path
      d="M8 12L10 40H17L20 22L23 40H30L32 12H8Z"
      fill="rgba(66, 103, 178, 0.28)"
      stroke="var(--wine, #732d4a)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Stitching */}
    <line x1="20" y1="12" x2="20" y2="20" stroke="#f4d38c" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M12 16C14 19 16 19 18 16" stroke="#f4d38c" strokeWidth="1" />
    <path d="M22 16C24 19 26 19 28 16" stroke="#f4d38c" strokeWidth="1" />
  </svg>
);

export const DoodleHandbag = ({ className = "", style = {}, size = 42 }) => (
  <svg
    width={size}
    height={size * 0.9}
    viewBox="0 0 46 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Handle arch */}
    <path
      d="M17 16C17 9 20 5 23 5C26 5 29 9 29 16"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Bag body */}
    <path
      d="M8 16L11 36H35L38 16H8Z"
      fill="rgba(217, 140, 168, 0.3)"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Flap */}
    <path
      d="M8 16L23 26L38 16"
      stroke="var(--wine, #732d4a)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Gold clasp */}
    <circle cx="23" cy="26" r="2.5" fill="#d4af37" stroke="var(--wine, #732d4a)" strokeWidth="1" />
  </svg>
);

export const DoodleMirror = ({ className = "", style = {}, size = 42 }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 40 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Oval Mirror */}
    <ellipse cx="20" cy="20" rx="15" ry="18" fill="rgba(235, 245, 255, 0.7)" stroke="#d4af37" strokeWidth="2.5" />
    <ellipse cx="20" cy="20" rx="12" ry="15" fill="none" stroke="rgba(217, 140, 168, 0.4)" strokeWidth="1" />
    {/* Stand */}
    <path d="M20 38V48" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 48H30" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
    {/* Reflection highlights */}
    <path d="M12 12C14 8 18 6 22 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DoodleLeaf = ({ className = "", style = {}, size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path
      d="M6 30C6 30 9 18 20 10C27 4 32 4 32 4C32 4 32 9 26 16C18 27 6 30 6 30Z"
      fill="rgba(120, 160, 120, 0.35)"
      stroke="#5d8a66"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9 27C14 21 21 15 30 6" stroke="#5d8a66" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M17 19L21 22" stroke="#5d8a66" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M22 14L26 16" stroke="#5d8a66" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const DoodleSwatches = ({ className = "", style = {}, size = 48 }) => (
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 54 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* 4 Fan Swatches */}
    <rect x="4" y="6" width="14" height="26" rx="2" fill="#732d4a" stroke="#ffffff" strokeWidth="1.5" transform="rotate(-15 4 6)" />
    <rect x="14" y="4" width="14" height="26" rx="2" fill="#d98ca8" stroke="#ffffff" strokeWidth="1.5" transform="rotate(-5 14 4)" />
    <rect x="25" y="4" width="14" height="26" rx="2" fill="#faecef" stroke="var(--border-light, #dcc3cd)" strokeWidth="1.5" transform="rotate(8 25 4)" />
    <rect x="36" y="8" width="14" height="26" rx="2" fill="#d4af37" stroke="#ffffff" strokeWidth="1.5" transform="rotate(22 36 8)" />
    {/* Pivot pin */}
    <circle cx="28" cy="32" r="3" fill="var(--wine, #732d4a)" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

export const DoodleQuoteSticker = ({ text = "Style is self-love ♡", className = "", style = {} }) => (
  <div className={`doodle-sticker-badge ${className}`} style={style}>
    <span className="sticker-pin">📌</span>
    <span className="sticker-text">{text}</span>
  </div>
);

// Category Icon Switcher for Tabs
export const CategoryDoodleIcon = ({ category, size = 18 }) => {
  switch (category) {
    case "Tops":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      );
    case "Pants":
      return <DoodleDenim size={size} />;
    case "Dresses & Gowns":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3c0 1.1.6 2.1 1.5 2.6L6 21c1.5.7 3.5 1 6 1s4.5-.3 6-1L13.5 7.6A3.01 3.01 0 0 0 15 5a3 3 0 0 0-3-3z" />
        </svg>
      );
    case "Indian & Ethnic Wear":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l3 5h5l-4 4 2 6-6-3-6 3 2-6-4-4h5z" fill="#d4af37" stroke="currentColor" />
        </svg>
      );
    case "Jewelry":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9z" fill="rgba(217, 140, 168, 0.2)" />
          <path d="M11 3L8 9l4 13 4-13-3-6" />
        </svg>
      );
    case "Footwear":
      return <DoodleHeels size={size * 1.2} />;
    case "Hats & Headwear":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 18h20M5 18a7 7 0 0 1 14 0" />
        </svg>
      );
    case "Bags & Purses":
      return <DoodleHandbag size={size * 1.1} />;
    case "Accessories":
      return <DoodleSunglasses size={size * 1.3} />;
    default:
      return <span style={{ fontSize: size * 0.85 }}>✨</span>;
  }
};

// ==========================================================================
// ADDITIONAL HIGH-FASHION VECTOR DOODLES (DRESSES, JEWELS, HATS & ATELIER)
// ==========================================================================

export const DoodleDress = ({ className = "", style = {}, size = 52, color = "#d98ca8" }) => (
  <svg
    width={size}
    height={size * 1.25}
    viewBox="0 0 44 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Straps & Bodice */}
    <path d="M16 4L17 14M28 4L27 14" stroke="var(--wine, #732d4a)" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15 14C19 16 25 16 29 14L30 24C27 25 17 25 14 24L15 14Z" fill={color} stroke="var(--wine, #732d4a)" strokeWidth="1.8" />
    {/* Waist Bow */}
    <ellipse cx="22" cy="24" rx="3" ry="2.5" fill="var(--wine, #732d4a)" />
    {/* Flared Skirt */}
    <path
      d="M15 24C12 36 6 46 4 50C12 52 32 52 40 50C38 46 32 36 29 24"
      fill="rgba(217, 140, 168, 0.35)"
      stroke="var(--wine, #732d4a)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Skirt pleats */}
    <path d="M22 26V49M16 28C14 36 12 44 11 49M28 28C30 36 32 44 33 49" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
  </svg>
);

export const DoodleHat = ({ className = "", style = {}, size = 50, stroke = "var(--wine, #732d4a)" }) => (
  <svg
    width={size}
    height={size * 0.55}
    viewBox="0 0 54 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Crown */}
    <path d="M17 18C17 9 20 5 27 5C34 5 37 9 37 18" fill="rgba(217, 140, 168, 0.3)" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    {/* Hat Ribbon */}
    <path d="M17 18H37" stroke="var(--wine-dark, #5a2139)" strokeWidth="3" />
    <path d="M37 18L43 23M37 18L41 25" stroke="var(--wine-dark, #5a2139)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Wide Brim with wavy couture curve */}
    <path d="M3 24C12 18 42 18 51 24C44 26 10 26 3 24Z" fill="#fbf0f4" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const DoodleLipstick = ({ className = "", style = {}, size = 42 }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 32 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Slanted bullet */}
    <path d="M11 16V8C11 8 13 4 19 6L21 16H11Z" fill="#c4335c" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    <line x1="13" y1="10" x2="15" y2="15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    {/* Gold inner collar */}
    <rect x="9" y="16" width="14" height="6" rx="1" fill="#d4af37" stroke="var(--wine, #732d4a)" strokeWidth="1.6" />
    {/* Case base */}
    <rect x="8" y="22" width="16" height="18" rx="2" fill="var(--wine, #732d4a)" stroke="var(--wine-dark, #5a2139)" strokeWidth="1.6" />
    <line x1="16" y1="24" x2="16" y2="38" stroke="#d98ca8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DoodleJewelry = ({ className = "", style = {}, size = 46 }) => (
  <svg
    width={size}
    height={size * 0.9}
    viewBox="0 0 46 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Chain */}
    <path d="M8 8C14 26 32 26 38 8" stroke="var(--wine, #732d4a)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 3" />
    {/* Diamond Pendant */}
    <path d="M23 20L28 26L23 34L18 26L23 20Z" fill="rgba(212, 175, 55, 0.4)" stroke="#d4af37" strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="18" y1="26" x2="28" y2="26" stroke="#d4af37" strokeWidth="1.4" />
    <circle cx="23" cy="20" r="1.5" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodleStar = ({ className = "", style = {}, size = 30, color = "#d4af37" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path
      d="M16 2L19.5 11.5L29 12.5L22 19L24 29L16 23.5L8 29L10 19L3 12.5L12.5 11.5L16 2Z"
      fill={color}
      stroke="var(--wine, #732d4a)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoodleCoffee = ({ className = "", style = {}, size = 42 }) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 36 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Cup */}
    <path d="M8 12L10 38C10 40 12 41 14 41H22C24 41 26 40 26 38L28 12H8Z" fill="#ffffff" stroke="var(--wine, #732d4a)" strokeWidth="1.8" />
    {/* Sleeve */}
    <path d="M9 20L27 20L26 32L10 32L9 20Z" fill="rgba(217, 140, 168, 0.3)" stroke="var(--wine, #732d4a)" strokeWidth="1.5" />
    <path d="M18 24C16.5 22 14.5 24 16 26L18 28L20 26C21.5 24 19.5 22 18 24Z" fill="var(--wine, #732d4a)" />
    {/* Lid */}
    <path d="M6 12C6 10 9 9 18 9C27 9 30 10 30 12H6Z" fill="#faecef" stroke="var(--wine, #732d4a)" strokeWidth="1.8" />
    <rect x="15" y="6" width="6" height="3" rx="1" fill="#d4af37" stroke="var(--wine, #732d4a)" strokeWidth="1.2" />
  </svg>
);

export const DoodleCamera = ({ className = "", style = {}, size = 46 }) => (
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 46 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    {/* Body */}
    <rect x="4" y="9" width="38" height="23" rx="5" fill="#fbf0f4" stroke="var(--wine, #732d4a)" strokeWidth="2" />
    {/* Top Prism */}
    <path d="M15 9L18 4H28L31 9" fill="rgba(217, 140, 168, 0.2)" stroke="var(--wine, #732d4a)" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Lens */}
    <circle cx="23" cy="20" r="7" fill="#ffffff" stroke="var(--wine, #732d4a)" strokeWidth="2" />
    <circle cx="23" cy="20" r="3.5" fill="var(--wine, #732d4a)" />
    {/* Flash & Button */}
    <circle cx="36" cy="14" r="2" fill="#d4af37" />
    <rect x="8" y="6" width="4" height="3" rx="1" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodleCrown = ({ className = "", style = {}, size = 44 }) => (
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 44 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path
      d="M5 26L8 10L16 19L22 6L28 19L36 10L39 26H5Z"
      fill="rgba(244, 211, 140, 0.35)"
      stroke="#d4af37"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" fill="#d4af37" />
    <circle cx="22" cy="4" r="2" fill="var(--wine, #732d4a)" />
    <circle cx="36" cy="8" r="2" fill="#d4af37" />
    <circle cx="15" cy="22" r="1.5" fill="var(--wine, #732d4a)" />
    <circle cx="22" cy="22" r="1.5" fill="#d4af37" />
    <circle cx="29" cy="22" r="1.5" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodleTape = ({ className = "", style = {}, size = 52, color = "#faecef" }) => (
  <svg
    width={size}
    height={size * 0.35}
    viewBox="0 0 60 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path d="M3 3L6 19L57 19L54 3L3 3Z" fill={color} stroke="var(--border-light, #dcc3cd)" strokeWidth="1.4" strokeDasharray="3 2" />
    <line x1="12" y1="8" x2="20" y2="8" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="26" y1="14" x2="36" y2="14" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="42" y1="8" x2="48" y2="8" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const DoodlePin = ({ className = "", style = {}, size = 38 }) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 44 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`fashion-svg-doodle ${className}`}
    style={style}
  >
    <path d="M4 14C4 8 10 4 16 4H36C40 4 42 7 42 10C42 13 40 16 36 16H8C5 16 4 15 4 14Z" stroke="#d4af37" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="2" y="10" width="8" height="8" rx="2" fill="var(--wine, #732d4a)" />
  </svg>
);

// ==========================================================================
// ANIMATED ANIME FASHION CHARACTERS & POLAROID STICKERS (SIDE GUTTERS)
// ==========================================================================

export const SideAnimeGirl = ({
  src,
  alt = "Fashion Anime Character",
  tag = "",
  style = {},
  animation = "anim-anime-float",
  size = 108,
  flip = false,
}) => (
  <div
    className={`page-side-anime-card ${animation}`}
    style={{ ...style, width: `${size}px` }}
  >
    <img
      src={src}
      alt={alt}
      className="side-anime-img"
      style={flip ? { transform: "scaleX(-1)" } : {}}
      loading="lazy"
    />
    {tag && <span className="side-anime-tag">{tag}</span>}
  </div>
);

export const SideStickerCard = ({
  src,
  alt = "Fashion Sticker",
  caption = "",
  style = {},
  animation = "anim-anime-sway",
  size = 115,
  rotation = 0,
}) => (
  <div
    className={`page-side-sticker-card ${animation}`}
    style={{ ...style, width: `${size}px`, transform: `rotate(${rotation}deg)` }}
  >
    <img src={src} alt={alt} className="side-sticker-img" loading="lazy" />
    {caption && <span className="side-sticker-caption">{caption}</span>}
  </div>
);

// ==========================================================================
// CURATED DESIGNER EDITORIAL VIGNETTES (SOPHISTICATED LUXURY FRONTEND)
// ==========================================================================

export const FullSideDoodles = ({ page = "wardrobe" }) => {
  if (page === "wardrobe") {
    return (
      <>
        {/* LEFT SIDE: 2 CURATED EDITORIAL VIGNETTES */}
        <div style={{ position: "absolute", top: "140px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-1.png"
            alt="Street Chic Anime Muse"
            tag="Street Chic ✦"
            size={102}
            animation="anim-anime-float"
          />
          <DoodleSparkles
            className="page-side-doodle anim-pulse"
            style={{ position: "absolute", top: "-15px", right: "-12px" }}
            size={22}
            color="#d4af37"
          />
        </div>

        <div style={{ position: "absolute", top: "900px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-4.png"
            alt="Atelier Knit Anime Muse"
            tag="Atelier Knit ♡"
            size={104}
            animation="anim-anime-sway"
          />
        </div>

        {/* RIGHT SIDE: 2 CURATED EDITORIAL VIGNETTES */}
        <div style={{ position: "absolute", top: "140px", right: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/magazine-cover.png"
            alt="Vogue Magazine Polaroid"
            caption="Vogue Mood ♡"
            size={108}
            rotation={5}
            animation="anim-anime-sway"
          />
          <DoodleBow
            className="page-side-doodle anim-drift"
            style={{ position: "absolute", bottom: "-14px", left: "-10px" }}
            size={36}
          />
        </div>

        <div style={{ position: "absolute", top: "900px", right: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/girl2.png"
            alt="Summer Muse Anime Girl"
            tag="Summer Muse ✨"
            size={94}
            animation="anim-anime-float"
          />
        </div>
      </>
    );
  }

  if (page === "recommendation") {
    return (
      <>
        {/* LEFT SIDE: 2 CURATED STYLIST VIGNETTES */}
        <div style={{ position: "absolute", top: "150px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-3.png"
            alt="Parisian Chic Muse"
            tag="Parisian Chic ☕"
            size={104}
            animation="anim-anime-float"
          />
          <DoodleSparkles
            className="page-side-doodle anim-pulse"
            style={{ position: "absolute", top: "-12px", right: "-10px" }}
            size={22}
            color="#d4af37"
          />
        </div>

        <div style={{ position: "absolute", top: "880px", left: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/fashion-sticker.png"
            alt="Couture Sticker"
            caption="Couture Glow ♡"
            size={108}
            rotation={-5}
            animation="anim-anime-sway"
          />
        </div>

        {/* RIGHT SIDE: 2 CURATED STYLIST VIGNETTES */}
        <div style={{ position: "absolute", top: "150px", right: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/magazine-cover.png"
            alt="Vogue Style Magazine"
            caption="Stylist Edit ♡"
            size={108}
            rotation={6}
            animation="anim-anime-sway"
          />
        </div>

        <div style={{ position: "absolute", top: "880px", right: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-2.png"
            alt="Evening Gala Anime Muse"
            tag="Evening Gala ♡"
            size={102}
            animation="anim-anime-float"
          />
          <DoodleHeart
            className="page-side-doodle anim-heart"
            style={{ position: "absolute", top: "-10px", left: "-8px" }}
            size={24}
            color="#d98ca8"
          />
        </div>
      </>
    );
  }

  if (page === "thrift") {
    return (
      <>
        {/* LEFT SIDE: 2 CURATED THRIFT VIGNETTES */}
        <div style={{ position: "absolute", top: "150px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-4.png"
            alt="Vintage Lover Muse"
            tag="Vintage Lover ♡"
            size={104}
            animation="anim-anime-float"
          />
          <DoodleLeaf
            className="page-side-doodle anim-drift"
            style={{ position: "absolute", top: "-14px", right: "-8px" }}
            size={32}
          />
        </div>

        <div style={{ position: "absolute", top: "900px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/girl2.png"
            alt="Circular Belle Muse"
            tag="Circular Belle 🌿"
            size={94}
            animation="anim-anime-sway"
          />
        </div>

        {/* RIGHT SIDE: 2 CURATED THRIFT VIGNETTES */}
        <div style={{ position: "absolute", top: "150px", right: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/magazine-cover.png"
            alt="Vogue Circular"
            caption="Pre-Loved Gem ♡"
            size={108}
            rotation={5}
            animation="anim-anime-sway"
          />
          <DoodleSparkles
            className="page-side-doodle anim-pulse"
            style={{ position: "absolute", bottom: "-10px", left: "-8px" }}
            size={22}
            color="#d4af37"
          />
        </div>

        <div style={{ position: "absolute", top: "900px", right: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-5.png"
            alt="Eco Aesthetic Muse"
            tag="Eco Aesthetic 🌸"
            size={98}
            animation="anim-anime-float"
          />
        </div>
      </>
    );
  }

  if (page === "about") {
    return (
      <>
        {/* LEFT SIDE: 2 RESTRAINED ATELIER VIGNETTES (COMPLEMENTS HERO ROSE MUSE) */}
        <div style={{ position: "absolute", top: "220px", left: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/magazine-cover.png"
            alt="Vogue Magazine Cover"
            caption="Atelier Vision ♡"
            size={105}
            rotation={-5}
            animation="anim-anime-sway"
          />
        </div>

        <div style={{ position: "absolute", top: "1050px", left: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/girl2.png"
            alt="Runway Muse Anime Character"
            tag="Runway Muse ✨"
            size={94}
            animation="anim-anime-float"
          />
        </div>

        {/* RIGHT SIDE: 2 RESTRAINED ATELIER VIGNETTES */}
        <div style={{ position: "absolute", top: "220px", right: "1.8%" }}>
          <SideAnimeGirl
            src="/fashion-assets/fashion-girl-1.png"
            alt="Future Fashion Anime Muse"
            tag="Future Fashion ✦"
            size={100}
            animation="anim-anime-float"
          />
          <DoodleSparkles
            className="page-side-doodle anim-pulse"
            style={{ position: "absolute", top: "-12px", right: "-8px" }}
            size={22}
            color="#d4af37"
          />
        </div>

        <div style={{ position: "absolute", top: "1050px", right: "1.8%" }}>
          <SideStickerCard
            src="/fashion-assets/fashion-sticker.png"
            alt="Good Vibes Sticker"
            caption="Good Vibes ♡"
            size={108}
            rotation={5}
            animation="anim-anime-sway"
          />
        </div>
      </>
    );
  }

  // Edit Clothing Page: Minimal & Focused
  return (
    <>
      <div style={{ position: "absolute", top: "180px", left: "2%" }}>
        <SideAnimeGirl
          src="/fashion-assets/fashion-girl-4.png"
          alt="Design Atelier Anime Muse"
          tag="Design Atelier ♡"
          size={100}
          animation="anim-anime-float"
        />
      </div>

      <div style={{ position: "absolute", top: "180px", right: "2%" }}>
        <SideStickerCard
          src="/fashion-assets/magazine-cover.png"
          alt="Curated Magazine Cover"
          caption="Curated Details ♡"
          size={105}
          rotation={5}
          animation="anim-anime-sway"
        />
      </div>
    </>
  );
};
