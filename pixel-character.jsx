// Pixel character renderer — fighting-game roster portrait style.
// Each character is rendered procedurally on a canvas so we can give them
// a gentle Wii-style turntable sway via CSS transforms on the wrapper.
//
// Art logic: ~64-tall pixel grid, scaled up to fit container. We layer:
//   shadow → body/torso → neck → head → hair-back → face → hair-front → accessories
//
// Each flatmate has a "look" object describing colors and feature flags.

const PIXEL_LOOKS = {
  "01": { // BORNO — Davide — blond, tall, hoodie maroon/navy
    skin: "#f1c4a3", skinShade: "#d49d7d",
    hair: "#dcc28b", hairShade: "#a98c4f",
    hairStyle: "messy-medium",
    eyes: "#3a5a3a",
    blush: "#f5a59a",
    outfit: "hoodie-twotone",
    outfitMain: "#2a2f4a", outfitAccent: "#7a2230", outfitDraw: "#e8e6df",
    accessories: [],
    height: "tall",
    expression: "neutral",
  },
  "02": { // PARO — Luca — brown wavy short hair, big smile, olive sweater under brown jacket
    skin: "#f0c2a0", skinShade: "#d4a079",
    hair: "#3d2412", hairShade: "#241408",
    hairStyle: "short-tousled",
    eyes: "#4a6a8a",
    blush: "#e89a90",
    outfit: "jacket-over-sweater",
    outfitMain: "#3a2418", outfitAccent: "#5a3a26", outfitDraw: "#9a8a7a",
    sweaterColor: "#6a6a3a", sweaterShade: "#4a4a26",
    accessories: ["watch"],
    height: "regular",
    expression: "big-smile",
  },
  "03": { // STEGO — Michael — dark hair, beard, laurel wreath, suit
    skin: "#e8b48f", skinShade: "#c69172",
    hair: "#2b1a14", hairShade: "#1a0f0a",
    hairStyle: "short-classic",
    eyes: "#2b1a14",
    blush: "#d97a70",
    outfit: "suit-tie",
    outfitMain: "#1f2a48", outfitAccent: "#0f1530", outfitDraw: "#ffffff",
    tieColor: "#1a1a2a",
    accessories: ["beard", "laurel"],
    height: "regular",
    expression: "proud",
  },
  "04": { // JIMPO — Jinpeng — auburn side-fringe, aviator glasses, bomber jacket over grey tee
    skin: "#f5d98a", skinShade: "#d4b35a",
    hair: "#7a3a1a", hairShade: "#4a1f0a",
    hairStyle: "side-fringe",
    eyes: "#1a1a1a",
    blush: "#e89a90",
    outfit: "bomber-jacket",
    outfitMain: "#1a2540", outfitAccent: "#0d1525", outfitDraw: "#a8a8a8",
    teeColor: "#9a9a9a",
    accessories: ["glasses-aviator"],
    height: "regular",
    expression: "duckface",
  },
};

// === PIXEL DRAWING HELPERS ===
function px(ctx, x, y, color, size = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}
function pxRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Draw character at scale. canvas is sized externally.
// We work in a 64×64 logical grid (head ~24px tall, body below).
function drawPixelChar(ctx, look, opts = {}) {
  const W = 64, H = 80;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);

  // Sway offset (subtle pixel shift for animation frames)
  const sway = opts.sway || 0; // -1, 0, 1
  const cx = 32 + sway;

  // === SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(32, 78, 18, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // === BODY / TORSO ===
  drawTorso(ctx, look, cx);

  // === NECK ===
  pxRect(ctx, cx - 4, 38, 8, 6, look.skin);
  pxRect(ctx, cx - 4, 43, 8, 1, look.skinShade); // chin shadow

  // === HEAD (round-ish, 22w x 22h) ===
  drawHead(ctx, look, cx);

  // === HAIR-BACK (behind head silhouette but in front of body) ===
  drawHairBack(ctx, look, cx);

  // === FACE ===
  drawFace(ctx, look, cx);

  // === HAIR-FRONT ===
  drawHairFront(ctx, look, cx);

  // === ACCESSORIES ===
  if (look.accessories.includes("glasses-round")) drawGlasses(ctx, look, cx);
  if (look.accessories.includes("glasses-aviator")) drawAviators(ctx, look, cx);
  if (look.accessories.includes("beard")) drawBeard(ctx, look, cx);
  if (look.accessories.includes("laurel")) drawLaurel(ctx, look, cx);
  if (look.accessories.includes("watch")) drawWatch(ctx, look, cx);
}

