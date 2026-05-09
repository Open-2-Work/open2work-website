// Shared visual primitives: portrait placeholder, scanlines, etc.

const ACCENT_MAP = {
  lime:    { hex: "oklch(0.88 0.18 130)", soft: "oklch(0.88 0.18 130 / 0.15)", name: "LIME" },
  cyan:    { hex: "oklch(0.85 0.14 200)", soft: "oklch(0.85 0.14 200 / 0.15)", name: "CYAN" },
  magenta: { hex: "oklch(0.78 0.18 340)", soft: "oklch(0.78 0.18 340 / 0.15)", name: "MAGENTA" },
  amber:   { hex: "oklch(0.84 0.16 75)",  soft: "oklch(0.84 0.16 75 / 0.15)",  name: "AMBER" },
};

// Striped portrait placeholder (no SVG hand-drawing of faces — uses image-slot for real photo).
function PortraitPlaceholder({ accent = "lime", codename = "", index = 0, large = false }) {
  const a = ACCENT_MAP[accent];
  const stripes = [];
  const stripeCount = large ? 14 : 10;
  for (let i = 0; i < stripeCount; i++) {
    stripes.push(
      <rect
        key={i}
        x="0"
        y={(i * 100) / stripeCount}
        width="100"
        height={50 / stripeCount}
        fill={i % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent"}
      />
    );
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={`grad-${codename}-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.22 0.015 260)" />
          <stop offset="100%" stopColor="oklch(0.14 0.01 260)" />
        </linearGradient>
        <pattern id={`dots-${codename}-${index}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.4" fill={a.hex} opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#grad-${codename}-${index})`} />
      {stripes}
      <rect width="100" height="100" fill={`url(#dots-${codename}-${index})`} />
      {/* Silhouette suggestion — abstract head shape */}
      <circle cx="50" cy="38" r="14" fill="rgba(255,255,255,0.04)" stroke={a.hex} strokeWidth="0.3" strokeOpacity="0.4" />
      <path d="M 22 100 Q 22 70 50 70 Q 78 70 78 100 Z" fill="rgba(255,255,255,0.04)" stroke={a.hex} strokeWidth="0.3" strokeOpacity="0.4" />
      {/* Corner brackets */}
      <path d="M 4 4 L 4 12 M 4 4 L 12 4" stroke={a.hex} strokeWidth="0.6" fill="none" />
      <path d="M 96 4 L 96 12 M 96 4 L 88 4" stroke={a.hex} strokeWidth="0.6" fill="none" />
      <path d="M 4 96 L 4 88 M 4 96 L 12 96" stroke={a.hex} strokeWidth="0.6" fill="none" />
      <path d="M 96 96 L 96 88 M 96 96 L 88 96" stroke={a.hex} strokeWidth="0.6" fill="none" />
      {/* Codename label */}
      <text x="50" y="94" textAnchor="middle" fill={a.hex} fontSize="3" fontFamily="ui-monospace, monospace" letterSpacing="0.5" opacity="0.7">
        [ DROP PORTRAIT ]
      </text>
    </svg>
  );
}

// Animated scan line — purely decorative, low-opacity.
function ScanField({ density = 1 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 3px)",
        opacity: density,
        mixBlendMode: "screen",
      }}
    />
  );
}

// Animated terminal cursor
function Caret({ char = "▊" }) {
  return <span className="caret">{char}</span>;
}

// Skill bar — segmented, terminal-style
function SkillBar({ level = 80, accent = "lime", animate = true }) {
  const a = ACCENT_MAP[accent];
  const segments = 20;
  const filled = Math.round((level / 100) * segments);
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 6,
            background: i < filled ? a.hex : "rgba(255,255,255,0.06)",
            transition: animate ? `background 200ms ${i * 18}ms` : "none",
            boxShadow: i < filled ? `0 0 6px ${a.soft}` : "none",
          }}
        />
      ))}
    </div>
  );
}

Object.assign(window, { ACCENT_MAP, PortraitPlaceholder, ScanField, Caret, SkillBar });
