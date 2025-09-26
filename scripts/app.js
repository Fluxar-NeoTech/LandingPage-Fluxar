// atualiza ano no footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -------------------------
   Seletores principais
------------------------- */
const body = document.body;
const navToggle = document.getElementById('navToggle'); // botão do header
const sidePanel = document.getElementById('sidePanel'); // painel lateral
const backdropEl = document.getElementById('backdrop'); // backdrop
const drawerLinks = Array.from(document.querySelectorAll('.side-panel__list .drawer-link'));
const drawerItems = Array.from(document.querySelectorAll('.side-panel__list .drawer-item'));

/* segurança: se não existir toggle/menu, não causa crash */
const hasMenuElements = !!(navToggle && sidePanel && backdropEl);

/* -------------------------
   Funções open/close do menu
   (trabalham com attribute hidden para acessibilidade)
------------------------- */
function openMenu() {
  body.classList.add('body--menu-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  if (sidePanel) sidePanel.setAttribute('aria-hidden', 'false');
  if (backdropEl) {
    backdropEl.removeAttribute('hidden'); // mostra com transição definida no CSS
  }
  // foco no primeiro link do drawer
  if (drawerLinks.length) drawerLinks[0].focus();
}
function closeMenu() {
  body.classList.remove('body--menu-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  if (sidePanel) sidePanel.setAttribute('aria-hidden', 'true');
  if (backdropEl) {
    backdropEl.setAttribute('hidden', '');
  }
  if (navToggle) navToggle.focus();
}
if (hasMenuElements) {
  navToggle.addEventListener('click', () => {
    const open = body.classList.contains('body--menu-open');
    if (open) closeMenu(); else openMenu();
  });

  // fecha ao clicar no backdrop
  backdropEl.addEventListener('click', closeMenu);

  // fecha com ESC
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' || ev.key === 'Esc') {
      if (body.classList.contains('body--menu-open')) closeMenu();
    }
  });
}
/* -------------------------
   Fecha o drawer ao clicar em links dentro do submenu (NeoTech > Sobre)
   NÃO fecha quando o usuário clica no botão que abre o submenu.
------------------------- */
(function setupCloseOnSubmenuClick() {
  const panel = document.getElementById('sidePanel');
  if (!panel) return;

  panel.addEventListener('click', (ev) => {
    // pega o elemento clicado que seja <a> ou <button> (ou elemento dentro deles)
    const clicked = ev.target.closest('a, button');
    if (!clicked) return;

    // Se o elemento tem o atributo data-no-close, não fecha (opcional)
    if (clicked.hasAttribute('data-no-close')) return;

    // Se o elemento é o botão que abre/fecha um submenu (ex.: .drawer-item.has-children > .drawer-link)
    // e ele NÃO é um <a> (ou seja, é realmente um botão toggle), então NÃO fechamos.
    // Isso evita fechar quando o usuário só quer abrir o submenu.
    if (clicked.matches('.drawer-item.has-children > .drawer-link') && clicked.tagName !== 'A') {
      return;
    }

    // Caso contrário: fechamos o menu.
    closeMenu();

    // para acessibilidade, foca o toggle do menu
    const navToggle = document.getElementById('navToggle');
    if (navToggle) navToggle.focus();
  }, { capture: false });
})();

/* -------------------------
   Acordeão interno (drawer)
------------------------- */
document.querySelectorAll('.drawer-item.has-children > .drawer-link').forEach(btn => {
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    const item = btn.closest('.drawer-item');
    const willOpen = !item.classList.contains('open');
    // fecha outros
    document.querySelectorAll('.drawer-item.has-children.open')
      .forEach(o => { if (o !== item) o.classList.remove('open'); });
    if (willOpen) item.classList.add('open'); else item.classList.remove('open');
  });
});

