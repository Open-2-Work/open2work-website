// v2 main app — single featured card + pixel character on the side.
// Vim navigation, prev/next arrows, page indicator, keymap overlay.
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentMode": "per-character",
  "globalAccent": "lime",
  "background": "grid",
  "scanlines": true,
  "ambientGlow": true,
  "tagline": "Four junior engineers. One apartment. Available now.",
  "headline": "SELECT YOUR HIRE",
  "showBalconyPrompt": true,
  "characterAnimate": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [vimBuffer, setVimBuffer] = useState("");
  const [hireEgg, setHireEgg] = useState(false);
  const roster = window.ROSTER;

  const characters = roster.map((c) =>
    t.accentMode === "global" ? { ...c, accent: t.globalAccent } : c
  );

  const active = characters[activeIdx];
  const goNext = () => setActiveIdx((i) => (i + 1) % characters.length);
  const goPrev = () => setActiveIdx((i) => (i - 1 + characters.length) % characters.length);

  // Keyboard / Vim nav
  useEffect(() => {
    const handler = (e) => {
      // Don't intercept when typing in inputs (tweaks panel)
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const k = e.key;
      // Vim: h/l prev/next, j/k prev/next
      if (k === "l" || k === "ArrowRight") { goNext(); e.preventDefault(); return; }
      if (k === "h" || k === "ArrowLeft")  { goPrev(); e.preventDefault(); return; }
      if (k === "j" || k === "ArrowDown")  { goNext(); e.preventDefault(); return; }
      if (k === "k" || k === "ArrowUp")    { goPrev(); e.preventDefault(); return; }
      if (k === "?" || (e.shiftKey && k === "/")) { setShowHelp((v) => !v); e.preventDefault(); return; }
      if (k === "Escape") { setShowHelp(false); return; }
      // Number keys 1-4
      const n = parseInt(k, 10);
      if (n >= 1 && n <= characters.length) { setActiveIdx(n - 1); return; }
      // Easter egg buffer "hire"
      if (/^[a-z]$/.test(k)) {
        const next = (vimBuffer + k).slice(-4);
        setVimBuffer(next);
        if (next === "hire") setHireEgg(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, vimBuffer, characters.length]);

  // Hash deeplink
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const i = characters.findIndex((c) => c.id === hash);
    if (i >= 0) setActiveIdx(i);
  }, []);
  useEffect(() => {
    if (active) window.history.replaceState(null, "", `#${active.id}`);
  }, [activeIdx]);

  return (
    <div className={`app bg-${t.background} ${t.ambientGlow ? "has-glow" : ""}`}>
      {t.scanlines && <ScanField density={0.6} />}
      {t.background === "grid" && <div className="bg-grid" aria-hidden />}
      {t.background === "code" && <CodeRain />}
      {t.ambientGlow && (
        <div className="ambient-glow" aria-hidden>
          <div className="glow glow-1" style={{ background: ACCENT_MAP[active.accent].hex, opacity: 0.18 }} />
          <div className="glow glow-2" />
        </div>
      )}

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">▮▮</span>
          <span className="brand-name">OPEN2WORK</span>
          <span className="brand-ver">v2.0</span>
        </div>
        <div className="header-meta">
          <span className="dim">COPENHAGEN.DK</span>
          <span className="sep">/</span>
          <span className="status-live">
            <span className="status-dot" /> 4 ONLINE
          </span>
        </div>
      </header>

      {/* Hero strip */}
      <div className="v2-hero">
        <div className="prompt-line">
          <span className="prompt-arrow">&gt;</span>
          <span className="prompt-text">init recruit.exe</span>
          <Caret />
        </div>
        <h1 className="v2-headline">{t.headline}</h1>
        <p className="v2-tagline">{t.tagline}</p>
      </div>

      {/* MAIN STAGE — featured card + character */}
      <FeaturedStage
        key={active.id}
        character={active}
        index={activeIdx}
        total={characters.length}
        animate={t.characterAnimate}
        onPrev={goPrev}
        onNext={goNext}
      />

      {/* Bottom rail */}
      <BottomRail
        characters={characters}
        activeIdx={activeIdx}
        onSelect={setActiveIdx}
        onPrev={goPrev}
        onNext={goNext}
      />

      {/* Footer hints */}
      <div className="v2-foot">
        <div className="hint-row">
          <kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd><span>vim nav</span>
          <span className="dot-sep">·</span>
          <kbd>1–4</kbd><span>jump</span>
          <span className="dot-sep">·</span>
          <kbd>?</kbd><span>help</span>
        </div>
        {t.showBalconyPrompt && (
          <div className="balcony-prompt">
            <span className="qr-mini" aria-hidden>
              <svg viewBox="0 0 9 9" width="22" height="22">
                {[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],
                  [6,0],[7,0],[8,0],[6,1],[8,1],[6,2],[7,2],[8,2],
                  [0,6],[1,6],[2,6],[0,7],[2,7],[0,8],[1,8],[2,8],
                  [4,4],[5,5],[4,6],[6,4],[3,3],[5,3],[3,5],[6,6],[7,7],[8,8]
                ].map(([x,y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor"/>)}
              </svg>
            </span>
            <span>You scanned the QR on the balcony · Welcome.</span>
          </div>
        )}
      </div>

      {/* Help overlay */}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

      {/* Easter egg */}
      {hireEgg && (
        <div className="easter-egg" onClick={() => setHireEgg(false)}>
          <div className="ee-card">
            <div className="ee-title">CHEAT_CODE_ACCEPTED</div>
            <div className="ee-body">All four flatmates unlocked. They were never locked.</div>
            <div className="ee-hint">click anywhere to dismiss</div>
          </div>
        </div>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Aesthetic">
          <TweakRadio
            label="Accent mode"
            value={t.accentMode}
            options={[{value:"per-character", label:"Per-character"}, {value:"global", label:"Single accent"}]}
            onChange={(v) => setTweak("accentMode", v)}
          />
          {t.accentMode === "global" && (
            <TweakColor
              label="Global accent"
              value={t.globalAccent}
              options={[
                { value: "lime",    label: "Lime",    color: "#bef264" },
                { value: "cyan",    label: "Cyan",    color: "#67e8f9" },
                { value: "magenta", label: "Magenta", color: "#f0abfc" },
                { value: "amber",   label: "Amber",   color: "#fbbf24" },
              ]}
              onChange={(v) => setTweak("globalAccent", v)}
            />
          )}
          <TweakSelect
            label="Background"
            value={t.background}
            options={[
              { value: "grid",  label: "Grid lines" },
              { value: "code",  label: "Code rain" },
              { value: "void",  label: "Pure void" },
            ]}
            onChange={(v) => setTweak("background", v)}
          />
          <TweakToggle label="Scanlines" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
          <TweakToggle label="Ambient glow" value={t.ambientGlow} onChange={(v) => setTweak("ambientGlow", v)} />
          <TweakToggle label="Animate character" value={t.characterAnimate} onChange={(v) => setTweak("characterAnimate", v)} />
        </TweakSection>
        <TweakSection label="Copy">
          <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak("headline", v)} />
          <TweakText label="Tagline" value={t.tagline} onChange={(v) => setTweak("tagline", v)} />
          <TweakToggle label="Show balcony QR prompt" value={t.showBalconyPrompt} onChange={(v) => setTweak("showBalconyPrompt", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// === FEATURED STAGE ===
function FeaturedStage({ character, index, total, animate, onPrev, onNext }) {
  const a = ACCENT_MAP[character.accent];
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) { dx < 0 ? onNext() : onPrev(); }
    touchStartX.current = null;
  };

  return (
    <div className="featured" style={{ "--accent": a.hex, "--accent-soft": a.soft }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Side prev arrow */}
      <button className="side-arrow side-arrow-l" onClick={onPrev} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 4 L7 10 L13 16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <div className="featured-grid">
        {/* CHARACTER COLUMN */}
        <div className="featured-char">
          <PixelCharacter
            characterId={character.id}
            size={window.innerWidth <= 480 ? 160 : window.innerWidth <= 720 ? 200 : 300}
            animate={animate}
            accent={character.accent}
          />
          <div className="char-id-strip">
            <span className="char-id-num">{character.id}</span>
            <span className="char-id-codename">{character.codename}</span>
            <span className="char-id-status"><span className="status-dot" /> ONLINE</span>
          </div>
          <div className="page-indicator">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`pi-dot ${i === index ? "is-active" : ""}`} />
            ))}
            <span className="pi-text">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>
        </div>

        {/* INFO COLUMN */}
        <div className="featured-info">
          <div className="info-meta">
            <div className="meta-codename">
              <span style={{ color: a.hex }}>›</span> {character.codename}
            </div>
            <h2 className="info-name">{character.name}<Caret /></h2>
            <div className="info-title-row">
              <span className="info-title">{character.title}</span>
              <span className="dot-sep">·</span>
              <span className="dim">{character.yearsExp} yr exp</span>
              <span className="dot-sep">·</span>
              <span className="dim">{character.location}</span>
            </div>
          </div>

          <blockquote className="info-quote">
            <span className="quote-mark">"</span>{character.quote}<span className="quote-mark">"</span>
          </blockquote>

          <section className="info-section">
            <header className="section-header">
              <span className="section-num">01</span>
              <span className="section-title">BIO</span>
              <span className="section-rule" />
            </header>
            <div className="bio-text">
              {character.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>

          <section className="info-section">
            <header className="section-header">
              <span className="section-num">02</span>
              <span className="section-title">SKILL_MATRIX</span>
              <span className="section-rule" />
            </header>
            <div className="skills-list">
              {character.skills.map((s, i) => (
                <div key={s.name} className="skill-row" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="skill-name">{s.name}</div>
                  <SkillBar level={s.level} accent={character.accent} />
                  <div className="skill-level">{s.level}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="info-section">
            <header className="section-header">
              <span className="section-num">03</span>
              <span className="section-title">LINKS</span>
              <span className="section-rule" />
            </header>
            <div className="quick-links quick-links-row">
              <a className="link-btn link-primary" href={character.linkedin} target="_blank" rel="noreferrer">
                <span>LINKEDIN</span><span className="link-arrow">↗</span>
              </a>
              {character.github && (
                <a className="link-btn" href={character.github} target="_blank" rel="noreferrer">
                  <span>GITHUB</span><span className="link-arrow">↗</span>
                </a>
              )}
              {character.site && (
                <a className="link-btn" href={character.site} target="_blank" rel="noreferrer">
                  <span>{character.site.replace(/^https?:\/\//, "").replace(/\/$/, "").toUpperCase()}</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              <a className="link-btn" href={character.cv} download>
                <span>DOWNLOAD CV</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      <button className="side-arrow side-arrow-r" onClick={onNext} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 4 L13 10 L7 16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

// === BOTTOM RAIL ===
function BottomRail({ characters, activeIdx, onSelect, onPrev, onNext }) {
  return (
    <div className="rail">
      <button className="rail-arrow" onClick={onPrev}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3 L5 7 L9 11" stroke="currentColor" strokeWidth="1.5"/></svg>
      </button>
      <div className="rail-tiles">
        {characters.map((c, i) => {
          const a = ACCENT_MAP[c.accent];
          const isActive = i === activeIdx;
          return (
            <button
              key={c.id}
              className={`rail-tile ${isActive ? "is-active" : ""}`}
              style={{ "--accent": a.hex, "--accent-soft": a.soft }}
              onClick={() => onSelect(i)}
            >
              <div className="rail-tile-portrait">
                <RailPortrait characterId={c.id} />
              </div>
              <div className="rail-tile-meta">
                <span className="rail-tile-num">{c.id}</span>
                <span className="rail-tile-codename">{c.codename}</span>
              </div>
              {isActive && <span className="rail-tile-marker" />}
            </button>
          );
        })}
      </div>
      <button className="rail-arrow" onClick={onNext}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3 L9 7 L5 11" stroke="currentColor" strokeWidth="1.5"/></svg>
      </button>
    </div>
  );
}

// Mini portrait for the rail — same renderer at small size, no animation.
function RailPortrait({ characterId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    drawPixelChar(ctx, PIXEL_LOOKS[characterId], { sway: 0 });
  }, [characterId]);
  return (
    <canvas ref={ref} width={64} height={80}
      style={{ width: 56, height: 70, imageRendering: "pixelated", display: "block", margin: "0 auto" }}
    />
  );
}

// === HELP OVERLAY ===
function HelpOverlay({ onClose }) {
  const rows = [
    ["h / ←", "previous flatmate"],
    ["l / →", "next flatmate"],
    ["j / ↓", "next flatmate"],
    ["k / ↑", "previous flatmate"],
    ["1 – 4", "jump to flatmate"],
    ["?", "toggle this help"],
    ["Esc", "close overlays"],
    ["h-i-r-e", "(easter egg)"],
  ];
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <span className="help-title">:keymap</span>
          <button className="help-close" onClick={onClose}>ESC</button>
        </div>
        <table className="help-table">
          <tbody>
            {rows.map(([k, d]) => (
              <tr key={k}>
                <td><kbd>{k}</kbd></td>
                <td>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="help-foot">~ open2work · vim mode ~</div>
      </div>
    </div>
  );
}

// Code rain background
function CodeRain() {
  const cols = 40;
  const chars = "01<>{}[]/=*+-|".split("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 220);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="code-rain" aria-hidden>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="code-col" style={{ left: `${(i / cols) * 100}%`, animationDelay: `${(i * 0.13) % 4}s` }}>
          {Array.from({ length: 18 }).map((_, j) => (
            <span key={j}>{chars[(i * 7 + j * 3 + tick) % chars.length]}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
