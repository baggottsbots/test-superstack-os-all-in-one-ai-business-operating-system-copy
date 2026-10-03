// ===== TAILWIND THEME EXTENSION =====
    // Purpose: Brand colors + font family so utility classes like bg-ink / text-brand-400 work.
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ink: { DEFAULT: '#07070d', 900: '#0b0b14', 800: '#111120', 700: '#181829', 600: '#22223a' },
            brand: { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
            volt: { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4' }
          },
          fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] }
        }
      }
    }

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ===== MOBILE MENU TOGGLE =====
    // Function: toggleMobileMenu()
    // Purpose: Show/hide navigation menu on mobile devices and update aria state
    // Triggers: Click on hamburger button; closes when a link is tapped
    (function(){var b=document.getElementById('nav-toggle'),m=document.getElementById('mobile-menu');if(!b||!m)return;b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');b.setAttribute('aria-expanded','false');});});})();

    // ===== HERO INTRO TIMELINE =====
    // Function: initHeroIntro()
    // Purpose: Stagger badge → headline → subtext → CTAs → dashboard in from hidden on load
    // Note: Hidden states are set ONLY here in JS so content is visible without JavaScript
    (function initHeroIntro() {
      gsap.set(['.hero-badge', '.hero-title', '.hero-sub', '.hero-ctas', '.hero-meta'], { autoAlpha: 0, y: 48 });
      gsap.set('.hero-visual', { autoAlpha: 0, y: 90, scale: 0.94 });
      gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
        .to('.hero-badge', { autoAlpha: 1, y: 0 }, 0.1)
        .to('.hero-title', { autoAlpha: 1, y: 0 }, '-=0.6')
        .to('.hero-sub', { autoAlpha: 1, y: 0 }, '-=0.65')
        .to('.hero-ctas', { autoAlpha: 1, y: 0 }, '-=0.65')
        .to('.hero-meta', { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.6')
        .to('.hero-visual', { autoAlpha: 1, y: 0, scale: 1, duration: 1.2 }, '-=0.7');
    })();

    // ===== SCROLL REVEALS =====
    // Function: initReveals()
    // Purpose: Every .reveal element starts hidden/offset and fades up when entering viewport
    // Behaviour: once:true so content never re-hides; siblings stagger for a cascading feel
    (function initReveals() {
      var items = gsap.utils.toArray('.reveal');
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 48 });
      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });
        }
      });
    })();

    // ===== ANIMATED STAT COUNTERS =====
    // Function: initCounters()
    // Purpose: Count each .counter from 0 to its data-count value when scrolled into view
    // Edit: Change data-count / data-suffix attributes in the STATS section
    (function initCounters() {
      document.querySelectorAll('.counter').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { v: 1 },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString() + suffix; }
        });
      });
    })();

    // ===== STACK REPLACEMENT PINNED SCENE =====
    // Function: initStackScene()
    // Purpose: Pin the section and, as the user scrolls, pull every scattered SaaS card
    //          into the center where they collapse into the glowing SuperStack OS core
    // Behaviour: scrub:1 ties progress to scroll; headline A fades out, caption B fades in
    (function initStackScene() {
      var scene = document.querySelector('.stack-scene');
      var cards = gsap.utils.toArray('.stack-card');
      if (!scene || !cards.length) return;

      // Give each card its tilt from data-rot
      cards.forEach(function (c) { gsap.set(c, { rotation: parseFloat(c.getAttribute('data-rot')) || 0 }); });
      gsap.set('.stack-core', { scale: 0.7, autoAlpha: 0.35 });
      gsap.set('.stack-headline-b', { autoAlpha: 0, y: 40 });

      gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'top top', end: '+=220%', pin: true, scrub: 1, anticipatePin: 1 }
      })
        .to(cards, {
          left: '50%', top: '50%', right: 'auto', xPercent: -50, yPercent: -50,
          rotation: 0, scale: 0.45, duration: 1.4, ease: 'power2.inOut', stagger: 0.06
        }, 0)
        .to('.stack-headline-a', { autoAlpha: 0, y: -40, duration: 0.5 }, 0.7)
        .to(cards, { autoAlpha: 0, duration: 0.35, stagger: 0.02 }, 1.35)
        .to('.stack-core', { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 1.3)
        .to('.stack-headline-b', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.7)
        .to({}, { duration: 0.4 }); // brief hold at the end
    })();

    // ===== MCP FLOW PATH DRAW + TRACER DOT =====
    // Function: initFlowPath()
    // Purpose: Draw the SVG line down the "How it works" steps as you scroll and ride a
    //          glowing dot along it using MotionPathPlugin (scrubbed to scroll position)
    // Note: The path is rebuilt in real pixel coordinates on every resize so the curve,
    //       stroke and dot stay perfectly round and aligned with each step on any screen.
    (function initFlowPath() {
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.getElementById('flowSvg');
      var col = document.getElementById('flowCol');
      var path = document.getElementById('flowPath');
      var track = document.getElementById('flowTrack');
      var nodesG = document.getElementById('flowNodes');
      var dot = document.getElementById('flowDot');
      var list = document.querySelector('.flow-steps');
      if (!svg || !col || !path || !track || !dot || !list) return;

      var steps = Array.prototype.slice.call(list.children);
      var len = 0, nodes = [], state = { p: 0 };

      function build() {
        var w = col.clientWidth, h = col.clientHeight;
        if (!w || !h) return;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        var cx = w / 2;
        var amp = Math.max(8, w * 0.32);

        // Anchor points: top, one per step (aligned with STEP label, transform-independent), bottom
        var pts = [{ x: cx, y: 0 }];
        steps.forEach(function (li) {
          var y = li.offsetTop - col.offsetTop + Math.min(40, li.offsetHeight / 2);
          pts.push({ x: cx, y: y, node: true });
        });
        pts.push({ x: cx, y: h });

        var d = 'M' + cx + ' 0';
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], dy = b.y - a.y;
          var s = (i % 2 ? 1 : -1) * amp;
          d += ' C' + (cx + s) + ' ' + (a.y + dy * 0.3) + ', ' + (cx + s) + ' ' + (b.y - dy * 0.3) + ', ' + b.x + ' ' + b.y;
        }
        path.setAttribute('d', d);
        track.setAttribute('d', d);
        len = path.getTotalLength();
        path.style.strokeDasharray = len;

        // Step nodes
        while (nodesG.firstChild) nodesG.removeChild(nodesG.firstChild);
        nodes = [];
        pts.forEach(function (p) {
          if (!p.node) return;
          var c = document.createElementNS(NS, 'circle');
          c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', w < 60 ? 5 : 7);
          c.setAttribute('fill', '#0b0b14'); c.setAttribute('stroke', 'rgba(255,255,255,0.2)'); c.setAttribute('stroke-width', '2');
          c.style.transition = 'fill .3s, stroke .3s';
          nodesG.appendChild(c);
          nodes.push({ el: c, y: p.y });
        });
        render();
      }

      function render() {
        if (!len) return;
        var l = len * state.p;
        path.style.strokeDashoffset = len - l;
        var pt = path.getPointAtLength(l);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        nodes.forEach(function (n) {
          var on = pt.y >= n.y - 1;
          n.el.setAttribute('fill', on ? '#22d3ee' : '#0b0b14');
          n.el.setAttribute('stroke', on ? '#a78bfa' : 'rgba(255,255,255,0.2)');
        });
      }

      build();

      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.6, invalidateOnRefresh: true }
      });

      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { build(); }).observe(col);
      } else {
        window.addEventListener('resize', build);
      }
      ScrollTrigger.addEventListener('refresh', build);
      window.addEventListener('load', build);
    })();


    // ===== REFRESH SCROLLTRIGGER AFTER FONTS/LAYOUT SETTLE =====
    // Function: refreshTriggers()
    // Purpose: Recalculate pinned/scrubbed positions once web fonts have loaded
    (function refreshTriggers() {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    })();