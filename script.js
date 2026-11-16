/* ===========================================================
   Thiago Oliveira — Portfólio · script
   =========================================================== */

/* -----------------------------------------------------------
   DADOS DO PORTFÓLIO
   Para adicionar/editar um vídeo, é só mexer aqui:
   - id    : ID do arquivo no Google Drive (o que vem em /file/d/AQUI/view)
   - title : título que aparece no card
   - cat   : "vsl" | "criativos" | "tiktok"
   O arquivo precisa estar compartilhado como
   "Qualquer pessoa com o link" para tocar no site.
   ----------------------------------------------------------- */
const VIDEOS = [
  // ---- VSL ----
  { id: "1uN6QT5ZBDjHlm5-FweShvtPX82hiMfJa", title: "VSL 01", cat: "vsl" },
  { id: "1jL1CYJjOfTlTlaOGfU8ef_qXQLaTRHZy", title: "VSL 02", cat: "vsl" },

  // ---- ADS / CRIATIVOS ----
  { id: "1spgTiyzIlrVbPDM9Uyj4tDWBL8GtPx1v", title: "Criativo 01", cat: "criativos" },
  { id: "1UwBIeqcVs-AGqyVnq_3KzU-lzqI6T6RW", title: "Criativo 02", cat: "criativos" },
  { id: "1yXO_XziqJrTiwUn5sk4kFhKcKgs_61YZ", title: "Criativo 03", cat: "criativos" },

  // ---- TIKTOK SHOP ----
  { id: "1FAA0kNaL8ChpmdD20oq2UA97Rfw33iVj", title: "TikTok Shop 01", cat: "tiktok" },
  { id: "18tk7lr9n_fDQQL8ytdrCV_FIDuwu6kCv", title: "TikTok Shop 02", cat: "tiktok" },
];

const CAT_LABEL = { vsl: "VSL", criativos: "Criativo", tiktok: "TikTok Shop" };

const thumbUrl = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1280`;
const previewUrl = (id) => `https://drive.google.com/file/d/${id}/preview`;

/* -----------------------------------------------------------
   GALERIA
   ----------------------------------------------------------- */
const gallery = document.getElementById("gallery");

function buildGallery() {
  const frag = document.createDocumentFragment();
  VIDEOS.forEach((v, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.dataset.cat = v.cat;
    card.dataset.id = v.id;
    card.dataset.title = v.title;
    card.style.animationDelay = (i % 6) * 0.06 + "s";
    card.setAttribute("aria-label", `Assistir: ${v.title}`);

    card.innerHTML = `
      <div class="card__fallback">${CAT_LABEL[v.cat] || "Vídeo"}</div>
      <img class="card__thumb" src="${thumbUrl(v.id)}" alt="${v.title}" loading="lazy"
           referrerpolicy="no-referrer" />
      <div class="card__overlay">
        <span class="card__cat">${CAT_LABEL[v.cat] || ""}</span>
        <span class="card__title">${v.title}</span>
      </div>
      <span class="card__play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </span>`;

    const img = card.querySelector(".card__thumb");

    // Cada card assume a proporção real do vídeo
    const applyRatio = () => {
      if (img.naturalWidth && img.naturalHeight) {
        card.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      }
    };
    if (img.complete && img.naturalWidth) applyRatio();
    img.addEventListener("load", applyRatio);

    // Fallback quando a thumb não carrega (arquivo ainda privado, etc.)
    img.addEventListener("error", () => {
      img.style.display = "none";
      card.querySelector(".card__fallback").style.display = "flex";
    });

    card.addEventListener("click", () => openModal(v));
    frag.appendChild(card);
  });
  gallery.appendChild(frag);
}
buildGallery();

/* -----------------------------------------------------------
   FILTROS
   ----------------------------------------------------------- */
const filters = document.getElementById("filters");
filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  filters.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  const f = btn.dataset.filter;
  gallery.querySelectorAll(".card").forEach((card, i) => {
    const show = f === "all" || card.dataset.cat === f;
    card.classList.toggle("is-hidden", !show);
    if (show) {
      card.style.animation = "none";
      // reflow para reiniciar a animação
      void card.offsetWidth;
      card.style.animation = "";
      card.style.animationDelay = (i % 6) * 0.05 + "s";
    }
  });
});

// Filtro inicial: abrir já em Criativos
const initialFilter = filters.querySelector('.filter[data-filter="criativos"]');
if (initialFilter) initialFilter.click();

/* -----------------------------------------------------------
   MODAL / PLAYER
   ----------------------------------------------------------- */
