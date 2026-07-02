/* Renders the photo gallery page from window.SITE_DATA.photos (data/photos.js).
   Each category gets its own slider. */
(function () {
  const D = window.SITE_DATA || {};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- Sidebar ---------- */
  const p = D.profile || {};
  const socials = [
    ['scholar', 'fa-solid fa-graduation-cap', 'Google Scholar'],
    ['researchgate', 'fa-brands fa-researchgate', 'ResearchGate'],
    ['github', 'fa-brands fa-github', 'GitHub'],
    ['linkedin', 'fa-brands fa-linkedin-in', 'LinkedIn'],
  ].filter(([k]) => p[k])
   .map(([k, ic, lbl]) => `<a href="${esc(p[k])}" target="_blank" aria-label="${lbl}"><i class="${ic}"></i></a>`)
   .join('') + (p.email ? `<a href="mailto:${esc(p.email)}" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>` : '');

  $('side-profile').innerHTML = `
    <img src="${esc(p.photo)}" alt="${esc(p.name)}">
    <h1><a href="index.html">${esc(p.name)}</a></h1>
    <div class="tagline">${esc(p.tagline)}</div>
    <div class="social-links">${socials}</div>`;

  $('footer-name').innerHTML = `© ${new Date().getFullYear()} <a href="index.html">${esc(p.name)}</a>. All rights reserved.`;

  /* ---------- Group photos by category (order of first appearance) ---------- */
  const photos = D.photos || [];
  const cats = [];
  const byCat = {};
  photos.forEach(ph => {
    const c = ph.category || 'Other';
    if (!byCat[c]) { byCat[c] = []; cats.push(c); }
    byCat[c].push(ph);
  });

  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-');

  /* Category links in the sidebar */
  $('gallery-nav').insertAdjacentHTML('beforeend', cats.map(c =>
    `<li><a href="#cat-${slug(c)}"><i class="fa-solid fa-camera"></i> ${esc(c)}</a></li>`).join(''));

  /* ---------- Sections: one slider per category ---------- */
  const sliderHTML = (imgs) => `
    <div class="slider gallery-slider">
      ${imgs.map((im, i) => `
        <div class="slide${i === 0 ? ' on' : ''}" data-src="${esc(im.src)}" data-caption="${esc(im.caption || '')}">
          <img src="${esc(im.src)}" alt="${esc(im.caption || 'Photo')}" loading="lazy">
          ${im.caption ? `<div class="slide-caption">${esc(im.caption)}</div>` : ''}
        </div>`).join('')}
      ${imgs.length > 1 ? `
      <button class="slide-arrow prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="slide-arrow next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="slide-dots">${imgs.map((_, i) => `<button data-dot="${i}"${i === 0 ? ' class="on"' : ''} aria-label="Slide ${i + 1}"></button>`).join('')}</div>` : ''}
    </div>`;

  $('gallery-content').innerHTML = cats.map(c => `
    <div class="gallery-cat" id="cat-${slug(c)}">
      <h3>${esc(c)} <span class="cat-count">(${byCat[c].length})</span></h3>
      ${sliderHTML(byCat[c])}
    </div>`).join('') || '<p>No photos yet — add some from the dashboard.</p>';

  /* ---------- Slider behaviour (shared) ---------- */
  function initSlider(slider) {
    const slides = slider.querySelectorAll('.slide');
    if (slides.length < 2) return;
    const dots = slider.querySelectorAll('[data-dot]');
    let idx = 0, timer;
    const show = (i) => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('on', j === idx));
      dots.forEach((d, j) => d.classList.toggle('on', j === idx));
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => show(idx + 1), 5000); };
    slider.querySelector('.prev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); auto(); });
    slider.querySelector('.next').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); auto(); });
    dots.forEach(d => d.addEventListener('click', (e) => { e.stopPropagation(); show(+d.dataset.dot); auto(); }));
    auto();
  }
  document.querySelectorAll('.gallery-slider').forEach(initSlider);

  /* ---------- Lightbox (click the photo) ---------- */
  const lb = $('lightbox');
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('.lb-caption');
  document.querySelectorAll('.gallery-slider .slide img').forEach(img => {
    img.addEventListener('click', () => {
      const slide = img.closest('.slide');
      lbImg.src = slide.dataset.src;
      lbCap.textContent = slide.dataset.caption;
      lb.classList.add('open');
    });
  });
  const close = () => lb.classList.remove('open');
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  /* ---------- Mobile menu ---------- */
  const sidebar = $('sidebar');
  $('menu-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebar.querySelectorAll('.nav-menu a').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));
})();
