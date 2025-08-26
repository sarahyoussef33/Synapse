(function () {
  'use strict';

  // S'assure que le DOM est prêt si le script est chargé dans <head>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    init();
  }

  function init() {
    var map = document.querySelector('.map');
    if (!map) return;

    var lat = map.getAttribute('data-lat');
    var lng = map.getAttribute('data-lng');
    var rawLabel = map.getAttribute('data-label') || 'Location';
    var label = encodeURIComponent(rawLabel);

    // URLs Google Maps (pas d’API key)
    var embedSrc = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&z=15&output=embed';
    var clickHref = 'https://www.google.com/maps?q=' + lat + ',' + lng + ' (' + label + ')';

    var iframe = map.querySelector('iframe');
    if (iframe) { iframe.src = embedSrc; }

    var overlay = map.querySelector('.map__overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        var win = window.open(clickHref, '_blank');
        if (win) { try { win.opener = null; } catch (e) {} }
      }, false);
    }

    if (iframe) {
      iframe.addEventListener('load', function () {
        if ((' ' + map.className + ' ').indexOf(' ready ') === -1) {
          map.className = (map.className ? map.className + ' ' : '') + 'ready';
        }
      }, false);
    }

    var fallback = map.querySelector('.map__fallback');
    if (fallback) { fallback.href = clickHref; }
  }
})();



/*=== Introduction ===*/


document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector("#intro-title");
  const paragraph = document.querySelector("#intro p");
  const buttons = document.querySelector(".hero-buttons");

  // On applique la classe fade-in
  [title, paragraph, buttons].forEach(el => el.classList.add("fade-in"));

  // Séquence : titre → texte → boutons
  setTimeout(() => title.classList.add("show"), 300);      // titre
  setTimeout(() => paragraph.classList.add("show"), 1200); // texte
  setTimeout(() => buttons.classList.add("show"), 2000);   // boutons
});


/*=== About - Mission - Vision ===*/

document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');

  // Observer qui déclenche quand ~20% du bloc est visible
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // On n’observe plus ensuite (une seule animation)
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px', // déclenche un peu plus tôt
    threshold: 0.2
  });

  reveals.forEach(el => observer.observe(el));
});


/* === Values ===*/ 

document.addEventListener('DOMContentLoaded', () => {
  const items = Array.from(document.querySelectorAll('#values .value-item'));

  // On attribue un ordre pour un léger décalage si plusieurs entrent en même temps
  items.forEach((el, i) => el.dataset.order = i);

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const order = Number(el.dataset.order || 0);

      // Petit décalage global optionnel (80ms * ordre) pour un effet naturel
      setTimeout(() => {
        el.classList.add('is-visible');
      }, order * 80);

      obs.unobserve(el); // on n’anime qu’une fois
    });
  }, {
    root: null,
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  items.forEach(el => observer.observe(el));
});

/*=== Services ===*/

document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('#services .card-service'));

  // On stocke un ordre pour un léger décalage si plusieurs cartes entrent en même temps
  cards.forEach((el, i) => el.dataset.order = i);

  const io = new IntersectionObserver((entries, obs) => {
    // Grouper les entrées visibles d’un même “tick”
    const visibleBatch = entries.filter(e => e.isIntersecting);

    visibleBatch
      .sort((a, b) => (a.target.dataset.order ?? 0) - (b.target.dataset.order ?? 0))
      .forEach((entry, idxInBatch) => {
        const el = entry.target;
        // Stagger doux de 120 ms entre cartes qui apparaissent ensemble
        setTimeout(() => {
          el.classList.add('is-visible');
        }, idxInBatch * 120);

        obs.unobserve(el); // anime une seule fois
      });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  cards.forEach(card => io.observe(card));
});

/*=== Privacy ===*/

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('#privacy-security .reveal-privacy');

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target); // animation une seule fois
    });
  }, {
    root: null,
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  targets.forEach(el => io.observe(el));
});

/*=== Partners ===*/

document.addEventListener('DOMContentLoaded', () => {
  // Titre, intro, citation : petite chaîne (120ms d’écart)
  const blocks = Array.from(document.querySelectorAll('#partners .reveal-partners'));
  blocks.forEach((el, i) => el.style.transitionDelay = `${i * 120}ms`);

  const ioBlocks = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  blocks.forEach(el => ioBlocks.observe(el));

  // Logos/partenaires : apparition un par un
  const items = Array.from(document.querySelectorAll('#partners .reveal-partner-item'));
  const ioItems = new IntersectionObserver((entries, obs) => {
    const visibles = entries.filter(e => e.isIntersecting)
                            .sort((a,b) => items.indexOf(a.target) - items.indexOf(b.target));
    visibles.forEach((entry, idx) => {
      setTimeout(() => {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }, idx * 140);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => ioItems.observe(el));
});
