const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


const filmCarousel = document.querySelector('[data-film-carousel]');

if (filmCarousel) {
  const films = [
    {
      videoId: 'ErSLfkAjK5M',
      title: '중장비선수들 브랜드 필름 01'
    },
    {
      videoId: 'mfmNR8v3RRI',
      title: '중장비선수들 브랜드 필름 02'
    }
  ];

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
    currentIndex = (nextIndex + films.length) % films.length;
    const film = films[currentIndex];
    frame.src = buildEmbedUrl(film.videoId);
    frame.title = film.title;
    label.textContent = film.title;
    externalLink.href = `https://www.youtube.com/watch?v=${film.videoId}`;
    externalLink.setAttribute('aria-label', `${film.title} YouTube에서 새 창으로 보기`);
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
  };

  prevButton.addEventListener('click', () => renderFilm(currentIndex - 1));
  nextButton.addEventListener('click', () => renderFilm(currentIndex + 1));

  filmCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') renderFilm(currentIndex - 1);
    if (event.key === 'ArrowRight') renderFilm(currentIndex + 1);
  });

  renderFilm(0);
}