function drawHead(ctx, look, cx) {
  // Head shape: roughly a rounded rectangle 22w x 22h, top at y=16
  // We pixel-paint it row by row for that crisp pixel-art feel.
  const skin = look.skin, shade = look.skinShade;
  // top row narrow, then full, then narrow at chin
  const rows = [
    // [y, halfWidth]
    [16, 7], [17, 8], [18, 9], [19, 10], [20, 10],
    [21, 11], [22, 11], [23, 11], [24, 11], [25, 11],
    [26, 11], [27, 11], [28, 11], [29, 11], [30, 11],
    [31, 10], [32, 10], [33, 9], [34, 8], [35, 7], [36, 6],
  ];
  for (const [y, hw] of rows) {
    pxRect(ctx, cx - hw, y, hw * 2, 1, skin);
  }
  // Right-side shading (1px column on right edge)
  for (const [y, hw] of rows) {
    pxRect(ctx, cx + hw - 1, y, 1, 1, shade);
  }
  // Chin shading
  pxRect(ctx, cx - 6, 36, 12, 1, shade);
}

function drawFace(ctx, look, cx) {
  // Eyes — y ~25-26
  const ey = 25;
  // Eye whites (small) — fighting game style usually skips whites for pixel scale
  // We do 2x2 dark eyes
  pxRect(ctx, cx - 6, ey, 2, 2, look.eyes);
  pxRect(ctx, cx + 4, ey, 2, 2, look.eyes);
  // Eye highlight (1 pixel)
  px(ctx, cx - 5, ey, "#ffffff");
  px(ctx, cx + 5, ey, "#ffffff");

  // Eyebrows
  const browY = ey - 2;
  if (look.expression === "proud") {
    pxRect(ctx, cx - 7, browY, 4, 1, look.hairShade);
    pxRect(ctx, cx + 3, browY, 4, 1, look.hairShade);
  } else {
    pxRect(ctx, cx - 7, browY, 4, 1, look.hairShade);
    pxRect(ctx, cx + 3, browY, 4, 1, look.hairShade);
  }

  // Nose — tiny shadow
  pxRect(ctx, cx, 29, 1, 2, look.skinShade);

  // Mouth
  const my = 33;
  if (look.expression === "smirk") {
    pxRect(ctx, cx - 3, my, 6, 1, "#9a4a3a");
    px(ctx, cx + 3, my - 1, "#9a4a3a");
  } else if (look.expression === "duckface") {
    pxRect(ctx, cx - 2, my, 4, 2, "#c46a5a");
    pxRect(ctx, cx - 1, my - 1, 2, 1, "#c46a5a");
  } else if (look.expression === "proud") {
    pxRect(ctx, cx - 3, my, 6, 1, "#7a3a2a");
    px(ctx, cx - 4, my, "#7a3a2a");
    px(ctx, cx + 3, my, "#7a3a2a");
  } else if (look.expression === "big-smile") {
    // Wide open smile showing teeth
    pxRect(ctx, cx - 4, my, 8, 1, "#5a2a1a");
    pxRect(ctx, cx - 3, my + 1, 6, 1, "#7a3a2a");
    // teeth (small white strip)
    pxRect(ctx, cx - 2, my, 4, 1, "#f5f0e0");
    // dimples / corners turned up
    px(ctx, cx - 5, my - 1, look.skinShade);
    px(ctx, cx + 4, my - 1, look.skinShade);
  } else {
    pxRect(ctx, cx - 3, my, 6, 1, "#9a4a3a");
  }

  // Blush
  pxRect(ctx, cx - 9, 30, 2, 1, look.blush);
  pxRect(ctx, cx + 7, 30, 2, 1, look.blush);
}

