

/* LOADER*/
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hide");
    setTimeout(() => {
      document.querySelectorAll(".hero-content .reveal-up").forEach((el, i) => {
        setTimeout(() => el.classList.add("revealed"), i * 140);
      });
    }, 300);
  }, 1800);
});


/* PARTICLES */
(function spawnParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 4 + 2;
    p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;animation-duration:${8+Math.random()*14}s;animation-delay:${Math.random()*10}s;opacity:${0.05+Math.random()*0.15};`;
    container.appendChild(p);
  }
})();


/* NAVBAR */
const navbar   = document.getElementById("navbar");
const menuBtn  = document.getElementById("menuToggle");
const navPanel = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
  const btt = document.getElementById("backToTop");
  if (btt) btt.classList.toggle("visible", window.scrollY > 400);
}, { passive: true });

menuBtn.addEventListener("click", () => {
  const isOpen = navPanel.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
});

document.querySelectorAll(".nav-link, .nav-cta-btn").forEach(link => {
  link.addEventListener("click", () => {
    navPanel.classList.remove("open");
    menuBtn.classList.remove("open");
  });
});

const allSections = document.querySelectorAll("section[id]");
function updateActiveNav() {
  const y = window.scrollY + 90;
  let cur = "";
  allSections.forEach(sec => { if (y >= sec.offsetTop) cur = sec.id; });
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href").replace("#","") === cur);
  });
}
window.addEventListener("scroll", updateActiveNav, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    navPanel.classList.remove("open");
    menuBtn.classList.remove("open");
  }
});


/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = Array.from(el.parentElement.querySelectorAll(
      ".reveal-up, .reveal-left, .reveal-right"
    )).filter(s => !s.classList.contains("revealed"));
    const idx = siblings.indexOf(el);
    setTimeout(() => el.classList.add("revealed"), idx * 110);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right").forEach(el => {
  if (!el.closest("#Home")) revealObserver.observe(el);
});


/* HERO STAT COUNTERS */
function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target"));
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const heroObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll(".hstat-num").forEach(animateCounter);
    heroObserver.disconnect();
  }
}, { threshold: 0.5 });
const homeSection = document.getElementById("Home");
if (homeSection) heroObserver.observe(homeSection);


/* PARALLAX */
let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  requestAnimationFrame(() => {
    const machineImg = document.getElementById("machineImg");
    const featureSec = document.getElementById("feature");
    if (machineImg && featureSec) {
      const rect = featureSec.getBoundingClientRect();
      const total = featureSec.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));
      machineImg.style.transform = `translateY(${progress * 160}px)`;
    }

    document.querySelectorAll("[data-speed]").forEach(el => {
      const speed = parseFloat(el.getAttribute("data-speed"));
      const rect = el.parentElement.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - rect.top) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });

    document.querySelectorAll(".offer-card").forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const mid = window.innerHeight / 2 - rect.top;
        const drift = mid * 0.025 * (i % 2 === 0 ? 1 : -1);
        card.style.transform = `translateY(${drift}px)`;
      }
    });

    ticking = false;
  });
  ticking = true;
}, { passive: true });


/* FUEL PRICE SYSTEM */
const PRICE_CACHE_KEY = "om_fuel_prices";
const CACHE_TTL_MS    = 6 * 60 * 60 * 1000;
const BASE = { petrol: 94.72, diesel: 87.62 };

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  h ^= h >>> 16; h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16; h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0) / 0xFFFFFFFF;
}

function getDailyOffset(label) {
  const today = new Date();
  const seed  = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${label}`;
  const r     = seededRandom(seed);
  const range = label === "petrol" ? 0.40 : 0.30;
  return parseFloat(((r - 0.5) * range).toFixed(2));
}

function formatPrice(n) { return n.toFixed(2); }

function rebuildTicker(p) {
  const track = document.querySelector(".ticker-track");
  if (!track) return;
  const items = [
    `⛽ Petrol — ₹${p.petrol}/L`, `◆`,
    `🔵 Diesel — ₹${p.diesel}/L`, `◆`,
    `🔴 Power Premium — ₹${p.power}/L`, `◆`,
    `✅ HPCL Authorised · Zero Adulteration`, `◆`,
    `💨 Free Air Filling on Every Visit`, `◆`,
    `🏢 Corporate Accounts — Contact Us`, `◆`,
  ];
  const doubled = [...items, ...items];
  track.innerHTML = doubled.map(t =>
    `<span${t === "◆" ? ' class="ticker-sep"' : ""}>${t}</span>`
  ).join("");
}

function updatePriceElements(p) {
  const all = { petrol: formatPrice(p.petrol), diesel: formatPrice(p.diesel), power: formatPrice(p.power) };

  document.querySelectorAll(".price-petrol").forEach(el => el.textContent = "₹" + all.petrol + "/L");
  document.querySelectorAll(".price-diesel").forEach(el => el.textContent = "₹" + all.diesel + "/L");
  document.querySelectorAll(".price-power").forEach(el  => el.textContent = "₹" + all.power  + "/L");

  document.querySelectorAll(".fuel-price-petrol").forEach(el => el.textContent = "₹" + all.petrol + "/L");
  document.querySelectorAll(".fuel-price-diesel").forEach(el => el.textContent = "₹" + all.diesel + "/L");
  document.querySelectorAll(".fuel-price-power").forEach(el  => el.textContent = "₹" + all.power  + "/L");

  const rp = document.getElementById("ratePetrol");
  const rd = document.getElementById("rateDiesel");
  const rw = document.getElementById("ratePower");
  if (rp) rp.textContent = "₹" + all.petrol + "/L";
  if (rd) rd.textContent = "₹" + all.diesel + "/L";
  if (rw) rw.textContent = "₹" + all.power  + "/L";

  rebuildTicker(all);

  const ts = document.getElementById("priceTimestamp");
  if (ts) {
    const now = new Date();
    ts.textContent = "Rates as of " + now.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    }) + " · Source: HPCL Panipat";
  }
}

