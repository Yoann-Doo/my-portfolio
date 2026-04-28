// ── Responsive helper ──────────────────────────────────────────
const isMobile = () => window.innerWidth < 768;

// ── Year auto-update ───────────────────────────────────────────
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Scroll-reveal (IntersectionObserver) ──────────────────────
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // once is enough
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".section").forEach(el => revealObserver.observe(el));

// ── Navigation: scroll background ─────────────────────────────
const navbar = document.getElementById("navbar");

function updateNav() {
  navbar.classList.toggle("scrolled", window.scrollY > 30);
}
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

// ── Navigation: active link on scroll ─────────────────────────
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id], div[id='experience']");

const activeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach(s => activeObserver.observe(s));

// ── Navigation: hamburger menu ─────────────────────────
const navToggle   = document.getElementById("navToggle");
const navLinksEl  = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinksEl.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close mobile menu on link click
navLinksEl.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navLinksEl.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ── Canvas particle background ────────────────────────────────
const canvas = document.getElementById("bg");
const ctx    = canvas.getContext("2d");

let w, h, particles;

function resizeCanvas() {
  w = canvas.width  = window.innerWidth;
  h = canvas.height = window.innerHeight;
  createParticles();
}

function createParticles() {
  const density = isMobile() ? 0.00008 : 0.00015;
  const count   = Math.floor(w * h * density);

  particles = Array.from({ length: count }, () => ({
    x:  Math.random() * w,
    y:  Math.random() * h,
    r:  Math.random() * (isMobile() ? 1.2 : 2.2) + 0.5,
    dx: (Math.random() - 0.5) * (isMobile() ? 0.2 : 0.4),
    dy: (Math.random() - 0.5) * (isMobile() ? 0.2 : 0.4),
  }));
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function animate() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(34,211,238,0.8)";

  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();

// ── GitHub API ────────────────────────────────────────────────
const username = "Yoann-Doo";
const repoList = document.getElementById("repo-list");

if (repoList) {
  fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`)
    .then(res => res.json())
    .then(repos => {
      const filtered = repos.filter(repo => !repo.fork).slice(0, isMobile() ? 4 : 6);

      if (filtered.length === 0) {
        repoList.innerHTML = "<p>Aucun projet public pour l'instant.</p>";
        return;
      }

      filtered.forEach(repo => {
        const div = document.createElement("div");
        div.className = "project";
        div.innerHTML = `
          <h3>${repo.name}</h3>
          <p>${repo.description || "Aucune description disponible."}</p>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" aria-label="Voir ${repo.name} sur GitHub">
            Voir sur GitHub →
          </a>
        `;
        repoList.appendChild(div);
      });
    })
    .catch(() => {
      repoList.innerHTML = "<p>Impossible de charger les projets GitHub pour le moment.</p>";
    });
}