/* -------------------------
   Marca item ativo no drawer
   - tenta casar pathname; se não, marca "Início".
------------------------- */
(function markActiveItem() {
  if (!drawerItems.length) return;
  const path = location.pathname.replace(/\/$/, '') || '/';
  let matched = false;
  drawerItems.forEach(li => li.classList.remove('is-active'));
  drawerLinks.forEach(a => {
    const href = a.getAttribute('href') || '';
    const url = href.split('?')[0].split('#')[0];
    const normalized = url.replace(/\/$/, '') || '/';
    if (normalized === path) {
      a.closest('.drawer-item')?.classList.add('is-active');
      matched = true;
    }
  });
  if (!matched) {
    const inicio = drawerItems.find(li => {
      const a = li.querySelector('.drawer-link');
      const href = a ? (a.getAttribute('href') || '') : '';
      return href === '/' || href.toLowerCase().includes('inicio') || href.toLowerCase().includes('home');
    });
    if (inicio) inicio.classList.add('is-active');
    else drawerItems[0]?.classList.add('is-active'); // fallback
  }
})();

/* -------------------------
   Carrossel simples (fade) para #fluxarImg
------------------------- */
(function setupCarousel() {
  const imagens = [
    '/assets/images/ImagemTransmutando1.png',
    '/assets/images/ImagemTransmutando2.png',
    '/assets/images/ImagemTransmutando3.png'
  ];
  const imgEl = document.getElementById('fluxarImg');
  if (!imgEl) return;
  let idx = 0;
  // assegura que a primeira imagem já esteja no src
  if (!imgEl.src || imgEl.src.trim() === '') imgEl.src = imagens[0];
  imgEl.classList.add('is-active');
  setInterval(() => {
    // fade out/in simples usando classes e timeout compatível com seu CSS (.is-active -> opacity)
    imgEl.classList.remove('is-active');
    setTimeout(() => {
      idx = (idx + 1) % imagens.length;
      imgEl.src = imagens[idx];
      // small delay antes de adicionar is-active para disparar transition
      requestAnimationFrame(() => imgEl.classList.add('is-active'));
    }, 800); // deve bater com transition do CSS (você tem 1s; 800ms funciona suave)
  }, 3000); // troca a cada 3s
})();

/* -------------------------
   Reveal genérico via IntersectionObserver
------------------------- */
(function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const ioReveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        const idx = Array.from(el.parentNode?.children || []).indexOf(el);
        const auto = 60 * (el.hasAttribute('data-no-auto') ? 0 : Math.max(0, idx));
        el.style.transitionDelay = `${delay + auto}ms`;
        el.classList.add('is-in');
        ioReveal.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => ioReveal.observe(el));
})();

