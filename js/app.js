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