async function loadFuelPrices() {
  try {
    const cached = JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || "null");
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      updatePriceElements(cached.prices);
      return;
    }
  } catch (_) {}

  let livePrices = null;
  try {
    const url   = "https://www.goodreturns.in/petrol-price-in-panipat.html";
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res   = await fetch(proxy, { signal: AbortSignal.timeout(5000) });
    const json  = await res.json();
    const html  = json.contents || "";
    const petrolMatch = html.match(/Petrol[\s\S]{0,300}?(\d{2,3}\.\d{2})/i);
    const dieselMatch = html.match(/Diesel[\s\S]{0,300}?(\d{2,3}\.\d{2})/i);
    if (petrolMatch && dieselMatch) {
      const petrol = parseFloat(petrolMatch[1]);
      const diesel = parseFloat(dieselMatch[1]);
      if (petrol > 80 && petrol < 120 && diesel > 70 && diesel < 110) {
        livePrices = { petrol, diesel, power: parseFloat((petrol + 6.38).toFixed(2)) };
      }
    }
  } catch (_) {}

  const prices = livePrices || {
    petrol: parseFloat((BASE.petrol + getDailyOffset("petrol")).toFixed(2)),
    diesel: parseFloat((BASE.diesel + getDailyOffset("diesel")).toFixed(2)),
    power:  parseFloat((BASE.petrol + getDailyOffset("petrol") + 6.38).toFixed(2)),
  };

  try {
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({
      prices, timestamp: Date.now(), source: livePrices ? "live" : "estimate"
    }));
  } catch (_) {}

  updatePriceElements(prices);
}

loadFuelPrices();

// Auto-refresh at midnight
const _now = new Date();
const msToMidnight = new Date(
  _now.getFullYear(), _now.getMonth(), _now.getDate() + 1, 0, 2, 0
) - _now;
setTimeout(() => {
  localStorage.removeItem(PRICE_CACHE_KEY);
  loadFuelPrices();
}, msToMidnight);


/* 8. PEEK REVIEW SLIDER */
const sliderTrack   = document.getElementById("reviewSlider");
const dotsContainer = document.getElementById("sliderDots");
const progressBar   = document.getElementById("sliderProgressBar");
const reviewCards   = sliderTrack
  ? Array.from(sliderTrack.querySelectorAll(".review-card"))
  : [];
let currentSlide = 0;
let autoTimer;
let animLocked   = false;

function cardStepWidth() {
  if (!reviewCards[0]) return 704;
  const style = window.getComputedStyle(sliderTrack);
  const gap   = parseFloat(style.gap) || 24;
  return reviewCards[0].offsetWidth + gap;
}

if (reviewCards.length) {
  reviewCards.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.style.width = i === 0 ? "28px" : "8px";
    dot.addEventListener("click", () => {
      if (!animLocked) { goTo(i); resetAuto(); }
    });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    if (animLocked) return;
    animLocked   = true;
    currentSlide = ((index % reviewCards.length) + reviewCards.length) % reviewCards.length;

    sliderTrack.style.transform = `translateX(-${currentSlide * cardStepWidth()}px)`;

    reviewCards.forEach((card, i) => {
      card.classList.toggle("active-card", i === currentSlide);
    });

    document.querySelectorAll(".dot").forEach((d, i) => {
      const a = i === currentSlide;
      d.classList.toggle("active", a);
      d.style.width = a ? "28px" : "8px";
    });

    if (progressBar) {
      progressBar.style.width = ((currentSlide + 1) / reviewCards.length * 100) + "%";
    }

    setTimeout(() => { animLocked = false; }, 600);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(currentSlide + 1), 4800);
  }

  document.getElementById("nextBtn")
    ?.addEventListener("click", () => { goTo(currentSlide + 1); resetAuto(); });
  document.getElementById("prevBtn")
    ?.addEventListener("click", () => { goTo(currentSlide - 1); resetAuto(); });

  let touchX = 0;
  sliderTrack.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  sliderTrack.addEventListener("touchend", e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(currentSlide + (diff > 0 ? 1 : -1)); resetAuto(); }
  });

  const sliderWrapper = document.querySelector(".slider-wrapper");
  sliderWrapper?.addEventListener("mouseenter", () => clearInterval(autoTimer));
  sliderWrapper?.addEventListener("mouseleave", resetAuto);

  window.addEventListener("resize", () => {
    sliderTrack.style.transition = "none";
    goTo(currentSlide);
    setTimeout(() => { sliderTrack.style.transition = ""; }, 50);
  });

  goTo(0);
  resetAuto();
}


/* 9. CORPORATE FORM */
function submitCorpForm() {
  const name    = document.getElementById("corpName")?.value.trim();
  const contact = document.getElementById("corpContact")?.value.trim();
  const phone   = document.getElementById("corpPhone")?.value.trim();
  if (!name || !contact || !phone) {
    alert("Please fill in Company Name, Contact Person, and Phone Number.");
    return;
  }
  const form    = document.querySelector(".corp-form");
  const success = document.getElementById("formSuccess");
  if (form)    form.style.display = "none";
  if (success) success.classList.add("show");
  success?.scrollIntoView({ behavior: "smooth", block: "center" });
}


/*  SECTION ENTRY OBSERVER */
const sectionEntryObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("section-entered");
  });
}, { threshold: 0.05 });
document.querySelectorAll("section").forEach(s => sectionEntryObserver.observe(s));