/* Renders every section of the site from window.SITE_DATA (data/*.js files). */
(function () {
  const D = window.SITE_DATA || {};
  const $ = (id) => document.getElementById(id);

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // "**bold**" -> <b>bold</b> (after escaping)
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

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
    <h1><a href="#about">${esc(p.name)}</a></h1>
    <div class="tagline">${esc(p.tagline)}</div>
    <div class="social-links">${socials}</div>`;

  if (p.cv) $('nav-cv').href = p.cv;
  $('footer-name').innerHTML = `© ${new Date().getFullYear()} <a href="#about">${esc(p.name)}</a>. All rights reserved.`;

  /* ---------- About ---------- */
  const a = D.about || {};
  const skillGroups = ((D.service || {}).skills) || [];
  const contactSocials = [
    ['scholar', 'fa-solid fa-graduation-cap', 'cs-scholar', 'Google Scholar'],
    ['researchgate', 'fa-brands fa-researchgate', 'cs-researchgate', 'ResearchGate'],
    ['github', 'fa-brands fa-github', 'cs-github', 'GitHub'],
    ['linkedin', 'fa-brands fa-linkedin-in', 'cs-linkedin', 'LinkedIn'],
  ].filter(([k]) => p[k])
   .map(([k, ic, cls, lbl]) => `<a class="${cls}" href="${esc(p[k])}" target="_blank" aria-label="${lbl}"><i class="${ic}"></i></a>`)
   .join('');

  $('about-content').innerHTML = `
    <div class="about-wrap">
      <div class="about-left">
        <div class="photo-card"><img src="${esc(p.photo)}" alt="${esc(p.name)}"></div>
        <div class="contact-card">
          <ul>
            ${p.email ? `<li><i class="fa-solid fa-envelope"></i> <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : ''}
            ${p.phone ? `<li><i class="fa-solid fa-phone"></i> ${esc(p.phone)}</li>` : ''}
            ${p.location ? `<li><i class="fa-solid fa-location-dot"></i> ${esc(p.location)}</li>` : ''}
            ${p.affiliation ? `<li><i class="fa-solid fa-building-columns"></i> ${esc(p.affiliation)}</li>` : ''}
          </ul>
          <div class="contact-socials">${contactSocials}</div>
        </div>
      </div>
      <div class="about-text">
        <h3>${esc(a.heading)}</h3>
        ${String(a.text || '').split(/\n\s*\n/).map(t => `<p>${md(t)}</p>`).join('')}
        <div class="interests">${(a.interests || []).map(i => `<span class="chip">${esc(i)}</span>`).join('')}</div>
        <h3 class="exp-title">Technical Expertise</h3>
        ${skillGroups.map(g => `
          <div class="exp-group">
            <div class="exp-label">${esc(g.group)}</div>
            <div class="chips">${(g.items || []).map(i => `<span class="chip-outline">${esc(i)}</span>`).join('')}</div>
          </div>`).join('')}
      </div>
    </div>`;

  /* ---------- Timeline sections ---------- */
  const timeline = (items, f) => `<div class="timeline">${items.map(it => `
    <div class="timeline-item">
      <h4>${esc(f.title(it))}</h4>
      <span class="period">${esc(f.period(it))}</span>
      <p>${f.body(it)}</p>
    </div>`).join('')}</div>`;

  $('education-content').innerHTML = timeline(D.education || [], {
    title: (i) => i.degree, period: (i) => i.period,
    body: (i) => esc(i.institution) + (i.details ? '<br>' + esc(i.details) : ''),
  });

  $('experience-content').innerHTML = timeline(D.experience || [], {
    title: (i) => i.role, period: (i) => i.period,
    body: (i) => esc(i.org) + (i.details ? '<br>' + esc(i.details) : ''),
  });

  $('presentations-content').innerHTML = timeline(D.presentations || [], {
    title: (i) => i.title, period: (i) => i.year,
    body: (i) => esc(i.venue),
  });

  /* ---------- Awards ---------- */
  $('awards-content').innerHTML = `<div class="grid">${(D.awards || []).map(w => `
    <div class="card">
      <div class="year">${esc(w.year)}</div>
      <h4>${esc(w.title)}</h4>
      <p>${esc(w.description)}</p>
    </div>`).join('')}</div>`;

  /* ---------- Publications ---------- */
  const pub = D.publications || { stats: {}, journals: [], conferences: [] };
  const boldMe = (authors) => {
    let s = esc(authors);
    const parts = String(p.name || '').trim().split(/\s+/);
    const variants = [p.name];
    if (parts.length > 1) variants.push(parts[parts.length - 1] + ', ' + parts.slice(0, -1).join(' '));
    variants.forEach(v => { if (v) s = s.split(esc(v)).join('<b>' + esc(v) + '</b>'); });
    return s;
  };
  const pubList = (arr) => `<ul class="pub-list">${arr.map(x => `
    <li>${boldMe(x.authors)}. <b>&ldquo;${esc(x.title)}.&rdquo;</b>
      <span class="venue">${esc(x.venue)}.</span>
      ${x.link ? `<br><a class="pub-link" href="${esc(x.link)}" target="_blank"><i class="fa-solid fa-link"></i> ${esc(x.linkLabel || 'Link')}</a>` : ''}
    </li>`).join('')}</ul>`;

  $('publications-content').innerHTML = `
    <div class="scholar-stats">
      <div class="stat"><div class="num">${esc(pub.stats.citations)}</div><div class="lbl">Citations</div></div>
      <div class="stat"><div class="num">${esc(pub.stats.hindex)}</div><div class="lbl">h-index</div></div>
      <div class="stat"><div class="num">${esc(pub.stats.i10)}</div><div class="lbl">i10-index</div></div>
    </div>
    <div class="pub-tabs">
      <button class="pub-tab active" data-tab="pub-journals">Journal Articles (${(pub.journals || []).length})</button>
      <button class="pub-tab" data-tab="pub-conferences">Conference Papers (${(pub.conferences || []).length})</button>
    </div>
    <div class="pub-group show" id="pub-journals">${pubList(pub.journals || [])}</div>
    <div class="pub-group" id="pub-conferences">${pubList(pub.conferences || [])}</div>`;

  document.querySelectorAll('.pub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pub-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pub-group').forEach(g => g.classList.remove('show'));
      btn.classList.add('active');
      $(btn.dataset.tab).classList.add('show');
    });
  });

  /* ---------- Projects ---------- */
  $('projects-content').innerHTML = `<div class="grid">${(D.projects || []).map(pr => `
    <div class="card">
      <h4>${esc(pr.title)}</h4>
      <p>${esc(pr.description)}</p>
      ${(pr.link || pr.link2) ? `<div class="links">${pr.link ? `<a href="${esc(pr.link)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${esc(pr.linkLabel || 'Link')}</a>` : ''}${pr.link2 ? `<a href="${esc(pr.link2)}" target="_blank"><i class="fa-brands fa-github"></i> ${esc(pr.linkLabel2 || 'GitHub')}</a>` : ''}</div>` : ''}
    </div>`).join('')}</div>`;

  /* ---------- Academic service (skills are shown in About) ---------- */
  const sv = D.service || { reviewers: [], skills: [] };
  $('service-content').innerHTML = `
    <div class="grid">
      <div class="card">
        <h4><i class="fa-solid fa-magnifying-glass" style="color:var(--accent)"></i> Peer Reviewer</h4>
        <p>${(sv.reviewers || []).map(esc).join('<br>')}</p>
      </div>
    </div>`;

  /* ---------- Hobby slider ---------- */
  const hb = D.hobby || { intro: {}, images: [] };
  const hbImgs = hb.images || [];
  $('hobby-content').innerHTML = `
    ${hb.intro && hb.intro.text ? `<p class="hobby-text">${md(hb.intro.text)}</p>` : ''}
    ${hbImgs.length ? `
    <div class="slider" id="hobby-slider">
      ${hbImgs.map((im, i) => `
        <div class="slide${i === 0 ? ' on' : ''}">
          <img src="${esc(im.src)}" alt="${esc(im.caption || 'Hobby photo')}">
          ${im.caption ? `<div class="slide-caption">${esc(im.caption)}</div>` : ''}
        </div>`).join('')}
      ${hbImgs.length > 1 ? `
      <button class="slide-arrow prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="slide-arrow next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="slide-dots">${hbImgs.map((_, i) => `<button data-dot="${i}"${i === 0 ? ' class="on"' : ''} aria-label="Slide ${i + 1}"></button>`).join('')}</div>` : ''}
    </div>` : ''}`;

  if (hbImgs.length > 1) {
    const slider = $('hobby-slider');
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('[data-dot]');
    let idx = 0, timer;
    const show = (i) => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('on', j === idx));
      dots.forEach((d, j) => d.classList.toggle('on', j === idx));
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => show(idx + 1), 5000); };
    slider.querySelector('.prev').addEventListener('click', () => { show(idx - 1); auto(); });
    slider.querySelector('.next').addEventListener('click', () => { show(idx + 1); auto(); });
    dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.dot); auto(); }));
    auto();
  }

  /* ---------- Nav behaviour ---------- */
  const sidebar = $('sidebar');
  $('menu-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebar.querySelectorAll('.nav-menu a').forEach(a2 => a2.addEventListener('click', () => sidebar.classList.remove('open')));

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  window.addEventListener('scroll', () => {
    let current = 'about';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a2 => a2.classList.toggle('active', a2.getAttribute('href') === '#' + current));
  });
})();
