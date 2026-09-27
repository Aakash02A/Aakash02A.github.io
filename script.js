// REVEAL (blur + rise)
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal, .reveal-img, .reveal-l, .reveal-r")
  .forEach((el) => obs.observe(el));

// SCROLL-SPY
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  let cur = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) cur = s.id;
  });
  navLinks.forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === "#" + cur),
  );
});

// CONTROLLED ANCHOR SCROLL
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    const header = document.querySelector(".site-header");
    const offset = (header ? header.offsetHeight : 0) + 16;
    const start = window.scrollY;
    const destination = Math.max(0, target.offsetTop - offset);
    const distance = destination - start;
    const duration = 900;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || Math.abs(distance) < 1) {
      window.scrollTo(0, destination);
      return;
    }

    const startedAt = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    history.pushState(null, "", anchor.getAttribute("href"));
  });
});

// CAROUSEL DOTS
const carousel = document.getElementById("carousel");
const dotsWrap = document.getElementById("dots");
if (carousel && dotsWrap) {
  const cards = carousel.querySelectorAll(".project-card");
  cards.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "c-dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Go to project " + (i + 1));
    d.addEventListener("click", () =>
      carousel.scrollTo({
        left:
          ((carousel.scrollWidth - carousel.clientWidth) * i) /
          (cards.length - 1),
        behavior: "smooth",
      }),
    );
    dotsWrap.appendChild(d);
  });
  carousel.addEventListener("scroll", () => {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const progress = maxScroll > 0 ? carousel.scrollLeft / maxScroll : 0;
    const idx = Math.round(progress * (cards.length - 1));
    document
      .querySelectorAll(".c-dot")
      .forEach((d, i) => d.classList.toggle("active", i === idx));
  });
}

// MOBILE MENU
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }),
  );
}

// BACK TO TOP
const backToTop = document.getElementById("back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

// FORM
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector(".btn-send");
  const label = btn.querySelector(".btn-pill-label");
  const original = label.textContent;

  label.textContent = "Sending...";
  btn.disabled = true;

  try {
    const response = await fetch(form.dataset.endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.elements.name.value,
        email: form.elements.email.value,
        message: form.elements.message.value,
        _subject: "New message from your portfolio",
      }),
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    form.reset();
    label.textContent = "Sent!";
    btn.style.background = "#a4813d";
  } catch (error) {
    label.textContent = "Try again";
    btn.style.background = "#a43d3d";
  } finally {
    setTimeout(() => {
      label.textContent = original;
      btn.style.background = "";
      btn.disabled = false;
    }, 3000);
  }
}
