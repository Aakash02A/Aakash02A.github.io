// ================================================
// Aakash G — Portfolio
// Theme, navigation, reveal, live status, contact form
// ================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initSmoothScroll();
  initClock();
  initReveal();
  initContactForm();
});

/* ---------------- theme ---------------- */
function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const stored = safeGet("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  const initial = stored || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    safeSet("theme", next);
  });
}

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* storage unavailable — theme just won't persist */
  }
}

/* ---------------- navigation ---------------- */
function initNav() {
  const nav = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = Array.from(document.querySelectorAll("section[id], header[id]"));

  if (!nav) return;

  const closeMenu = () => {
    nav.classList.remove("mobile-open");
    document.body.classList.remove("no-scroll");
    if (toggle) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
  };

  const openMenu = () => {
    nav.classList.add("mobile-open");
    document.body.classList.add("no-scroll");
    if (toggle) {
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
    }
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      nav.classList.contains("mobile-open") ? closeMenu() : openMenu();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  links.forEach((link) => link.addEventListener("click", closeMenu));

  const updateSurface = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const updateActive = () => {
    const offset = nav.offsetHeight + 60;
    const pos = window.scrollY + offset;
    let activeId = sections[0]?.id || "";

    sections.forEach((section) => {
      if (pos >= section.offsetTop) activeId = section.id;
    });

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateSurface();
        updateActive();
        ticking = false;
      });
    },
    { passive: true }
  );

  updateSurface();
  updateActive();
}

/* ---------------- smooth scroll ---------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------------- status-strip clock ---------------- */
function initClock() {
  const el = document.getElementById("localTime");
  if (!el) return;

  const update = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata"
    });
    el.textContent = `${formatted} IST`;
  };

  update();
  window.setInterval(update, 30000);
}

/* ---------------- scroll reveal ---------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------- contact form ---------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = document.getElementById("contactStatus");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    const valid = data.name.length >= 2 && emailRegex.test(data.email) && data.message.length >= 10;

    if (!valid) {
      const msg = "Please fill in every field with valid details.";
      setStatus(msg, "err");
      notify(msg, "err");
      return;
    }

    const endpoint = (form.dataset.endpoint || "").trim();
    if (submitBtn) submitBtn.disabled = true;
    setStatus("Sending…", "");

    if (endpoint) {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then((res) => {
          if (res.ok) {
            const msg = "Message sent — thanks, I'll reply soon.";
            setStatus(msg, "ok");
            notify(msg, "ok");
            form.reset();
          } else {
            const msg = "Something went wrong. Please try again.";
            setStatus(msg, "err");
            notify(msg, "err");
          }
        })
        .catch(() => {
          const msg = "Network error — please try again later.";
          setStatus(msg, "err");
          notify(msg, "err");
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
      return;
    }

    // fallback: open the user's email client
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:aakashvkl4@email.com?subject=${subject}&body=${body}`;
    const msg = "Opening your email app with the message ready.";
    setStatus(msg, "ok");
    notify(msg, "ok");
    window.setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
    }, 900);
  });

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
  }
}

function notify(message, type) {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = `notification ${type === "ok" ? "ok" : type === "err" ? "err" : ""}`.trim();
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.textContent = message;
  document.body.appendChild(el);

  window.setTimeout(() => {
    el.classList.add("leave");
    window.setTimeout(() => el.remove(), 200);
  }, 4000);
}