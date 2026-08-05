(() => {
  const root = document.querySelector('[data-home-cases]');
  const allCases = Array.isArray(window.CASE_STUDIES) ? window.CASE_STUDIES : [];
  if (!root || !allCases.length) return;

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const sectionKey = (item) => {
    if (item.caseType === 'global-enterprise') return 'global-enterprise';
    if (item.caseType === 'special') return 'special';
    return item.region === 'domestic' ? 'domestic-startup' : 'overseas-startup';
  };

  // Home에는 유형이 겹치지 않도록 대표 사례를 한 건씩 노출합니다.
  const representativeSections = ['global-enterprise', 'domestic-startup', 'overseas-startup'];
  const latest = representativeSections
    .map((section) => [...allCases]
      .filter((item) => sectionKey(item) === section)
      .sort((a, b) => (Number(b.priority || 0) - Number(a.priority || 0)) || String(b.date || '').localeCompare(String(a.date || '')))[0])
    .filter(Boolean);

  const logoMarkup = (item) => `
    <div class="case-logo-stage is-compact">
      <span class="case-logo-fallback" aria-hidden="true">${escapeHtml(item.logoText || item.company)}</span>
      ${item.logo ? `<img class="case-logo-img" src="${escapeHtml(item.logo)}" data-logo-fallback="${escapeHtml(item.logoFallback || '')}" alt="${escapeHtml(item.company)} 로고" loading="lazy" referrerpolicy="no-referrer" />` : ''}
    </div>`;

  root.innerHTML = latest.map((item) => {
    const group = sectionKey(item);
    return `
      <a class="home-case-card reveal" data-category="${escapeHtml(item.category)}" data-section="${escapeHtml(group)}" href="case-study.html#${escapeHtml(item.id)}" aria-label="${escapeHtml(item.company)} ${escapeHtml(item.product)} 사례 보기">
        <div class="case-logo-visual">
          <div class="case-logo-topline">
            <span>${escapeHtml(item.caseTypeLabel || item.categoryLabel)}</span>
            <small>${escapeHtml(item.regionLabel || item.country)}</small>
          </div>
          <span class="home-case-story-tag">${escapeHtml(item.storyTag || item.categoryLabel)}</span>
          ${logoMarkup(item)}
        </div>
        <div class="home-case-copy">
          <small>${escapeHtml(item.company)} · ${escapeHtml(item.product)}</small>
          <h3>${escapeHtml(item.headline)}</h3>
          <span>CASE VIEW →</span>
        </div>
      </a>`;
  }).join('');

  const bindLogo = (img) => {
    const stage = img.closest('.case-logo-stage');
    const markLoaded = () => {
      if (!img.naturalWidth) return;
      img.classList.add('is-loaded');
      stage?.classList.add('has-logo');
      stage?.classList.remove('is-text-only');
    };
    img.addEventListener('load', markLoaded, { once: true });
    if (img.complete) markLoaded();
    img.addEventListener('error', () => {
      const fallback = img.dataset.logoFallback;
      stage?.classList.remove('has-logo');
      if (fallback && img.dataset.fallbackTried !== 'true') {
        img.dataset.fallbackTried = 'true';
        img.src = fallback;
      } else {
        img.remove();
        stage?.classList.add('is-text-only');
      }
    });
  };

  root.querySelectorAll('img.case-logo-img').forEach(bindLogo);
  root.querySelectorAll('.reveal').forEach((item) => requestAnimationFrame(() => item.classList.add('is-visible')));
})();