function drawHairBack(ctx, look, cx) {
  const h = look.hair, hs = look.hairShade;
  if (look.hairStyle === "bowl") {
    // Bowl cut — rounded cap covering forehead + sides + nape
    const rows = [
      [13, 8], [14, 10], [15, 11], [16, 12], [17, 13],
      [18, 13], [19, 13], [20, 13], [21, 13], [22, 13], [23, 13],
      [24, 13], [25, 12], // sideburns down past ears
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    // back of head (above neck, behind body)
    pxRect(ctx, cx - 12, 26, 24, 14, h);
    // nape
    pxRect(ctx, cx - 5, 39, 10, 3, h);
  } else if (look.hairStyle === "messy-medium") {
    const rows = [
      [12, 7], [13, 9], [14, 10], [15, 11], [16, 12],
      [17, 12], [18, 12], [19, 12], [20, 12], [21, 12],
      [22, 12], [23, 11], [24, 10],
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    // sideburns thinner
    pxRect(ctx, cx - 11, 25, 2, 4, h);
    pxRect(ctx, cx + 9, 25, 2, 4, h);
  } else if (look.hairStyle === "wavy-side") {
    const rows = [
      [13, 8], [14, 10], [15, 11], [16, 12], [17, 12],
      [18, 12], [19, 12], [20, 12], [21, 12], [22, 11],
      [23, 10],
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    pxRect(ctx, cx - 11, 24, 2, 3, h);
    pxRect(ctx, cx + 9, 24, 2, 3, h);
  } else if (look.hairStyle === "short-classic") {
    const rows = [
      [14, 8], [15, 10], [16, 11], [17, 11], [18, 12],
      [19, 12], [20, 12], [21, 12], [22, 11], [23, 10],
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    pxRect(ctx, cx - 11, 23, 2, 3, h);
    pxRect(ctx, cx + 9, 23, 2, 3, h);
  } else if (look.hairStyle === "side-fringe") {
    const rows = [
      [12, 8], [13, 10], [14, 11], [15, 12], [16, 12],
      [17, 12], [18, 12], [19, 12], [20, 12], [21, 12],
      [22, 12], [23, 11], [24, 11], [25, 10],
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    pxRect(ctx, cx - 11, 26, 2, 4, h);
    pxRect(ctx, cx + 9, 26, 2, 4, h);
  } else if (look.hairStyle === "short-tousled") {
    // Short, slightly wavy/tousled brown hair — PARO
    const rows = [
      [13, 8], [14, 10], [15, 11], [16, 12], [17, 12],
      [18, 12], [19, 12], [20, 12], [21, 12], [22, 11], [23, 10],
    ];
    for (const [y, hw] of rows) pxRect(ctx, cx - hw, y, hw * 2, 1, h);
    pxRect(ctx, cx - 11, 24, 2, 3, h);
    pxRect(ctx, cx + 9, 24, 2, 3, h);
  }
  // shading along bottom of hair mass on right
  // (kept implicit by hairShade in front layer)
}

function drawHairFront(ctx, look, cx) {
  const h = look.hair, hs = look.hairShade;
  if (look.hairStyle === "bowl") {
    // Forehead-covering bangs (the JIMPO bowl) — raised slightly to clear glasses
    pxRect(ctx, cx - 11, 17, 22, 4, h);
    // Asymmetric tuft on left
    pxRect(ctx, cx - 12, 19, 2, 3, h);
    // Shading along bottom of bangs
    pxRect(ctx, cx - 10, 21, 20, 1, hs);
  } else if (look.hairStyle === "messy-medium") {
    // Tousled top — chunky tufts
    pxRect(ctx, cx - 10, 17, 6, 4, h);
    pxRect(ctx, cx - 4, 16, 5, 5, h);
    pxRect(ctx, cx + 1, 17, 6, 4, h);
    pxRect(ctx, cx + 7, 18, 4, 3, h);
    // tip flicks
    px(ctx, cx - 9, 16, h);
    px(ctx, cx - 2, 15, h);
    px(ctx, cx + 4, 16, h);
    // bangs partial
    pxRect(ctx, cx - 7, 21, 8, 1, hs);
  } else if (look.hairStyle === "wavy-side") {
    // Side-swept brown wave
    pxRect(ctx, cx - 10, 18, 18, 4, h);
    // wave curl on left
    pxRect(ctx, cx - 11, 19, 2, 4, h);
    px(ctx, cx - 9, 17, h);
    px(ctx, cx - 4, 16, h);
    // shading
    pxRect(ctx, cx - 8, 21, 14, 1, hs);
  } else if (look.hairStyle === "short-classic") {
    // Short neat hair
    pxRect(ctx, cx - 9, 18, 18, 4, h);
    pxRect(ctx, cx - 7, 21, 14, 1, hs);
  } else if (look.hairStyle === "side-fringe") {
    pxRect(ctx, cx - 11, 17, 22, 4, h);
    pxRect(ctx, cx - 12, 18, 2, 5, h);
    pxRect(ctx, cx - 10, 21, 4, 2, h);
    pxRect(ctx, cx - 6, 21, 3, 1, h);
    px(ctx, cx + 10, 17, h);
    pxRect(ctx, cx + 9, 21, 2, 1, hs);
    px(ctx, cx - 6, 18, "#a85a2a");
    px(ctx, cx - 2, 19, "#a85a2a");
    px(ctx, cx + 3, 18, "#a85a2a");
    pxRect(ctx, cx - 9, 22, 16, 1, hs);
  } else if (look.hairStyle === "short-tousled") {
    // Tousled tufts — short and slightly messy
    pxRect(ctx, cx - 10, 18, 20, 4, h);
    // tuft variation on top
    pxRect(ctx, cx - 8, 17, 4, 1, h);
    pxRect(ctx, cx - 2, 17, 5, 1, h);
    pxRect(ctx, cx + 5, 17, 3, 1, h);
    // bottom shading
    pxRect(ctx, cx - 8, 22, 16, 1, hs);
  }
}

function drawAviators(ctx, look, cx) {
  const frame = "#c8a050", frameShade = "#8a6a30";
  pxRect(ctx, cx - 9, 24, 7, 6, frame);
  pxRect(ctx, cx - 8, 25, 5, 4, look.skin);
  pxRect(ctx, cx + 2, 24, 7, 6, frame);
  pxRect(ctx, cx + 3, 25, 5, 4, look.skin);
  pxRect(ctx, cx - 2, 24, 4, 1, frame);
  pxRect(ctx, cx - 9, 29, 7, 1, frameShade);
  pxRect(ctx, cx + 2, 29, 7, 1, frameShade);
  pxRect(ctx, cx - 6, 26, 1, 2, look.eyes);
  pxRect(ctx, cx + 5, 26, 1, 2, look.eyes);
  px(ctx, cx - 8, 25, "rgba(255,255,255,0.6)");
  px(ctx, cx + 3, 25, "rgba(255,255,255,0.6)");
}

function drawGlasses(ctx, look, cx) {
  const c = "#1a1a1a";
  // Left lens (3x3 hollow)
  pxRect(ctx, cx - 8, 24, 5, 5, c);
  pxRect(ctx, cx - 7, 25, 3, 3, look.skin);
  // Right lens
  pxRect(ctx, cx + 3, 24, 5, 5, c);
  pxRect(ctx, cx + 4, 25, 3, 3, look.skin);
  // Bridge
  pxRect(ctx, cx - 3, 26, 6, 1, c);
  // re-draw eyes inside lenses
  pxRect(ctx, cx - 6, 26, 1, 1, look.eyes);
  pxRect(ctx, cx + 5, 26, 1, 1, look.eyes);
  // Lens shine
  px(ctx, cx - 7, 24, "rgba(255,255,255,0.5)");
  px(ctx, cx + 4, 24, "rgba(255,255,255,0.5)");
}

function drawBeard(ctx, look, cx) {
  const c = look.hair, cs = look.hairShade;
  // Mustache
  pxRect(ctx, cx - 4, 32, 8, 1, c);
  // Stubble/jaw beard
  pxRect(ctx, cx - 8, 33, 4, 3, c);
  pxRect(ctx, cx + 4, 33, 4, 3, c);
  pxRect(ctx, cx - 5, 34, 10, 2, c);
  // soul patch
  pxRect(ctx, cx - 1, 35, 2, 2, cs);
}

function drawLaurel(ctx, look, cx) {
  // Green wreath over the hair
  const leaf = "#2d6e3e";
  const leafLight = "#4a9e5c";
  const berry = "#a82828";
  // Left side leaves
  for (let i = 0; i < 5; i++) {
    pxRect(ctx, cx - 13 + i, 14 - i, 2, 2, leaf);
    px(ctx, cx - 13 + i, 14 - i, leafLight);
  }
  // Right side leaves
  for (let i = 0; i < 5; i++) {
    pxRect(ctx, cx + 11 - i, 14 - i, 2, 2, leaf);
    px(ctx, cx + 12 - i, 14 - i, leafLight);
  }
  // Top arc filler
  pxRect(ctx, cx - 7, 11, 14, 2, leaf);
  pxRect(ctx, cx - 5, 10, 10, 1, leafLight);
  // Berries
  px(ctx, cx - 4, 12, berry);
  px(ctx, cx + 4, 12, berry);
  px(ctx, cx, 11, berry);
}

function drawWatch(ctx, look, cx) {
  // Tiny silver square on right wrist — only if we draw arms; skipped here for portrait.
}

function drawTorso(ctx, look, cx) {
  // Body silhouette — shoulders + chest, ending at canvas bottom.
  if (look.outfit === "hoodie-twotone") {
    // BORNO — maroon top half, navy bottom (like the photo)
    // Outer hoodie shape: shoulders 26 wide @ y=44, expanding to 36 wide @ bottom
    const top = look.outfitAccent; // maroon
    const bot = look.outfitMain;   // navy
    // top zone (44-58)
    drawHoodieShape(ctx, cx, top, 44, 58);
    // bottom zone (58-78)
    drawHoodieShape(ctx, cx, bot, 58, 78);
    // Hood drawstrings
    pxRect(ctx, cx - 4, 44, 1, 6, look.outfitDraw);
    pxRect(ctx, cx + 3, 44, 1, 6, look.outfitDraw);
    px(ctx, cx - 4, 50, "#ddd");
    px(ctx, cx + 3, 50, "#ddd");
    // Hood opening (light interior)
    pxRect(ctx, cx - 6, 41, 12, 4, "#f0eee5");
    pxRect(ctx, cx - 4, 42, 8, 3, look.skinShade); // neck shadow inside hood
    pxRect(ctx, cx - 4, 42, 8, 2, look.skin);
    // Pocket horizontal divider
    pxRect(ctx, cx - 12, 64, 24, 1, "rgba(0,0,0,0.25)");
  } else if (look.outfit === "bomber-jacket") {
    // JIMPO — navy bomber jacket over grey tee
    drawShirtShape(ctx, cx, look.outfitMain, look.outfitAccent);
    // Grey tee underneath at neck (V/U shape)
    pxRect(ctx, cx - 4, 44, 8, 4, look.teeColor);
    pxRect(ctx, cx - 3, 48, 6, 2, look.teeColor);
    pxRect(ctx, cx - 2, 50, 4, 1, look.teeColor);
    // Jacket folded collar/lapels
    pxRect(ctx, cx - 6, 44, 2, 4, look.outfitAccent);
    pxRect(ctx, cx + 4, 44, 2, 4, look.outfitAccent);
    pxRect(ctx, cx - 7, 45, 1, 3, look.outfitMain);
    pxRect(ctx, cx + 6, 45, 1, 3, look.outfitMain);
    // Center zipper
    pxRect(ctx, cx, 51, 1, 22, look.outfitDraw);
    for (let i = 0; i < 5; i++) px(ctx, cx, 53 + i * 4, "#e0e0e0");
    // Alpha Industries patch (small white rect)
    pxRect(ctx, cx + 5, 56, 6, 3, "#e8e8e8");
    px(ctx, cx + 7, 57, look.outfitMain);
    px(ctx, cx + 8, 57, look.outfitMain);
    // Hem
    pxRect(ctx, cx - 14, 75, 28, 2, look.outfitAccent);
  } else if (look.outfit === "jacket-over-sweater") {
    // PARO — dark brown quilted jacket open over olive sweater
    drawShirtShape(ctx, cx, look.outfitMain, look.outfitAccent);
    // Olive sweater visible in center (V/U shape down the front)
    pxRect(ctx, cx - 5, 44, 10, 6, look.sweaterColor);
    pxRect(ctx, cx - 6, 50, 12, 30, look.sweaterColor);
    // Sweater shading on right edge
    pxRect(ctx, cx + 4, 50, 2, 30, look.sweaterShade);
    // Sweater ribbed collar (1px line)
    pxRect(ctx, cx - 4, 44, 8, 1, look.sweaterShade);
    // Jacket lapels framing the sweater
    pxRect(ctx, cx - 7, 44, 2, 6, look.outfitAccent);
    pxRect(ctx, cx + 5, 44, 2, 6, look.outfitAccent);
    // Quilted pattern on jacket (diagonal dots)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        px(ctx, cx - 13 + c * 2, 56 + r * 4, look.outfitAccent);
        px(ctx, cx + 9 + c * 2, 56 + r * 4, look.outfitAccent);
      }
    }
    // Jacket bottom shading
    pxRect(ctx, cx - 14, 75, 28, 2, look.outfitAccent);
  } else if (look.outfit === "hoodie-plain" || look.outfit === "tee-plain") {
    // Clean tee/sweater — no hood, no collar over head, neckline starts BELOW chin (y=44+)
    drawShirtShape(ctx, cx, look.outfitMain, look.outfitAccent);
    // Crew neckline — small dip, sits below the neck pixels (neck ends at y=43)
    pxRect(ctx, cx - 4, 44, 8, 1, look.outfitAccent);
    pxRect(ctx, cx - 3, 45, 6, 1, look.outfitAccent);
    // Subtle bottom shading
    pxRect(ctx, cx - 14, 70, 28, 1, "rgba(0,0,0,0.3)");
  } else if (look.outfit === "button-up") {
    // PARO — light blue button-up
    drawShirtShape(ctx, cx, look.outfitMain, look.outfitAccent);
    // Buttons
    for (let i = 0; i < 4; i++) {
      px(ctx, cx, 48 + i * 6, look.outfitDraw);
    }
    // Collar
    pxRect(ctx, cx - 5, 44, 4, 3, look.outfitMain);
    pxRect(ctx, cx + 1, 44, 4, 3, look.outfitMain);
    // Collar shading
    px(ctx, cx - 2, 46, look.outfitAccent);
    px(ctx, cx + 1, 46, look.outfitAccent);
  } else if (look.outfit === "suit-tie") {
    // STEGO — navy suit + white shirt + dark tie
    // Outer suit shape
    drawSuitShape(ctx, cx, look.outfitMain, look.outfitAccent);
    // White shirt V at neck
    pxRect(ctx, cx - 3, 44, 6, 8, "#ffffff");
    // Tie
    pxRect(ctx, cx - 1, 44, 3, 4, look.tieColor);
    pxRect(ctx, cx - 2, 48, 5, 14, look.tieColor);
    pxRect(ctx, cx - 3, 60, 7, 8, look.tieColor);
    // Tie pattern (dots)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 2; c++) {
        px(ctx, cx - 1 + c * 2, 50 + r * 4, "#5a5a7a");
      }
    }
    // Lapels
    drawLapels(ctx, cx, look.outfitAccent);
  }
}

function drawHoodieShape(ctx, cx, color, y0, y1) {
  // trapezoid widening
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / (y1 - y0);
    const hw = Math.round(13 + t * 5);
    pxRect(ctx, cx - hw, y, hw * 2, 1, color);
  }
}

