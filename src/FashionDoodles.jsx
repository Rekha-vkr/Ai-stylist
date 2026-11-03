// ==========================================================================
// CRYSTAL-CLEAR VECTOR FASHION DOODLES & ICONS (ZERO BLURRINESS)
// ==========================================================================

export const DoodleSparkles = ({ className = "", style = {}, size = 32, color = "#d4af37" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.75} viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.45} viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.85} viewBox="0 0 50 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.9} viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.3} viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.7} viewBox="0 0 54 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.25} viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.55} viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.3} viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.9} viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
    {/* Chain */}
    <path d="M8 8C14 26 32 26 38 8" stroke="var(--wine, #732d4a)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 3" />
    {/* Diamond Pendant */}
    <path d="M23 20L28 26L23 34L18 26L23 20Z" fill="rgba(212, 175, 55, 0.4)" stroke="#d4af37" strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="18" y1="26" x2="28" y2="26" stroke="#d4af37" strokeWidth="1.4" />
    <circle cx="23" cy="20" r="1.5" fill="var(--wine, #732d4a)" />
  </svg>
);

export const DoodleStar = ({ className = "", style = {}, size = 30, color = "#d4af37" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 1.2} viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.8} viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.7} viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
  <svg width={size} height={size * 0.35} viewBox="0 0 60 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
    <path d="M3 3L6 19L57 19L54 3L3 3Z" fill={color} stroke="var(--border-light, #dcc3cd)" strokeWidth="1.4" strokeDasharray="3 2" />
    <line x1="12" y1="8" x2="20" y2="8" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="26" y1="14" x2="36" y2="14" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="42" y1="8" x2="48" y2="8" stroke="var(--rose, #d98ca8)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const DoodlePin = ({ className = "", style = {}, size = 38 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 44 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={`fashion-svg-doodle ${className}`} style={style} >
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
// DENSE FULL-PAGE SIDE-GUTTER TAPESTRY (ANIME GIRLS + ANIMATION CARDS + DOODLES)
// ==========================================================================

