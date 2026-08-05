const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const filmCarousel = document.querySelector('[data-film-carousel]');

if (filmCarousel) {
  const filmTabs = [...filmCarousel.querySelectorAll('[data-film-select]')];
  const films = filmTabs.map((button) => ({
    videoId: button.dataset.videoId,
    title: button.dataset.title
  })).filter((film) => film.videoId && film.title);

  const frame = filmCarousel.querySelector('#brandFilmFrame');
  const label = filmCarousel.querySelector('#brandFilmLabel');
  const counter = filmCarousel.querySelector('#brandFilmCounter');
  const externalLink = filmCarousel.querySelector('#brandFilmExternalLink');
  const prevButton = filmCarousel.querySelector('[data-film-prev]');
  const nextButton = filmCarousel.querySelector('[data-film-next]');
  let currentIndex = 0;

  const buildEmbedUrl = (videoId) => {
    const params = new URLSearchParams({ playsinline: '1', rel: '0' });
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      params.set('origin', window.location.origin);
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  const renderFilm = (nextIndex) => {
    if (!films.length || !frame || !label || !counter || !externalLink) return;
    currentIndex = (nextIndex + films.length) % films.length;
    const film = films[currentIndex];
    frame.src = buildEmbedUrl(film.videoId);
    frame.title = film.title;
    label.textContent = film.title;
    externalLink.href = `https://www.youtube.com/watch?v=${film.videoId}`;
    externalLink.setAttribute('aria-label', `${film.title} YouTube에서 새 창으로 보기`);
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
    filmTabs.forEach((tab, index) => {
      const selected = index === currentIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  };

  prevButton?.addEventListener('click', () => renderFilm(currentIndex - 1));
  nextButton?.addEventListener('click', () => renderFilm(currentIndex + 1));
  filmTabs.forEach((tab, index) => tab.addEventListener('click', () => renderFilm(index)));
  filmCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') renderFilm(currentIndex - 1);
    if (event.key === 'ArrowRight') renderFilm(currentIndex + 1);
  });

  renderFilm(0);
}
