// ================================================
// Aakash Portfolio
// Minimal interactions for navigation, reveal, and contact
// ================================================

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSmoothScroll();
    initContactForm();
    initScrollReveal();
});

function initNavigation() {
    const nav = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("header[id], section[id]"));

    if (!nav || !navMenu) return;

    const closeMenu = () => {
        navMenu.classList.remove("active");
        document.body.classList.remove("menu-open");

        if (navToggle) {
            navToggle.classList.remove("active");
            navToggle.setAttribute("aria-expanded", "false");
        }
    };

    const openMenu = () => {
        navMenu.classList.add("active");
        document.body.classList.add("menu-open");

        if (navToggle) {
            navToggle.classList.add("active");
            navToggle.setAttribute("aria-expanded", "true");
        }
    };

    if (navToggle) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.contains("active");
            isOpen ? closeMenu() : openMenu();
        });
    }

    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target) && navMenu.classList.contains("active")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    const updateNavSurface = () => {
        nav.classList.toggle("nav-scrolled", window.scrollY > 12);
    };

    const updateActiveLink = () => {
        const scrollPosition = window.scrollY + nav.offsetHeight + 96;
        let activeId = sections[0]?.id || "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeId = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
        });
    };

    let ticking = false;

    const onScroll = () => {
        if (ticking) return;

        window.requestAnimationFrame(() => {
            updateNavSurface();
            updateActiveLink();
            ticking = false;
        });

        ticking = true;
    };

    updateNavSurface();
    updateActiveLink();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveLink);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const subjectEl = document.getElementById("subject");
        const formData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            subject: subjectEl ? subjectEl.value.trim() : "",
            message: document.getElementById("message").value.trim()
        };

        if (!validateForm(formData)) {
            showNotification("Please complete every field with valid details.", "error");
            return;
        }

        const statusEl = document.getElementById("contactStatus");

        if (submitButton) {
            submitButton.disabled = true;
        }

        const endpoint = (contactForm.dataset.endpoint || "").trim();

        if (endpoint) {
            // Send via provided endpoint (e.g., Formspree). Expect JSON response or 2xx status.
            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        const successMsg = "Message sent — thank you!";
                        showNotification(successMsg, "success");
                        if (statusEl) statusEl.textContent = successMsg;
                        contactForm.reset();
                    } else {
                        const errMsg = "Failed to send message. Please try again.";
                        showNotification(errMsg, "error");
                        if (statusEl) statusEl.textContent = errMsg;
                    }
                })
                .catch((err) => {
                    console.error(err);
                    const netMsg = "Network error. Please try again later.";
                    showNotification(netMsg, "error");
                    if (statusEl) statusEl.textContent = netMsg;
                })
                .finally(() => {
                    if (submitButton) submitButton.disabled = false;
                });

            return;
        }

        // Fallback: open user's email client with prefilled content
        const subject = encodeURIComponent(`${formData.subject} - Portfolio inquiry from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
        );

        window.location.href = `mailto:aakashvkl4@email.com?subject=${subject}&body=${body}`;
        const openingMsg = "Opening your email app with the message ready.";
        showNotification(openingMsg, "success");
        if (statusEl) statusEl.textContent = openingMsg;

        window.setTimeout(() => {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }, 900);
    });
}

function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Subject is optional; if present it must be at least 3 chars.
    const subjectOk = data.subject.length === 0 || data.subject.length >= 3;

    return (
        data.name.length >= 2 &&
        emailRegex.test(data.email) &&
        subjectOk &&
        data.message.length >= 10
    );
}

function showNotification(message, type = "success") {
    const existingNotification = document.querySelector(".notification");

    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    const icon = document.createElement("i");
    const text = document.createElement("span");

    notification.className = `notification notification-${type}`;
    notification.setAttribute("role", "status");
    notification.setAttribute("aria-live", "polite");

    icon.className = `fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}`;
    icon.setAttribute("aria-hidden", "true");
    text.textContent = message;

    notification.append(icon, text);
    document.body.appendChild(notification);

    window.setTimeout(() => {
        notification.classList.add("is-leaving");
        window.setTimeout(() => notification.remove(), 200);
    }, 4200);
}

function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = document.querySelectorAll(`
        .stat,
        .skill-category,
        .project-card,
        .timeline-item,
        .education-card,
        .achievement-item,
        .cert-item,
        .contact-item,
        .contact-form
    `);

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -48px 0px"
        }
    );

    revealElements.forEach((element) => {
        element.classList.add("reveal");
        observer.observe(element);
    });
}

console.info("Aakash portfolio loaded.");