function drawShirtShape(ctx, cx, main, shade) {
  for (let y = 44; y < 80; y++) {
    const t = (y - 44) / 36;
    const hw = Math.round(11 + t * 4);
    pxRect(ctx, cx - hw, y, hw * 2, 1, main);
    // right edge shading
    pxRect(ctx, cx + hw - 2, y, 2, 1, shade);
  }
}

function drawSuitShape(ctx, cx, main, shade) {
  for (let y = 44; y < 80; y++) {
    const t = (y - 44) / 36;
    const hw = Math.round(13 + t * 5);
    pxRect(ctx, cx - hw, y, hw * 2, 1, main);
    pxRect(ctx, cx + hw - 2, y, 2, 1, shade);
  }
}

function drawLapels(ctx, cx, shade) {
  // Triangular lapel highlights on either side of the V
  for (let i = 0; i < 6; i++) {
    pxRect(ctx, cx - 6 - i, 46 + i, 2, 1, shade);
    pxRect(ctx, cx + 5 + i, 46 + i, 2, 1, shade);
  }
}

// === REACT WRAPPER ===
const { useEffect: useEffectChar, useRef: useRefChar, useState: useStateChar } = React;

function PixelCharacter({ characterId, size = 320, animate = true, accent = "lime" }) {
  const canvasRef = useRefChar(null);
  const [frame, setFrame] = useStateChar(0);
  const look = PIXEL_LOOKS[characterId];

  // Animation tick — frame cycles 0,1,2,1 for sway
  useEffectChar(() => {
    if (!animate) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 380);
    return () => clearInterval(id);
  }, [animate]);

  // Redraw on look or frame change
  useEffectChar(() => {
    if (!look || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const swayMap = [0, 1, 0, -1];
    drawPixelChar(ctx, look, { sway: swayMap[frame] });
  }, [look, frame]);

  if (!look) return null;
  const a = ACCENT_MAP[accent];
  return (
    <div className="pixel-char" style={{ "--accent": a.hex, "--accent-soft": a.soft }}>
      <div className="pixel-char-stage">
        {/* Backdrop disc — Wii-style turntable */}
        <div className="pixel-char-disc" />
        <div className="pixel-char-disc-ring" />
        <div className="pixel-char-spotlight" />

        <div className={`pixel-char-figure ${animate ? "is-animating" : ""}`}>
          <canvas
            ref={canvasRef}
            width={64}
            height={80}
            style={{
              width: size,
              height: size * (80 / 64),
              imageRendering: "pixelated",
              display: "block",
            }}
          />
          {/* Pixel shadow on disc */}
          <div className="pixel-char-floor-shadow" />
        </div>

        {/* Decorative grid floor */}
        <div className="pixel-char-floor" />
      </div>
    </div>
  );
}

window.PixelCharacter = PixelCharacter;
window.PIXEL_LOOKS = PIXEL_LOOKS;
