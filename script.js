// script.js — логика портфолио + анимации + частицы + книга отзывов

let allProjects = window.PROJECTS || [];
let allReviews = window.REVIEWS || [];
let filteredProjects = [...allProjects];
let visibleCount = 30;
const BATCH_SIZE = 30;
let currentReviewPage = 0;
const REVIEWS_PER_PAGE = 6;

const CATEGORY_ICONS = {
  ecommerce: "🛒", fintech: "💳", saas: "☁️", automation: "⚙️",
  logistics: "🚚", medical: "🏥", education: "🎓", realestate: "🏠",
  delivery: "📦", mobile: "📱", gambling: "🎰"
};

const CATEGORY_NAMES = {
  ecommerce: "E-commerce", fintech: "Финтех", saas: "SaaS",
  automation: "Автоматизация", logistics: "Логистика",
  medical: "Медицина", education: "Образование",
  realestate: "Недвижимость", delivery: "Доставка",
  mobile: "Мобильные", gambling: "Гемблинг"
};

// ===== ПАРТИКЛЫ =====
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = 60;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? "157,140,255" : "180,255,92",
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      grad.addColorStop(0, `rgba(${p.color},${p.alpha})`);
      grad.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== ЗВЁЗДЫ =====
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty);
}

// ===== ПРОЕКТЫ =====
function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const toShow = filteredProjects.slice(0, visibleCount);
  toShow.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.style.animationDelay = `${(i % 10) * 40}ms`;
    card.innerHTML = `
      <div class="project-art">
        <div class="project-art-emoji">${CATEGORY_ICONS[p.category] || "📦"}</div>
      </div>
      <div class="project-body">
        <div class="project-meta">
          <span>${String(i + 1).padStart(2, "0")} / ${CATEGORY_NAMES[p.category] || "PROJECT"}</span>
          <span class="project-status">${p.year}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.subtitle}</p>
        <div class="project-client">👤 ${p.client}</div>
        <div class="project-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span>${p.rating.toFixed(1)}</span>
          <span class="date">${p.date}</span>
        </div>
        <div class="tag-list">
          ${p.tags.slice(0, 4).map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    `;
    card.addEventListener("click", () => openModal(p));
    grid.appendChild(card);
  });

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    if (visibleCount >= filteredProjects.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-flex";
      loadMoreBtn.textContent = `Показать ещё ${Math.min(BATCH_SIZE, filteredProjects.length - visibleCount)} проектов ↓`;
    }
  }
}

function updateCategoryCounts() {
  const counts = { all: allProjects.length };
  allProjects.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  Object.keys(counts).forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = counts[key];
  });
}

function applyFilters() {
  const activeFilter = document.querySelector(".filter-button.active")?.dataset.filter || "all";
  const searchQuery = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const sortValue = document.getElementById("sortSelect")?.value || "date-desc";

  filteredProjects = allProjects.filter(p => {
    const matchCategory = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      p.subtitle.toLowerCase().includes(searchQuery) ||
      p.client.toLowerCase().includes(searchQuery) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery));
    return matchCategory && matchSearch;
  });

  filteredProjects.sort((a, b) => {
    if (sortValue === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortValue === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortValue === "rating-desc") return b.rating - a.rating;
    if (sortValue === "title-asc") return a.title.localeCompare(b.title);
    return 0;
  });

  visibleCount = BATCH_SIZE;
  renderProjects();
}

function openModal(project) {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  document.getElementById("modalEyebrow").textContent = `PROJECT / ${project.category.toUpperCase()}`;
  document.getElementById("modalTitle").textContent = project.title;
  document.getElementById("modalDescription").textContent = project.desc;

  document.getElementById("modalMeta").innerHTML = `
    <span class="meta-client">👤 ${project.client}</span>
    <span>📅 ${project.date}</span>
    <span>💰 Бюджет: обсуждается</span>
  `;

  document.getElementById("modalFeatures").innerHTML = project.features.map(f => `<li>${f}</li>`).join("");
  document.getElementById("modalTags").innerHTML = project.tags.map(t => `<span>${t}</span>`).join("");
  document.getElementById("modalRating").innerHTML = `
    <span class="stars">${renderStars(project.rating)}</span>
    <span class="rating-value">${project.rating.toFixed(1)} / 5.0</span>
    <span style="color: #6e7892; margin-left: auto;">${project.year}</span>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ===== КНИГА ОТЗЫВОВ =====
function renderReviews() {
  const pageEl = document.getElementById("reviewsPage");
  const infoEl = document.getElementById("reviewsPageInfo");
  if (!pageEl) return;

  const start = currentReviewPage * REVIEWS_PER_PAGE;
  const end = start + REVIEWS_PER_PAGE;
  const pageReviews = allReviews.slice(start, end);

  pageEl.innerHTML = pageReviews.map((r, i) => {
    const stars = renderStars(r.rating);
    return `
      <article class="review-card" style="animation-delay: ${i * 60}ms">
        <div class="review-header">
          <img class="review-avatar-img" src="${r.avatar}" alt="${r.name}" loading="lazy" />
          <div class="review-author">
            <strong>${r.name}</strong>
            <span>${r.nick} · ${r.role}</span>
          </div>
          <div class="review-rating">${stars}</div>
        </div>
        <p class="review-text">«${r.text}»</p>
        <div class="review-footer">
          <span class="review-date">${r.date}</span>
          <span class="review-rating-value">${r.rating.toFixed(1)} / 5.0</span>
        </div>
      </article>
    `;
  }).join("");

  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  if (infoEl) infoEl.textContent = `Страница ${currentReviewPage + 1} из ${totalPages}`;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  updateCategoryCounts();

  document.querySelectorAll(".filter-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(applyFilters, 250);
    });
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += BATCH_SIZE;
      renderProjects();
    });
  }

  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("projectModal")?.addEventListener("click", (e) => {
    if (e.target.id === "projectModal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  const prevBtn = document.getElementById("reviewsPrev");
  const nextBtn = document.getElementById("reviewsNext");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (currentReviewPage > 0) {
      currentReviewPage--;
      renderReviews();
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth" });
    }
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
    if (currentReviewPage < totalPages - 1) {
      currentReviewPage++;
      renderReviews();
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth" });
    }
  });

  applyFilters();
  renderReviews();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".section-block").forEach(s => observer.observe(s));
});