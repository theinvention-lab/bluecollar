(() => {
  const cases = Array.isArray(window.CASE_STUDIES) ? [...window.CASE_STUDIES] : [];
  const grid = document.querySelector('#caseGrid');
  const typeFiltersRoot = document.querySelector('#caseTypeFilters');
  const regionFiltersRoot = document.querySelector('#caseRegionFilters');
  const categorySelect = document.querySelector('#caseCategory');
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
  if (!grid || !typeFiltersRoot || !regionFiltersRoot || !categorySelect || !search || !sortSelect || !empty || !modal || !modalContent) return;

  let activeType = 'all';
  let activeRegion = 'all';
  let lastFocused = null;

  const normalized = (value) => String(value || '').toLocaleLowerCase('ko-KR');
  const escapeHtml = (value) => String(value || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const getOfficialUrl = (item) => item.officialUrl || item.source || '';
  const getOfficialLabel = (item) => item.officialLabel || item.sourceLabel || '공식 사이트';
  const getArticles = (item) => Array.isArray(item.articles) ? item.articles.filter((article) => article && article.url) : [];
  const typeLabel = (key) => ({all:'전체', 'global-enterprise':'글로벌 대기업', startup:'스타트업·성장기업', special:'번외 사례'})[key] || key;
  const regionLabel = (key) => ({all:'전체', domestic:'국내', overseas:'해외'})[key] || key;
  const typeOrder = ['all','global-enterprise','startup','special'];
  const regionOrder = ['all','domestic','overseas'];

  const externalIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v6H5V6h6"/></svg>';
  const arrowIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const logoMarkup = (item) => `
    <div class="case-logo-stage${item.logo ? '' : ' is-text-only'}">
      <span class="case-logo-fallback" aria-hidden="true">${escapeHtml(item.logoText || item.company)}</span>
      ${item.logo ? `<img class="case-logo-img" src="${escapeHtml(item.logo)}" data-logo-fallback="${escapeHtml(item.logoFallback || '')}" alt="${escapeHtml(item.company)} 로고" loading="lazy" decoding="async" />` : ''}
    </div>`;

  const bindLogoFallbacks = (root) => {
    root.querySelectorAll('img.case-logo-img').forEach((img) => {
      const stage = img.closest('.case-logo-stage');
      const markLoaded = () => {
        if (!img.naturalWidth) return;
        img.classList.add('is-loaded');
        stage?.classList.add('has-logo');
        stage?.classList.remove('is-text-only');
      };
      img.addEventListener('load', markLoaded, { once:true });
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
    });
  };

  const categoryMap = new Map();
  cases.forEach((item) => categoryMap.set(item.category, item.categoryLabel || item.category));
  const categories = [...categoryMap.entries()].sort((a,b) => a[1].localeCompare(b[1], 'ko-KR'));

  total.textContent = String(cases.length).padStart(2,'0');
  enterpriseTotal.textContent = String(cases.filter((item) => item.caseType === 'global-enterprise').length).padStart(2,'0');
  startupTotal.textContent = String(cases.filter((item) => item.caseType === 'startup').length).padStart(2,'0');

  typeFiltersRoot.innerHTML = typeOrder.map((key) => {
    const count = key === 'all' ? cases.length : cases.filter((item) => item.caseType === key).length;
    return `<button type="button" class="case-filter${key === 'all' ? ' is-active' : ''}" data-filter-group="type" data-value="${key}">${typeLabel(key)} <span>${count}</span></button>`;
  }).join('');
  regionFiltersRoot.innerHTML = regionOrder.map((key) => {
    const count = key === 'all' ? cases.length : cases.filter((item) => item.region === key).length;
    return `<button type="button" class="case-filter${key === 'all' ? ' is-active' : ''}" data-filter-group="region" data-value="${key}">${regionLabel(key)} <span>${count}</span></button>`;
  }).join('');
  categorySelect.innerHTML = `<option value="all">전체 산업 분야</option>${categories.map(([key,label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`).join('')}`;

  const sortItems = (items) => {
    const mode = sortSelect.value;
    return [...items].sort((a,b) => {
      if (mode === 'company') return String(a.company).localeCompare(String(b.company),'ko-KR');
      if (mode === 'category') return String(a.categoryLabel).localeCompare(String(b.categoryLabel),'ko-KR') || String(a.company).localeCompare(String(b.company),'ko-KR');
      return Number(b.priority || 0) - Number(a.priority || 0) || String(a.company).localeCompare(String(b.company),'ko-KR');
    });
  };

  const filteredItems = () => {
    const query = normalized(search.value.trim());
    return sortItems(cases.filter((item) => activeType === 'all' || item.caseType === activeType)
      .filter((item) => activeRegion === 'all' || item.region === activeRegion)
      .filter((item) => categorySelect.value === 'all' || item.category === categorySelect.value)
      .filter((item) => {
        if (!query) return true;
        const articles = getArticles(item).map((a) => `${a.publisher || ''} ${a.label || ''}`).join(' ');
        const haystack = [item.company,item.product,item.headline,item.summary,item.problem,item.solution,item.businessModel,item.caseTypeLabel,item.regionLabel,item.categoryLabel,(item.tags||[]).join(' '),(item.aliases||[]).join(' '),articles].join(' ');
        return normalized(haystack).includes(query);
      }));
  };

  const renderLinks = (item) => {
    const links = [];
    const officialUrl = getOfficialUrl(item);
    const articles = getArticles(item);
    if (officialUrl) links.push(`<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer">${externalIcon}<span>공식 사이트</span></a>`);
    if (articles.length) links.push(`<a href="${escapeHtml(articles[0].url)}" target="_blank" rel="noopener noreferrer">${externalIcon}<span>관련 기사</span></a>`);
    return links.length ? `<div class="case-card-links">${links.join('')}</div>` : '';
  };

  const updateSummary = (count) => {
    const parts = [`<strong>${count}</strong>개의 사례`];
    if (activeType !== 'all') parts.push(`<b>${escapeHtml(typeLabel(activeType))}</b>`);
    if (activeRegion !== 'all') parts.push(`<b>${escapeHtml(regionLabel(activeRegion))}</b>`);
    if (categorySelect.value !== 'all') parts.push(`<b>${escapeHtml(categoryMap.get(categorySelect.value))}</b>`);
    if (search.value.trim()) parts.push(`검색어 “<b>${escapeHtml(search.value.trim())}</b>”`);
    resultsSummary.innerHTML = parts.join(' · ');
  };

  const render = () => {
    const items = filteredItems();
    grid.innerHTML = items.map((item,index) => `
      <article class="case-card reveal" data-category="${escapeHtml(item.category)}" data-case-id="${escapeHtml(item.id)}">
        <button type="button" class="case-card-main" data-case-open="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.company)} 사례 상세 보기">
          <div class="case-card-visual">
            <span class="case-card-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>
            <div class="case-card-badges"><span class="case-type-badge">${escapeHtml(item.caseTypeLabel || typeLabel(item.caseType))}</span><span class="case-region-badge">${escapeHtml(item.regionLabel || regionLabel(item.region))}</span><span class="case-category-badge">${escapeHtml(item.categoryLabel)}</span></div>
            ${logoMarkup(item)}
          </div>
          <div class="case-card-body">
            <div class="case-company-line"><strong>${escapeHtml(item.company)}</strong><i aria-hidden="true"></i><span>${escapeHtml(item.product)}</span></div>
            <h3>${escapeHtml(item.headline)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <div class="case-tags">${(item.tags || []).slice(0,4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            <div class="case-card-action"><span>CASE VIEW</span>${arrowIcon}</div>
          </div>
        </button>
        ${renderLinks(item)}
      </article>`).join('');
    bindLogoFallbacks(grid);
    grid.querySelectorAll('.reveal').forEach((card,index) => { card.style.transitionDelay = `${Math.min(index,8)*35}ms`; requestAnimationFrame(() => card.classList.add('is-visible')); });
    empty.hidden = items.length > 0;
    searchClear.hidden = !search.value;
    updateSummary(items.length);
  };

  const reset = () => {
    activeType = 'all'; activeRegion = 'all'; categorySelect.value = 'all'; search.value = ''; sortSelect.value = 'recommended';
    typeFiltersRoot.querySelectorAll('.case-filter').forEach((b) => b.classList.toggle('is-active', b.dataset.value === 'all'));
    regionFiltersRoot.querySelectorAll('.case-filter').forEach((b) => b.classList.toggle('is-active', b.dataset.value === 'all'));
    render();
  };

  const openCase = (id, updateHash = true) => {
    const item = cases.find((entry) => entry.id === id); if (!item) return;
    lastFocused = document.activeElement;
    const labels = item.detailLabels || {};
    const articles = getArticles(item);
    modalContent.innerHTML = `
      <div class="case-modal-shell">
        <aside class="case-modal-brand" data-category="${escapeHtml(item.category)}">
          <div class="case-card-badges"><span class="case-type-badge">${escapeHtml(item.caseTypeLabel || typeLabel(item.caseType))}</span><span class="case-region-badge">${escapeHtml(item.regionLabel || regionLabel(item.region))}</span><span class="case-category-badge">${escapeHtml(item.categoryLabel)}</span></div>
          ${logoMarkup(item)}
        </aside>
        <div class="case-modal-main">
          <div class="case-modal-eyebrow"><span>${escapeHtml(item.company)}</span><span>${escapeHtml(item.product)}</span></div>
          <h2 id="caseModalTitle">${escapeHtml(item.headline)}</h2>
          <p class="case-modal-summary">${escapeHtml(item.summary)}</p>
          <p class="case-modal-notice"><strong>REFERENCE CASE</strong>본 사례는 프로그램 분야 이해를 위한 독립적인 참고자료이며, 소개 기업은 본 프로그램의 참여사·선정사·협력사 또는 투자대상이 아닙니다.</p>
          <div class="case-detail-grid case-detail-grid-neutral">
            <section><small>01 / CONTEXT</small><h3>${escapeHtml(labels.problem || '현장의 문제')}</h3><p>${escapeHtml(item.problem)}</p></section>
            <section><small>02 / BUSINESS &amp; PRODUCT</small><h3>${escapeHtml(labels.solution || '사업·제품 설명')}</h3><p>${escapeHtml(item.solution)}</p></section>
            <section><small>03 / BUSINESS MODEL</small><h3>${escapeHtml(labels.businessModel || '비즈니스 모델')}</h3><p>${escapeHtml(item.businessModel)}</p></section>
          </div>
          <section class="case-related-content"><div class="case-related-copy"><small>04 / RELATED CONTENT</small><h3>공식 사이트 및 관련 기사</h3><p>기업이 공개한 공식 정보와 유관 기사를 통해 최신 사업 현황을 확인할 수 있습니다.</p></div><div class="case-source-links">${getOfficialUrl(item) ? `<a href="${escapeHtml(getOfficialUrl(item))}" target="_blank" rel="noopener noreferrer"><span>OFFICIAL</span>${escapeHtml(getOfficialLabel(item))} ↗</a>` : ''}${articles.map((a) => `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(a.publisher || 'ARTICLE')}</span>${escapeHtml(a.label || '관련 기사')} ↗</a>`).join('')}${!getOfficialUrl(item) && !articles.length ? '<p class="case-source-empty">현재 등록된 외부 자료가 없습니다.</p>' : ''}</div></section>
          <div class="case-modal-footer case-modal-footer-tags"><div class="case-tags">${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div>
        </div>
      </div>`;
    bindLogoFallbacks(modalContent);
    modal.hidden = false; document.body.classList.add('modal-open'); modal.querySelector('.case-modal-close')?.focus();
    if (updateHash) history.replaceState(null,'',`#${item.id}`);
  };

  const closeCase = (clearHash = true) => { modal.hidden = true; document.body.classList.remove('modal-open'); if (clearHash && location.hash) history.replaceState(null,'',location.pathname+location.search); lastFocused?.focus?.(); };

  typeFiltersRoot.addEventListener('click',(e)=>{const b=e.target.closest('[data-value]');if(!b)return;activeType=b.dataset.value;typeFiltersRoot.querySelectorAll('.case-filter').forEach((x)=>x.classList.toggle('is-active',x===b));render();});
  regionFiltersRoot.addEventListener('click',(e)=>{const b=e.target.closest('[data-value]');if(!b)return;activeRegion=b.dataset.value;regionFiltersRoot.querySelectorAll('.case-filter').forEach((x)=>x.classList.toggle('is-active',x===b));render();});
  categorySelect.addEventListener('change',render); sortSelect.addEventListener('change',render); search.addEventListener('input',render);
  searchClear.addEventListener('click',()=>{search.value='';render();search.focus();}); resetButton?.addEventListener('click',reset);
  empty.addEventListener('click',(e)=>{if(e.target.closest('[data-case-reset]'))reset();});
  grid.addEventListener('click',(e)=>{const b=e.target.closest('[data-case-open]');if(b)openCase(b.dataset.caseOpen);});
  modal.addEventListener('click',(e)=>{if(e.target.closest('[data-case-close]'))closeCase();});
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&!modal.hidden)closeCase();});

  render();
  if (location.hash) openCase(location.hash.slice(1),false);
})();
