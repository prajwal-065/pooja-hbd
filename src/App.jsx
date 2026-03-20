import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   Pre-generate particle data at module level (outside any
   component) so Math.random() is never called inside a render
═══════════════════════════════════════════════════════════ */
const PARTICLE_DATA = Array.from({ length: 20 }, () => ({
  size:  2 + Math.random() * 5,
  left:  Math.random() * 100,
  color: ["#7eb8f7","#aad4ff","#e8c97e","rgba(126,184,247,0.45)"][Math.floor(Math.random() * 4)],
  dur:   9  + Math.random() * 13,
  delay: -(Math.random() * 13),
}));

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const VALID_USER     = "Pooja";
const VALID_PASS     = "Poojac@2603";
const TOTAL_STEPS    = 6;
const BIRTHDAY_MONTH = 2;   // 0-indexed → March (change to your month)
const BIRTHDAY_DAY   = 26;  // change to Pooja's actual birthday day

/* Replace src values below with your own photo URLs or local paths
   e.g. src: "/photos/photo1.jpg"  (place photos in /public/photos/) */
const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=500&fit=crop&crop=face", cap: "Birthday Vibes 🎂" },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face", cap: "Sunshine Smile ☀️" },
  { src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face", cap: "Glowing 💙" },
  { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face", cap: "Star Girl ✨" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face", cap: "Radiant 🌙" },
  { src: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=500&fit=crop&crop=face", cap: "Forever Young 🎈" },
];

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES injected once into <head>
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --black:      #0a0a0f;
    --card:       #16161f;
    --border:     rgba(255,255,255,0.08);
    --white:      #f0f4ff;
    --white-dim:  rgba(240,244,255,0.65);
    --blue:       #7eb8f7;
    --blue-light: #aad4ff;
    --blue-glow:  rgba(126,184,247,0.25);
    --blue-soft:  rgba(126,184,247,0.10);
    --red:        #ff6b8a;
    --red-soft:   rgba(255,107,138,0.10);
    --green:      #6bffb8;
    --green-soft: rgba(107,255,184,0.10);
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }

  body {
    font-family:'Inter',sans-serif;
    background:var(--black);
    color:var(--white);
    min-height:100vh;
    overflow-x:hidden;
  }

  /* Stars canvas */
  #stars-canvas {
    position:fixed; inset:0; z-index:0; pointer-events:none;
  }

  /* Particles */
  .particle {
    position:fixed; border-radius:50%;
    pointer-events:none; z-index:0;
    animation:drift linear infinite;
  }
  @keyframes drift {
    0%   { transform:translateY(110vh) rotate(0deg);   opacity:0; }
    8%   { opacity:1; }
    92%  { opacity:1; }
    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
  }

  /* Floating emojis */
  .fheart {
    position:fixed; pointer-events:none; z-index:200;
    animation:fh-up ease-out forwards; opacity:0;
  }
  @keyframes fh-up {
    0%   { transform:translateY(0) scale(.5) rotate(-10deg); opacity:1; }
    100% { transform:translateY(-80vh) scale(1.2) rotate(20deg); opacity:0; }
  }

  /* Confetti */
  .conf {
    position:fixed; pointer-events:none; z-index:999;
    animation:conffall linear forwards;
  }
  @keyframes conffall {
    0%   { transform:translateY(-20px) rotate(0deg);   opacity:1; }
    100% { transform:translateY(108vh) rotate(720deg); opacity:0; }
  }

  /* Progress bar */
  .progress-wrap {
    position:fixed; top:0; left:0; width:100%; height:3px;
    background:rgba(255,255,255,.06); z-index:100;
  }
  .progress-fill {
    height:100%;
    background:linear-gradient(90deg,var(--blue),var(--blue-light));
    transition:width .8s cubic-bezier(.65,0,.35,1);
    box-shadow:0 0 12px var(--blue-glow);
  }

  /* Lightbox */
  .lightbox-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.92);
    z-index:300; display:flex; align-items:center; justify-content:center;
    padding:20px; backdrop-filter:blur(8px); animation:fadeIn .3s;
  }
  .lightbox-inner {
    max-width:90vw; max-height:85vh; position:relative;
    animation:zoomIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  .lightbox-inner img {
    max-width:100%; max-height:75vh; border-radius:16px;
    border:1px solid var(--border); display:block;
  }
  .lightbox-cap {
    text-align:center; font-family:'Playfair Display',serif;
    font-style:italic; color:var(--blue-light); margin-top:12px;
  }
  .lb-close {
    position:absolute; top:-16px; right:-16px;
    background:var(--card); border:1px solid var(--border);
    color:var(--white); width:36px; height:36px; border-radius:50%;
    cursor:pointer; font-size:18px;
    display:flex; align-items:center; justify-content:center;
    transition:all .2s;
  }
  .lb-close:hover { background:var(--blue); color:var(--black); }

  /* Card */
  .card {
    background:var(--card); border:1px solid var(--border);
    border-radius:24px; padding:40px 36px;
    max-width:640px; width:100%; text-align:center;
    box-shadow:0 32px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.06);
    position:relative; overflow:hidden;
  }
  .card::before {
    content:''; position:absolute; top:-80px; left:50%;
    transform:translateX(-50%); width:280px; height:280px;
    background:radial-gradient(circle,var(--blue-glow) 0%,transparent 70%);
    pointer-events:none;
  }

  /* Typography */
  .display-text {
    font-family:'Playfair Display',serif;
    font-size:clamp(2rem,7vw,3.5rem);
    font-weight:700; letter-spacing:-.02em; line-height:1.1;
    background:linear-gradient(135deg,var(--white) 0%,var(--blue-light) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; margin-bottom:16px;
  }
  .subheading {
    font-family:'Playfair Display',serif;
    font-size:clamp(1.1rem,3.5vw,1.5rem);
    color:var(--blue-light); margin-bottom:20px;
  }
  .body-text {
    font-size:clamp(.9rem,2.5vw,1.05rem);
    color:var(--white-dim); line-height:1.8; margin-bottom:20px;
  }
  .label-text {
    font-size:.7rem; font-weight:600; letter-spacing:.2em;
    text-transform:uppercase; color:var(--blue); margin-bottom:16px;
  }
  .divider {
    width:60px; height:1px;
    background:linear-gradient(90deg,transparent,var(--blue),transparent);
    margin:20px auto;
  }

  /* Outline pill button */
  .btn {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:var(--white);
    border:1px solid var(--blue); padding:14px 32px;
    border-radius:100px; font-size:.95rem; font-weight:500;
    font-family:'Inter',sans-serif; letter-spacing:.05em;
    cursor:pointer; transition:all .3s; margin-top:24px;
    position:relative; overflow:hidden; z-index:1;
  }
  .btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,var(--blue),var(--blue-light));
    opacity:0; transition:opacity .3s; z-index:-1;
  }
  .btn:hover { transform:translateY(-2px); box-shadow:0 8px 32px var(--blue-glow); color:var(--black); }
  .btn:hover::before { opacity:1; }
  .btn:active { transform:translateY(0); }

  /* Solid filled button */
  .btn-solid {
    display:inline-flex; align-items:center; gap:10px;
    background:linear-gradient(135deg,var(--blue),var(--blue-light));
    color:var(--black); border:none;
    padding:15px 36px; border-radius:100px;
    font-size:1rem; font-weight:700;
    font-family:'Inter',sans-serif; letter-spacing:.04em;
    cursor:pointer; transition:all .3s;
    box-shadow:0 8px 28px var(--blue-glow);
    position:relative; overflow:hidden;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-solid::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,var(--blue-light),var(--blue));
    opacity:0; transition:opacity .3s;
  }
  .btn-solid:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px rgba(126,184,247,.45); }
  .btn-solid:hover:not(:disabled)::before { opacity:1; }
  .btn-solid:active:not(:disabled) { transform:scale(.98); }
  .btn-solid:disabled { opacity:.7; cursor:default; }
  .btn-solid.done {
    background:linear-gradient(135deg,var(--green),#4dffa0);
    box-shadow:0 8px 28px rgba(107,255,184,.28);
  }

  /* Hero badge */
  .hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--blue-soft); border:1px solid rgba(126,184,247,.3);
    color:var(--blue-light); padding:6px 16px; border-radius:100px;
    font-size:.75rem; font-weight:600; letter-spacing:.15em;
    text-transform:uppercase; margin-bottom:24px;
  }

  /* Floating cake */
  .cake-icon {
    font-size:clamp(3rem,10vw,5rem); margin:20px 0;
    animation:float 3s ease-in-out infinite; display:block;
    filter:drop-shadow(0 0 20px rgba(126,184,247,.4));
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

  /* Name input */
  .name-input {
    width:100%; max-width:340px; padding:16px 24px;
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    border-radius:100px; color:var(--white); font-size:1rem;
    font-family:'Inter',sans-serif; text-align:center;
    outline:none; transition:all .3s; margin:20px 0;
  }
  .name-input:focus { border-color:var(--blue); box-shadow:0 0 0 4px var(--blue-soft); }
  .name-input::placeholder { color:rgba(255,255,255,.3); }
  .name-input.err { border-color:#ee0077; animation:shake .42s both; }

  /* Heart button */
  .heart-btn {
    width:100px; height:100px; background:none; border:none;
    cursor:pointer; margin:24px auto; display:block; transition:transform .2s;
  }
  .heart-btn:active { transform:scale(.92); }
  .heart-svg {
    width:100px; height:100px;
    animation:hbeat 1.4s ease-in-out infinite;
    filter:drop-shadow(0 0 20px var(--blue-glow));
  }
  @keyframes hbeat {
    0%,100%{transform:scale(1)} 15%{transform:scale(1.13)}
    30%{transform:scale(1)}    45%{transform:scale(1.07)} 60%{transform:scale(1)}
  }

  /* Typing box */
  .typing-box {
    background:var(--blue-soft); border:1px solid rgba(126,184,247,.2);
    border-radius:16px; padding:20px 24px; margin:20px 0;
    min-height:80px; text-align:center;
  }
  .typing-text {
    font-family:'Playfair Display',serif; font-style:italic;
    color:var(--blue-light); font-size:clamp(.9rem,2.5vw,1.1rem); line-height:1.7;
  }
  .cursor {
    display:inline-block; width:2px; height:1.1em; background:var(--blue);
    animation:blink .75s step-end infinite; vertical-align:middle; margin-left:2px;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Photo frame */
  .photo-frame {
    width:180px; height:180px; border-radius:50%; overflow:hidden;
    border:3px solid var(--blue); box-shadow:0 0 40px var(--blue-glow);
    margin:20px auto; transition:transform .4s;
  }
  .photo-frame:hover { transform:scale(1.05) rotate(3deg); }
  .photo-frame img { width:100%; height:100%; object-fit:cover; }

  /* Gallery */
  .gallery-grid {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:12px; margin:24px 0; width:100%;
  }
  .polaroid {
    background:#1a1a24; border:1px solid var(--border);
    border-radius:12px; overflow:hidden; cursor:pointer;
    transition:all .4s cubic-bezier(.34,1.56,.64,1); aspect-ratio:3/4;
  }
  .polaroid:hover {
    transform:scale(1.05) rotate(-1deg); border-color:var(--blue);
    box-shadow:0 12px 40px var(--blue-glow); z-index:2;
  }
  .polaroid img { width:100%; height:80%; object-fit:cover; display:block; }
  .polaroid-cap {
    padding:8px 6px 6px; text-align:center;
    font-family:'Playfair Display',serif; font-style:italic;
    font-size:clamp(.6rem,1.8vw,.8rem); color:var(--blue-light);
    height:20%; display:flex; align-items:center; justify-content:center;
  }

  /* Reveal box */
  .msg-reveal {
    background:var(--card); border:1px solid var(--border);
    border-radius:20px; padding:28px 24px; max-width:500px; width:100%;
    cursor:pointer; transition:all .4s; position:relative; overflow:hidden;
    margin:0 auto 24px; user-select:none; -webkit-tap-highlight-color:transparent;
  }
  .msg-reveal::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,var(--blue-soft),transparent);
    opacity:0; transition:opacity .4s;
  }
  .msg-reveal:hover::before, .msg-reveal.tapped::before { opacity:1; }
  .msg-reveal:hover { border-color:var(--blue); transform:translateY(-2px); }
  .msg-reveal.tapped { cursor:default; }

  .reveal-hint {
    display:flex; align-items:center; justify-content:center; gap:10px;
    color:var(--blue); font-size:.85rem; font-weight:500; letter-spacing:.08em;
  }
  .reveal-hint i { animation:tap-pulse 1.5s ease-in-out infinite; }
  @keyframes tap-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:.7} }

  .bday-msg {
    font-family:'Playfair Display',serif;
    font-size:clamp(.95rem,3vw,1.15rem);
    color:var(--white-dim); line-height:1.85; text-align:center;
  }
  .bday-msg em { color:var(--blue-light); font-style:italic; }

  /* Countdown */
  .countdown-wrap { display:flex; gap:12px; justify-content:center; margin:20px 0; flex-wrap:wrap; }
  .cd-box {
    background:var(--blue-soft); border:1px solid rgba(126,184,247,.2);
    border-radius:12px; padding:14px 18px; min-width:70px; text-align:center;
  }
  .cd-num {
    font-family:'Playfair Display',serif; font-size:2rem;
    font-weight:700; color:var(--blue-light); display:block; line-height:1;
  }
  .cd-label { font-size:.6rem; letter-spacing:.15em; text-transform:uppercase; color:var(--white-dim); margin-top:4px; display:block; }

  /* Signature */
  .signature { font-family:'Playfair Display',serif; font-style:italic; font-size:1.2rem; color:var(--blue-light); margin-top:20px; opacity:.8; }

  /* Share */
  .share-row { display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap; }
  .share-btn {
    width:44px; height:44px; border-radius:50%;
    background:var(--blue-soft); border:1px solid rgba(126,184,247,.25);
    color:var(--blue-light); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .3s; font-size:16px;
  }
  .share-btn:hover { background:var(--blue); color:var(--black); transform:translateY(-3px); }

  /* Step animation */
  @keyframes stepIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  .step-enter { animation:stepIn .65s cubic-bezier(.22,1,.36,1) forwards; }

  /* Login */
  .lock-wrap {
    width:68px; height:68px; border-radius:20px;
    background:var(--blue-soft); border:1px solid rgba(126,184,247,.3);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:26px; color:var(--blue-light); margin-bottom:22px;
    box-shadow:0 0 28px var(--blue-glow);
    transition:all .45s cubic-bezier(.34,1.56,.64,1);
  }
  .lock-wrap.open {
    background:var(--green-soft); border-color:rgba(107,255,184,.35);
    color:var(--green); box-shadow:0 0 36px rgba(107,255,184,.22);
    animation:popOpen .5s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes popOpen {
    0%{transform:scale(.75) rotate(-12deg)} 60%{transform:scale(1.18) rotate(6deg)} 100%{transform:scale(1) rotate(0)}
  }

  .field-group { margin-bottom:18px; text-align:left; }
  .field-label { display:block; font-size:.72rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--blue); margin-bottom:8px; }
  .field-wrap { position:relative; display:flex; align-items:center; }
  .field-icon { position:absolute; left:16px; color:var(--blue); font-size:14px; pointer-events:none; z-index:1; }
  .field-input {
    width:100%; padding:14px 46px 14px 42px;
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    border-radius:14px; color:var(--white); font-size:.95rem;
    font-family:'Inter',sans-serif; outline:none; transition:all .25s;
  }
  .field-input::placeholder { color:rgba(255,255,255,.25); }
  .field-input:focus { border-color:var(--blue); background:rgba(126,184,247,.06); box-shadow:0 0 0 4px var(--blue-soft); }
  .field-input.err { border-color:var(--red); background:var(--red-soft); animation:shake .42s both; }
  .field-input.ok  { border-color:var(--green); background:var(--green-soft); }

  .eye-btn { position:absolute; right:14px; background:none; border:none; color:var(--white-dim); cursor:pointer; font-size:14px; padding:4px 6px; transition:color .2s; z-index:1; line-height:1; }
  .eye-btn:hover { color:var(--blue-light); }

  .err-box {
    display:none; align-items:center; gap:9px;
    background:var(--red-soft); border:1px solid rgba(255,107,138,.28);
    border-radius:12px; padding:12px 16px; margin-bottom:16px;
    font-size:.84rem; color:var(--red); text-align:left;
    animation:slideDown .28s ease;
  }
  .err-box.visible { display:flex; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

  .spinner {
    width:16px; height:16px; border:2px solid rgba(0,0,0,.25);
    border-top-color:var(--black); border-radius:50%;
    animation:spin .65s linear infinite; flex-shrink:0;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* Success overlay */
  .success-overlay {
    position:fixed; inset:0; background:var(--black); z-index:500;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:14px; transition:opacity .5s;
  }
  .success-overlay .big-emoji { font-size:4rem; animation:bounceIn .55s cubic-bezier(.34,1.56,.64,1); }
  .success-overlay .success-msg {
    font-family:'Playfair Display',serif; font-size:clamp(1.5rem,5vw,2.1rem);
    background:linear-gradient(135deg,var(--white),var(--blue-light));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .success-overlay .success-hint { font-size:.88rem; color:var(--white-dim); }
  @keyframes bounceIn { 0%{transform:scale(0) rotate(-20deg)} 65%{transform:scale(1.22) rotate(8deg)} 100%{transform:scale(1) rotate(0)} }

  /* Animations */
  @keyframes shake {
    0%,100%{transform:translateX(0)} 18%{transform:translateX(-7px)}
    36%{transform:translateX(6px)}  54%{transform:translateX(-5px)}
    72%{transform:translateX(4px)}  90%{transform:translateX(-2px)}
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes zoomIn { from{transform:scale(.8);opacity:0} to{transform:scale(1);opacity:1} }

  /* Responsive */
  @media(max-width:480px){
    .card         { padding:28px 20px; border-radius:20px; }
    .gallery-grid { grid-template-columns:repeat(2,1fr); gap:8px; }
    .cd-box       { padding:10px 12px; min-width:56px; }
    .cd-num       { font-size:1.5rem; }
    .photo-frame  { width:140px; height:140px; }
    .lock-wrap    { width:58px; height:58px; font-size:22px; }
  }
  @media(max-width:360px){
    .btn,.btn-solid { padding:12px 24px; font-size:.88rem; }
    .field-input    { font-size:.88rem; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   STARS HOOK
═══════════════════════════════════════════════════════════ */
function useStars() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext("2d");
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.006,
    }));
    let raf;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.a += s.speed;
        const op = 0.15 + 0.55 * Math.abs(Math.sin(s.a));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(174,210,255,${op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return canvasRef;
}

/* ═══════════════════════════════════════════════════════════
   PARTICLES COMPONENT
═══════════════════════════════════════════════════════════ */
function Particles() {
  return (
    <>
      {PARTICLE_DATA.map((p, i) => (
        <div key={i} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.left}vw`,
          background: p.color,
          opacity: 0.5,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   UTILITIES — confetti & floating hearts
═══════════════════════════════════════════════════════════ */
function launchConfetti() {
  const colors = ["#7eb8f7","#aad4ff","#e8c97e","#fff","#4fc3f7","#ffd54f","#6bffb8"];
  const total  = window.innerWidth < 480 ? 80 : 150;
  for (let i = 0; i < total; i++) {
    setTimeout(() => {
      const c = document.createElement("div");
      c.className = "conf";
      const sz = 5 + Math.random() * 8;
      c.style.cssText = `left:${Math.random()*100}vw;top:-12px;width:${sz}px;height:${sz}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random()>.5?"50%":"3px"};
        animation-duration:${2+Math.random()*3}s;
        animation-delay:${Math.random()*.5}s;`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }, i * 14);
  }
}

function spawnFloatingHearts() {
  const emojis = ["💙","✨","🌙","⭐","💫","🦋"];
  for (let i = 0; i < 16; i++) {
    const h = document.createElement("div");
    h.className = "fheart";
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.cssText = `left:${10+Math.random()*80}vw;bottom:${10+Math.random()*30}vh;
      font-size:${18+Math.random()*22}px;
      animation-delay:${Math.random()*.5}s;
      animation-duration:${2.5+Math.random()*2}s;`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 5000);
  }
}

/* ═══════════════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════════════ */
function Lightbox({ photo, onClose }) {
  if (!photo) return null;
  return (
    <div className="lightbox-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-inner">
        <button className="lb-close" onClick={onClose}>×</button>
        <img src={photo.src} alt={photo.cap} />
        <p className="lightbox-cap">{photo.cap}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP WRAPPER
═══════════════════════════════════════════════════════════ */
function Step({ children, wide }) {
  return (
    <div className="step-enter" style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"24px 20px 40px",
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════════ */
function LoginPage({ onSuccess }) {
  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [errMsg,      setErrMsg]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [unlocked,    setUnlocked]    = useState(false);
  const [btnDone,     setBtnDone]     = useState(false);
  const [uErr,        setUErr]        = useState(false);
  const [pErr,        setPErr]        = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  function clearErr() { setErrMsg(""); setUErr(false); setPErr(false); }

  function doLogin() {
    clearErr();
    if (!username && !password) { setErrMsg("Please enter your username and password."); setUErr(true); setPErr(true); return; }
    if (!username) { setErrMsg("Please enter your username."); setUErr(true); return; }
    if (!password) { setErrMsg("Please enter your password."); setPErr(true); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === VALID_USER && password === VALID_PASS) {
        setBtnDone(true);
        setUnlocked(true);
        launchConfetti();
        setTimeout(() => setShowOverlay(true), 600);
        setTimeout(() => onSuccess(), 2500);
      } else {
        if (username !== VALID_USER && password !== VALID_PASS) {
          setErrMsg("Incorrect username and password. Please try again."); setUErr(true); setPErr(true);
        } else if (username !== VALID_USER) {
          setErrMsg("Incorrect username. Please try again."); setUErr(true);
        } else {
          setErrMsg("Incorrect password. Please try again."); setPErr(true);
        }
      }
    }, 900);
  }

  return (
    <div style={{ position:"relative", zIndex:10, width:"100%", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
      <div className="card step-enter" style={{ maxWidth:420 }}>

        {/* Lock icon */}
        <div className={`lock-wrap${unlocked ? " open" : ""}`}>
          <i className={`fas ${unlocked ? "fa-lock-open" : "fa-lock"}`} />
        </div>

        <h1 className="display-text" style={{ fontSize:"clamp(1.9rem,5.5vw,2.5rem)" }}>
          Birthday Surprise
        </h1>
        <p className="body-text">Enter your details to unlock 💙</p>

        {/* Username */}
        <div className="field-group">
          <label className="field-label">Username</label>
          <div className="field-wrap">
            <i className="fas fa-user field-icon" />
            <input
              className={`field-input${uErr ? " err" : ""}`}
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => { setUsername(e.target.value); clearErr(); }}
              onKeyDown={e => e.key === "Enter" && document.getElementById("pwInput").focus()}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password */}
        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="field-wrap">
            <i className="fas fa-lock field-icon" />
            <input
              id="pwInput"
              className={`field-input${pErr ? " err" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearErr(); }}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              autoComplete="current-password"
            />
            <button className="eye-btn" type="button" onClick={() => setShowPw(v => !v)}>
              <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        {/* Error */}
        <div className={`err-box${errMsg ? " visible" : ""}`}>
          <i className="fas fa-triangle-exclamation" />
          <span>{errMsg}</span>
        </div>

        {/* Submit */}
        <button
          className={`btn-solid${btnDone ? " done" : ""}`}
          style={{ width:"100%", marginTop:8, justifyContent:"center" }}
          onClick={doLogin}
          disabled={loading || btnDone}
        >
          {loading ? (
            <><div className="spinner" /><span>Checking…</span></>
          ) : btnDone ? (
            <span>✓ Welcome, Pooja!</span>
          ) : (
            <><span>Unlock Surprise</span><i className="fas fa-arrow-right" /></>
          )}
        </button>
      </div>

      {/* Success overlay */}
      {showOverlay && (
        <div className="success-overlay">
          <div className="big-emoji">🎉</div>
          <p className="success-msg">Welcome, Pooja! 💙</p>
          <p className="success-hint">Opening your surprise…</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — LANDING
═══════════════════════════════════════════════════════════ */
function StepLanding({ onNext }) {
  return (
    <Step>
      <div className="card">
        <div className="hero-badge">✦ A Special Day ✦</div>
        <span className="cake-icon">🎂</span>
        <h1 className="display-text">Happy Birthday,<br />Poo</h1>
        <p className="body-text">Something magical has been crafted just for you.<br />Are you ready to begin?</p>
        <div className="divider" />
        <button className="btn" onClick={onNext}>Open Your Gift &nbsp;✦</button>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2 — NAME INPUT
═══════════════════════════════════════════════════════════ */
function StepName({ onNext }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  function submit() {
    if (!val.trim()) { setErr(true); setTimeout(() => setErr(false), 600); return; }
    onNext(val.trim());
  }

  return (
    <Step>
      <div className="card">
        <div className="label-text">✦ Let's Make It Personal ✦</div>
        <h2 className="subheading">What shall I call you?</h2>
        <p className="body-text">Tell me your name so I can make this just for you.</p>
        <input
          className={`name-input${err ? " err" : ""}`}
          type="text"
          placeholder="Enter your name…"
          maxLength={30}
          value={val}
          onChange={e => { setVal(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
        />
        <button className="btn" onClick={submit}>Continue →</button>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3 — HEART
═══════════════════════════════════════════════════════════ */
function StepHeart({ userName, onNext }) {
  const [clicked,    setClicked]    = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);
  const [pulse,      setPulse]      = useState(false);

  function handleHeart() {
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
    spawnFloatingHearts();
    if (!clicked) {
      setClicked(true);
      setTimeout(() => setMsgVisible(true), 400);
    }
  }

  return (
    <Step>
      <div className="card">
        <div className="label-text">✦ Feel The Love ✦</div>
        <h2 className="subheading">
          For You, <span style={{ color:"var(--blue-light)" }}>{userName}</span>
        </h2>
        <p className="body-text">Tap the heart — feel something warm 💙</p>

        <button
          className="heart-btn"
          onClick={handleHeart}
          style={{ transform: pulse ? "scale(1.35)" : "scale(1)", transition:"transform .2s" }}
        >
          <svg className="heart-svg" viewBox="0 0 100 90" fill="none">
            <path
              d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z"
              fill="url(#hg)" stroke="rgba(126,184,247,0.4)" strokeWidth="1"
            />
            <defs>
              <linearGradient id="hg" x1="5" y1="5" x2="95" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7eb8f7" />
                <stop offset="100%" stopColor="#aad4ff" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        <div className="typing-box" style={{ opacity: msgVisible ? 1 : 0, transition:"opacity .6s" }}>
          <p className="typing-text">
            Some people make life brighter just by being in it — you’re one of them,{" "}
            <em style={{ color:"var(--blue-light)", fontStyle:"italic" }}>{userName}</em>. 💙
          </p>
        </div>

        <button className="btn" onClick={onNext}>Continue →</button>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4 — TYPING MESSAGE
═══════════════════════════════════════════════════════════ */
function StepMessage({ userName, onNext }) {
  const [text,    setText]    = useState("");
  const [showBtn, setShowBtn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const msgs = [
      `Dear ${userName},`,
      "You are truly one of a kind…",
      "Your smile lights up every room. ✨",
      "Your laughter is my favourite sound.",
      "I'm so grateful you exist. 💙",
      "May this year bring you pure joy.",
      "You deserve the entire universe.",
      `Happy Birthday, ${userName}! 🎂`,
    ];
    let mi = 0, ci = 0, del = false;

    function tick() {
      const cur = msgs[mi];
      if (del) { ci--; } else { ci++; }
      setText(cur.substring(0, ci));
      let speed = del ? 40 : 80;
      if (!del && ci === cur.length) { del = true; speed = 1800; }
      else if (del && ci === 0)      { del = false; speed = 400; mi = (mi + 1) % msgs.length; }
      timerRef.current = setTimeout(tick, speed);
    }

    const init = setTimeout(() => {
      tick();
      setTimeout(() => setShowBtn(true), 3000);
    }, 300);

    return () => { clearTimeout(init); clearTimeout(timerRef.current); };
  }, [userName]);

  return (
    <Step>
      <div className="card">
        <div className="label-text">✦ A Message For You ✦</div>
        <div className="photo-frame">
          <img
            src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face"
            alt="For you"
          />
        </div>
        <div className="typing-box">
          <p className="typing-text">
            <span>{text}</span>
            <span className="cursor" />
          </p>
        </div>
        <button
          className="btn"
          onClick={onNext}
          style={{ opacity: showBtn ? 1 : 0, pointerEvents: showBtn ? "auto" : "none", transition:"opacity .5s" }}
        >
          See Your Surprise →
        </button>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 5 — GALLERY
═══════════════════════════════════════════════════════════ */
function StepGallery({ onNext }) {
  const [lightPhoto, setLightPhoto] = useState(null);

  return (
    <Step>
      <Lightbox photo={lightPhoto} onClose={() => setLightPhoto(null)} />
      <div className="card" style={{ maxWidth:700 }}>
        <div className="label-text">✦ Special Moments ✦</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2rem)", color:"var(--white)", marginBottom:8 }}>
          Our Beautiful Memories
        </h2>
        <p className="body-text" style={{ marginBottom:4 }}>Tap any photo to view it larger ✨</p>
        <p style={{ fontSize:".75rem", color:"var(--blue)", marginBottom:20 }}>
          (Replace these with your own photos!)
        </p>
        <div className="gallery-grid">
          {PHOTOS.map((p, i) => (
            <div key={i} className="polaroid" onClick={() => setLightPhoto(p)}>
              <img src={p.src} alt={p.cap} loading="lazy" />
              <div className="polaroid-cap">{p.cap}</div>
            </div>
          ))}
        </div>
        <button className="btn" onClick={onNext}>Your Final Surprise →</button>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN HOOK
═══════════════════════════════════════════════════════════ */
function useCountdown() {
  const [time, setTime] = useState({ d:"00", h:"00", m:"00", s:"00" });
  useEffect(() => {
    function getNext() {
      const now = new Date(), y = now.getFullYear();
      let bd = new Date(y, BIRTHDAY_MONTH, BIRTHDAY_DAY);
      if (bd <= now) bd = new Date(y + 1, BIRTHDAY_MONTH, BIRTHDAY_DAY);
      return bd;
    }
    function update() {
      const diff = getNext() - new Date();
      if (diff <= 0) { setTime({ d:"00",h:"00",m:"00",s:"00" }); return; }
      setTime({
        d: String(Math.floor(diff/(1000*60*60*24))).padStart(2,"0"),
        h: String(Math.floor((diff%(1000*60*60*24))/(1000*60*60))).padStart(2,"0"),
        m: String(Math.floor((diff%(1000*60*60))/(1000*60))).padStart(2,"0"),
        s: String(Math.floor((diff%(1000*60))/1000)).padStart(2,"0"),
      });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ═══════════════════════════════════════════════════════════
   STEP 6 — FINAL
═══════════════════════════════════════════════════════════ */
function StepFinal({ userName }) {
  const [revealed, setRevealed] = useState(false);
  const [wished,   setWished]   = useState(false);
  const cd = useCountdown();

  function makeWish() {
    setWished(true);
    launchConfetti();
    setTimeout(spawnFloatingHearts, 400);
    setTimeout(spawnFloatingHearts, 1200);
  }

  function share(p) {
    const txt = `🎂 Happy Birthday ${userName}! 🎉 Wishing you the most magical day! 💙`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(txt)}`,
      twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`,
    };
    window.open(urls[p], "_blank", "width=600,height=400");
  }

  return (
    <Step>
      <div className="card">
        <div className="label-text">✦ With All My Love ✦</div>
        <h1 className="display-text" style={{ fontSize:"clamp(1.6rem,5vw,2.6rem)" }}>
          🎉 Happy Birthday,<br /><span>{userName}</span>! 🎂
        </h1>
        <div className="divider" />

        {/* Tap to reveal */}
        <div
          className={`msg-reveal${revealed ? " tapped" : ""}`}
          onClick={() => !revealed && setRevealed(true)}
          role="button" tabIndex={0}
          onKeyDown={e => e.key === "Enter" && !revealed && setRevealed(true)}
        >
          {!revealed ? (
            <div className="reveal-hint">
              <i className="fas fa-hand-pointer" />
              <span>Tap to reveal your birthday message</span>
            </div>
          ) : (
            <p className="bday-msg">
              Dear <em>{userName}</em>,<br /><br />
              On this beautiful day, I want you to know that you are truly one of a kind.
              Your smile makes every room feel warmer, and your laughter makes everything better. 🌙<br /><br />
              <em>May this year bring you all the joy, peace, and love you so deeply deserve.</em><br /><br />
              You light up every room you walk into — never forget how special you are.
              Here's to another incredible year of being exactly, wonderfully, perfectly <em>you</em>. 💙<br /><br />
              With all my heart,<br />
              <em>Always yours ✦</em>
            </p>
          )}
        </div>

        {/* Countdown */}
        <div className="label-text" style={{ marginTop:24 }}>⏳ Next Birthday Countdown</div>
        <div className="countdown-wrap">
          {[["Days",cd.d],["Hours",cd.h],["Mins",cd.m],["Secs",cd.s]].map(([l,v]) => (
            <div className="cd-box" key={l}>
              <span className="cd-num">{v}</span>
              <span className="cd-label">{l}</span>
            </div>
          ))}
        </div>

        {/* Wish button */}
        <button
          className="btn-solid"
          onClick={makeWish}
          disabled={wished}
          style={{ marginTop:16, display:"flex", marginLeft:"auto", marginRight:"auto" }}
        >
          {wished ? "🌟 Wish Made!" : "🎆 Make a Wish"}
        </button>

        <div className="signature">Made with 💙 just for you</div>

        {/* Share */}
        <div className="share-row">
          <button className="share-btn" onClick={() => share("whatsapp")} title="WhatsApp">
            <i className="fab fa-whatsapp" />
          </button>
          <button className="share-btn" onClick={() => share("twitter")} title="Twitter">
            <i className="fab fa-twitter" />
          </button>
          <button className="share-btn" onClick={() => share("facebook")} title="Facebook">
            <i className="fab fa-facebook-f" />
          </button>
        </div>
      </div>
    </Step>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [step,     setStep]     = useState(1);
  const [userName, setUserName] = useState("Pooja");
  const canvasRef = useStars();

  /* Inject global CSS + FontAwesome once */
  useEffect(() => {
    const cssId = "pooja-global-css";
    if (!document.getElementById(cssId)) {
      const s = document.createElement("style");
      s.id = cssId;
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    const faId = "fa-cdn";
    if (!document.getElementById(faId)) {
      const l = document.createElement("link");
      l.id   = faId;
      l.rel  = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(l);
    }
    document.body.style.background = "#0a0a0f";
  }, []);

  const progress = loggedIn ? ((step - 1) / (TOTAL_STEPS - 1)) * 100 : 0;

  function goTo(n) { setStep(n); window.scrollTo(0, 0); }
  function handleName(name) { setUserName(name); goTo(3); }

  return (
    <>
      <canvas id="stars-canvas" ref={canvasRef} />
      <Particles />

      {loggedIn && (
        <div className="progress-wrap">
          <div className="progress-fill" style={{ width:`${progress}%` }} />
        </div>
      )}

      {!loggedIn && <LoginPage onSuccess={() => setLoggedIn(true)} />}

      {loggedIn && step === 1 && <StepLanding onNext={() => goTo(2)} />}
      {loggedIn && step === 2 && <StepName    onNext={handleName} />}
      {loggedIn && step === 3 && <StepHeart   userName={userName} onNext={() => goTo(4)} />}
      {loggedIn && step === 4 && <StepMessage userName={userName} onNext={() => goTo(5)} />}
      {loggedIn && step === 5 && <StepGallery onNext={() => goTo(6)} />}
      {loggedIn && step === 6 && <StepFinal   userName={userName} />}
    </>
  );
}
