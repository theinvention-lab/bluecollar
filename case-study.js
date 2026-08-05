(() => {
  const cases = Array.isArray(window.CASE_STUDIES) ? [...window.CASE_STUDIES] : [];
  const sectionsRoot = document.querySelector('#caseSections');
  const groupFiltersRoot = document.querySelector('#caseGroupFilters');
  const categoryFiltersRoot = document.querySelector('#caseFilters');
  const search = document.querySelector('#caseSearch');
  const searchClear = document.querySelector('#caseSearchClear');
  const sortSelect = document.querySelector('#caseSort');
  const resetButton = document.querySelector('#caseReset');
  const empty = document.querySelector('#caseEmpty');
  const total = document.querySelector('#caseTotal');
  const enterpriseTotal = document.querySelector('#enterpriseTotal');
  const startupTotal = document.querySelector('#startupTotal');
  const resultsSummary = document.querySelector('#caseResultsSummary');
  const modal = document.querySelector('#caseModal');
  const modalContent = document.querySelector('#caseModalContent');

  if (!sectionsRoot || !groupFiltersRoot || !categoryFiltersRoot || !search || !sortSelect || !empty || !modal || !modalContent) return;

  const sectionConfig = [
    {
      key: 'global-enterprise',
      label: '글로벌 대기업',
      eyebrow: 'GLOBAL ENTERPRISES',
      title: '현장 제품에서 글로벌 사업으로',
      description: '워크웨어, MRO, 공구와 중고차 유통 등 현장 가까이에서 시작한 제품과 사업이 대중시장·소프트웨어·지역 플랫폼으로 확장된 사례입니다.',
      tone: 'enterprise'
    },
    {
      key: 'domestic-startup',
      label: '국내 스타트업',
      eyebrow: 'KOREAN STARTUPS',
      title: '국내 산업현장·직군 특화 스타트업',
      description: '현장 종사자의 건강과 편의, MRO 구매, 렌탈, 건설 조달과 순환경제를 새로운 제품과 플랫폼으로 해결하는 국내 사례입니다.',
      tone: 'domestic'
    },
    {
      key: 'overseas-startup',
      label: '해외 스타트업',
      eyebrow: 'GLOBAL STARTUPS & SCALE-UPS',
      title: '해외 산업기술 스타트업·성장기업',
      description: '장비 렌탈, 작업자 안전과 텔레매틱스 등 산업현장의 운영 데이터를 기반으로 성장한 해외 기술기업 사례입니다.',
      tone: 'overseas'
    },
    {
      key: 'special',
      label: '번외 사례',
      eyebrow: 'SPECIAL CASE',
      title: '장인 제품의 글로벌 니치시장 진입',
      description: '스타트업은 아니지만, 현장 도구의 기능과 장인 기술이 온라인 유통을 통해 해외 수요를 확보한 참고 사례입니다.',
      tone: 'special'
    }
  ];

  const getSectionKey = (item) => {
    if (item.caseType === 'global-enterprise') return 'global-enterprise';
    if (item.caseType === 'special') return 'special';
    return item.region === 'domestic' ? 'domestic-startup' : 'overseas-startup';
  };

  let activeGroup = 'all';
  let activeCategory = 'all';
  let lastFocused = null;

  const normalized = (value) => String(value || '').toLocaleLowerCase('ko-KR');
  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const getOfficialUrl = (item) => item.officialUrl || item.source || '';
  const getOfficialLabel = (item) => item.officialLabel || item.sourceLabel || '공식 사이트';
  const getArticles = (item) => Array.isArray(item.articles) ? item.articles.filter((article) => article && article.url) : [];
  const categoryLabel = (key) => key === 'all' ? '전체 분야' : (cases.find((item) => item.category === key)?.categoryLabel || key);

  const sortItems = (items, mode = 'recommended') => {
    const copy = [...items];
    if (mode === 'company') {
      return copy.sort((a, b) => String(a.company || '').localeCompare(String(b.company || ''), 'ko-KR'));
    }
    if (mode === 'category') {
      return copy.sort((a, b) =>
        String(a.categoryLabel || '').localeCompare(String(b.categoryLabel || ''), 'ko-KR') ||
        String(a.company || '').localeCompare(String(b.company || ''), 'ko-KR')
      );
    }
    return copy.sort((a, b) =>
      (Number(b.priority || 0) - Number(a.priority || 0)) ||
      String(b.date || '').localeCompare(String(a.date || '')) ||
      String(a.company || '').localeCompare(String(b.company || ''), 'ko-KR')
    );
  };

  const logoMarkup = (item, compact = false) => {
    const company = escapeHtml(item.company);
    const text = escapeHtml(item.logoText || item.company);
    const logo = item.logo ? escapeHtml(item.logo) : '';
    const fallback = item.logoFallback ? escapeHtml(item.logoFallback) : '';
    const stateClass = logo ? '' : ' is-text-only';
    return `
      <div class="case-logo-stage${compact ? ' is-compact' : ''}${stateClass}">
        <span class="case-logo-fallback" aria-hidden="true">${text}</span>
        ${logo ? `<img class="case-logo-img" src="${logo}" data-logo-fallback="${fallback}" alt="${company} 로고" loading="lazy" referrerpolicy="no-referrer" />` : ''}
      </div>`;
  };

  const bindLogoFallbacks = (root) => {
    root.querySelectorAll('img.case-logo-img').forEach((img) => {
      const stage = img.closest('.case-logo-stage');
      const markLoaded = () => {
        img.classList.add('is-loaded');
        stage?.classList.add('has-logo');
        stage?.classList.remove('is-text-only');
      };
      img.addEventListener('load', markLoaded, { once: true });
      if (img.complete && img.naturalWidth > 0) markLoaded();
      img.addEventListener('error', () => {
        const fallback = img.dataset.logoFallback;
        stage?.classList.remove('has-logo');
        if (fallback && img.dataset.fallbackTried !== 'true') {
          img.dataset.fallbackTried = 'true';
          img.src = fallback;
          return;
        }
        img.remove();
        stage?.classList.add('is-text-only');
      });
    });
  };

  const externalIcon = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 3h7v7"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>
    </svg>`;
  const arrowIcon = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>
    </svg>`;

  const renderLinks = (item) => {
    const officialUrl = getOfficialUrl(item);
    const articles = getArticles(item);
    const links = [];
    if (officialUrl) {
      links.push(`<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.company)} 공식 사이트 새 창으로 열기">${externalIcon}<span>공식 사이트</span></a>`);
    }
    if (articles.length) {
      links.push(`<a href="${escapeHtml(articles[0].url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.company)} 관련 기사 새 창으로 열기">${externalIcon}<span>관련 기사</span></a>`);
    }
    return links.length ? `<div class="case-card-links">${links.join('')}</div>` : '';
  };

  const groupCounts = new Map(sectionConfig.map((section) => [section.key, 0]));
  const categoryCounts = new Map();
  cases.forEach((item) => {
    const sectionKey = getSectionKey(item);
    groupCounts.set(sectionKey, (groupCounts.get(sectionKey) || 0) + 1);
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });

  if (total) total.textContent = String(cases.length).padStart(2, '0');
  if (enterpriseTotal) enterpriseTotal.textContent = String(groupCounts.get('global-enterprise') || 0).padStart(2, '0');
  if (startupTotal) {
    const count = (groupCounts.get('domestic-startup') || 0) + (groupCounts.get('overseas-startup') || 0);
    startupTotal.textContent = String(count).padStart(2, '0');
  }

  groupFiltersRoot.innerHTML = [
    `<button type="button" class="case-filter is-active" data-group="all">전체 <span>${cases.length}</span></button>`,
    ...sectionConfig.map((section) => `<button type="button" class="case-filter" data-group="${section.key}">${section.label} <span>${groupCounts.get(section.key) || 0}</span></button>`)
  ].join('');

  const categoryEntries = [...categoryCounts.entries()].sort((a, b) => categoryLabel(a[0]).localeCompare(categoryLabel(b[0]), 'ko-KR'));
  categoryFiltersRoot.innerHTML = [
    `<button type="button" class="case-filter is-active" data-category="all">전체 분야 <span>${cases.length}</span></button>`,
    ...categoryEntries.map(([key, count]) => `<button type="button" class="case-filter" data-category="${escapeHtml(key)}">${escapeHtml(categoryLabel(key))} <span>${count}</span></button>`)
  ].join('');

  const currentFilteredItems = () => {
    const query = normalized(search.value.trim());
    return cases.filter((item) => {
      const sectionKey = getSectionKey(item);
      if (activeGroup !== 'all' && sectionKey !== activeGroup) return false;
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (!query) return true;
      const articles = getArticles(item).map((article) => `${article.publisher || ''} ${article.label || ''}`).join(' ');
      const haystack = [
        item.company, item.product, item.categoryLabel, item.headline, item.summary,
        item.problem, item.solution, item.businessModel, item.storyTag,
        item.caseTypeLabel, item.regionLabel, (item.tags || []).join(' '), (item.aliases || []).join(' '), item.country, articles
      ].join(' ');
      return normalized(haystack).includes(query);
    });
  };

  const renderCard = (item, index) => {
    const tags = (item.tags || []).slice(0, 3);
    return `
      <article class="case-card reveal" data-case-id="${escapeHtml(item.id)}" data-category="${escapeHtml(item.category)}" data-section="${escapeHtml(getSectionKey(item))}">
        <button type="button" class="case-card-main" data-case-open="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.company)} ${escapeHtml(item.product)} 사례 상세 보기">
          <div class="case-card-visual">
            <span class="case-card-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            <div class="case-card-badges case-card-badges-stack">
              <div><span class="case-type-badge">${escapeHtml(item.caseTypeLabel)}</span><span class="case-region-badge">${escapeHtml(item.regionLabel)}</span></div>
              <span class="case-category-badge">${escapeHtml(item.categoryLabel)}</span>
            </div>
            <span class="case-story-tag">${escapeHtml(item.storyTag || '')}</span>
            ${logoMarkup(item)}
          </div>
          <div class="case-card-body">
            <div class="case-company-line"><strong>${escapeHtml(item.company)}</strong><i aria-hidden="true"></i><span>${escapeHtml(item.product)}</span></div>
            <h3>${escapeHtml(item.headline)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <div class="case-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            <div class="case-card-action"><span>CASE VIEW</span>${arrowIcon}</div>
          </div>
        </button>
        ${renderLinks(item)}
      </article>`;
  };

  const updateResultsSummary = (count) => {
    if (!resultsSummary) return;
    const parts = [`<strong>${count}</strong>개의 사례`];
    if (activeGroup !== 'all') parts.push(`<b>${escapeHtml(sectionConfig.find((section) => section.key === activeGroup)?.label || '')}</b>`);
    if (activeCategory !== 'all') parts.push(`<b>${escapeHtml(categoryLabel(activeCategory))}</b>`);
    const query = search.value.trim();
    if (query) parts.push(`검색어 “<b>${escapeHtml(query)}</b>”`);
    resultsSummary.innerHTML = parts.join(' · ');
  };

  const render = () => {
    const filtered = currentFilteredItems();
    let cardIndex = 0;
    sectionsRoot.innerHTML = sectionConfig.map((section) => {
      const sectionItems = sortItems(filtered.filter((item) => getSectionKey(item) === section.key), sortSelect.value);
      if (!sectionItems.length) return '';
      const cards = sectionItems.map((item) => renderCard(item, cardIndex++)).join('');
      return `
        <section class="case-archive-section case-archive-${section.tone}" id="section-${section.key}">
          <header class="case-archive-head reveal">
            <div class="case-archive-heading">
              <span>${section.eyebrow}</span>
              <h2>${section.title}</h2>
            </div>
            <div class="case-archive-meta"><strong>${String(sectionItems.length).padStart(2, '0')}</strong><small>CASES</small></div>
            <p>${section.description}</p>
          </header>
          <div class="case-grid">${cards}</div>
        </section>`;
    }).join('');

    bindLogoFallbacks(sectionsRoot);
    empty.hidden = filtered.length > 0;
    updateResultsSummary(filtered.length);
    if (searchClear) searchClear.hidden = !search.value;
    sectionsRoot.querySelectorAll('.reveal').forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index, 10) * 35}ms`;
      requestAnimationFrame(() => item.classList.add('is-visible'));
    });
  };

  const resetFilters = () => {
    activeGroup = 'all';
    activeCategory = 'all';
    search.value = '';
    sortSelect.value = 'recommended';
    groupFiltersRoot.querySelectorAll('.case-filter').forEach((button) => button.classList.toggle('is-active', button.dataset.group === 'all'));
    categoryFiltersRoot.querySelectorAll('.case-filter').forEach((button) => button.classList.toggle('is-active', button.dataset.category === 'all'));
    render();
    search.focus();
  };

  const replaceLocation = (id = '') => {
    try {
      const base = `${location.pathname}${location.search}`;
      history.replaceState(null, '', id ? `${base}#${encodeURIComponent(id)}` : base);
    } catch (error) {
      // file:// and embedded preview environments can restrict History API updates.
      if (id) location.hash = encodeURIComponent(id);
    }
  };

  const openCase = (id, updateHash = true) => {
    const item = cases.find((entry) => entry.id === id);
    if (!item) return;
    const sortedAll = sortItems(cases, 'recommended');
    const itemIndex = sortedAll.findIndex((entry) => entry.id === id) + 1;
    const officialUrl = getOfficialUrl(item);
    const officialLabel = getOfficialLabel(item);
    const articles = getArticles(item);
    const labels = {
      problem: item.detailLabels?.problem || '현장 문제',
      solution: item.detailLabels?.solution || '사업·제품',
      businessModel: item.detailLabels?.businessModel || '비즈니스 모델'
    };
    lastFocused = document.activeElement;

    const articleLinks = articles.length
      ? articles.map((article) => `<a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer"><span><small>${escapeHtml(article.publisher || 'ARTICLE')}</small>${escapeHtml(article.label || '관련 기사')}</span>${externalIcon}</a>`).join('')
      : '<p class="case-related-empty">별도로 등록된 관련 기사가 없습니다.</p>';

    modalContent.innerHTML = `
      <div class="case-modal-shell">
        <aside class="case-modal-brand" data-category="${escapeHtml(item.category)}" data-section="${escapeHtml(getSectionKey(item))}">
          <div class="case-modal-badges">
            <span class="case-type-badge">${escapeHtml(item.caseTypeLabel)}</span>
            <span class="case-region-badge">${escapeHtml(item.regionLabel)}</span>
            <span class="case-category-badge">${escapeHtml(item.categoryLabel)}</span>
          </div>
          <span class="case-story-tag case-modal-story-tag">${escapeHtml(item.storyTag || '')}</span>
          ${logoMarkup(item)}
          <div class="case-modal-brand-index" aria-hidden="true">${String(itemIndex).padStart(2, '0')}</div>
        </aside>
        <div class="case-modal-main">
          <div class="case-modal-eyebrow"><span>${escapeHtml(item.country)}</span><span>${escapeHtml(item.company)}</span><span>${escapeHtml(item.product)}</span></div>
          <h2 id="caseModalTitle">${escapeHtml(item.headline)}</h2>
          <p class="case-modal-summary">${escapeHtml(item.summary)}</p>
          <div class="case-modal-notice"><strong>REFERENCE CASE</strong><span>본 프로그램과 무관한 독립 참고 사례입니다.</span></div>

          <div class="case-detail-grid case-detail-grid-neutral">
            <section><span>01 / ${escapeHtml(labels.problem)}</span><p>${escapeHtml(item.problem)}</p></section>
            <section><span>02 / ${escapeHtml(labels.solution)}</span><p>${escapeHtml(item.solution)}</p></section>
            <section><span>03 / ${escapeHtml(labels.businessModel)}</span><p>${escapeHtml(item.businessModel)}</p></section>
          </div>

          <div class="case-related-content">
            <div>
              <span>04 / RELATED CONTENT</span>
              <h3>공식 사이트와<br />관련 자료</h3>
              <div class="case-tags">${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            </div>
            <div class="case-related-links">
              ${officialUrl ? `<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer"><span><small>OFFICIAL</small>${escapeHtml(officialLabel)}</span>${externalIcon}</a>` : ''}
              ${articleLinks}
            </div>
          </div>
        </div>
      </div>`;

    bindLogoFallbacks(modalContent);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('[data-case-close]')?.focus();
    if (updateHash) replaceLocation(id);
  };

  const closeCase = (clearHash = true) => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (clearHash && location.hash) replaceLocation();
    lastFocused?.focus?.();
  };

  groupFiltersRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    activeGroup = button.dataset.group;
    groupFiltersRoot.querySelectorAll('.case-filter').forEach((item) => item.classList.toggle('is-active', item === button));
    render();
  });

  categoryFiltersRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    categoryFiltersRoot.querySelectorAll('.case-filter').forEach((item) => item.classList.toggle('is-active', item === button));
    render();
  });

  sectionsRoot.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-case-open]');
    if (opener) openCase(opener.dataset.caseOpen);
  });

  search.addEventListener('input', render);
  searchClear?.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  sortSelect.addEventListener('change', render);
  resetButton?.addEventListener('click', resetFilters);
  empty.addEventListener('click', (event) => { if (event.target.closest('[data-case-reset]')) resetFilters(); });

  modal.addEventListener('click', (event) => { if (event.target.closest('[data-case-close]')) closeCase(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeCase();
  });

  render();

  const hashId = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (hashId && cases.some((item) => item.id === hashId)) openCase(hashId, false);
})();