const modal = document.getElementById("modal");
const modalBox = document.getElementById("modalBox");
const modalFrame = document.getElementById("modalFrame");
const modalTitle = document.getElementById("modalTitle");

// Link de reserva + aviso de carregamento + pré-conexão com o Drive
const modalLink = document.createElement("a");
modalLink.className = "modal__drive";
modalLink.target = "_blank";
modalLink.rel = "noopener";
modalLink.textContent = "Não carregou? Assista no Google Drive";
modalTitle.insertAdjacentElement("afterend", modalLink);
["https://drive.google.com", "https://www.gstatic.com", "https://youtube.googleapis.com"].forEach((h) => {
  const l = document.createElement("link");
  l.rel = "preconnect"; l.href = h; l.crossOrigin = "";
  document.head.appendChild(l);
});
const vStyle = document.createElement("style");
vStyle.textContent = `.vload{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#bdbdbd;font:500 14px Inter,system-ui,sans-serif;background:#000}
.vload span{width:38px;height:38px;border-radius:50%;border:3px solid rgba(255,255,255,.15);border-top-color:var(--accent,#ff7a1a);animation:vspin .8s linear infinite}
@keyframes vspin{to{transform:rotate(360deg)}}
.modal__frame iframe{opacity:0;transition:opacity .3s}
.modal__frame iframe.is-ready{opacity:1}
.modal__drive{display:block;text-align:center;margin-top:8px;font-size:13px;color:var(--muted,#9a9a9a);text-decoration:underline}
.modal__drive:hover{color:var(--accent,#ff7a1a)}`;
document.head.appendChild(vStyle);

const isMobile = () => window.matchMedia("(max-width: 620px)").matches;
let lastDims = [9, 16];

// Dimensiona o player para caber na tela (largura E altura), em qualquer proporção
function fitFrame(w, h) {
  lastDims = [w, h];
  modalBox.classList.toggle("is-vertical", h > w);
  if (isMobile()) {
    const ar = w / h;
    const maxW = window.innerWidth * 0.96;
    const maxH = window.innerHeight * 0.86;
    let fw = maxW, fh = fw / ar;
    if (fh > maxH) { fh = maxH; fw = fh * ar; }
    modalFrame.style.aspectRatio = "";
    modalFrame.style.width = Math.round(fw) + "px";
    modalFrame.style.height = Math.round(fh) + "px";
  } else {
    modalFrame.style.width = "";
    modalFrame.style.height = "";
    modalFrame.style.aspectRatio = w + " / " + h;
  }
}

window.addEventListener("resize", () => {
  if (modal.classList.contains("is-open")) fitFrame(lastDims[0], lastDims[1]);
});

function openModal(v) {
  modalTitle.textContent = v.title;

  // Dimensiona o player pela proporção real, sempre cabendo na tela
  fitFrame(9, 16); // padrão vertical até a miniatura carregar
  const probe = new Image();
  probe.referrerPolicy = "no-referrer";
  probe.onload = () => {
    if (probe.naturalWidth && probe.naturalHeight) fitFrame(probe.naturalWidth, probe.naturalHeight);
  };
  probe.src = thumbUrl(v.id);

  modalFrame.innerHTML = `<div class="vload"><span></span>Carregando vídeo…</div><iframe src="${previewUrl(v.id)}"
      allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  const vf = modalFrame.querySelector("iframe");
  vf.addEventListener("load", () => { vf.classList.add("is-ready"); const ld = modalFrame.querySelector(".vload"); if (ld) ld.remove(); });
  modalLink.href = `https://drive.google.com/file/d/${v.id}/view`;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalFrame.innerHTML = ""; // para o vídeo
  document.body.style.overflow = "";
}

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

/* -----------------------------------------------------------
   NAV: scroll + menu mobile
   ----------------------------------------------------------- */
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const navLinks = document.querySelector(".nav__links");

const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

/* -----------------------------------------------------------
   REVEAL ao rolar
   ----------------------------------------------------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* -----------------------------------------------------------
   CONTADORES das estatísticas
   ----------------------------------------------------------- */
const counters = document.querySelectorAll(".stats__num[data-count]");
const cio = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = Math.max(1, Math.round(target / 28));
      const tick = () => {
        cur = Math.min(target, cur + step);
        el.textContent = cur;
        if (cur < target) requestAnimationFrame(tick);
      };
      tick();
      cio.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
counters.forEach((c) => cio.observe(c));

/* -----------------------------------------------------------
   Ano no rodapé
   ----------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();