/* -------------------------
   Observador para iniciar a animação do canvas (se existir)
   - assume que você tem uma função startCanvasAnimation() definida em outro script
   - se não existir, aqui tentamos disparar um evento custom 'startCanvas' para que seu código capture
------------------------- */
(function triggerCanvasWhenReady() {
  const canvas = document.querySelector('.product__canvas');
  if (!canvas) return;
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      // dispara evento custom que seu script de canvas pode escutar:
      const ev = new CustomEvent('startCanvas');
      window.dispatchEvent(ev);
      io.disconnect();
    }
  }, { threshold: 0.2 });
  io.observe(canvas);
})();
document.addEventListener('DOMContentLoaded', () => {
  // Para cada .marquee, criamos um .inner e duplicamos o conteúdo para loop suave
  document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.track');
    if (!track) return;

    // Cria inner e move os itens atuais para dentro dele
    const inner = document.createElement('div');
    inner.className = 'inner';
    // mover nós (preserva event listeners se necessário)
    while (track.firstChild) inner.appendChild(track.firstChild);
    // agora inner contém os itens originais
    track.appendChild(inner);

    // duplicar o conteúdo do inner (clonar nodes) para evitar "pulos"
    // fazemos clone profundo dos filhos do inner e append
    const clones = [];
    Array.from(inner.children).forEach(child => {
      clones.push(child.cloneNode(true));
    });
    clones.forEach(c => inner.appendChild(c));

    // cálculo opcional: ajustar a duração automaticamente com base na largura
    // se quiser manter manual, comente essa parte.
    try {
      const speedVar = getComputedStyle(marquee).getPropertyValue('--marquee-speed').trim();
      // se user deixou algo como "24s", usa direto; se número, adiciona s
      let duration = speedVar || '28s';
      // aplica a duração ao inner (caso queira override via CSS inline)
      inner.style.animationDuration = duration;
    } catch (e) {
      // fallback: nada
    }
  });
});
(() => {
  const CANVAS_SEL = '.product__canvas';
  const X_IMG_SRC = '/assets/images/Logos/Fluxar.jpg';
  const PART_IMG_SRC = '/assets/images/imgParteFluxar.png';
  const BG = '#ffffff';

  const D = { xFade: 900, xLift: 700, word: 1000, hold: 300 };
  const TUNING = { liftY: 0.22, wordSize: 0.18, spreadL: 0.6, spreadR: 0.6, baseUp: 0.03 };

  const canvas = document.querySelector(CANVAS_SEL);
  if (!canvas) return console.warn('Canvas não encontrado:', CANVAS_SEL);
  const ctx = canvas.getContext('2d');

  const elTitleSmall = document.querySelector('.TituloProduto');
  const elTitle = document.querySelector('.product__title');
  const elDesc = document.querySelector('.product__desc');
  const elBtn = document.querySelector('.product__card .btn');

  const xImg = new Image(); xImg.src = X_IMG_SRC;
  const partImg = new Image(); partImg.src = PART_IMG_SRC;

  // helper media queries
  const mqSmall = window.matchMedia('(max-width:767px)');
  const mqTablet = window.matchMedia('(min-width:768px) and (max-width:1199px)');
  const mqXL = window.matchMedia('(min-width:1200px)');

  function isSmall() { return mqSmall.matches; }
  function isTablet() { return mqTablet.matches; }
  function isXL() { return mqXL.matches; }

  function getSize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const W = Math.max(10, rect.width);
    const H = Math.max(140, rect.height || (W * 0.45));
    return { W, H, dpr };
  }

  function fitCanvas() {
    const { W, H, dpr } = getSize();
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clear();
  }

  function clear(bg = BG) {
    const { W, H } = getSize();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 2);
  const easeIn = t => t * t;

  function drawImageCover(img, cx, cy, w, h, scale = 1) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const r = Math.min(w / iw, h / ih) * scale;
    const dw = iw * r, dh = ih * r;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  }

  function drawWord(cx, cy, size, t) {
    ctx.fillStyle = '#46005A';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${size}px Poppins, system-ui, sans-serif`;

    ctx.textAlign = 'right';
    ctx.fillText('Flu', cx - lerp(0, size * TUNING.spreadL, easeOut(t)), cy);

    ctx.textAlign = 'left';
    ctx.fillText('ar', cx + lerp(0, size * TUNING.spreadR, easeOut(t)), cy);
  }

  // IntersectionObserver para iniciar a animação uma vez
  let started = false;
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !started) {
      started = true;
      start();
      io.disconnect();
    }
  }, { threshold: 0.2 });
  io.observe(canvas);

  function start() {
    const tStart = performance.now();
    function frame(now) {
      const t = now - tStart;
      const { W, H } = getSize();
      const cx = W / 2;
      const baseY = H * (isSmall() ? 0.5 : 0.44);

      clear(BG);

      const xFadeT = clamp(t / D.xFade, 0, 1), xAlpha = easeOut(xFadeT);
      const liftT = clamp((t - D.xFade) / D.xLift, 0, 1), lift = easeOut(liftT);
      const yOff = lerp(0, -H * TUNING.liftY, lift) - H * TUNING.baseUp;

      const phoneStartDelay = D.xFade * (isSmall() ? 0.75 : 0.9) + (isSmall() ? 80 : 200);
      const phoneDuration = isSmall() ? 600 : 900;
      const phoneT = clamp((t - phoneStartDelay) / phoneDuration, 0, 1);
      const phoneEase = easeOut(phoneT);

      // phone size adaptativo
      let phoneMaxW = isSmall() ? Math.min(W * 0.72, 360) : (isTablet() ? Math.min(W * 0.50, 420) : Math.min(W * 0.34, 420));
      let phoneMaxH = phoneMaxW * 1.12;

      const phoneInitialY = H + phoneMaxH * 0.5 + 40;
      const phoneFinalY = baseY + yOff + Math.max((Math.min(W, H) * (TUNING.wordSize * (isXL() ? 0.9 : 1))) * 0.9, phoneMaxH * 0.28) + (isSmall() ? 6 : 10);
      const phoneY = lerp(phoneInitialY, phoneFinalY, phoneEase);
      const phoneScale = lerp(isSmall() ? 0.62 : 0.78, isSmall() ? 0.95 : 1.03, phoneEase);

      // logo X colorido
      if (xImg.complete && xImg.naturalWidth) {
        ctx.save();
        ctx.globalAlpha = xAlpha;
        const boxW = isSmall() ? W * 0.44 : (isTablet() ? W * 0.36 : W * 0.30);
        const boxH = isSmall() ? H * 0.22 : (isTablet() ? H * 0.32 : H * 0.32);
        const xScale = isSmall() ? lerp(0.42, 0.78, lift) : lerp(0.46, 0.92, lift);
        drawImageCover(xImg, cx, baseY + yOff, boxW, boxH, xScale);
        ctx.restore();
      }

      // phones
      if (partImg.complete && partImg.naturalWidth) {
        ctx.save();
        ctx.globalAlpha = clamp(phoneEase, 0, 1);
        drawImageCover(partImg, cx, phoneY, phoneMaxW, phoneMaxH, phoneScale);
        ctx.restore();
      }

      // palavra "Fluxar"
      const wordT = clamp((t - (D.xFade + D.xLift * 0.75)) / D.word, 0, 1);
      const wordAlpha = easeIn(wordT);
      if (wordAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = wordAlpha;
        const size = Math.min(W, H) * TUNING.wordSize * (isXL() ? 0.92 : (isSmall() ? 0.9 : 1));
        drawWord(cx, baseY + yOff, size, wordT);
        ctx.restore();
      }

      if (t > (D.xFade + D.xLift + D.word + D.hold)) {
        revealHtml();
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  let revealed = false;
  function revealHtml() {
    if (revealed) return;
    revealed = true;
    if (elTitleSmall) elTitleSmall.classList.add('is-in');
    if (elTitle) { elTitle.style.transitionDelay = '120ms'; elTitle.classList.add('is-in'); }
    if (elDesc) { elDesc.style.transitionDelay = '240ms'; elDesc.classList.add('is-in'); }
    if (elBtn) { elBtn.style.transitionDelay = '360ms'; elBtn.classList.add('is-in'); }
  }

  // reveal genérico (mantido)
  const els = document.querySelectorAll('.reveal');
  const ioReveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        const idx = Array.from(el.parentNode?.children || []).indexOf(el);
        const auto = 60 * (el.hasAttribute('data-no-auto') ? 0 : Math.max(0, idx));
        el.style.transitionDelay = `${delay + auto}ms`;
        el.classList.add('is-in');
        ioReveal.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => ioReveal.observe(el));

})();
  // pricing toggle
  (function () {
    const toggleBtns = document.querySelectorAll('.period-btn');
    const amountEls = document.querySelectorAll('.plan-price .amount');
    const periodLabels = document.querySelectorAll('.plan-price .period');

    // inicial (mensal)
    function setPeriod(period) {
      toggleBtns.forEach(b => {
        const p = b.dataset.period;
        b.classList.toggle('is-active', p === period);
        b.setAttribute('aria-pressed', (p === period).toString());
      });
      periodLabels.forEach(l => {
        l.textContent = period === 'monthly' ? '/mês' : '/mês';
      });
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => setPeriod(btn.dataset.period));
    });

    // start
    setPeriod('monthly');
  })();