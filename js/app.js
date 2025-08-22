/*
  synapse ai liban — app.js (clean, full)
  - Headings visibles tout de suite + anim douce à l’entrée
  - Corps ~1s après entrée dans le viewport (incl. 1re section)
  - Stagger sur .feature-list li, .audience-list li, .team-grid .card-person
  - Titre du hero (word-stagger) sans casser le dégradé
  - Ancres lissées compatibles scroll-snap (pas d’offset manuel)
  - Header fixed + .is-solid après un léger scroll
  - Effet “nerfs” (canvas) : hero + 1 section sur 2
  - Respecte prefers-reduced-motion
  - No $ helpers, no template literals
*/

(function () {
  // ====== Config
  var RESPECT_REDUCED_MOTION = true;
  var REVEAL_DELAY_MS = 1000;

  // ====== State
  var prefersReduced = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) && RESPECT_REDUCED_MOTION;

  // ====== Helpers
  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function setHidden(el){
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'none';
    el.style.willChange = 'opacity, transform';
  }
  function showInstant(el){
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
    el.style.willChange = 'auto';
  }
  function animateIn(el, delay){
    el.style.transition =
      'opacity 600ms cubic-bezier(.2,.65,.2,1) ' + delay + 'ms, ' +
      'transform 700ms cubic-bezier(.2,.65,.2,1) ' + delay + 'ms';
    requestAnimationFrame(function(){
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    setTimeout(function(){ el.style.willChange = 'auto'; }, delay + 820);
  }

  // ----- Header height -> CSS var (pour scroll-padding-top)
  function setHeaderVar(){
    var header = qs('.site-header');
    var h = header ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--header-h', (h|0) + 'px');
  }

  // ----- Footer year
  function initYear(){
    var y = qs('#year');
    if(y) y.textContent = new Date().getFullYear();
  }

  // ----- Ancres compatibles scroll-snap
  function initSmoothAnchors(){
    qsa('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href');
        if(!id || id.length <= 1) return;
        var target = qs(id);
        if(!target) return;
        e.preventDefault();
        try { target.scrollIntoView({ behavior:'smooth', block:'start' }); }
        catch(err){ location.hash = id; }
      });
    });
  }

  // ----- Header toujours visible + état .is-solid
  function keepHeaderVisible(){
    var header = qs('.site-header');
    if(!header) return;
    header.style.transform = 'translateY(0)';
    function onScroll(){
      if(window.scrollY > 8) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
  }

  // ----- Timed reveal (titres immédiats, corps après 1s) + staggers
  function initTimedReveal(){
    var sections = qsa('.section');
    if(!sections.length) return;

    // Préparation
    for(var i=0;i<sections.length;i++){
      var sec  = sections[i];
      var wrap = qs('.container', sec) || sec;
      var h    = qs('h1, h2, h3', wrap);

      var kids = Array.prototype.slice.call(wrap.children);
      var body = [];
      for(var k=0;k<kids.length;k++){ if(kids[k] !== h) body.push(kids[k]); }

      sec.__heading   = h || null;
      sec.__body      = body;
      sec.__scheduled = false;
      sec.__revealed  = false;

      if(prefersReduced){
        if(h) showInstant(h);
        for(var b0=0;b0<body.length;b0++) showInstant(body[b0]);

        var lis0   = qsa('.feature-list li',  sec);
        var chips0 = qsa('.audience-list li', sec);
        var cards0 = qsa('.team-grid .card-person', sec);
        for(var u0=0; u0<lis0.length;   u0++) showInstant(lis0[u0]);
        for(var c0=0; c0<chips0.length; c0++) showInstant(chips0[c0]);
        for(var t0=0; t0<cards0.length; t0++) showInstant(cards0[t0]);

        sec.__revealed = true;
      }else{
        for(var b=0;b<body.length;b++) setHidden(body[b]);

        var lis   = qsa('.feature-list li',  sec);
        var chips = qsa('.audience-list li', sec);
        var cards = qsa('.team-grid .card-person', sec);
        for(var u=0; u<lis.length;   u++) setHidden(lis[u]);
        for(var c=0; c<chips.length; c++) setHidden(chips[c]);
        for(var t=0; t<cards.length; t++) setHidden(cards[t]);
      }
    }

    if(prefersReduced) return;

    function scheduleBody(sec){
      if(sec.__scheduled || sec.__revealed) return;
      sec.__scheduled = true;
      setTimeout(function(){ revealBody(sec); }, REVEAL_DELAY_MS);
    }

    function revealBody(sec){
      if(sec.__revealed) return;

      // 1) Corps (stagger léger)
      var bodyEls = sec.__body, step = 70;
      for(var i=0;i<bodyEls.length;i++) animateIn(bodyEls[i], i*step);

      // 2) Stagger des listes
      var lists = qsa('.feature-list', sec);
      for (var L=0; L<lists.length; L++) staggerList(lists[L], 150, 140);

      var audiences = qsa('.audience-list', sec);
      for (var A=0; A<audiences.length; A++) staggerList(audiences[A], 120, 130);

      // 3) Stagger des cartes équipe
      var grids = qsa('.team-grid', sec);
      for (var G=0; G<grids.length; G++) staggerCards(grids[G], 160, 140);

      sec.__revealed = true;
    }

    // Helpers de stagger (locaux à initTimedReveal)
    function staggerList(list, base, step){
      var items = qsa('li', list);
      for (var i=0; i<items.length; i++){
        (function(el, idx){
          setTimeout(function(){ animateIn(el, 0); }, (base||150) + idx*(step||140));
        })(items[i], i);
      }
    }
    function staggerCards(grid, base, step){
      var items = qsa('.card-person', grid);
      for (var i=0; i<items.length; i++){
        (function(el, idx){
          setTimeout(function(){ animateIn(el, 0); }, (base||180) + idx*(step||140));
        })(items[i], i);
      }
    }

    // Déclenchement via IO
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        for(var i=0;i<entries.length;i++){
          var ent = entries[i];
          if(ent.isIntersecting) scheduleBody(ent.target);
        }
      }, { threshold:0.15, rootMargin:'0px 0px -10% 0px' });
      for(var s=0;s<sections.length;s++) io.observe(sections[s]);
    }else{
      for(var s2=0;s2<sections.length;s2++) scheduleBody(sections[s2]);
    }

    // 1re section
    if(sections[0]) scheduleBody(sections[0]);
  }

  // ----- Animation des titres (fade + slide + défloutage)
  function initHeadingFX(){
    if(prefersReduced) return;
    var sections = qsa('.section');
    if(!sections.length) return;

    for(var i=0;i<sections.length;i++){
      var h = qs('h1, h2, h3', sections[i]);
      if(h) h.classList.add('heading-anim');
    }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        for(var j=0;j<entries.length;j++){
          var ent = entries[j];
          if(!ent.isIntersecting) continue;
          var head = qs('h1, h2, h3', ent.target);
          if(head) head.classList.add('is-in');
          io.unobserve(ent.target);
        }
      }, { threshold:0.35, rootMargin:'0px 0px -10% 0px' });

      for(var k=0;k<sections.length;k++) io.observe(sections[k]);
    }else{
      for(var k2=0;k2<sections.length;k2++){
        var h2 = qs('h1, h2, h3', sections[k2]);
        if(h2) h2.classList.add('is-in');
      }
    }

    var first = sections[0] && qs('h1, h2, h3', sections[0]);
    if(first) setTimeout(function(){ first.classList.add('is-in'); }, 120);
  }

  // ----- Anim spéciale du titre du hero (stagger mot-par-mot)
  function initHeroTitleFX(){
    if(prefersReduced) return;
    var h = qs('#intro h1');
    if(!h) return;

    if(h.classList.contains('heading-anim')){
      h.classList.remove('heading-anim','is-in');
    }
    h.classList.add('hero-title');

    var text = h.textContent.trim().replace(/\s+/g,' ').split(' ');
    var frag = document.createDocumentFragment();
    for(var i=0;i<text.length;i++){
      var span = document.createElement('span');
      span.className = 'word';
      span.style.setProperty('--i', i);
      span.textContent = text[i];
      frag.appendChild(span);
      if(i !== text.length-1) frag.appendChild(document.createTextNode(' '));
    }
    h.setAttribute('aria-label', h.textContent.trim());
    h.textContent = '';
    h.appendChild(frag);

    function kick(){ h.classList.add('is-in'); }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        for(var j=0;j<entries.length;j++){
          if(entries[j].isIntersecting){ kick(); io.disconnect(); break; }
        }
      }, { threshold:0.4 });
      io.observe(qs('#intro'));
    } else {
      setTimeout(kick, 150);
    }
  }

  // ----- Effet “nerfs” (canvas)
  function initNetworkFXAlternating(){
    if(prefersReduced) return;

    var sections = qsa('.section');
    if(!sections.length) return;

    var items = [], raf;

    function addNetwork(sec, palette){
      if(getComputedStyle(sec).position === 'static'){ sec.style.position = 'relative'; }
      var c = document.createElement('canvas');
      c.setAttribute('aria-hidden','true');
      c.className = 'fx-canvas';
      c.style.position = 'absolute';
      c.style.inset = '0';
      c.style.zIndex = '1';
      c.style.pointerEvents = 'none';
      sec.insertBefore(c, sec.firstChild);

      items.push({
        sec:sec, c:c, ctx:c.getContext('2d'),
        w:0, h:0, dpr:1, nodes:[], N:0, MAX:0,
        stroke: palette.stroke, dot: palette.dot,
        baseA: palette.baseA, varA: palette.varA,
        lw: palette.lw || 1.1
      });
    }

    function resizeItem(o){
      o.dpr = Math.min(window.devicePixelRatio||1, 2);
      var r = o.sec.getBoundingClientRect();
      o.w = Math.max(300, r.width);
      o.h = Math.max(220, r.height);
      o.c.width  = Math.floor(o.w * o.dpr);
      o.c.height = Math.floor(o.h * o.dpr);
      o.c.style.width  = o.w + 'px';
      o.c.style.height = o.h + 'px';
      o.ctx.setTransform(o.dpr,0,0,o.dpr,0,0);

      var area = o.w * o.h;
      o.N = Math.max(16, Math.min(42, Math.floor(area/12000)));
      o.MAX = Math.max(120, Math.min(220, Math.floor(Math.min(o.w,o.h)*0.22)));

      o.nodes.length = 0;
      for(var i=0;i<o.N;i++){
        o.nodes.push({ x:Math.random()*o.w, y:Math.random()*o.h, vx:(Math.random()-.5)*0.7, vy:(Math.random()-.5)*0.7 });
      }
    }

    function drawAll(){
      for(var n=0;n<items.length;n++){
        var it = items[n], ctx = it.ctx, w = it.w, h = it.h, nodes = it.nodes, i, j;
        ctx.clearRect(0,0,w,h);

        for(i=0;i<nodes.length;i++) for(j=i+1;j<nodes.length;j++){
          var a=nodes[i], b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist < it.MAX){
            var t = 1 - (dist / it.MAX);
            ctx.globalAlpha = it.baseA + t*it.varA;
            ctx.strokeStyle = it.stroke;
            ctx.lineWidth = it.lw;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;

        for(i=0;i<nodes.length;i++){
          var p = nodes[i];
          ctx.beginPath(); ctx.arc(p.x,p.y,2.0,0,Math.PI*2);
          ctx.fillStyle = it.dot; ctx.fill();
          p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
        }
      }
      raf = requestAnimationFrame(drawAll);
    }

    function onResize(){ for(var i=0;i<items.length;i++) resizeItem(items[i]); }
    function onScroll(){
      for(var i=0;i<items.length;i++){
        var it = items[i], r = it.sec.getBoundingClientRect();
        var vis = Math.max(0, Math.min(1, 1 - Math.abs(r.top)/Math.max(1,r.height)));
        it.c.style.opacity = (0.28 + vis*0.55).toFixed(2);
        it.c.style.transform = 'translateY(' + (-r.top*0.06).toFixed(1) + 'px)';
      }
    }

    // Hero (#intro) — nerfs plus foncés
    var intro = qs('#intro');
    if(intro){
      addNetwork(intro, {
        stroke: 'rgba(12,101,120,.75)',
        dot:    'rgba(9,78,92,.92)',
        baseA:  0.18,
        varA:   0.28,
        lw:     1.35
      });
    }

    // Autres sections : une sur deux
    var all = qsa('.section');
    var toggle = false;
    for(var s=0;s<all.length;s++){
      var sec = all[s];
      if(sec === intro) continue;
      toggle = !toggle;
      if(toggle){
        addNetwork(sec, {
          stroke: '#0ea5a0',
          dot:    '#0a8f8b',
          baseA:  0.10,
          varA:   0.20,
          lw:     1.1
        });
      }
    }

    for(var z=0; z<items.length; z++) resizeItem(items[z]);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll(); drawAll();
    window.addEventListener('pagehide', function(){ cancelAnimationFrame(raf); });
  }

  // ====== INIT
  function init(){
    setHeaderVar();
    initYear();
    initSmoothAnchors();
    keepHeaderVisible();
    initTimedReveal();
    initHeadingFX();
    initHeroTitleFX();
    initNetworkFXAlternating();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', setHeaderVar);
  window.addEventListener('resize', setHeaderVar);
})();