export const FullSideDoodles = ({ page = "wardrobe" }) => {
  if (page === "wardrobe") {
    return (
      <>
        {/* LEFT SIDE GUTTER: ANIME GIRLS + ANIMATION STICKERS + DOODLES */}
        <DoodleHanger className="page-side-doodle anim-float" style={{ top: "40px", left: "1.5%", transform: "rotate(8deg)" }} size={68} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "90px", left: "4.8%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Street Chic Anime Girl" tag="Street Chic ✦" size={106} animation="anim-anime-float" style={{ top: "140px", left: "1.2%" }} />

        <DoodleCrown className="page-side-doodle anim-pulse" style={{ top: "350px", left: "4.8%", transform: "rotate(-10deg)" }} size={42} />
        <DoodleDress className="page-side-doodle anim-drift" style={{ top: "405px", left: "1.4%", transform: "rotate(-5deg)" }} size={60} />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Magazine Cover" caption="Vogue Mood ♡" size={110} rotation={-6} animation="anim-anime-sway" style={{ top: "485px", left: "1.4%" }} />

        <DoodleSwatches className="page-side-doodle anim-float" style={{ top: "700px", left: "1.8%", transform: "rotate(-12deg)" }} size={54} />
        <DoodleStar className="page-side-doodle anim-drift" style={{ top: "765px", left: "4.8%", transform: "rotate(14deg)" }} size={30} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-3.png" alt="Parisian Anime Girl" tag="Latte Chic ☕" size={105} animation="anim-anime-bob" style={{ top: "830px", left: "1.2%" }} />

        <DoodleFloral className="page-side-doodle anim-float" style={{ top: "1050px", left: "1.5%", transform: "rotate(15deg)" }} size={56} />
        <DoodleRibbon className="page-side-doodle anim-drift" style={{ top: "1115px", left: "4.2%", transform: "rotate(-10deg)" }} size={64} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Cozy Atelier Anime Girl" tag="Atelier Knit ♡" size={110} animation="anim-anime-float" style={{ top: "1190px", left: "1.4%" }} />

        <DoodleHat className="page-side-doodle anim-drift" style={{ top: "1420px", left: "1.5%", transform: "rotate(-14deg)" }} size={52} />
        <DoodleTape className="page-side-doodle anim-pulse" style={{ top: "1485px", left: "4.2%", transform: "rotate(8deg)" }} size={48} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Good Vibes Sticker Collage" caption="Aesthetic ♡" size={115} rotation={5} animation="anim-anime-sway" style={{ top: "1560px", left: "1.2%" }} />

        <DoodleMirror className="page-side-doodle anim-float" style={{ top: "1780px", left: "1.8%", transform: "rotate(6deg)" }} size={58} />
        <DoodlePin className="page-side-doodle anim-pulse" style={{ top: "1850px", left: "4.2%", transform: "rotate(10deg)" }} size={40} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-5.png" alt="Blossom Anime Girl" tag="Peony Muse 🌸" size={100} animation="anim-anime-bob" style={{ top: "1920px", left: "1.4%" }} />

        <DoodleDress className="page-side-doodle anim-drift" style={{ top: "2140px", left: "1.4%", transform: "rotate(-8deg)" }} size={56} />
        <DoodleFloral className="page-side-doodle anim-float" style={{ top: "2205px", left: "4.2%", transform: "rotate(12deg)" }} size={50} />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Palazzo Belle Anime Girl" tag="Sunhat Belle ✨" size={95} animation="anim-anime-sway" style={{ top: "2280px", left: "1.5%" }} />

        <DoodleHanger className="page-side-doodle anim-drift" style={{ top: "2490px", left: "1.8%", transform: "rotate(6deg)" }} size={65} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "2560px", left: "4.5%" }} size={32} color="#f4d38c" />

        {/* RIGHT SIDE GUTTER: ANIME GIRLS + ANIMATION STICKERS + DOODLES */}
        <DoodleBow className="page-side-doodle anim-float" style={{ top: "40px", right: "1.8%", transform: "rotate(10deg)" }} size={52} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "90px", right: "4.5%" }} size={30} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Summer Elegance Anime Girl" tag="Summer Chic ✨" size={95} animation="anim-anime-sway" style={{ top: "140px", right: "1.5%" }} />

        <DoodleLipstick className="page-side-doodle anim-drift" style={{ top: "350px", right: "4.8%", transform: "rotate(-8deg)" }} size={42} />
        <DoodleHeels className="page-side-doodle anim-float" style={{ top: "405px", right: "1.5%", transform: "rotate(-8deg)" }} size={60} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-2.png" alt="Rose Couture Anime Girl" tag="Rose Couture ♡" size={105} animation="anim-anime-float" style={{ top: "485px", right: "1.2%" }} />

        <DoodleSunglasses className="page-side-doodle anim-drift" style={{ top: "700px", right: "2%", transform: "rotate(12deg)" }} size={56} />
        <DoodleJewelry className="page-side-doodle anim-pulse" style={{ top: "765px", right: "4.5%", transform: "rotate(12deg)" }} size={44} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Aesthetic Fashion Sticker" caption="Good Vibes ♡" size={115} rotation={-6} animation="anim-anime-sway" style={{ top: "830px", right: "1.4%" }} />

        <DoodlePerfume className="page-side-doodle anim-drift" style={{ top: "1050px", right: "1.6%", transform: "rotate(-6deg)" }} size={50} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "1115px", right: "4.8%" }} size={36} color="#d98ca8" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Runway Icon Anime Girl" tag="Runway Star ✦" size={105} flip={true} animation="anim-anime-bob" style={{ top: "1190px", right: "1.2%" }} />

        <DoodleCamera className="page-side-doodle anim-float" style={{ top: "1420px", right: "4.4%", transform: "rotate(8deg)" }} size={46} />
        <DoodleHandbag className="page-side-doodle anim-drift" style={{ top: "1485px", right: "1.8%", transform: "rotate(-10deg)" }} size={54} />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Magazine Polaroid" caption="Vogue Cover ♡" size={110} rotation={6} animation="anim-anime-float" style={{ top: "1560px", right: "1.5%" }} />

        <DoodleDenim className="page-side-doodle anim-float" style={{ top: "1780px", right: "1.5%", transform: "rotate(8deg)" }} size={54} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1850px", right: "4.6%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-3.png" alt="Trench Aura Anime Girl" tag="Trench Aura ✨" size={105} flip={true} animation="anim-anime-sway" style={{ top: "1920px", right: "1.2%" }} />

        <DoodleLipstick className="page-side-doodle anim-float" style={{ top: "2140px", right: "4.6%", transform: "rotate(-12deg)" }} size={40} />
        <DoodleHeels className="page-side-doodle anim-drift" style={{ top: "2205px", right: "1.5%", transform: "rotate(-8deg)" }} size={58} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Chic Sunday Anime Girl" tag="Chic Sunday ♡" size={110} animation="anim-anime-float" style={{ top: "2280px", right: "1.4%" }} />

        <DoodlePerfume className="page-side-doodle anim-float" style={{ top: "2490px", right: "1.8%", transform: "rotate(6deg)" }} size={50} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "2560px", right: "4.5%" }} size={32} color="#f4d38c" />
      </>
    );
  }

  if (page === "recommendation") {
    return (
      <>
        {/* LEFT SIDE GUTTER: AI STYLIST ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodleMirror className="page-side-doodle anim-float" style={{ top: "45px", left: "1.8%", transform: "rotate(6deg)" }} size={64} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "95px", left: "4.8%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-3.png" alt="Parisian Chic Anime Girl" tag="Parisian Chic ☕" size={106} animation="anim-anime-float" style={{ top: "145px", left: "1.3%" }} />

        <DoodleCrown className="page-side-doodle anim-pulse" style={{ top: "355px", left: "4.6%", transform: "rotate(-8deg)" }} size={40} />
        <DoodleRibbon className="page-side-doodle anim-drift" style={{ top: "410px", left: "1.5%", transform: "rotate(-12deg)" }} size={66} />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Magazine" caption="Stylist Edit ♡" size={110} rotation={-7} animation="anim-anime-sway" style={{ top: "490px", left: "1.4%" }} />

        <DoodleDress className="page-side-doodle anim-float" style={{ top: "710px", left: "1.6%", transform: "rotate(-6deg)" }} size={58} />
        <DoodleFloral className="page-side-doodle anim-drift" style={{ top: "770px", left: "4.5%", transform: "rotate(14deg)" }} size={54} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Stylist Muse Anime Girl" tag="Stylist Muse ♡" size={110} animation="anim-anime-bob" style={{ top: "840px", left: "1.3%" }} />

        <DoodleSwatches className="page-side-doodle anim-float" style={{ top: "1060px", left: "1.8%", transform: "rotate(-8deg)" }} size={52} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1125px", left: "4.6%" }} size={30} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-5.png" alt="Floral Dream Anime Girl" tag="Floral Dream 🌸" size={100} animation="anim-anime-sway" style={{ top: "1190px", left: "1.4%" }} />

        <DoodleHat className="page-side-doodle anim-drift" style={{ top: "1410px", left: "1.5%", transform: "rotate(-12deg)" }} size={50} />
        <DoodleTape className="page-side-doodle anim-pulse" style={{ top: "1475px", left: "4.4%", transform: "rotate(8deg)" }} size={48} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Couture Sticker" caption="Couture Glow ♡" size={115} rotation={5} animation="anim-anime-float" style={{ top: "1540px", left: "1.2%" }} />

        <DoodleCoffee className="page-side-doodle anim-float" style={{ top: "1720px", left: "1.8%", transform: "rotate(-5deg)" }} size={44} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "1780px", left: "4.5%" }} size={32} color="#f4d38c" />

        {/* RIGHT SIDE GUTTER: AI STYLIST ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodlePerfume className="page-side-doodle anim-drift" style={{ top: "45px", right: "1.8%", transform: "rotate(-8deg)" }} size={54} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "95px", right: "4.8%" }} size={36} color="#d98ca8" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Runway Ready Anime Girl" tag="Runway Ready ✦" size={105} animation="anim-anime-bob" style={{ top: "145px", right: "1.3%" }} />

        <DoodleJewelry className="page-side-doodle anim-pulse" style={{ top: "355px", right: "4.6%", transform: "rotate(10deg)" }} size={44} />
        <DoodleSunglasses className="page-side-doodle anim-float" style={{ top: "410px", right: "1.5%", transform: "rotate(10deg)" }} size={58} />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Summer Muse Anime Girl" tag="Summer Muse ✨" size={95} animation="anim-anime-sway" style={{ top: "490px", right: "1.4%" }} />

        <DoodleBow className="page-side-doodle anim-drift" style={{ top: "710px", right: "1.8%", transform: "rotate(-10deg)" }} size={50} />
        <DoodleLipstick className="page-side-doodle anim-float" style={{ top: "770px", right: "4.5%", transform: "rotate(-8deg)" }} size={42} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Good Vibes Sticker" caption="Good Vibes ♡" size={115} rotation={6} animation="anim-anime-float" style={{ top: "840px", right: "1.4%" }} />

        <DoodleHeels className="page-side-doodle anim-drift" style={{ top: "1060px", right: "1.5%", transform: "rotate(-6deg)" }} size={58} />
        <DoodleHandbag className="page-side-doodle anim-float" style={{ top: "1125px", right: "4.6%", transform: "rotate(10deg)" }} size={52} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-2.png" alt="Evening Gala Anime Girl" tag="Evening Gala ♡" size={105} animation="anim-anime-float" style={{ top: "1190px", right: "1.3%" }} />

        <DoodleCamera className="page-side-doodle anim-drift" style={{ top: "1410px", right: "1.8%", transform: "rotate(-8deg)" }} size={46} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "1475px", right: "4.4%" }} size={32} color="#d4af37" />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Style Magazine" caption="Vogue Style ♡" size={110} rotation={-6} animation="anim-anime-sway" style={{ top: "1540px", right: "1.4%" }} />

        <DoodleDenim className="page-side-doodle anim-float" style={{ top: "1720px", right: "1.6%", transform: "rotate(8deg)" }} size={52} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "1780px", right: "4.2%" }} size={34} color="#d98ca8" />
      </>
    );
  }

  if (page === "thrift") {
    return (
      <>
        {/* LEFT SIDE GUTTER: THRIFT ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodleLeaf className="page-side-doodle anim-drift" style={{ top: "45px", left: "2.2%", transform: "rotate(-15deg)" }} size={56} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "95px", left: "4.8%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Vintage Lover Anime Girl" tag="Vintage Lover ♡" size={110} animation="anim-anime-float" style={{ top: "145px", left: "1.3%" }} />

        <DoodleCrown className="page-side-doodle anim-pulse" style={{ top: "355px", left: "4.6%", transform: "rotate(8deg)" }} size={40} />
        <DoodleDenim className="page-side-doodle anim-float" style={{ top: "410px", left: "1.8%", transform: "rotate(10deg)" }} size={58} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Thrift Treasures Sticker" caption="Pre-Loved Gem ♡" size={115} rotation={-6} animation="anim-anime-sway" style={{ top: "490px", left: "1.3%" }} />

        <DoodleFloral className="page-side-doodle anim-drift" style={{ top: "710px", left: "2%", transform: "rotate(15deg)" }} size={52} />
        <DoodleTape className="page-side-doodle anim-pulse" style={{ top: "770px", left: "4.5%", transform: "rotate(-6deg)" }} size={48} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Retro Chic Anime Girl" tag="Retro Chic ✦" size={105} animation="anim-anime-bob" style={{ top: "840px", left: "1.3%" }} />

        <DoodleDress className="page-side-doodle anim-float" style={{ top: "1060px", left: "1.6%", transform: "rotate(-8deg)" }} size={56} />
        <DoodleHat className="page-side-doodle anim-drift" style={{ top: "1125px", left: "4.5%", transform: "rotate(12deg)" }} size={50} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-3.png" alt="Slow Fashion Anime Girl" tag="Slow Fashion ☕" size={105} animation="anim-anime-sway" style={{ top: "1190px", left: "1.3%" }} />

        <DoodleRibbon className="page-side-doodle anim-float" style={{ top: "1410px", left: "1.8%", transform: "rotate(-10deg)" }} size={62} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1475px", left: "4.6%" }} size={30} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Circular Belle Anime Girl" tag="Circular Belle 🌿" size={95} animation="anim-anime-float" style={{ top: "1540px", left: "1.4%" }} />

        <DoodleCoffee className="page-side-doodle anim-drift" style={{ top: "1730px", left: "1.6%", transform: "rotate(6deg)" }} size={42} />
        <DoodleSwatches className="page-side-doodle anim-float" style={{ top: "1800px", left: "4.4%", transform: "rotate(-10deg)" }} size={50} />
        <DoodlePin className="page-side-doodle anim-pulse" style={{ top: "1890px", left: "2%", transform: "rotate(12deg)" }} size={38} />
        <DoodleLeaf className="page-side-doodle anim-drift" style={{ top: "1980px", left: "4.2%", transform: "rotate(-18deg)" }} size={52} />

        {/* RIGHT SIDE GUTTER: THRIFT ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodleHandbag className="page-side-doodle anim-drift" style={{ top: "45px", right: "2%", transform: "rotate(12deg)" }} size={56} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "95px", right: "4.8%" }} size={34} color="#d98ca8" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-5.png" alt="Eco Aesthetic Anime Girl" tag="Eco Aesthetic 🌸" size={100} animation="anim-anime-sway" style={{ top: "145px", right: "1.4%" }} />

        <DoodleJewelry className="page-side-doodle anim-pulse" style={{ top: "355px", right: "4.5%", transform: "rotate(-10deg)" }} size={44} />
        <DoodleHeels className="page-side-doodle anim-float" style={{ top: "410px", right: "1.8%", transform: "rotate(-10deg)" }} size={58} />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Circular" caption="Vogue Circular ♡" size={110} rotation={6} animation="anim-anime-float" style={{ top: "490px", right: "1.4%" }} />

        <DoodleSunglasses className="page-side-doodle anim-drift" style={{ top: "710px", right: "2.2%", transform: "rotate(12deg)" }} size={54} />
        <DoodleLipstick className="page-side-doodle anim-float" style={{ top: "770px", right: "4.6%", transform: "rotate(-8deg)" }} size={40} />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Vintage Muse Anime Girl" tag="Vintage Muse ✨" size={95} animation="anim-anime-bob" style={{ top: "840px", right: "1.4%" }} />

        <DoodleCamera className="page-side-doodle anim-drift" style={{ top: "1060px", right: "1.8%", transform: "rotate(8deg)" }} size={46} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1125px", right: "4.6%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-2.png" alt="Pre-Loved Glam Anime Girl" tag="Pre-Loved Glam ♡" size={105} animation="anim-anime-float" style={{ top: "1190px", right: "1.3%" }} />

        <DoodleBow className="page-side-doodle anim-float" style={{ top: "1410px", right: "2%", transform: "rotate(-10deg)" }} size={48} />
        <DoodlePerfume className="page-side-doodle anim-drift" style={{ top: "1475px", right: "4.5%", transform: "rotate(8deg)" }} size={46} />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Good Vibes Sticker" caption="Good Vibes ♡" size={115} rotation={-5} animation="anim-anime-sway" style={{ top: "1540px", right: "1.4%" }} />

        <DoodleHandbag className="page-side-doodle anim-float" style={{ top: "1730px", right: "4.4%", transform: "rotate(-10deg)" }} size={50} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "1800px", right: "2%" }} size={34} color="#d98ca8" />
        <DoodleSunglasses className="page-side-doodle anim-drift" style={{ top: "1890px", right: "4.2%", transform: "rotate(14deg)" }} size={50} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "1980px", right: "1.8%" }} size={30} color="#d4af37" />
      </>
    );
  }

  if (page === "about") {
    return (
      <>
        {/* LEFT SIDE GUTTER: ABOUT US ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodleRibbon className="page-side-doodle anim-drift" style={{ top: "45px", left: "2%", transform: "rotate(-12deg)" }} size={68} />
        <DoodleCrown className="page-side-doodle anim-pulse" style={{ top: "95px", left: "4.8%", transform: "rotate(8deg)" }} size={40} />
        
        <SideAnimeGirl src="/fashion-assets/girl.png" alt="Atelier Belle Anime Girl" tag="Atelier Muse ✨" size={95} animation="anim-anime-sway" style={{ top: "150px", left: "1.4%" }} />

        <DoodleSwatches className="page-side-doodle anim-float" style={{ top: "365px", left: "1.8%", transform: "rotate(8deg)" }} size={54} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "420px", left: "4.5%" }} size={34} color="#d4af37" />
        
        <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Vogue Magazine Cover" caption="Haute Vision ♡" size={110} rotation={-6} animation="anim-anime-float" style={{ top: "500px", left: "1.4%" }} />

        <DoodleDress className="page-side-doodle anim-drift" style={{ top: "720px", left: "1.5%", transform: "rotate(-6deg)" }} size={58} />
        <DoodleFloral className="page-side-doodle anim-float" style={{ top: "780px", left: "4.6%", transform: "rotate(15deg)" }} size={56} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-3.png" alt="Couture Vision Anime Girl" tag="Couture Vision ☕" size={105} animation="anim-anime-bob" style={{ top: "850px", left: "1.3%" }} />

        <DoodleHat className="page-side-doodle anim-drift" style={{ top: "1070px", left: "1.8%", transform: "rotate(-14deg)" }} size={50} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1135px", left: "4.6%" }} size={32} color="#d4af37" />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-5.png" alt="Sustainable Art Anime Girl" tag="Sustainable Art 🌸" size={100} animation="anim-anime-float" style={{ top: "1200px", left: "1.4%" }} />

        <DoodleMirror className="page-side-doodle anim-float" style={{ top: "1420px", left: "1.6%", transform: "rotate(6deg)" }} size={56} />
        <DoodleTape className="page-side-doodle anim-pulse" style={{ top: "1485px", left: "4.4%", transform: "rotate(-8deg)" }} size={48} />
        <DoodleCoffee className="page-side-doodle anim-drift" style={{ top: "1590px", left: "1.8%", transform: "rotate(6deg)" }} size={42} />
        <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "1670px", left: "4.5%" }} size={32} color="#f4d38c" />

        {/* RIGHT SIDE GUTTER: ABOUT US ANIME CHARACTERS + STICKERS + DOODLES */}
        <DoodleBow className="page-side-doodle anim-float" style={{ top: "45px", right: "2.2%", transform: "rotate(10deg)" }} size={52} />
        <DoodleLipstick className="page-side-doodle anim-drift" style={{ top: "95px", right: "4.8%", transform: "rotate(-10deg)" }} size={40} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Fashion Future Anime Girl" tag="Fashion Future ✦" size={105} animation="anim-anime-bob" style={{ top: "150px", right: "1.4%" }} />

        <DoodlePerfume className="page-side-doodle anim-drift" style={{ top: "365px", right: "1.8%", transform: "rotate(-8deg)" }} size={54} />
        <DoodleJewelry className="page-side-doodle anim-pulse" style={{ top: "420px", right: "4.6%", transform: "rotate(12deg)" }} size={42} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Creative Muse Anime Girl" tag="Creative Muse ♡" size={110} animation="anim-anime-sway" style={{ top: "500px", right: "1.4%" }} />

        <DoodleSunglasses className="page-side-doodle anim-float" style={{ top: "720px", right: "2.2%", transform: "rotate(12deg)" }} size={56} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "780px", right: "4.8%" }} size={36} color="#d98ca8" />
        
        <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Good Vibes Sticker" caption="Good Vibes ♡" size={115} rotation={5} animation="anim-anime-float" style={{ top: "850px", right: "1.3%" }} />

        <DoodleHeels className="page-side-doodle anim-drift" style={{ top: "1070px", right: "1.8%", transform: "rotate(-8deg)" }} size={58} />
        <DoodleCamera className="page-side-doodle anim-float" style={{ top: "1135px", right: "4.5%", transform: "rotate(8deg)" }} size={44} />
        
        <SideAnimeGirl src="/fashion-assets/fashion-girl-2.png" alt="Runway Icon Anime Girl" tag="Runway Icon ✨" size={105} animation="anim-anime-float" style={{ top: "1200px", right: "1.3%" }} />

        <DoodleHandbag className="page-side-doodle anim-drift" style={{ top: "1420px", right: "2%", transform: "rotate(-10deg)" }} size={52} />
        <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "1485px", right: "4.6%" }} size={32} color="#d4af37" />
        <DoodleBow className="page-side-doodle anim-float" style={{ top: "1590px", right: "1.8%", transform: "rotate(8deg)" }} size={48} />
        <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "1670px", right: "4.2%" }} size={34} color="#d98ca8" />
      </>
    );
  }

  // Edit Clothing Page
  return (
    <>
      {/* LEFT SIDE GUTTER: EDIT CLOTHING */}
      <DoodleSwatches className="page-side-doodle anim-drift" style={{ top: "50px", left: "2.2%", transform: "rotate(-10deg)" }} size={58} />
      <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "100px", left: "4.8%" }} size={32} color="#d4af37" />
      
      <SideAnimeGirl src="/fashion-assets/fashion-girl-4.png" alt="Design Atelier Anime Girl" tag="Design Atelier ♡" size={106} animation="anim-anime-float" style={{ top: "150px", left: "1.6%" }} />

      <DoodleFloral className="page-side-doodle anim-float" style={{ top: "370px", left: "2%", transform: "rotate(14deg)" }} size={52} />
      <DoodleDress className="page-side-doodle anim-drift" style={{ top: "430px", left: "4%", transform: "rotate(-6deg)" }} size={54} />
      
      <SideStickerCard src="/fashion-assets/fashion-sticker.png" alt="Atelier Details Sticker" caption="Details ♡" size={110} rotation={-5} animation="anim-anime-sway" style={{ top: "510px", left: "1.5%" }} />

      <DoodleRibbon className="page-side-doodle anim-float" style={{ top: "720px", left: "2%", transform: "rotate(10deg)" }} size={58} />
      <DoodleStar className="page-side-doodle anim-pulse" style={{ top: "780px", left: "4.2%" }} size={30} color="#d4af37" />

      {/* RIGHT SIDE GUTTER: EDIT CLOTHING */}
      <DoodleMirror className="page-side-doodle anim-float" style={{ top: "50px", right: "2.2%", transform: "rotate(8deg)" }} size={56} />
      <DoodleHeart className="page-side-doodle anim-heart" style={{ top: "100px", right: "4.8%" }} size={34} color="#d98ca8" />
      
      <SideAnimeGirl src="/fashion-assets/fashion-girl-1.png" alt="Silhouette Fit Anime Girl" tag="Silhouette Fit ✦" size={105} animation="anim-anime-bob" style={{ top: "150px", right: "1.6%" }} />

      <DoodleBow className="page-side-doodle anim-drift" style={{ top: "370px", right: "2.2%", transform: "rotate(-10deg)" }} size={46} />
      <DoodleLipstick className="page-side-doodle anim-float" style={{ top: "430px", right: "4.5%", transform: "rotate(8deg)" }} size={38} />
      
      <SideStickerCard src="/fashion-assets/magazine-cover.png" alt="Curated Magazine Cover" caption="Curated ♡" size={110} rotation={6} animation="anim-anime-float" style={{ top: "510px", right: "1.5%" }} />

      <DoodlePerfume className="page-side-doodle anim-drift" style={{ top: "720px", right: "2.2%", transform: "rotate(-8deg)" }} size={48} />
      <DoodleSparkles className="page-side-doodle anim-pulse" style={{ top: "780px", right: "4.5%" }} size={30} color="#d4af37" />
    </>
  );
};
